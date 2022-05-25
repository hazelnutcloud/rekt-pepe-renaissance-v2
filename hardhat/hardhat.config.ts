import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter"


const config = {
    defaultNetwork: "hardhat",
    gasReporter: {
        currency: "USD",
        src: "./contracts",
        gasPrice: 30,
        ethPrice: 1978.16 
    },
    networks: {
        hardhat: {
            hardfork: "london",
            initialBaseFeePerGas: 0,
            forking: {
                url: "https://eth-mainnet.alchemyapi.io/v2/zOVFUzSEld1v_MuTOqGPYkTYttwBUrmF",
                blockNumber: 14800000,
            },
        }
    },
    //     rinkeby: {
    //         url: "https://eth-rinkeby.alchemyapi.io/v2/srVBZIhy3PWWN1URQfd-KlTJk8q964kr",
    //         accounts: [
    //             "d52502401f0fe8d3a73cce950102a28ed2f1ed69b87448530a23129e5fbcbd41",
    //         ],
    //     },
    //     mainnet: {
    //         url: "https://eth-mainnet.alchemyapi.io/v2/zOVFUzSEld1v_MuTOqGPYkTYttwBUrmF",
    //         accounts: [PRIVATE_KEY],
    //         gasPrice: 50e9,
    //         blockGasLimit: 12487794,
    //     },
    //     matic: {
    //         url: "https://polygon-mainnet.g.alchemy.com/v2/XZF2U-6qLByJKH9OVsB8rflwSYaZRQaq",
    //         accounts: [PRIVATE_KEY],
    //         gasPrice: 40e9,
    //         chainId: 137,
    //         blockGasLimit: 12487794,
    //     },
    //     fantom: {
    //         url: "https://rpc.ftm.tools/",
    //         accounts: [PRIVATE_KEY],
    //         gasPrice: 100e9,
    //         chainId: 250,
    //         blockGasLimit: 12487794,
    //     },
    //     avax: {
    //         url: "https://api.avax.network/ext/bc/C/rpc",
    //         accounts: [PRIVATE_KEY],
    //         gasPrice: 75e9,
    //         chainId: 43114,
    //         blockGasLimit: 12487794,
    //     },
    //     syscoin: {
    //         hardfork: "london",
    //         url: "https://rpc.syscoin.org",
    //         accounts: [PRIVATE_KEY],
    //         gasPrice: "auto",
    //         chainId: 57,
    //     },
    // },
    paths: {
        artifacts: "./artifacts",
        cache: "./cache",
        sources: "./contracts",
        tests: "./test",
    },
    contractSizer: {
        alphaSort: true,
        runOnCompile: true,
        disambiguatePaths: false,
    },
    solidity: {
        version: "0.8.9",
        settings: {
            metadata: {
                // Not including the metadata hash
                // https://github.com/paulrberg/solidity-template/issues/31
                bytecodeHash: "none",
            },
            // You should disable the optimizer when debugging
            // https://hardhat.org/hardhat-network/#solidity-optimizer-support
            optimizer: {
                enabled: true,
                runs: 10000,
            },
        },
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: "CD6S4FNXAPRUE582YPRIWRIN9KKJ2YJC5A",
    },
    mocha: {
        timeout: 60000,
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
};

export default config;
