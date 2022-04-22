const { ethers } = require("ethers");
const { BigNumber } = require("@ethersproject/bignumber");

const formatEther = (amount) => {
    return ethers.utils.formatEther(amount);
}

const ether = (amount) => {
    const weiString = ethers.utils.parseEther(amount.toString());
    return BigNumber.from(weiString);
};

const gWei = (amount) => {
    const weiString = BigNumber.from("1000000000").mul(amount);
    return BigNumber.from(weiString);
};

const parseUnits = (amount, units) => {
    return ethers.utils.parseUnits(amount, units);
}

module.exports = {
    formatEther,
    ether,
    gWei,
    parseUnits
}