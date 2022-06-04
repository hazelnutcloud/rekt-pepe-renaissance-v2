// Run with `npx hardhat test test/revest-primary.js`
import { use } from "chai";
import { expect, assert, } from "chai";
import { ethers, network } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Mock20, Mock20__factory, Mock721, Mock721__factory, RektPepeRenaissance, RektPepeRenaissance__factory } from "../typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { connect } from "http2";

use(solidity)
/*
    * @test {RektPepeRenaissance}
 */
describe("", async () => {

let RPR: RektPepeRenaissance
let RPR_Factory: RektPepeRenaissance__factory
let Mock20: Mock20;
let Mock721: Mock721;
let owner: SignerWithAddress;
let actorA: SignerWithAddress;
let actorB: SignerWithAddress;
let actorC: SignerWithAddress;
let actorD: SignerWithAddress;
let actorE: SignerWithAddress;
const BASE_URI = "ipfs-example/";
    //let actorA: SignerWithAddress;
    before(async () => {
        [owner, actorA, actorB, actorC, actorD, actorE] = await ethers.getSigners()
    
        await main();
    });

    describe("Sale mechanics", async () => {
        const preSaleStartTime = 1652893100;
        const publicSalePrice = ethers.utils.parseEther("1.0")
        const preSalePrice = ethers.utils.parseEther("0.8");
        describe("setup", async () => {
            it("should set sale config", async () => {
                await getTimestamp();

                (await RPR.setSaleConfig(preSaleStartTime, publicSalePrice, preSalePrice)).wait()

                console.log(`\tSale Config:`);
                console.log(`\tPre sale start time: \t${preSaleStartTime}`);
                console.log(`\tPublic sale price: \t${publicSalePrice}`);
                console.log(`\tPre Sale Price: \t${preSalePrice}`);
                
                await getTimestamp();
            })
        })

        describe("Seed round", async () => {
            it("should revert attempts to mint before the seed round", async () => {
                for (let i = 0; i < 5; i++) {
                    await expect (
                        RPR.seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                    ).to.revertedWith("Seed round not yet started")
                    await getTimestamp();
                }
                expect(await RPR.totalSupply()).eq(0);
                console.log(`\tFive transactions properly rejected before seed round `);
            })
            
            it("should revert foreign attempt to activate seed round", async () => {
                await expect(
                    RPR.connect(actorA).enableSeedRound()
                ).to.reverted;
            })
            it("should accept owner attempt to activate seed round", async () => {
                await RPR.connect(owner).enableSeedRound()

                //Expect seedRoundPrice to have changed
                expect((await RPR.saleConfig()).seedRoundPrice).to.be.gt(0);
            })

            it("should reject ineligible minters", async () => {
                console.log(`\tseed round activated`);
                await expect(
                    RPR.connect(actorB).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                ).to.revertedWith("Ineligible for seed round mint")

                await expect(
                    RPR.connect(actorC).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                ).to.revertedWith("Ineligible for seed round mint")
            })
            it("should reject foreign attempt to seed allowlist", async () => {
                await expect(
                    RPR.connect(actorA).seedAllowlist([actorA.address, actorB.address], [10, 2])
                ).to.reverted;;
            })
            it("should accept owner attempt to seed the allowlist", async () => {
                await RPR.connect(owner).seedAllowlist([actorA.address, actorB.address], [10, 2])
            })

            it("should accept Actor A's 10 token mint during the seed round", async () => {
                expect (await
                    RPR.connect(actorA).seedRoundMint(10, {value: ethers.utils.parseEther("0.07")})
                )
                .to.emit(RPR, "Mint")
                .withArgs(actorA.address, 10)
                for (let i = 0; i < 10; i++) {
                    expect(
                        await RPR.ownerOf(i)
                    ).to.eq(actorA.address)
                }
            })
            it("should accept Actor B's 2 token mint during the seed round", async () => {
                expect (await
                    RPR.connect(actorB).seedRoundMint(2, {value: ethers.utils.parseEther("0.07")})
                )
                .to.emit(RPR, "Mint")
                .withArgs(actorB.address, 2)
                for (let i = 10; i < 12; i++) {
                    expect(
                        await RPR.ownerOf(i)
                    ).to.eq(actorB.address)
                }
            })
            it("should reject seed round mints beyond allowance", async () => {
                await expect (
                    RPR.connect(actorA).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                ).to.revertedWith("Ineligible for seed round mint")
                await expect (
                    RPR.connect(actorB).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                ).to.revertedWith("Ineligible for seed round mint")
                await expect (
                    RPR.connect(actorC).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                ).to.revertedWith("Ineligible for seed round mint")
            })
            it("should reject presale mint attempts", async () => {
                await expect (
                    RPR.connect(actorA).preSaleMint(5, {value: ethers.utils.parseEther("4.0")})
                ).to.revertedWith("Pre-sale not yet started")
                await expect (
                    RPR.connect(actorB).preSaleMint(5, {value: ethers.utils.parseEther("4.0")})
                ).to.revertedWith("Pre-sale not yet started")
                await expect (
                    RPR.connect(actorC).preSaleMint(5, {value: ethers.utils.parseEther("4.0")})
                ).to.revertedWith("Pre-sale not yet started")
            })
            it("should reject public sale mint attempts", async () => {
                await expect (
                    RPR.connect(actorA).publicSaleMint(5, {value: ethers.utils.parseEther("4.0")})
                ).to.revertedWith("public sale has not begun yet")
                await expect (
                    RPR.connect(actorB).publicSaleMint(5, {value: ethers.utils.parseEther("4.0")})
                ).to.revertedWith("public sale has not begun yet")
                await expect (
                    RPR.connect(actorC).publicSaleMint(5, {value: ethers.utils.parseEther("4.0")})
                ).to.revertedWith("public sale has not begun yet")
            })
        })

        describe("Presale", async () => {
            it("Should revert presale mints until the presale timestamp: " + preSaleStartTime.toString(), async () => {
                console.log(`\tRevert pre sale mints until presale start time`);
                while ((await ethers.provider.getBlock('latest')).timestamp + 1 < preSaleStartTime) {
                    await expect (
                        RPR.preSaleMint(5, {value: ethers.utils.parseEther("4.0")})
                    ).to.revertedWith("Pre-sale not yet started")
                    console.log(`\t\tReverted: \tstamp ${(await ethers.provider.getBlock('latest')).timestamp} < ${preSaleStartTime}`);
                }
            })
            it("should revert Actor C's attempt to mint more than the allowed amount in pre-sale", async () => {
                console.log(`\t***Presale has begun, seed round is over***`);
                const c_bal = await ethers.provider.getBalance(actorC.address);
                const rpr_bal = await ethers.provider.getBalance(RPR.address);
                await expect (
                    RPR.connect(actorC).preSaleMint(20, {value: ethers.utils.parseEther("4.0")})
                ).to.revertedWith("can not mint this many")
                // Actor C should have no tokens from seed sale
                expect (await RPR.balanceOf(actorC.address)).to.eq(0)
                expect ((await ethers.provider.getBalance(actorC.address)).lt(c_bal))
                expect (await ethers.provider.getBalance(RPR.address)).to.eq(rpr_bal)
            })

            it("should accept Actor C's attempt to mint 5 tokens during the pre sale", async () => {
                const c_bal = await ethers.provider.getBalance(actorC.address);
                const rpr_bal = await ethers.provider.getBalance(RPR.address);
                expect (await ethers.provider.getBalance(RPR.address)).to.eq(rpr_bal.add(ethers.utils.parseEther("0.0")))

                await expect (
                    RPR.connect(actorC).preSaleMint(10, {value: ethers.utils.parseEther("8.0")})
                ).to.emit(RPR, "Mint")
                .withArgs(actorC.address, 10)

                expect (await RPR.balanceOf(actorC.address)).to.eq(10)
                expect ((await ethers.provider.getBalance(actorC.address)).lt(c_bal.sub(ethers.utils.parseEther("8.0"))))
                expect (await ethers.provider.getBalance(RPR.address)).to.eq(rpr_bal.add(ethers.utils.parseEther("8.0")))
            })
            it("should revert Actor C's attempt to mint an additional token in pre-sale", async () => {
                const c_bal = await ethers.provider.getBalance(actorC.address);
                const rpr_bal = await ethers.provider.getBalance(RPR.address);
                await expect (
                    RPR.connect(actorC).preSaleMint(1, {value: ethers.utils.parseEther("4.0")})
                ).to.revertedWith("can not mint this many")
                // Actor C should have no tokens from seed sale
                expect (await RPR.balanceOf(actorC.address)).to.eq(10)
                expect ((await ethers.provider.getBalance(actorC.address)).lt(c_bal))
                expect (await ethers.provider.getBalance(RPR.address)).to.eq(rpr_bal)
            })
            it("shoud revert Actor A's attempt to seed round mint", async () => {
                await expect (
                    RPR.connect(actorA).seedRoundMint(1, {value: ethers.utils.parseEther("1")})
                ).to.revertedWith("seed round is over")
            })
            it("shoud revert Actor A's attempt to public sale mint", async () => {
                await expect (
                    RPR.connect(actorA).publicSaleMint(1)
                ).to.revertedWith("public sale has not begun yet")
            })
        })
        describe("Public Sale", async () => {
            const publicSaleStartTime = preSaleStartTime + 14400; // PreSaleTimestamp + uint256(4 hours)
            it("Should revert presale mints until the public sale timestamp: " + publicSaleStartTime.toString(), async () => {
                console.log(`\tRevert public sale mints until public start time`);
                await network.provider.send("evm_increaseTime", [14390]);

                while ((await ethers.provider.getBlock('latest')).timestamp + 1 < publicSaleStartTime) {
                    await expect (
                        RPR.publicSaleMint(5, {value: ethers.utils.parseEther("5.0")})
                    ).to.revertedWith("public sale has not begun yet")
                    console.log(`\t\tReverted: \tstamp ${(await ethers.provider.getBlock('latest')).number} < ${publicSaleStartTime}`);
                }
            })

            it("should revert Actor D's attempt to mint more than the allowed amount in Public -sale", async () => {
                console.log(`\t***Public sale has begun, pre sale is over***`);
                const c_bal = await ethers.provider.getBalance(actorD.address);
                const rpr_bal = await ethers.provider.getBalance(RPR.address);
                await expect (
                    RPR.connect(actorD).publicSaleMint(20, {value: ethers.utils.parseEther("20.0")})
                ).to.revertedWith("can not mint this many")
                // Actor C should have no tokens from seed sale
                expect (await RPR.balanceOf(actorD.address)).to.eq(0)
                expect ((await ethers.provider.getBalance(actorD.address)).lt(c_bal))
                expect (await ethers.provider.getBalance(RPR.address)).to.eq(rpr_bal)
            })

            it("should accept Actor D's attempt to mint 10 tokens during the pre sale", async () => {
                const c_bal = await ethers.provider.getBalance(actorD.address);
                const rpr_bal = await ethers.provider.getBalance(RPR.address);
                expect (await ethers.provider.getBalance(RPR.address)).to.eq(rpr_bal.add(ethers.utils.parseEther("0.0")))

                await expect (
                    RPR.connect(actorD).publicSaleMint(10, {value: ethers.utils.parseEther("10.0")})
                ).to.emit(RPR, "Mint")
                .withArgs(actorD.address, 10)

                expect (await RPR.balanceOf(actorD.address)).to.eq(10)
                expect ((await ethers.provider.getBalance(actorD.address)).lt(c_bal.sub(ethers.utils.parseEther("10.0"))))
                expect (await ethers.provider.getBalance(RPR.address)).to.eq(rpr_bal.add(ethers.utils.parseEther("10.0")))
            })
            it("should revert Actor D's attempt to mint an additional token in pre-sale", async () => {
                const c_bal = await ethers.provider.getBalance(actorD.address);
                const rpr_bal = await ethers.provider.getBalance(RPR.address);
                await expect (
                    RPR.connect(actorD).publicSaleMint(1, {value: ethers.utils.parseEther("1.0")})
                ).to.revertedWith("can not mint this many")
                // Actor C should have no tokens from seed sale
                expect (await RPR.balanceOf(actorD.address)).to.eq(10)
                expect ((await ethers.provider.getBalance(actorD.address)).lt(c_bal))
                expect (await ethers.provider.getBalance(RPR.address)).to.eq(rpr_bal)
            })
            it("shoud revert Actor B's attempt to seed round mint", async () => {
                await expect (
                    RPR.connect(actorD).seedRoundMint(1) 
                ).to.revertedWith("seed round is over")
            })
            it("shoud revert Actor B's attempt to pre sale mint", async () => {
                await expect (
                    RPR.connect(actorD).preSaleMint(1, {value: ethers.utils.parseEther("1")})
                ).to.revertedWith("Pre-sale not yet started")
            })
        })
    })
    describe("Minting/Burning General", async () => {
        it("should revert Actor E attempt to mint under price", async () => {
            // Pre conditions
            const pre_bal = await ethers.provider.getBalance(actorE.address);
            expect(await RPR.balanceOf(actorE.address)).to.eq(0)

            // Actions
            await expect (
                RPR.connect(actorE).publicSaleMint(1, {value: ethers.utils.parseEther("0.05")})
            ).to.revertedWith("Insufficient funds")

            expect(await RPR.balanceOf(actorE.address)).to.eq(0)

        })
        it("should accept Actor E attempting to mint 1 NFT perfect price", async () => {
            const pre_bal = await ethers.provider.getBalance(actorE.address);
            const index = await RPR.totalSupply();
            expect(await RPR.balanceOf(actorE.address)).to.eq(0)

            // Actions
            await expect (
                RPR.connect(actorE).publicSaleMint(1, {value: ethers.utils.parseEther("1.0")})
            ).to.emit(RPR, "Transfer")
            .withArgs(ethers.constants.AddressZero, actorE.address, index)

            expect(await RPR.ownerOf(index)).to.eq(actorE.address)
            expect((await RPR.balanceOf(actorE.address)).eq(1))
            expect((await ethers.provider.getBalance(actorE.address)).lt(pre_bal.sub(ethers.utils.parseEther("1.0"))))
        })
        it("should accept Actor E attempting to mint 2 NFTs overflow price", async () => {
            // Pre conditions
            const rpr_bal = await RPR.balanceOf(actorE.address);
            const pre_bal = await ethers.provider.getBalance(actorE.address);
            const pre_con_bal = await ethers.provider.getBalance(RPR.address);
            const index = await RPR.totalSupply();
            // Actions
            expect (await
                RPR.connect(actorE).publicSaleMint(2, {value: ethers.utils.parseEther("3.0")})
            )
            .to.emit(RPR, "Transfer")
            .withArgs(ethers.constants.AddressZero, actorE.address, index)
            .to.emit(RPR, "Transfer")
            .withArgs(ethers.constants.AddressZero, actorE.address, index.add(1))
          
            expect(await RPR.ownerOf(index)).to.eq(actorE.address)
            expect(await RPR.ownerOf(index.add(1))).to.eq(actorE.address)
            expect(await RPR.balanceOf(actorE.address)).to.eq(rpr_bal.add(2))
            expect((await actorE.getBalance()).lt(pre_bal.sub(ethers.utils.parseEther("2.0"))))
            expect((await actorE.getBalance()).gt(pre_bal.sub(ethers.utils.parseEther("2.9"))))
            expect((await ethers.provider.getBalance(RPR.address)).sub(pre_con_bal)).to.eq(ethers.utils.parseEther("2.0"))
        })
        it("Burn 1 NFT", async () => {
            // Pre conditions
            console.log(`\tActor A Address: ${actorA.address}`);
            await RPR.connect(owner).mint(actorA.address, 1)
            console.log(`\tActor A Pre balance: ${await RPR.balanceOf(actorA.address)}`);

            //I was wrong about the burn() method. You can just test burning it by sending it to the zero-address.

            // Actions
            await expect (
                RPR.connect(actorB).burn(0)
            )
            .to.be.reverted

            await expect (
                RPR.connect(actorA).burn(0)
            )
            .to.emit(RPR, "Transfer")
            
            // What you expect it to look like afterwards
            console.log(`\tActor A Post balance: ${await RPR.balanceOf(actorA.address)}`);
            
            //Add Assertions about balances
        })
    })
    describe("Transfer", async () => {
        let index: BigNumber;
        it("should transfer a single NFT", async () => {
            // Pre conditions
            index = await RPR.totalSupply();
            await RPR.connect(owner).mint(actorA.address, 1)

            // Actions
            await expect (
                RPR.connect(actorB).transfer(actorA.address, actorB.address, index)
            ).to.be.reverted;

            await expect(
                RPR.connect(actorA).transfer(actorA.address, actorB.address, index)
            ).to.emit(RPR, "Transfer")

            expect(await
                RPR.ownerOf(index)
            ).to.eq(actorB.address)

            // What you expect it to look like afterwards
            console.log(`\tActor A Post balance: ${await RPR.balanceOf(actorA.address)}`);
            console.log(`\tActor B Post balance: ${await RPR.balanceOf(actorB.address)}`);
        })

        it("should transfer via allowance", async () => {
            // RPR.approve() tx.wait()
            // Pre conditions
            
            // Actions
            await expect(
                RPR.connect(actorC).transfer(actorB.address, actorC.address, index)
            )
            .to.be.reverted

            RPR.connect(actorB).approve(actorA.address, index)

            expect(await
                RPR.connect(actorA).transfer(actorB.address, actorA.address, index)
            )
            .to.emit(RPR, "Transfer")

            expect(await
                RPR.ownerOf(index)
            )
            .to.eq(actorA.address)
        })

        it("should transfer ownership of contract", async () => {
            ////Pre conditions
            //console.log(`Owner of Contract : ${await RPR.owner()}`);
            //console.log(`Actor A Address: ${actorA.address}`);

            //// Actions
            //RPR.connect(await RPR.owner()).transferOwnership(actorA.address)

            //// What you expect it to look like afterwards
            //console.log(`Owner of Contract : ${await RPR.owner()}`);
            //console.log(`Actor A Address: ${actorA.address}`);
        })
    })
    describe("Smart Wallet Tests", async () => {
        let smartWalletAddress: string;
        let tokenId: BigNumber;
        before(async () => {
            // Pre conditions
            tokenId = await RPR.totalSupply();
            console.log(`\tThe tested smart wallet will have token ID: \t${tokenId}`);

            // Actions
            await expect (
                RPR.connect(owner).mint(actorC.address, 1)
            )
            .to.emit(RPR, "Mint")
            .to.emit(RPR, "Transfer")

            // What you expect it to look like afterwards
            console.log(`\tActor C Address: \t${actorC.address}`);
            console.log(`\tOwner of id ${tokenId}: \t\t${await RPR.ownerOf(tokenId)}`);
            expect(
                await RPR.ownerOf(tokenId) == actorC.address
            )

            smartWalletAddress = await RPR.callStatic.getWalletAddressForTokenId(tokenId);
            console.log(`\tSmart Wallet Address: \t${smartWalletAddress}`);

        })
        describe("Ether mechanics" ,async () => {
            it("Pre conditions ^", async () => {
                console.log(`\tSmart Wallet Eth Balance: \t${await ethers.provider.getBalance(smartWalletAddress)}`);
                console.log(`\tActor C ETH balance: \t\t${await actorC.getBalance()}`);
            })
            it("should deposit 15 ether into smart wallet", async () => {
                await actorA.sendTransaction({value: ethers.utils.parseEther("15"), to: smartWalletAddress});
                expect(await ethers.provider.getBalance(smartWalletAddress)).to.eq(ethers.utils.parseEther("15"));
            })
            it("should revert Actor A's attempt to withdraw from smart wallet", async () => {    
                await expect(
                    RPR.connect(actorA).withdrawEther(tokenId)
                ).to.revertedWith("Only the token owner can withdraw ether");
                expect(await ethers.provider.getBalance(smartWalletAddress)).to.eq(ethers.utils.parseEther("15"));
            })
            it("should revert Actor B's attempt to withdraw from smart wallet", async () => {
                await expect(
                    RPR.connect(actorB).withdrawEther(tokenId)
                ).to.revertedWith("Only the token owner can withdraw ether");
                expect(await ethers.provider.getBalance(smartWalletAddress)).to.eq(ethers.utils.parseEther("15"));
            })
            it("should accept actor C's attempt to withdraw from smart wallet", async () => {
                const bal = await ethers.provider.getBalance(smartWalletAddress);
                (await RPR.connect(actorC).withdrawEther(tokenId)).wait()
                expect(await ethers.provider.getBalance(smartWalletAddress)).to.eq(ethers.utils.parseEther("0"));
                expect(await ethers.provider.getBalance(actorC.address)).to.above(bal);
            })
            it("Post Conditions ^", async () => {
                console.log(`\tSmart Wallet Post Eth Balance: \t${await ethers.provider.getBalance(smartWalletAddress)}`);
                console.log(`\tActor C Post Eth Balance: \t${await ethers.provider.getBalance(actorC.address)}`);
            })
        })
        describe("ERC20 Basic Mechanics", async () => {
            it("should deposit some eth into smart wallet", async () => {
                console.log(`\tMock20 is our fictional ERC20 token`);
                await actorA.sendTransaction({value: ethers.utils.parseEther("15"), to: smartWalletAddress});
            })
            it("Pre Conditions", async () => {
                console.log(`\tMock20 balance (smart wallet): \t${await Mock20.balanceOf(smartWalletAddress)}`);
                console.log(`\tMock20 balance (actor C): \t${await Mock20.balanceOf(actorC.address)}`);
                console.log(`\tETH balance (smart wallet): \t${await ethers.provider.getBalance(smartWalletAddress)}`);
                console.log(`\tETH balance (actor C): \t\t${await ethers.provider.getBalance(actorB.address)}`);
            })
            it("should deposit 2000 Mock20 into smart wallet", async () => {
                // have to mess with approvals if you use our functions
                // (await Mock20.connect(owner).approve(RPR.address, 2000)).wait()

                // await expect(
                //     RPR.connect(owner).depositERC20(Mock20.address, 2000, tokenId)
                // ).to.emit(Mock20, "Transfer")
                // .withArgs(owner.address, smartWalletAddress, 2000);

                await expect(
                    Mock20.connect(owner).transfer(smartWalletAddress, 2000)
                ).to.emit(Mock20, "Transfer")
                .withArgs(owner.address, smartWalletAddress, 2000);
                expect (await Mock20.balanceOf(smartWalletAddress)).eq(2000);
            })
            it("should revert Actor A's attempt to access smart wallet", async () => {
                await expect(
                    RPR.connect(actorA).withdrawERC20(Mock20.address, 1000, tokenId)
                ).to.revertedWith("Only the token owner can withdraw ERC20");
                expect (await Mock20.balanceOf(smartWalletAddress)).eq(2000);
            })
            it("should revert Actor B's attempt to access smart wallet", async () => {
                await expect(
                    RPR.connect(actorB).withdrawERC20(Mock20.address, 1000, tokenId)
                ).to.revertedWith("Only the token owner can withdraw ERC20");
                expect (await Mock20.balanceOf(smartWalletAddress)).eq(2000);
            })
            it("should correctly withdraw 1000 tokens + all eth from actor C", async () => {
                await expect (
                    RPR.connect(actorC).withdrawERC20(Mock20.address, 1000, tokenId)
                ).to.emit(Mock20, "Transfer")
                expect((await Mock20.balanceOf(smartWalletAddress)).eq(1000))
                expect((await Mock20.balanceOf(actorC.address)).eq(1000))
            })
            it("Post conditions ^", async () => {
                console.log(`\tMock20 balance (smart wallet): \t${await Mock20.balanceOf(smartWalletAddress)}`);
                console.log(`\tMock20 balance (actor C): \t${await Mock20.balanceOf(actorC.address)}`);
                console.log(`\tEth balance (smart wallet): \t${await ethers.provider.getBalance(smartWalletAddress)}`);
                console.log(`\tEth balance (actor C): \t\t${await ethers.provider.getBalance(actorC.address)}`);
            })
        })
        describe("ERC721 Basic Mechanics", async () => {
            it("should deposit Mock721(0) into smart wallet", async () => {
                await expect(
                    Mock721.connect(owner).transferFrom(owner.address, smartWalletAddress, 0)
                ).to.emit(Mock721, "Transfer")
                .withArgs(owner.address, smartWalletAddress, 0);

                expect(await Mock721.ownerOf(0)).eq(smartWalletAddress)
            })
            it("Pre Conditions", async () => {
                console.log(`\tMock721 is our fictional ERC721 token`);
                console.log(`\tOwner of Mock721(0): \t${await Mock721.ownerOf(0)}`);
            })
            it("should revert Actor A's attempt to access smart wallet", async () => {
                await expect(
                    RPR.connect(actorA).withdrawERC721(Mock721.address, 0, tokenId)
                ).to.revertedWith("Only the token owner can withdraw ERC721");
                expect(await Mock721.ownerOf(0)).eq(smartWalletAddress)
            })
            it("should revert Actor B's attempt to access smart wallet", async () => {
                await expect(
                    RPR.connect(actorB).withdrawERC721(Mock721.address, 0, tokenId)
                ).to.revertedWith("Only the token owner can withdraw ERC721");
                expect(await Mock721.ownerOf(0)).eq(smartWalletAddress)
            })
            it("should accept Actor C's attempt to access smart wallet", async () => {
                await expect(
                    RPR.connect(actorC).withdrawERC721(Mock721.address, 0, tokenId)
                ).to.emit(Mock721, "Transfer")
                .withArgs(smartWalletAddress, actorC.address, 0);
                expect(await Mock721.ownerOf(0)).eq(actorC.address)
            })
            it("Post conditions", async () => {
                console.log(`\tActor C address: \t${actorC.address}`);
                console.log(`\tOwner of Mock721(0): \t${await Mock721.ownerOf(0)}`);
            })
        })
        describe("ERC20/721 withdraw after transfer", async () => {
            let id1: BigNumber;
            let id2: BigNumber;
            let id1_address: string;
            let id2_address: string;
            it("should mint id1 to actorA and id2 to actorB", async () => {
                id1 = await RPR.callStatic.totalSupply();
                id2 = id1.add(1);
                await expect(
                    RPR.connect(owner).mint(actorA.address, 1)
                ).to.emit(RPR, "Mint")
                await expect(
                    RPR.connect(owner).mint(actorB.address, 1)
                ).to.emit(RPR, "Mint")
                expect (await RPR.ownerOf(id1)).to.eq(actorA.address);
                expect (await RPR.ownerOf(id2)).to.eq(actorB.address);
                id1_address = await RPR.callStatic.getWalletAddressForTokenId(id1);
                id2_address = await RPR.callStatic.getWalletAddressForTokenId(id2);
            })
            it("should deposit Mock20 into id1", async () => {
                await expect(
                    Mock20.connect(owner).transfer(id1_address, 500)
                ).to.emit(Mock20, "Transfer")
                .withArgs(owner.address, id1_address, 500);
                expect(await Mock20.balanceOf(id1_address)).to.eq(500);
            })
            it("should deposit Mock721_id=1 into id2", async () => {
                await expect(
                    Mock721.connect(owner).transferFrom(owner.address, id2_address, 1)
                ).to.emit(Mock721, "Transfer")
                .withArgs(owner.address, id2_address, 1);
                expect(await Mock721.ownerOf(1)).to.eq(id2_address);           
            })
            it("Initial Conditions", async () => {
                console.log(`\tMock20 balance \t${await Mock20.balanceOf(id1_address)} held in smart wallet: \t${id1_address}`);
                console.log(`\tOwner of ${id1_address}: \t${actorA.address}`);

                console.log(`\tMock721 balance \t${await Mock721.balanceOf(id2_address)} held in smart wallet: \t${id2_address}`);
                console.log(`\tOwner of ${id2_address}: \t${actorB.address}`);
            })
            it("should trade id1 and id2 between actors A and B", async () => {
                await expect (
                    RPR.connect(actorA).transferFrom(actorA.address, actorB.address, id1)
                ).to.emit(RPR, "Transfer")
                .withArgs(actorA.address, actorB.address, id1);
                expect ( await RPR.ownerOf(id1) ).to.eq(actorB.address);
                await expect (
                    RPR.connect(actorB).transferFrom(actorB.address, actorA.address, id2)
                ).to.emit(RPR, "Transfer")
                .withArgs(actorB.address, actorA.address, id2);
                expect ( await RPR.ownerOf(id2) ).to.eq(actorA.address);
            })
            it("should revert Actor A's attempt to access id1", async () => {
                await expect(
                    RPR.connect(actorA).withdrawERC20(Mock20.address, 500, id1)
                ).to.revertedWith("Only the token owner can withdraw ERC20");
                expect ( await Mock20.balanceOf(id1_address) ).to.eq(500);
            })            
            it("should revert Actor B's attempt to access id2", async () => {
                await expect(
                    RPR.connect(actorB).withdrawERC721(Mock721.address, 1, id2)
                ).to.revertedWith("Only the token owner can withdraw ERC721");
                expect ( await Mock721.ownerOf(1) ).to.eq(id2_address);
            })
            it("should accept Actor A's attempt to correctly access id2", async () => {
                await expect(
                    RPR.connect(actorA).withdrawERC721(Mock721.address, 1, id2)
                ).to.emit(Mock721, "Transfer")
                .withArgs(id2_address, actorA.address, 1);
                expect ( await Mock721.ownerOf(1) ).to.eq(actorA.address);
            })
            it("should accept Actor B's attempt to correctly access id1", async () => {
                await expect(
                    RPR.connect(actorB).withdrawERC20(Mock20.address, 500, id1)
                ).to.emit(Mock20, "Transfer")
                .withArgs(id1_address, actorB.address, 500);
                expect ( await Mock20.balanceOf(actorB.address) ).to.eq(500);
            })
            it("Post conditions", async () => {
                console.log(`\tOwner of Mock721: \t${await Mock721.ownerOf(1)}`);
                console.log(`\t${actorB.address} Mock20 balance: \t${await Mock20.balanceOf(actorB.address)}`);
            })
        })


    })
    describe("Malicious behavior prevention", async () => {
        it("Should Revert on mint > 5 NFTs", async () => {
            expect (await
                RPR.connect(actorA).payable_mint(actorA.address, 6)
            ).to.revertedWith("RPR: mint limit exceeded")
        })

        it("Should revert on pay below floor price", async () => {
            expect (await
                RPR.connect(actorA).payable_mint(actorA.address, 1)
            ).to.revertedWith("RPR: insufficient funds")
            expect (await
                RPR.connect(actorA).payable_mint(actorA.address, 1, { value: ethers.utils.parseEther("0.01") })
            ).to.revertedWith("RPR: insufficient funds")
            expect (await
                RPR.connect(actorA).payable_mint(actorA.address, 2, { value: ethers.utils.parseEther("1.999999999") })
            ).to.revertedWith("RPR: insufficient funds")
        })
        it("Should revert on exceeded mint capacity for address", async () => {
            expect (await
                RPR.connect(actorA).payable_mint(actorA.address, 1)
            ).to.revertedWith("RPR: insufficient funds")

            expect (await
                RPR.connect(actorA).payable_mint(actorA.address, 1, { value: ethers.utils.parseEther("0.01") })
            ).to.revertedWith("RPR: insufficient funds")

            expect (await
                RPR.connect(actorA).payable_mint(actorA.address, 2, { value: ethers.utils.parseEther("1.999999999") })
            ).to.revertedWith("RPR: insufficient funds")
        })
    })
    describe("Withdrawing charity funds", async () => {
        it("Should Withdraw deposited funds to the ownership address", async () => {
            const owner_bal = await ethers.provider.getBalance(owner.address);
            const rpr_bal = await ethers.provider.getBalance(RPR.address);
    
            await expect(
                RPR.connect(actorA).withdrawCharity()
            ).to.reverted;
    
            await RPR.connect(owner).withdrawCharity();
    
            expect(await ethers.provider.getBalance(RPR.address)).to.eq(0);
            expect((rpr_bal.add(owner_bal).sub(await ethers.provider.getBalance(owner.address))).lt(ethers.utils.parseEther("0.01")))
        })
    })

    // What API for this? Seaport?
    describe("List on OpenSea", async () => {
        it("Should list NFT on opensea?", async () => {
            
        })
    })

    const getTimestamp = async () => {
        console.log(`\tBlock: \t${(await ethers.provider.getBlock('latest')).number}\t${(await ethers.provider.getBlock('latest')).timestamp}`);
    }

    async function main() {
        [owner, actorA, actorB, actorC] = await ethers.getSigners();
        RPR_Factory = await ethers.getContractFactory("RektPepeRenaissance") as RektPepeRenaissance__factory
        const maxBatchSize = 10;
        const collectionSize = 10000;
        const seedRoundCap = 1000;
        const amountForAuctionAndDevs = 100;
        const amountForDevs = 50;
        RPR = await RPR_Factory.deploy(maxBatchSize, collectionSize, seedRoundCap, amountForAuctionAndDevs, amountForDevs, BASE_URI)

        await RPR.deployed();

        console.log(`\tContract deployed to: ${RPR.address}`);

        await expect (
            RPR.connect(actorA).setBaseURI("malicious")
        ).to.reverted;

        await RPR.connect(owner).setBaseURI(BASE_URI)

        // Mock ERC20
        const Mock20_Factory = await ethers.getContractFactory("Mock20") as Mock20__factory
        Mock20 = await Mock20_Factory.deploy("Mock20", "M20")
        await Mock20.deployed();

        // Mock ERC721
        const Mock721_Factory = await ethers.getContractFactory("Mock721") as Mock721__factory
        Mock721 = await Mock721_Factory.deploy("Mock721", "M721")
        await Mock721.deployed();
    }
})