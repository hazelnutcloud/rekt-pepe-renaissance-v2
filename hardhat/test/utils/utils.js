const setupImpersonator = async (addr) => {
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [addr],
    });
}

const timeTravel = async (time) => {
    await network.provider.send("evm_increaseTime", [time]);
    await network.provider.send("evm_mine");
}

const approveAll = async (signer, address, tokenContract) => {
    let approval = await tokenContract
        .connect(signer)
        .approve(address, ethers.constants.MaxInt256);
    await approval.wait();
}

const getDefaultConfig = (address, amount) => {
    let config = {
        asset: address, // The token being stored
        depositAmount: amount, // How many tokens
        depositMul: ethers.BigNumber.from(0),// Deposit multiplier
        split: ethers.BigNumber.from(0),// Number of splits remaining
        maturityExtension: ethers.BigNumber.from(0),// Maturity extensions remaining
        pipeToContract: "0x0000000000000000000000000000000000000000", // Indicates if FNFT will pipe to another contract
        isStaking: false,
        isMulti: false,
        depositStopTime: ethers.BigNumber.from(0),
        whitelist: false
    };
    return config;
}

const encodeArguments = (abi, args) => {
    let abiCoder = ethers.utils.defaultAbiCoder;
    return abiCoder.encode(abi, args);
}

const getLatestBlockTimestamp = async () => {
    const latestBlock = await ethers.provider.getBlock("latest");
    return latestBlock.timestamp;
};

const dayToSec = (days) => {
    return days * 24 * 60 * 60;
};

module.exports = {
    setupImpersonator, 
    timeTravel, 
    approveAll,
    getDefaultConfig,
    encodeArguments,
    getLatestBlockTimestamp,
    dayToSec
}
