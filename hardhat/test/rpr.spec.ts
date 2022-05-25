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
    before(async () => {
        const signers = await ethers.getSigners();
        owner = signers[0];
        RPR_Factory = await ethers.getContractFactory("RektPepeRenaissance") as RektPepeRenaissance__factory
    })
    const deploy = async () => {
        RPR = await RPR_Factory.deploy()
        await RPR.deployed();
        console.log(`\tContract deployed to: ${RPR.address}`);
    }   
    it("deploy contract", async () => {
        await deploy();
    })
})