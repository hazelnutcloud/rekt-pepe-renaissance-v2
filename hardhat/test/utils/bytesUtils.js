const { ethers } = require("ethers");

const solidityKeccak256 = (types, values) => {
    return ethers.utils.solidityKeccak256(types, values);
}

module.exports = {
    solidityKeccak256
}
