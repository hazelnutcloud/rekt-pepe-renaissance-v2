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
    //let actorA: SignerWithAddress;
    before(async () => {
        const signers = await ethers.getSigners();
        owner = signers[0];
        RPR_Factory = await ethers.getContractFactory("RektPepeRenaissance") as RektPepeRenaissance__factory

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xbcf5ab858cb0c003adb5226bdbfecd0bfd7b6d9f"]
          });
        actorA = await ethers.getSigner("0xbcf5ab858cb0c003adb5226bdbfecd0bfd7b6d9f")
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
                await RPR.ownerOf(1) == actorA.address
            )
        })
        it("Batch mint 2 NFTs", async () => {
            
        })
        it("Batch mint 5 NFTs", async () => {
            
        })
        it("burn 1 NFT", async () => {
            
        })
        it("Batch burn 5 NFTs", async () => {
            
        })
    })
    describe("Transfer", async () => {
        it("Transfer single", async () => {
            
        })
        it("Transfer multiple NFTs", async () => {
            
        })
        it("Transfer via allowance", async () => {
            
        })
        it("Batch transfer via allowance", async () => {
            
        })
    })
    it("Transfer contract ownership", async () => {
        // RPR Renounce ownership
        
    })
    it("Withdraw deposited funds to address", async () => {
        
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