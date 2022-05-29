// Run with `npx hardhat test test/revest-primary.js`
import { use } from "chai";
import { expect, assert, } from "chai";
import { ethers, network } from "hardhat";
import { solidity } from "ethereum-waffle";
import { BigNumber, BytesLike, Contract, ContractTransaction, providers } from "ethers";
import { RektPepeRenaissance, RektPepeRenaissance__factory } from "../typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

use(solidity)
/*
    * @test {RektPepeRenaissance}
 */
// describe("RPR Tests", async () => {
//     let RPR: RektPepeRenaissance
//     let RPR_Factory: RektPepeRenaissance__factory
//     let owner: SignerWithAddress;
//     let actorA: SignerWithAddress;
//     let actorB: SignerWithAddress;
//     let actorC: SignerWithAddress;
//     const BASE_URI = "ipfs-example/";
//     //let actorA: SignerWithAddress;
//     before(async () => {
//         [owner, actorA, actorB, actorC] = await ethers.getSigners();
//         RPR_Factory = await ethers.getContractFactory("RektPepeRenaissance") as RektPepeRenaissance__factory
//         // await network.provider.request({
//         //     method: "hardhat_impersonateAccount",
//         //     params: ["0xbcf5ab858cb0c003adb5226bdbfecd0bfd7b6d9f"]
//         //   });
//         // actorA = await ethers.getSigner("0xbcf5ab858cb0c003adb5226bdbfecd0bfd7b6d9f")
//         // RPR = await RPR_Factory.deploy()
//         // await RPR.deployed();
//         // console.log(`\tContract deployed to: ${RPR.address}`);
//     })
//     describe("Deploy", async () => {
//         it("Deploying contract", async () => {
//             RPR = await RPR_Factory.deploy(5, 10000, 8500, 500, "firstBaseURI")
//             await RPR.deployed();
//             console.log(`\tContract deployed to: ${RPR.address}`);
//         })
//         it("BaseURI", async () => {
//             await expect (
//                 RPR.connect(actorA).setBaseURI("malicious")
//             ).to.reverted;

//             (await RPR.connect(owner).setBaseURI(BASE_URI)).wait()
//         })
//         // it("Transfer contract ownership", async () => {
//         //     console.log(`\tContract owner: \t${await RPR.owner()}`);
//         //     console.log(`\tFuture owner: \t${actorA.address}`);
//         //     await expect(
//         //         RPR.connect(actorA).renounceOwnership()
//         //     ).to.reverted
    
//         //     await expect(
//         //         RPR.connect(owner).transferOwnership(actorA.address)
//         //     )
//         //     .to.emit(RPR, 'OwnershipTransferred')
//         //     .withArgs(owner.address, actorA.address)
    
//         //     console.log(`\tNew owner: \t${await RPR.owner()}`);
//         //     expect(await RPR.owner()).to.eq(actorA.address)
            
//         // })
//     })   
//     describe("Minting/Burning", async () => {
//         it("Mint 1 NFT", async () => {
//             // Pre conditions
//             console.log(`\tAddress: ${actorA.address}`);
//             console.log(`\tPre balance: ${await RPR.balanceOf(actorA.address)}`);

//             // Actions
//             await expect(
//                 RPR.connect(actorA).payable_mint(actorA.address, 1, {value: ethers.utils.parseEther("1")})
//             )
//             .to.emit(RPR, "Mint")
//             .to.emit(RPR, "Transfer")

//             // BaseURI
//             await expect(
//                 RPR.tokenURI(0)
//             ).to.eq(BASE_URI + "0")
//             console.log(`\tToken URI: \t${await RPR.tokenURI(0)}`);
//             // What you expect it to look like afterwards
//             console.log(`\tPost balance: ${await RPR.balanceOf(actorA.address)}`);
//             console.log(`\tOwner of id 0: ${await RPR.ownerOf(0)}`);

//             expect( 
//                 await RPR.ownerOf(0) == actorA.address
//             )
//         })
//         it("Batch mint 2 NFTs", async () => {
//             // Pre conditions
//             console.log(`\tAddress: ${actorA.address}`);
//             console.log(`\tPre balance: ${await RPR.balanceOf(actorA.address)}`);

//             // Actions
//             await expect(
//                RPR.connect(owner).mint(actorA.address, 2)
//             )
//             .to.emit(RPR, "Mint")
//             .to.emit(RPR, "Transfer")
          
//             // What you expect it to look like afterwards
//             console.log(`\tPost balance: ${await RPR.balanceOf(actorA.address)}`);
//             for (let i = 0; i < 2; i++) {
//                 console.log(`\tOwner of id ${i + 1}: ${await RPR.ownerOf(i)}`);
//             }

//             for (let i = 0; i < 2; i++) {
//                 expect(
//                     await RPR.ownerOf(i) == actorA.address
//                 )
//             }
//         })
//         it("Batch mint 5 NFTs", async () => {
//             // Pre conditions
//             console.log(`\tAddress: ${actorA.address}`);
//             console.log(`\tPre balance: ${await RPR.balanceOf(actorA.address)}`);

//             // Actions
//             await expect(
//                RPR.connect(owner).mint(actorA.address, 5)
//             )
//             .to.emit(RPR, "Mint")
//             .to.emit(RPR, "Transfer")
          
//             // What you expect it to look like afterwards
//             console.log(`\tPost balance: ${await RPR.balanceOf(actorA.address)}`);
//             for (let i = 0; i < 5; i++) {
//                 console.log(`\tOwner of id ${i + 1}: ${await RPR.ownerOf(i)}`);
//             }

//             for (let i = 0; i < 5; i++) {
//                 expect(
//                     await RPR.ownerOf(i) == actorA.address
//                 )
//             }
//         })
//         it("burn 1 NFT", async () => {
            
//         })
//         it("Batch burn 5 NFTs", async () => {
            
//         })
//     })
//     describe("Transfer", async () => {
//         it("Transfer single", async () => {
            
//         })
//         it("Transfer multiple NFTs", async () => {
            
//         })
//         it("Transfer via allowance", async () => {
//             // RPR.approve() tx.wait()
//         })
//         it("Batch transfer via allowance", async () => {
            
//         })
//     })
//     describe("Malicious behavior", async () => {
//         it("Revert on mint > 5 NFTs", async () => {
//             await expect(
//                 RPR.connect(actorA).payable_mint(actorA.address, 6)
//             ).to.revertedWith("RPR: mint limit exceeded")
//         })
//         it("Revert on pay below floor price", async () => {
//             await expect(
//                 RPR.connect(actorA).payable_mint(actorA.address, 1)
//             ).to.revertedWith("RPR: insufficient funds")
//             await expect(
//                 RPR.connect(actorA).payable_mint(actorA.address, 1, { value: ethers.utils.parseEther("0.01") })
//             ).to.revertedWith("RPR: insufficient funds")
//             await expect(
//                 RPR.connect(actorA).payable_mint(actorA.address, 2, { value: ethers.utils.parseEther("1.999999999") })
//             ).to.revertedWith("RPR: insufficient funds")
//         })
//         it("Revert on exceeded mint capacity for address", async () => {
//             await expect(
//                 RPR.connect(actorA).payable_mint(actorA.address, 1)
//             ).to.revertedWith("RPR: insufficient funds")
//             await expect(
//                 RPR.connect(actorA).payable_mint(actorA.address, 1, { value: ethers.utils.parseEther("0.01") })
//             ).to.revertedWith("RPR: insufficient funds")
//             await expect(
//                 RPR.connect(actorA).payable_mint(actorA.address, 2, { value: ethers.utils.parseEther("1.999999999") })
//             ).to.revertedWith("RPR: insufficient funds")
//         })
//     })
//     describe("Withdraw funds", async () => {
//         it("Withdraw deposited funds to address", async () => {
//             const donation = 1;
    
//             const pre_bal1 = await ethers.provider.getBalance(actorA.address);
//             console.log(`\tActor A pre balance: ${pre_bal1}`);
//             //Send funds to address
//             const tx0 = await RPR.connect(actorA).payable_mint(actorA.address, 5, {value: ethers.utils.parseEther("5")});
//             tx0.wait();
//             const post_bal1 = await ethers.provider.getBalance(actorA.address);
//             console.log(`\tActor A post balance: ${post_bal1}`);
    
//             const pre_bal2 = await ethers.provider.getBalance(actorB.address);
//             console.log(`\tActor B pre balance: ${pre_bal2}`);
//             //Send funds to address
//             const tx1 = await RPR.connect(actorB).payable_mint(actorB.address, 2, {value: ethers.utils.parseEther("2")});
//             tx1.wait();
//             const post_bal2 = await ethers.provider.getBalance(actorB.address);
//             console.log(`\tActor B post balance: ${post_bal2}`);
    
//             const pre_bal3 = await ethers.provider.getBalance(actorC.address);
//             console.log(`\tActor C pre balance: ${pre_bal3}`);
//             //Send funds to address
//             const tx2 = await RPR.connect(actorC).payable_mint(actorC.address, 2, {value: ethers.utils.parseEther("2")});
//             tx2.wait();
//             const post_bal3 = await ethers.provider.getBalance(actorC.address);
//             console.log(`\tActor C post balance: ${post_bal3}`);
    
//             const totalDeposit = (pre_bal1.sub(post_bal1)).add(pre_bal2.sub(post_bal2)).add(pre_bal3.sub(post_bal3))
//             console.log(`\tTotal Deposit: \t${totalDeposit.toString()}`);
//             const contract_balance = await ethers.provider.getBalance(RPR.address);
//             console.log(`\tBalance of contract: ${contract_balance}`);
//             expect(totalDeposit == contract_balance);
    
//             await expect(
//                 RPR.connect(actorA).withdrawCharity()
//             ).to.reverted
    
//             const tx3 = await RPR.connect(owner).withdrawCharity();
//             tx3.wait()
    
//             console.log(`\tOwner balance: ${await ethers.provider.getBalance(owner.address)}`);
//             console.log(`\tContract balance: ${await ethers.provider.getBalance(RPR.address)}`);
    
//             expect(
//                 await ethers.provider.getBalance(RPR.address)
//             ).to.eq(0)  
//     })
      
//     })
//     // What API for this? Seaport?
//     describe("List on OpenSea", async () => {
//         it("Set up opensea API", async () => {
            
//         })
//         it("List on opensea?", async () => {
            
//         })
//     })
//     // Do last
//     describe("Smart Wallet suite", async () => {
//         it("I don't know what he wants here.", async () => {
            
//         })
//     })
// })
const getTimestamp = async () => {
    console.log(`\tBlock: \t${(await ethers.provider.getBlock('latest')).number}\t${(await ethers.provider.getBlock('latest')).timestamp}`);
}
describe.only("Sale mechanics", async () => {
    // TODO: Implement tests for auction, public sale, and pre sale.
    let RPR: RektPepeRenaissance
    let RPR_Factory: RektPepeRenaissance__factory
    let owner: SignerWithAddress
    let actorA: SignerWithAddress
    let actorB: SignerWithAddress
    let actorC: SignerWithAddress
    const BASE_URI = "https://ipfs/"
    describe("setup", async () => {
        it("accounts", async () => {
            [owner, actorA, actorB, actorC] = await ethers.getSigners()
        })
        it("deploying", async () => {
            await getTimestamp();
            RPR_Factory = await ethers.getContractFactory("RektPepeRenaissance")
            const maxBatchSize = 10;
            const collectionSize = 10000;
            const seedRoundCap = 1000;
            const amountForAuctionAndDevs = 100;
            const amountForDevs = 50;
            RPR = await RPR_Factory.deploy(maxBatchSize, collectionSize, seedRoundCap, amountForAuctionAndDevs, amountForDevs, BASE_URI)
            await RPR.deployed()
            console.log(`\tContract deployed to: \t${RPR.address}`);
            await expect (
                RPR.transferOwnership(owner.address)
            )
            .to.emit(RPR, "OwnershipTransferred")
            console.log(`\tOwner: \t${owner.address}`);
        })
        it("set sale config", async () => {
            await getTimestamp();
            const preSaleStartTime = 1652893100;
            const publicSalePrice = ethers.utils.parseEther("1.0")
            const publicSaleKey = 999;
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
        it("before seed round", async () => {
            await getTimestamp();
            for (let i = 0; i < 5; i++) {
                await expect (
                    RPR.seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
                ).to.revertedWith("Seed round not yet started")
                await getTimestamp();
            }
            assert((await RPR.totalSupply()).eq(0));
            console.log(`\tFive transactions properly rejected before seed round `);
        })
        it("activate seed round", async () => {
            await expect(
                RPR.connect(actorA).enableSeedRound()
            ).to.reverted;

            (await RPR.connect(owner).enableSeedRound()).wait()
            console.log(`\tSeed round enabled`);
            await getTimestamp(); 
        })
        it("ineligible minters are rejected", async () => {
            await expect(
                RPR.connect(actorB).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
            ).to.revertedWith("Ineligible for seed round mint")
            await getTimestamp();
            await expect(
                RPR.connect(actorC).seedRoundMint(1, {value: ethers.utils.parseEther("0.07")})
            ).to.revertedWith("Ineligible for seed round mint")
            await getTimestamp();
        })
        it("seed allowlist", async () => {
            ((await RPR.seedAllowlist([actorA.address, actorB.address], [10, 2])).wait())
        })
        it("seed round mint", async () => {
            await expect (
                RPR.connect(actorA).seedRoundMint(10, {value: ethers.utils.parseEther("0.07")})
            )
            .to.emit(RPR, "Mint")
            .withArgs(actorA.address, 10)
            console.log(`\tActor A minted 10 tokens`);
            await expect (
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
    })
    describe("Presale", async () => {
        const preSaleStartTime = 1652893100;
        it("Before presale", async () => {
            await getTimestamp();
            console.log(`\tRevert pre sale mints until presale start time`);
            while ((await ethers.provider.getBlock('latest')).timestamp + 1 < preSaleStartTime) {
                await expect(
                    RPR.preSaleMint(5, {value: ethers.utils.parseEther("4.0")})
                ).to.revertedWith("Pre-sale not yet started")
                console.log(`\Reverted: \tstamp ${(await ethers.provider.getBlock('latest')).timestamp} < ${preSaleStartTime}`);
            }
            await getTimestamp();
            console.log(`\t***Presale has begun, the NEXT tx will go through***`);
        })
        it("seed sale should be turned off", async () => {
            await getTimestamp();
            await expect(
                RPR.connect(actorA).seedRoundMint(1)
            ).to.revertedWith("seed round is over")
            console.log(`\tProperly reverted seed sale mint`);
            await getTimestamp();
        })
        it("pre sale mint", async () => {
            await expect (
                RPR.connect(actorC).preSaleMint(5, {value: ethers.utils.parseEther("4.0")})
            ).to.emit(RPR, "Mint")
            .withArgs(actorC.address, 5)
            console.log(`\tActor C minted 5 tokens`);
            console.log(`\tActor C's balance: \t${await RPR.balanceOf(actorC.address)}`);
        })
        it("minting over amount", async () => {
            await expect (
                RPR.connect(actorC).preSaleMint(6, {value: ethers.utils.parseEther("4.0")})
            ).to.revertedWith("can not mint this many")
            console.log(`\tActor C tried to mint 6 more tokens, reverted`);
            console.log(`\tActor C's balance: \t${await RPR.balanceOf(actorC.address)}`);
        })
        it("still can't public sale mint", async () => {
            await expect (
                RPR.connect(actorC).publicSaleMint(1, {value: ethers.utils.parseEther("4.0")})
            ).to.revertedWith("public sale has not begun yet")
            console.log(`\tActor C tried to public mint 1 more token, reverted`);
            console.log(`\tActor C's balance: \t${await RPR.balanceOf(actorC.address)}`);
        })
    })
})