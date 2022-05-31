// Run with `npx hardhat test test/revest-primary.js`
import { use } from "chai";
import { expect, assert, } from "chai";
import { ethers, network } from "hardhat";
import { solidity } from "ethereum-waffle";
import { BigNumber, BytesLike, Contract, ContractTransaction, providers } from "ethers";
import { RektPepeRenaissance, RektPepeRenaissance__factory } from "../typechain"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

use(solidity)
describe.only("RPR Tests", async () => {
    let RPR: RektPepeRenaissance
    let RPR_Factory: RektPepeRenaissance__factory
    let owner: SignerWithAddress;
    let actorA: SignerWithAddress;
    let actorB: SignerWithAddress;
    let actorC: SignerWithAddress;
    before(async () => {
        [owner, actorA, actorB, actorC] = await ethers.getSigners();
        RPR_Factory = await ethers.getContractFactory("RektPepeRenaissance") as RektPepeRenaissance__factory
        await deploy();
        // await network.provider.request({
        //     method: "hardhat_impersonateAccount",
        //     params: ["0xbcf5ab858cb0c003adb5226bdbfecd0bfd7b6d9f"]
        //   });
        // actorA = await ethers.getSigner("0xbcf5ab858cb0c003adb5226bdbfecd0bfd7b6d9f")
    })
    const deploy = async () => {
        RPR = await RPR_Factory.deploy()
        await RPR.deployed();
        console.log(`\tContract deployed to: ${RPR.address}`);
    }   
    describe("Minting/Burning", async () => {
        beforeEach(async () => {
            await deploy();
        })
        it("Mint 1 NFT", async () => {
            // Pre conditions
            console.log(`\tAddress: ${actorA.address}`);
            console.log(`\tPre balance: ${await RPR.balanceOf(actorA.address)}`);

            // Actions
            await expect(
                RPR.connect(owner).mint(actorA.address, 1)
            )
            .to.emit(RPR, "Mint")
            .to.emit(RPR, "Transfer")
            
            // What you expect it to look like afterwards
            console.log(`\tPost balance: ${await RPR.balanceOf(actorA.address)}`);
            console.log(`\tOwner of id 1: ${await RPR.ownerOf(0)}`);

            expect( 
                await RPR.ownerOf(0) == actorA.address
            )
        })
        it("Batch mint 2 NFTs", async () => {
            // Pre conditions
            console.log(`\tAddress: ${actorA.address}`);
            console.log(`\tPre balance: ${await RPR.balanceOf(actorA.address)}`);

            // Actions
            await expect(
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
        it("Batch mint 5 NFTs", async () => {
            // Pre conditions
            console.log(`\tAddress: ${actorA.address}`);
            console.log(`\tPre balance: ${await RPR.balanceOf(actorA.address)}`);

            // Actions
            await expect(
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

            // Actions
            await expect(
                RPR.connect(actorB).burn(0)
            )
            .to.be.reverted

            await expect(
                RPR.connect(actorA).burn(0)
            )
            .to.emit(RPR, "Burn")
            
            // What you expect it to look like afterwards
            console.log(`\tActor A Post balance: ${await RPR.balanceOf(actorA.address)}`);
        })
        it("Batch burn 2 NFTs", async() => {
            // Pre conditions
            console.log(`\tActor A Address: ${actorA.address}`);
            await RPR.connect(owner).mint(actorA.address, 2)
            console.log(`\tActor A Pre balance: ${await RPR.balanceOf(actorA.address)}`);

            // Actions
            for (let i = 0; i < 2; i++) {
                await expect(
                    RPR.connect(actorB).burn(i)
                )
                .to.be.reverted
    
                await expect(
                    RPR.connect(actorA).burn(i)
                )
                .to.emit(RPR, "Burn")
            }
            
            // What you expect it to look like afterwards
            console.log(`\tActor A Post balance: ${await RPR.balanceOf(actorA.address)}`);
        })
        it("Batch burn 5 NFTs", async () => {
            // Pre conditions
            console.log(`\tActor A Address: ${actorA.address}`);
            await RPR.connect(owner).mint(actorA.address, 5)
            console.log(`\tActor A Pre balance: ${await RPR.balanceOf(actorA.address)}`);

            // Actions
            for (let i = 0; i < 5; i++) {
                await expect(
                    RPR.connect(actorB).burn(i)
                )
                .to.be.reverted
    
                await expect(
                    RPR.connect(actorA).burn(i)
                )
                .to.emit(RPR, "Burn")
            }
            
            // What you expect it to look like afterwards
            console.log(`\tActor A Post balance: ${await RPR.balanceOf(actorA.address)}`);
        })
    })
    describe("Transfer", async () => {
        it("Transfer single", async () => {
            // Pre conditions
            console.log(`\tActor A Address: ${actorA.address}`);
            await RPR.connect(owner).mint(actorA.address, 1)
            console.log(`\tActor A Pre balance: ${await RPR.balanceOf(actorA.address)}`);
            console.log(`\tActor B Address: ${actorB.address}`);
            console.log(`\tActor B Pre balance: ${await RPR.balanceOf(actorB.address)}`);

            // Actions
            await expect(
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
        it("Transfer multiple NFTs", async () => {
            
        })
        it("Transfer via allowance", async () => {
            // RPR.approve() tx.wait()
        })
        it("Batch transfer via allowance", async () => {
            
        })
    })
    it("Transfer contract ownership", async () => {
        console.log(`\tContract owner: \t${await RPR.owner()}`);
        console.log(`\tFuture owner: \t${actorA.address}`);
        await expect(
            RPR.connect(actorA).renounceOwnership()
        ).to.reverted

        await expect(
            RPR.connect(owner).transferOwnership(actorA.address)
        )
        .to.emit(RPR, 'OwnershipTransferred')
        .withArgs(owner.address, actorA.address)

        console.log(`\tNew owner: \t${await RPR.owner()}`);
        expect(await RPR.owner()).to.eq(actorA.address)
        
    })
    it("Withdraw deposited funds to address", async () => {
        await deploy();
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

        await expect(
            RPR.connect(actorA).withdrawCharity()
        ).to.reverted

        const tx3 = await RPR.connect(owner).withdrawCharity();
        tx3.wait()

        console.log(`\tOwner balance: ${await ethers.provider.getBalance(owner.address)}`);
        console.log(`\tContract balance: ${await ethers.provider.getBalance(RPR.address)}`);

        expect(
            await ethers.provider.getBalance(RPR.address)
        ).to.eq(0)

        
    })
    // What API for this? Seaport?
    describe("List on OpenSea", async () => {
        it("Set up opensea API", async () => {
            
        })
        it("List on opensea?", async () => {
            
        })
    })
    // Do last
    describe("Smart Wallet suite", async () => {
        it("I don't know what he wants here.", async () => {
            
        })
    })
})