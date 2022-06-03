// Run with `npx hardhat test test/revest-primary.js`
import { use } from "chai";
import { expect, assert, } from "chai";
import { ethers, network } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Mock20, Mock20__factory, Mock721, Mock721__factory, RektPepeRenaissance, RektPepeRenaissance__factory } from "../typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

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
const BASE_URI = "ipfs-example/";
    //let actorA: SignerWithAddress;
    before(async () => {
        [owner, actorA, actorB, actorC] = await ethers.getSigners()
    
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
            it("should seed the allowlist", async () => {
                await RPR.connect(owner).seedAllowlist([actorA.address, actorB.address], [10, 2])
            })

            it("should mint during the seed round", async () => {
                expect (await
                    RPR.connect(actorA).seedRoundMint(10, {value: ethers.utils.parseEther("0.07")})
                )
                .to.emit(RPR, "Mint")
                .withArgs(actorA.address, 10)
                console.log(`\tActor A minted 10 tokens`);
                expect (await
                    RPR.connect(actorB).seedRoundMint(2, {value: ethers.utils.parseEther("0.07")})
                )
                .to.emit(RPR, "Mint")
                .withArgs(actorB.address, 2)
                console.log(`\tActor B minted 2 tokens`);
                for (let i = 0; i < 10; i++) {
                    expect(
                        await RPR.ownerOf(i)
                    ).to.eq(actorA.address)
                }
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
        })

        describe("Presale", async () => {
            const preSaleStartTime = 1652893100;
            it("Should fail to mint before the presale", async () => {
                await getTimestamp();
                console.log(`\tRevert pre sale mints until presale start time`);
                while ((await ethers.provider.getBlock('latest')).timestamp + 1 < preSaleStartTime) {
                    expect (await
                        RPR.preSaleMint(5, {value: ethers.utils.parseEther("4.0")})
                    ).to.revertedWith("Pre-sale not yet started")
                    console.log(`\Reverted: \tstamp ${(await ethers.provider.getBlock('latest')).timestamp} < ${preSaleStartTime}`);
                }
                await getTimestamp();
                console.log(`\t***Presale has begun, the NEXT tx will go through***`);
            })

            it("Shoud revert seed sale mint", async () => {
                await getTimestamp();
                expect (await
                    RPR.connect(actorA).seedRoundMint(1)
                ).to.revertedWith("seed round is over")
                console.log(`\tProperly reverted seed sale mint`);
                await getTimestamp();
            })

            it("Should fail to mint more than the allowed amount", async () => {
                expect (await
                    RPR.connect(actorC).preSaleMint(6, {value: ethers.utils.parseEther("4.0")})
                ).to.revertedWith("can not mint this many")
                console.log(`\tActor C tried to mint 6 more tokens, reverted`);
                console.log(`\tActor C's balance: \t${await RPR.balanceOf(actorC.address)}`);

                //include an assertion here for making sure ether value hasn't changed.
            })

            it("should mint an allowed amount during the pre sale", async () => {
                expect (await
                    RPR.connect(actorC).preSaleMint(5, {value: ethers.utils.parseEther("4.0")})
                ).to.emit(RPR, "Mint")
                .withArgs(actorC.address, 5)
                console.log(`\tActor C minted 5 tokens`);
                console.log(`\tActor C's balance: \t${await RPR.balanceOf(actorC.address)}`);

                //include an assertion for Ether value before and after mint
                //include assertion for RPR balance instead of just printing
            })

           

            it("should fail to mint over the allowed amount during the pre-sale", async () => {
                expect (await
                    RPR.connect(actorC).publicSaleMint(1, {value: ethers.utils.parseEther("4.0")})
                ).to.revertedWith("public sale has not begun yet")
                console.log(`\tActor C tried to public mint 1 more token, reverted`);
                console.log(`\tActor C's balance: \t${await RPR.balanceOf(actorC.address)}`);

                //include assertion for RPR Balance
            })
        })
    })
        
    describe("Minting/Burning General", async () => {
        it("Should Mint 1 NFT", async () => {
            // Pre conditions
            console.log(`\tAddress: ${actorA.address}`);
            console.log(`\tPre balance: ${await RPR.balanceOf(actorA.address)}`);

            // Actions
            expect (await
                RPR.connect(actorA).payable_mint(actorA.address, 1, {value: ethers.utils.parseEther("1")})
            )
            .to.emit(RPR, "Mint")
            .to.emit(RPR, "Transfer")

            // BaseURI
            expect (await
                RPR.tokenURI(0)
            ).to.eq(BASE_URI + "0")
            console.log(`\tToken URI: \t${await RPR.tokenURI(0)}`);
            // What you expect it to look like afterwards
            console.log(`\tPost balance: ${await RPR.balanceOf(actorA.address)}`);
            console.log(`\tOwner of id 0: ${await RPR.ownerOf(0)}`);

            expect( 
                await RPR.ownerOf(0) == actorA.address
            )
        })

        it("Should mint 2 more NFTs", async () => {
            // Pre conditions
            console.log(`\tAddress: ${actorA.address}`);
            console.log(`\tPre balance: ${await RPR.balanceOf(actorA.address)}`);

            // Actions
            expect (await
                RPR.connect(owner).mint(actorA.address, 2)
            )
            .to.emit(RPR, "Mint")
            .to.emit(RPR, "Transfer")
          
            // What you expect it to look like afterwards
            console.log(`\tPost balance: ${await RPR.balanceOf(actorA.address)}`);
            for (let i = 0; i < 2; i++) {
                console.log(`\tOwner of id ${i + 1}: ${await RPR.ownerOf(i)}`);
            }

            for (let i = 0; i < 2; i++) {
                expect(
                    await RPR.ownerOf(i) == actorA.address
                )
            }
        })

        it("Should batch mint 5 more NFTs", async () => {
            // Pre conditions
            console.log(`\tAddress: ${actorA.address}`);
            console.log(`\tPre balance: ${await RPR.balanceOf(actorA.address)}`);

            // Actions
            expect (await
                RPR.connect(owner).mint(actorA.address, 5)
            )
            .to.emit(RPR, "Mint")
            .to.emit(RPR, "Transfer")
          
            // What you expect it to look like afterwards
            console.log(`\tPost balance: ${await RPR.balanceOf(actorA.address)}`);
            for (let i = 0; i < 5; i++) {
                console.log(`\tOwner of id ${i + 1}: ${await RPR.ownerOf(i)}`);
            }

            for (let i = 0; i < 5; i++) {
                expect(
                    await RPR.ownerOf(i) == actorA.address
                )
            }
        })
        it("Burn 1 NFT", async () => {
            // Pre conditions
            console.log(`\tActor A Address: ${actorA.address}`);
            await RPR.connect(owner).mint(actorA.address, 1)
            console.log(`\tActor A Pre balance: ${await RPR.balanceOf(actorA.address)}`);

            //I was wrong about the burn() method. You can just test burning it by sending it to the zero-address.

            // Actions
            expect (await
                RPR.connect(actorB).burn(0)
            )
            .to.be.reverted

            expect (await
                RPR.connect(actorA).burn(0)
            )
            .to.emit(RPR, "Burn")
            
            // What you expect it to look like afterwards
            console.log(`\tActor A Post balance: ${await RPR.balanceOf(actorA.address)}`);
            
            //Add Assertions about balances
        })
       
            
       
    })

    describe("Transfer", async () => {
        it("should transfer a single NFT", async () => {
            // Pre conditions
            console.log(`\tActor A Address: ${actorA.address}`);
            await RPR.connect(owner).mint(actorA.address, 1)
            console.log(`\tActor A Pre balance: ${await RPR.balanceOf(actorA.address)}`);
            console.log(`\tActor B Address: ${actorB.address}`);
            console.log(`\tActor B Pre balance: ${await RPR.balanceOf(actorB.address)}`);

            // Actions
            expect (await
                RPR.connect(actorB).transfer(actorA.address, actorB.address, 0)
            )
            .to.be.reverted

            //await expect(
                //RPR.connect(actorA).transfer(actorA.address, actorB.address, 0)
            //)
            //.to.emit(RPR, "Transfer")

            // What you expect it to look like afterwards
            console.log(`\tActor A Post balance: ${await RPR.balanceOf(actorA.address)}`);
            console.log(`\tActor B Post balance: ${await RPR.balanceOf(actorB.address)}`);
        })

        it("should transfer via allowance", async () => {
            // RPR.approve() tx.wait()
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
            const donation = 1;
    
            const pre_bal1 = await ethers.provider.getBalance(actorA.address);
            console.log(`\tActor A pre balance: ${pre_bal1}`);
            //Send funds to address
            const tx0 = await RPR.connect(actorA).payable_mint(actorA.address, 5, {value: ethers.utils.parseEther("5")});
            tx0.wait();
            const post_bal1 = await ethers.provider.getBalance(actorA.address);
            console.log(`\tActor A post balance: ${post_bal1}`);
    
            const pre_bal2 = await ethers.provider.getBalance(actorB.address);
            console.log(`\tActor B pre balance: ${pre_bal2}`);
            //Send funds to address
            const tx1 = await RPR.connect(actorB).payable_mint(actorB.address, 2, {value: ethers.utils.parseEther("2")});
            tx1.wait();
            const post_bal2 = await ethers.provider.getBalance(actorB.address);
            console.log(`\tActor B post balance: ${post_bal2}`);
    
            const pre_bal3 = await ethers.provider.getBalance(actorC.address);
            console.log(`\tActor C pre balance: ${pre_bal3}`);
            //Send funds to address
            const tx2 = await RPR.connect(actorC).payable_mint(actorC.address, 2, {value: ethers.utils.parseEther("2")});
            tx2.wait();
            const post_bal3 = await ethers.provider.getBalance(actorC.address);
            console.log(`\tActor C post balance: ${post_bal3}`);
    
            const totalDeposit = (pre_bal1.sub(post_bal1)).add(pre_bal2.sub(post_bal2)).add(pre_bal3.sub(post_bal3))
            console.log(`\tTotal Deposit: \t${totalDeposit.toString()}`);
            const contract_balance = await ethers.provider.getBalance(RPR.address);
            console.log(`\tBalance of contract: ${contract_balance}`);
            expect(totalDeposit == contract_balance);
    
            expect( await
                RPR.connect(actorA).withdrawCharity()
            ).to.reverted
    
            await RPR.connect(owner).withdrawCharity();
    
            console.log(`\tOwner balance: ${await ethers.provider.getBalance(owner.address)}`);
            console.log(`\tContract balance: ${await ethers.provider.getBalance(RPR.address)}`);
    
            expect(
                await ethers.provider.getBalance(RPR.address)
            ).to.eq(0)  
        })
    })

    // What API for this? Seaport?
    describe("List on OpenSea", async () => {
        it("Should list NFT on opensea?", async () => {
            
        })
    })

    // Do last
    describe("Smart Wallet suite", async () => {
        it("I don't know what he wants here.", async () => {
            
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