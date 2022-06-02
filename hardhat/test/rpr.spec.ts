// Run with `npx hardhat test test/revest-primary.js`
import { use } from "chai";
import { expect, assert, } from "chai";
import { ethers, network } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Mock20, Mock20__factory, RektPepeRenaissance, RektPepeRenaissance__factory } from "../typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { mock20Sol } from "../typechain/contracts/mock";

use(solidity)
/*
    * @test {RektPepeRenaissance}
 */
describe("", async () => {

let RPR: RektPepeRenaissance
let RPR_Factory: RektPepeRenaissance__factory
let Mock20: Mock20;
let owner: SignerWithAddress;
let actorA: SignerWithAddress;
let actorB: SignerWithAddress;
let actorC: SignerWithAddress;

    const BASE_URI = "ipfs-example/";
    //let actorA: SignerWithAddress;
    before(async () => {
        return new Promise(async resolve => {
            // runs once before the first test in this block

            [owner, actorA, actorB, actorC] = await ethers.getSigners()
      
            await main();
      
            resolve();
          });
    });

    describe("Sale mechanics", async () => {
        // TODO: Implement tests for auction, public sale, and pre sale.
        let RPR: RektPepeRenaissance
        let RPR_Factory: RektPepeRenaissance__factory
        let owner: SignerWithAddress
        let actorA: SignerWithAddress
        let actorB: SignerWithAddress
        let actorC: SignerWithAddress
        const BASE_URI = "https://ipfs/"

        describe("setup", async () => {
      
            it("should set sale config", async () => {
                await getTimestamp();
                const preSaleStartTime = 1652893100;
                const publicSalePrice = ethers.utils.parseEther("1.0")
                const preSalePrice = ethers.utils.parseEther("0.8");
                (await RPR.setSaleConfig(preSaleStartTime, publicSalePrice, preSalePrice)).wait()

                console.log(`\tSale Config:`);
                console.log(`\tPre sale start time: \t${preSaleStartTime}`);
                console.log(`\tPublic sale price: \t${publicSalePrice}`);
                console.log(`\tPre Sale Price: \t${preSalePrice}`);
                
                await getTimestamp();
            })
        })

        describe("Seed round", async () => {
            it("should fail to mint before the seed round", async () => {
                await getTimestamp();
                for (let i = 0; i < 5; i++) {
                    expect (await
                        RPR.seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                    ).to.revertedWith("Seed round not yet started")
                    await getTimestamp();
                }
                expect(await RPR.totalSupply()).eq(0);
                console.log(`\tFive transactions properly rejected before seed round `);
            })
            
            it("should activate seed round", async () => {
                expect(await
                    RPR.connect(actorA).enableSeedRound()
                ).to.reverted;

                await RPR.connect(owner).enableSeedRound()
                console.log(`\tSeed round enabled`);

                //Expect seedRoundPrice to have changed
                expect((await RPR.saleConfig()).seedRoundPrice).to.be.gt(0);

                await getTimestamp(); 
            })

            it("should reject ineligible minters", async () => {
                expect(await
                    RPR.connect(actorB).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                ).to.revertedWith("Ineligible for seed round mint")

                await getTimestamp();
                expect(await
                    RPR.connect(actorC).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                ).to.revertedWith("Ineligible for seed round mint")

                await getTimestamp();
            })

            it("should seed the allowlist", async () => {
                await RPR.seedAllowlist([actorA.address, actorB.address], [10, 2])
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
                expect (await
                    RPR.connect(actorA).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                ).to.revertedWith("Ineligible for seed round mint")
                expect (await
                    RPR.connect(actorB).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                ).to.revertedWith("Ineligible for seed round mint")
                expect (await
                    RPR.connect(actorC).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                ).to.revertedWith("Ineligible for seed round mint")
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
    describe.only("Smart Wallet Tests", async () => {
        let smartWalletAddress: string;

        it("setup gives id 0 to actor C", async () => {
            // Pre conditions
            console.log(`\tActor C Address: ${actorC.address}`);
            const tokenId = await RPR.totalSupply();
            console.log(`\tThe next NFT minted will have ID: \t${tokenId}`);
            console.log(`\tActor C Pre balance: ${await RPR.balanceOf(actorC.address)}`);

            // Actions
            await expect (
                RPR.connect(owner).mint(actorC.address, 1)
            )
            .to.emit(RPR, "Mint")
            .to.emit(RPR, "Transfer")

            // What you expect it to look like afterwards
            console.log(`\tActor C Post balance: ${await RPR.balanceOf(actorC.address)}`);
            console.log(`\tOwner of id ${tokenId}: ${await RPR.ownerOf(tokenId)}`);
            expect(
                await RPR.ownerOf(tokenId) == actorC.address
            )

            smartWalletAddress = await RPR.callStatic.getWalletAddressForTokenId(tokenId);
        })
        it("should deposit ether to id=0 smart wallet", async () => {
            console.log(`\tShould deposit ether to id=0 smart wallet`);
            console.log(`\tSmart Wallet Address: \t${smartWalletAddress}`);
            console.log(`\tSmart Wallet Eth Balance: \t${await ethers.provider.getBalance(smartWalletAddress)}`);

            await actorA.sendTransaction({value: ethers.utils.parseEther("15"), to: smartWalletAddress});

            console.log(`\tEther sent from Actor A`);
            console.log(`\tSmart Wallet Eth Balance: \t${await ethers.provider.getBalance(smartWalletAddress)}`);
        })
        it("should revert if withdraw isn't from actor C", async () => {
            console.log(`\tShould revert if withdraw isn't from actor C`);
            console.log(`\tSmart Wallet Address: \t\t${smartWalletAddress}`);
            console.log(`\tSmart Wallet Eth Balance: \t${await ethers.provider.getBalance(smartWalletAddress)}`);

            await expect(
                RPR.connect(actorA).withdrawEther(0)
            ).to.revertedWith("Only the token owner can withdraw ether");
            await expect(
                RPR.connect(actorB).withdrawEther(0)
            ).to.revertedWith("Only the token owner can withdraw ether");

            console.log(`\tSmart Wallet Eth Balance: \t${await ethers.provider.getBalance(smartWalletAddress)}`);

        })
        it("should withdraw correctly from actor C", async () => {
            console.log(`\tshould withdraw correctly from actor C`);
            console.log(`\tSmart Wallet Address: \t\t${smartWalletAddress}`);
            console.log(`\tSmart Wallet Eth Balance: \t${await ethers.provider.getBalance(smartWalletAddress)}`);
            console.log(`\tActor C Balance: \t\t${await ethers.provider.getBalance(actorC.address)}`);

            // Correct withdraw
            (await RPR.connect(actorC).withdrawEther(0)).wait()

            console.log(`\tSmart Wallet Eth Balance: \t${await ethers.provider.getBalance(smartWalletAddress)}`);
            console.log(`\tActor C Balance: \t\t${await ethers.provider.getBalance(actorC.address)}`);
        })
        it("should deposit Mock20 into id=0", async () => {
            
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

        // Mock ERC
        const Mock20_Factory = await ethers.getContractFactory("Mock20") as Mock20__factory
        Mock20 = await Mock20_Factory.deploy("Mock20", "M20")
        await Mock20.deployed();
    }
})