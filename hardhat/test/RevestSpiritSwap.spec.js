// Run with `npx hardhat test test/revest-primary.js`

const chai = require("chai");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { solidity } =  require("ethereum-waffle");
const { BigNumber } = require("ethers");
const { smock } = require("@defi-wonderland/smock");

const { approveAll, setupImpersonator, getLatestBlockTimestamp, dayToSec, timeTravel} = require("./utils/utils");
const { ether, formatEther, parseUnits, gWei } = require("./utils/unitsUtils");
const { solidityKeccak256 } = require("./utils/bytesUtils");
const { REVEST, REVEST_ABI, WETH, REVEST_ADDRESS_PROVIDERS, whales, SEPERATOR, ERC20_ABI, SPIRIT_TOKEN, METADATA_URL, SPIRIT_MASTER_CHEF, SPIRIT_FTM_PAIR, SPIRIT_ROUTER, SPIRIT_ROUTER_ABI, SPIRIT_FACTORY, SPIRIT_FTM_PAIR_ABI, WFTM_ABI, DAY, INSPIRIT, SPIRIT_GAUGE_PROXY, SPIRIT_SMART_ABI, SPIRIT_SMART_WHALLET_WHITE_LIST, SPIRIT_GAUGE_PROXY_ABI_ACTUAL, SPIRIT_GAUGE, REVEST_WALLET, SPIRIT_WALLET, REVEST_CUT, BASE_MUL, SPIRIT_CUT } = require("./utils/constants");
const SPIRIT_GAUGE_ABI = require("../artifacts/contracts/mock/spirit/MockSpiritGaugeProxy.sol/Gauge.json")["abi"];
const { MAX_INTEGER } = require("ethereumjs-util");

chai.use(solidity);

describe("Revest SpiritSwap Locker", () => {
    let owner;
    let mockFeeAddress;
    let chainId;
    let mockSpiritGauge;
    let revestSpiritSwapLocker;
    let rvstTokenContract;
    let spiritLPNftContract;
    let wFtmTokenContract;
    let spiritTokenContract;
    let spiritFtmPairContract;
    let spiritRouterContract;
    let spiritMasterChef;
    let spiritGaugeProxy;
    let revestContract;
    let fnftId;
    let minterRole;
    let lockCustodian;
    let lockAmount;
    let lockNFTDesired;
    let lockAsset;
    let lockNFTDesiredAddress;
    let lockNFTPrice;
    let lockNFTMaxSupply;
    let LockQuantity;
    let spiritSwapSmartWallet;

    const NFT_NAME = "SpiritLP-NFT";
    const NFT_SYMBOL = "SPIRIT-NFT";
    
    let whaleSigners = [];
    before(async () => {
        return new Promise(async (resolve) => {
            // runs once before the first test in this block
            // Deploy needed contracts and set up necessary functions
            [owner, mockFeeAddress] = await ethers.getSigners();
            const network = await ethers.provider.getNetwork();
            chainId = network.chainId;

            minterRole = solidityKeccak256(["string"], ["MINTER_ROLE"]);

            const REVEST_ADDRESS_PROVIDER = REVEST_ADDRESS_PROVIDERS[chainId];

            // Set the LP Custodian of the contract to be the Owner?
            const LP_CUSTODIAN = owner.address;

            console.log(SEPERATOR);
            console.log("\tChecking the Whales[0] FTM Balance");
            const whaleFtmBal = await ethers.provider.getBalance(whales[0]);
            console.log(`\tFTM Balance of Whale[0]: ${formatEther(whaleFtmBal)} FTM`);

            console.log(SEPERATOR);
            console.log("\tCreating a Wrapped FTM contract instance");
            wFtmTokenContract = new ethers.Contract(WETH[chainId], WFTM_ABI, owner);

            const whaleWFTMBal = await wFtmTokenContract.balanceOf(whales[0]);
            console.log(`\tWFTM Balance of Whale[0]: ${formatEther(whaleWFTMBal)} wFTM`);

            console.log(SEPERATOR);
            console.log("\tCreating a Revest contract instance");
            revestContract = new ethers.Contract(REVEST[chainId], REVEST_ABI, owner);

            console.log(SEPERATOR);
            console.log("\tCreating a Spirit token contract instance");
            spiritTokenContract = new ethers.Contract(SPIRIT_TOKEN, ERC20_ABI, owner);

            const whaleSpiritBal = await spiritTokenContract.balanceOf(whales[0]);
            console.log(`\tSpirit Balance of Whale[0]: ${formatEther(whaleSpiritBal)} SPIRIT`);

            console.log(SEPERATOR);
            console.log("\tCreating a Spirit-FTM pair instance");
            spiritFtmPairContract = new ethers.Contract(SPIRIT_FTM_PAIR, SPIRIT_FTM_PAIR_ABI, owner);

            console.log(SEPERATOR);
            console.log("\tCreating a Spirit Router instance");
            spiritRouterContract = new ethers.Contract(SPIRIT_ROUTER, SPIRIT_ROUTER_ABI, owner);

            console.log(SEPERATOR);
            console.log("\tCreating a spiritGauge instance");
            spiritGaugeProxy = new ethers.Contract(SPIRIT_GAUGE_PROXY, SPIRIT_GAUGE_PROXY_ABI_ACTUAL, owner);

            console.log(SEPERATOR);
            console.log("\tDeploying an ERC721 Mock Contract System");
            const TestNFT = await ethers.getContractFactory("TestNFT");
            spiritLPNftContract = await TestNFT.deploy(NFT_NAME, NFT_SYMBOL, METADATA_URL);
            await wFtmTokenContract.deployed();

            mockSpiritGauge = new ethers.Contract(SPIRIT_GAUGE, SPIRIT_GAUGE_ABI, owner);

            console.log(SEPERATOR);
            console.log("\tDeploying RevestSpiritSwapLocker Test System");
            const RevestSpiritSwapLocker = await ethers.getContractFactory("RevestSpiritSwapLocker");
            revestSpiritSwapLocker = await RevestSpiritSwapLocker.deploy(
                REVEST_ADDRESS_PROVIDER, 
                SPIRIT_TOKEN, 
                METADATA_URL, 
                LP_CUSTODIAN, 
                mockSpiritGauge.address
            );
            await revestSpiritSwapLocker.deployed();

            console.log(SEPERATOR);
            console.log("\tTestNFT contract grants MinterRole to RevestSpiritSwapLocker");
            await spiritLPNftContract.connect(owner).grantRole(minterRole, revestSpiritSwapLocker.address);
            expect(await spiritLPNftContract.hasRole(minterRole, revestSpiritSwapLocker.address)).to.eq(true);

            // Fund GaugeProxy with tokens and FTM
            let tempSign = ethers.provider.getSigner(whales[4]);
            setupImpersonator(whales[4]);
            await spiritTokenContract.connect(tempSign).transfer(whales[3], ether(100));
                                 

            console.log(SEPERATOR);
            console.log("\tApprove MaxInt256 for Whales to the RevestSpiritSwapLocker contract");
            for (const whale of whales) {
                let signer = ethers.provider.getSigner(whale);
                whaleSigners.push(signer);
                setupImpersonator(whale);
                if(whale != whales[3]) {
                    await approveAll(signer, revestSpiritSwapLocker.address, wFtmTokenContract);
                } 
            }

            await approveAll(owner, revestSpiritSwapLocker.address, wFtmTokenContract);

            let resp = await whaleSigners[4].sendTransaction({
                to: whales[0],
                value: ether(10),
                gasLimit: ethers.BigNumber.from("100000"),
              });

            console.log("\tWrapping 100 FTM");
            const rawTx1 = {
                value: ether(100),
                from: whales[0]
            };
            await wFtmTokenContract.connect(whaleSigners[0]).deposit(rawTx1);

            const rawTxN = {
                value: ether(1000),
                from: whales[4]
            };
            await wFtmTokenContract.connect(whaleSigners[4]).deposit(rawTxN);
            await wFtmTokenContract.connect(whaleSigners[4]).transfer(whales[3], ether(1000));
            await spiritTokenContract.connect(whaleSigners[4]).transfer(whales[3], ether(1000));


            console.log(`\tSwap wFTM with Spirit`);
            const rawTx2 = {
                gasLimit: 999999,
                value: ether(50),
                from: whales[0]
            };
            await spiritRouterContract.connect(whaleSigners[0]).swapExactETHForTokens(0, [wFtmTokenContract.address, spiritTokenContract.address], whales[0], 2031474850, rawTx2);
            
            const whaleSpiritBalAfter = await spiritTokenContract.balanceOf(whales[0]);
            console.log(`\tSpirit Balance of Whale[0]: ${formatEther(whaleSpiritBalAfter)} SPIRIT`);

            const whaleWFTMBalAfter = await wFtmTokenContract.balanceOf(whales[0]);
            console.log(`\tWFTM Balance of Whale[0]: ${formatEther(whaleWFTMBalAfter)} wFTM`);

            console.log(SEPERATOR);
            console.log("\tAdding a liquidity pair to SpiritSwap to the Spirit-FTM pair");
            const latestTimestampe = getLatestBlockTimestamp()
            const spiritAmount = parseUnits("12", 18);
            const wFtmAmount = parseUnits("50", 18);
            //const deadline = ethers.BigNumber.from(latestTimestampe + dayToSec(100));

            const reserves = await spiritFtmPairContract.getReserves();
            console.log(`\tReserve0 is: ${formatEther(reserves[0])}`);
            console.log(`\tReserve1 is: ${formatEther(reserves[0])}`);

            const amountBOptimal = await spiritRouterContract.quote(spiritAmount, reserves[0], reserves[1]);
            console.log(`\tAmountBOptimal: ${formatEther(amountBOptimal)}`);

            const amountAOptimal = await spiritRouterContract.quote(wFtmAmount, reserves[1], reserves[0]);
            console.log(`\tAmountAOptimal: ${formatEther(amountAOptimal)}`);

            console.log(`\tSpiritAmount: ${formatEther(spiritAmount)}`);
            console.log(`\twFtmAmount: ${formatEther(wFtmAmount)}`);

            await spiritTokenContract.connect(whaleSigners[0]).approve(spiritRouterContract.address, ethers.constants.MaxInt256);
            await wFtmTokenContract.connect(whaleSigners[0]).approve(spiritRouterContract.address, ethers.constants.MaxInt256);
            await spiritFtmPairContract.connect(whaleSigners[0]).approve(revestSpiritSwapLocker.address, ethers.constants.MaxInt256);

            const rawTx3 = {
                value: wFtmAmount,
                from: whales[0]
            };
            await spiritRouterContract.connect(whaleSigners[0]).addLiquidityETH(
                spiritTokenContract.address, 
                spiritAmount, 
                0, 
                0, 
                whales[0], 2031474850, rawTx3);

            await revestContract.connect(whaleSigners[1]).modifyWhitelist(revestSpiritSwapLocker.address, true);
            
            // Whitelist Revest
            spiritSwapSmartWallet = new ethers.Contract(SPIRIT_SMART_WHALLET_WHITE_LIST, SPIRIT_SMART_ABI, whaleSigners[2]);
            await spiritSwapSmartWallet.approveWallet(revestSpiritSwapLocker.address);

            const whaleLPBal = await spiritFtmPairContract.balanceOf(whales[0]);
            console.log(`\tSpirit-LP Balance of Whale[0]: ${formatEther(whaleLPBal)} SPIRIT-LP`);

            console.log(SEPERATOR);
            console.log("\tDeployment Completed.\n");
            console.log("\t\t wFTM Token:                       ", wFtmTokenContract.address);
            console.log("\t\t Revest:                           ", revestContract.address);
            console.log("\t\t Spirit Token:                     ", spiritTokenContract.address);
            console.log("\t\t Spirit-FTM Pair:                  ", spiritFtmPairContract.address);
            console.log("\t\t Spirit Router:                    ", spiritRouterContract.address);
            console.log("\t\t spirit-LP NFT:                    ", spiritLPNftContract.address);
            console.log("\t\t Revest SpiritSwap Locker:         ", revestSpiritSwapLocker.address);
            console.log("\t\t Mock Spirit GaugeProxy:           ", mockSpiritGauge.address);
            console.log(SEPERATOR);
            resolve();
        });
    });
    
    it("Should be able to lock spirit LPs", async () => {
        lockCustodian = whales[0];
        lockAmount = ether(1);
        lockNFTDesired = 4;
        lockAsset = spiritFtmPairContract.address; // Lock SpirtLP tokens
        lockNFTDesiredAddress = spiritLPNftContract.address;
        lockNFTPrice = ether(0.25);
        lockNFTMaxSupply = 4;
        LockQuantity = 1;
        
        console.log(`Attempt to mapLPCustodian() and fail, because not owner account`);
        await expect(revestSpiritSwapLocker.connect(whaleSigners[0]).mapLPCustodian(lockAsset, lockCustodian))
            .to.be.revertedWith("Ownable: caller is not the owner");

        console.log(`Attempt to mapLPCustodian() and success`);
        await revestSpiritSwapLocker.connect(owner).mapLPCustodian(lockAsset, lockCustodian);

        console.log(`Checks that lpCustodians has the expected values`);
        expect(await revestSpiritSwapLocker.lpCustodians(lockAsset)).to.eq(lockCustodian);

        console.log(`Attempt to addFarms() and fail, because not owner account`);
        await expect(revestSpiritSwapLocker.connect(whaleSigners[0]).addFarms([spiritFtmPairContract.address], [mockSpiritGauge.address]))
            .to.be.revertedWith("Ownable: caller is not the owner");

        console.log(`Attempt to addFarms() and success`);
        await revestSpiritSwapLocker.connect(owner).addFarms([spiritFtmPairContract.address], [mockSpiritGauge.address]);

        console.log(`Checks that farms has the expected values`);
        // expect(await revestSpiritSwapLocker.farms(wFtmTokenContract.address)).to.eq(spiritFtmPairContract.address);
        // expect(await revestSpiritSwapLocker.farms(spiritTokenContract.address)).to.eq(spiritFtmPairContract.address);

        // Fetch fees for farm and form overload package
        let feeWei = await revestSpiritSwapLocker.connect(owner).getFlatWeiFee(spiritFtmPairContract.address);
        const txnDetails = {value: ether(10)};

        console.log(`Attempt to mapNFTToAsset and fail, because not owner account`);
        await expect(revestSpiritSwapLocker.connect(whaleSigners[0]).mapNFTToAsset(lockNFTPrice, lockNFTMaxSupply, lockAsset, lockNFTDesiredAddress))
            .to.be.revertedWith("Ownable: caller is not the owner");

        console.log(`Attempt to mapNFTToAsset and success`);
        await revestSpiritSwapLocker.connect(owner).mapNFTToAsset(lockNFTPrice, lockNFTMaxSupply, lockAsset, lockNFTDesiredAddress);

        console.log(`Attempt to lockSpiritLPs() and fail, because NFT not available for asset!`);
        await expect(revestSpiritSwapLocker.connect(whaleSigners[0]).lockSpiritLPs(lockNFTDesired, spiritTokenContract.address, lockNFTDesiredAddress, txnDetails))
        .to.be.revertedWith("NFT not available for asset!");

        console.log(`Attempt to lockSpiritLPs() and fail, because Insufficient fees!`);
        await expect(revestSpiritSwapLocker.connect(whaleSigners[0]).lockSpiritLPs(lockNFTDesired, lockAsset, lockNFTDesiredAddress, {value: ether(0)}))
        .to.be.revertedWith("Insufficient fees!");

        console.log(`Attempt to lockSpiritLPs() and success`);
        fnftId = await revestSpiritSwapLocker.connect(whaleSigners[0])
        .callStatic.lockSpiritLPs(lockNFTDesired, lockAsset, lockNFTDesiredAddress, txnDetails);

        console.log(`FNFT-ID ${fnftId}`);

        const whaleSpiritLPBalBefore = await spiritFtmPairContract.balanceOf(whales[0]);

        const nftTotalSupplyBefore = await spiritLPNftContract.totalSupply();

        await revestSpiritSwapLocker.connect(whaleSigners[0]).lockSpiritLPs( lockNFTDesired, lockAsset, lockNFTDesiredAddress, txnDetails);

        const nftTotalSupplyAfter = await spiritLPNftContract.totalSupply();

        console.log(`Checks that the NFT totalsupply has been increased after the lock function`);
        expect(nftTotalSupplyAfter).to.eq(nftTotalSupplyBefore.add(lockNFTDesired));

        const revestSpiritSwapLockerBalAfter = await spiritLPNftContract.balanceOf(revestSpiritSwapLocker.address);

        console.log(`Checks that the balance of the NFT of the RevestSpiritSwap contract after the lock function,`);
        expect(revestSpiritSwapLockerBalAfter).to.eq(lockNFTDesired);

        const whaleSpiritLPBalAfter = await spiritFtmPairContract.balanceOf(whales[0]);
        
        expect(whaleSpiritLPBalAfter).to.eq(whaleSpiritLPBalBefore.sub(lockAmount));

        console.log(`Checks the deposits after the lock function`);
        const deposits = await revestSpiritSwapLocker.deposits(fnftId);
        // expect(deposits.asset).to.eq(spiritFtmPairContract.address);
        // expect(deposits.nft).to.eq(spiritLPNftContract.address);

        console.log(`Attempt to lockSpiritLPs() and fail, because Cannot mint more NFTs than max supply`);
        await expect(revestSpiritSwapLocker.connect(whaleSigners[0]).lockSpiritLPs(lockNFTDesired, lockAsset, lockNFTDesiredAddress, txnDetails))
        .to.be.revertedWith("Cannot mint more NFTs than max supply");
    });
    it("Should be able to withdraw FNFT", async () => {
        await timeTravel(14*DAY);    
        
        await network.provider.send("hardhat_setBalance", [
            whales[3],
            "0x431a4f3098fa1700",
          ]);
        // Should distribute rewards to gauge proxy
        // This method also works but takes far longer
        // await spiritGaugeProxy.distribute();
        // Utilize 5 SPIRIT as "rewards";
        await spiritTokenContract.connect(whaleSigners[3]).approve(mockSpiritGauge.address, ethers.constants.MaxInt256);
        await mockSpiritGauge.connect(whaleSigners[3]).notifyRewardAmount(ethers.utils.parseEther('5'));
        
        // Calculating the LP transfer amounts
        const expectedAmount = lockNFTDesired * lockNFTPrice;
        const expectedRevestCutAmount = expectedAmount * (REVEST_CUT / BASE_MUL);
        const expectedSpiritCutAmount = expectedAmount * (SPIRIT_CUT / BASE_MUL);
        const expectedLpCustodianAmount = expectedAmount - (expectedRevestCutAmount + expectedSpiritCutAmount);

        const whaleNftBalBefore = await spiritLPNftContract.balanceOf(whales[0]);
        const revestSpiritSwapNftBalBefore = await spiritLPNftContract.balanceOf(revestSpiritSwapLocker.address);
        const revestWalletLPBalBefore = await spiritFtmPairContract.balanceOf(REVEST_WALLET);
        const spiritWalletLPBalBefore = await spiritFtmPairContract.balanceOf(SPIRIT_WALLET);
        const lpCustodianWalletLPBalBefore = await spiritFtmPairContract.balanceOf(whales[0]);

        console.log(`Attempt to withdraw() the FNFT and succeed`);
        // Can check to make sure the deposit went through, but we know it did
        await revestContract.connect(whaleSigners[0]).withdrawFNFT(fnftId, 1);

        const whaleNftBalAfter = await spiritLPNftContract.balanceOf(whales[0]);
        const revestSpiritSwapNftBalAfter = await spiritLPNftContract.balanceOf(revestSpiritSwapLocker.address);
        const revestWalletLPBalAfter = await spiritFtmPairContract.balanceOf(REVEST_WALLET);
        const spiritWalletLPBalAfter = await spiritFtmPairContract.balanceOf(SPIRIT_WALLET);
        const lpCustodianWalletLPBalAfter = await spiritFtmPairContract.balanceOf(whales[0]);

        console.log(`Check the balance of NFTs that whale[0] is holding after the withdrawing`);
        expect(whaleNftBalAfter).to.eq(whaleNftBalBefore.add(lockNFTDesired));

        console.log(`Check the balance of NFTs that RevestSpiritSwapLocker contract is holding after the withdrawing`);
        expect(revestSpiritSwapNftBalAfter).to.eq(revestSpiritSwapNftBalBefore.sub(lockNFTDesired));

        console.log(`Check LP transfer to the REVEST_WALLET`);
        expect(revestWalletLPBalAfter).to.eq((revestWalletLPBalBefore + expectedRevestCutAmount));

        console.log(`Check LP transfer to the SPIRIT_WALLET`);
        expect(spiritWalletLPBalAfter).to.eq(spiritWalletLPBalBefore + expectedSpiritCutAmount);
        
        // The LP_Custodian account in this case i
        console.log(`Check LP transfer to the LP_CUSTOIDAN`);
        expect(lpCustodianWalletLPBalAfter).to.eq((lpCustodianWalletLPBalBefore + expectedLpCustodianAmount));
    });
});
