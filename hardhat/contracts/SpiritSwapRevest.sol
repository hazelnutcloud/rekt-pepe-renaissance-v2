// SPDX-License-Identifier: GNU-GPL v3.0 or later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import '@openzeppelin/contracts/utils/introspection/ERC165.sol';
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import "./interfaces/IOutputReceiver.sol";
import "./interfaces/ITokenVault.sol";
import "./interfaces/IFeeReporter.sol";
import "./interfaces/IRevest.sol";
import "./interfaces/IFNFTHandler.sol";
import "./interfaces/ILockManager.sol";
import "./interfaces/IAddressRegistry.sol";
import "./interfaces/IRewardsHandler.sol";


interface IWETH {
    function deposit() external payable;
}

interface IGauge {
    function deposit(uint amount) external;
    function withdraw(uint amount) external;
    function earned(address account) external view returns (uint rewards);
    function getReward() external;
    function derivedBalance(address account) external view returns (uint);
    function balanceOf(address account) external view returns (uint256);
}

interface IERC_721 {
    // Specs taken from OpenZeppelin ERC721 contract
    // Implementing contracts should ideally use _safeMint internally
    function mint(address to) external;
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;
}

interface IInSpirit {
    function create_lock(uint _value, uint _unlock_time) external;
}

/**
 * @title
 * @dev 
 */
contract RevestSpiritSwapLocker is IOutputReceiver, Ownable, ERC165, ERC721Holder, IFeeReporter {

    using SafeERC20 for IERC20;

    address public addressRegistry;
    string public  metadata;

    uint private constant PRECISION = 10**27;
    uint private constant MAX_MUL = 25*10**26;
    uint private constant MAX_INT = 2 ** 256 - 1;
    uint private constant MAX_TIME = 4 * 365 * 86400 - 1; // 4 years

    uint private weiFee = 10 ether; // 10 FTM per mint
    uint private erc20Fee = 100; // 

    bool private withdrawSpirit = false;

    // The period for which the LP tokens will be locked
    uint public lockupPeriod = 2 weeks;

    // The address which will receive custody of the LP tokens at end of lockup
    mapping(address => address) public lpCustodians; 

    // The default address is one is not specified
    address public lpCustodian;

    // The SPIRIT token address
    address public immutable spirit;

    // The Spirit-Fantom LP GaugeProxy Contract
    // SOLELY used to determine what our max derived bal is
    address private immutable SPIRIT_FTM_GAUGE;// = 0xEFe02cB895b6E061FA227de683C04F3Ce19f3A62;

    address private constant INSPIRIT = 0x2FBFf41a9efAEAE77538bd63f1ea489494acdc08;

    address private constant WFTM = 0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83;

    address private constant SPIRIT_WALLET = 0xB106c39D2408c15D750f21797e232890E7C3eBEc;
    address private constant REVEST_WALLET = 0x05661eE5e1AcD6532DB7b9d5Bd23447fd89c91fd;
    
    // NO NEED FOR SETTERS
    uint private constant BASE_MUL = 1000*PRECISION;
    uint private constant REVEST_CUT = 50 * PRECISION;
    uint private constant SPIRIT_CUT = 50 * PRECISION;

    // A mapping that points LP pairs to farm addresses
    mapping(address => address) public farms;

    // A mapping to state if an address has approvals to spend – save on gas over time
    mapping(address => mapping (address => bool)) private hasApproval;

    // A mapping to store info about deposits
    mapping(uint => DepositTracker) public deposits;

    // Maps asset to NFT which maps to details
    mapping(address => mapping(address => NFTDetails)) public nftAssetMappings;

    // Track approved depositors on behalf of this contract
    mapping(address => bool) public approved;

    // Map accounts to assets to balances
    mapping(address => mapping(address => uint)) public accountsPayable;

    struct DepositTracker {
        address asset;
        address nft;
        uint[] nftIds;
    }

    struct NFTDetails {
        uint nextIdForNFT;
        uint pricePerNFT;
        uint maxSupplyNFT;
    }


    constructor(address _provider, address _spirit, string memory _meta, address _lpCustodian, address gauge) {
        addressRegistry = _provider;
        metadata = _meta;
        spirit = _spirit;
        lpCustodian = _lpCustodian;
        SPIRIT_FTM_GAUGE = gauge;
        IERC20(_spirit).approve(INSPIRIT, MAX_INT);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IOutputReceiver).interfaceId
            || super.supportsInterface(interfaceId);
    }

    function lockSpiritLPs(uint nftsDesired, address asset, address nftDesired) external payable returns (uint fnftId) {
        NFTDetails storage nft = nftAssetMappings[asset][nftDesired];
        require(nft.maxSupplyNFT > 0, 'NFT not available for asset!');
        require(nft.nextIdForNFT + nftsDesired - 1 < nft.maxSupplyNFT, 'Cannot mint more NFTs than max supply');
        require(msg.value >= getFlatWeiFee(nftDesired), 'Insufficient fees!');
        
        // Begin by transferring tokens to this address
        // Requires approval for this contract
        uint amount = nftsDesired * nft.pricePerNFT;
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);

        IRevest.FNFTConfig memory fnftConfig;
        fnftConfig.asset = asset;
        fnftConfig.depositAmount = amount;
        fnftConfig.pipeToContract = address(this);

        address[] memory recipients = new address[](1);
        recipients[0] = msg.sender;

        uint[] memory quantities = new uint[](1);
        quantities[0] = 1;

        // Only perform farm operations if farm exists
        address farm = farms[asset];
        if(farm != address(0)) {
            deposit(asset, farm, amount);
            // ERC20 manipulation complete, can now create FNFT
            // Use address(0) as placeholder with non-zero amount, since we are not storing in Revest
            fnftConfig.asset = address(0);     
        } 
        {
            address revest = IAddressRegistry(addressRegistry).getRevest();
            if(asset != address(0) && !hasApproval[revest][asset]) {
                IERC20(asset).approve(revest, MAX_INT);
                hasApproval[revest][asset] = true;
            }
            // Handle flat fees for Revest
            if(msg.value > 0) {
                uint wftmFee = msg.value;
                address rewards = IAddressRegistry(addressRegistry).getRewardsHandler();
                IWETH(WFTM).deposit{value: msg.value}();
                if(!hasApproval[rewards][WFTM]) {
                    IERC20(WFTM).approve(rewards, MAX_INT);
                    hasApproval[rewards][WFTM] = true;
                }
                IRewardsHandler(rewards).receiveFee(WFTM, wftmFee);
            }
            fnftId = IRevest(revest).mintTimeLock(block.timestamp + lockupPeriod, recipients, quantities, fnftConfig);
        }

        uint[] memory nftIdList = new uint[](nftsDesired);
        for(uint i = 0; i < nftsDesired; i++) {
            //We'll hold the NFTs here
            IERC_721(nftDesired).mint(address(this));
            nftIdList[i] = nft.nextIdForNFT + i;
        }
        
        // Finally, we store the data – must store info about asset in case we used address(0)
        deposits[fnftId] = DepositTracker(fnftConfig.asset == address(0) ? asset : address(0), nftDesired, nftIdList);
        nft.nextIdForNFT += nftsDesired;
    }

    function receiveRevestOutput(
        uint fnftId,
        address asset,
        address payable payee,
        uint
    ) external override  {
        address vault = IAddressRegistry(addressRegistry).getTokenVault();
        require(msg.sender == vault, "E016");

        DepositTracker memory tracker = deposits[fnftId];
        asset = asset == address(0) ? tracker.asset : asset;
        uint amount = ITokenVault(vault).getFNFT(fnftId).depositAmount;

        // Handle changes to farm
        address farm = farms[asset];
        if(farm != address(0)) {
            withdraw(asset, farm, amount);
        } 
        
        IERC20(asset).safeTransfer(REVEST_WALLET, amount * REVEST_CUT / BASE_MUL);
        IERC20(asset).safeTransfer(SPIRIT_WALLET, amount * SPIRIT_CUT / BASE_MUL);
        amount -= ((amount * REVEST_CUT / BASE_MUL) + (amount * REVEST_CUT / BASE_MUL));
        IERC20(asset).safeTransfer(lpCustodians[asset] == address(0) ? lpCustodian : lpCustodians[asset], amount);
        
        for(uint i = 0; i < tracker.nftIds.length; i++) {
            IERC_721(tracker.nft).safeTransferFrom(address(this), payee, tracker.nftIds[i]);
        }

        delete(deposits[fnftId]);
    }

    function proxyDeposit(
        address asset,
        uint amount
    ) external {
        require(approved[msg.sender], 'Access denied!');
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        address farm = farms[asset];
        require(farm != address(0), 'No farm available!');
        deposit(asset, farm, amount);
        accountsPayable[msg.sender][asset] += amount;
    }

    // TODO: Understand better how to route SPIRIT tokens
    function proxyWithdrawal(
        address asset,
        uint amount
    ) external {
        require(approved[msg.sender], 'Access denied!');
        require(accountsPayable[msg.sender][asset] >= amount, 'Insufficient funds!');
        address farm = farms[asset];
        require(farm != address(0), 'No farm available!');

        withdraw(asset, farm, amount);
        accountsPayable[msg.sender][asset] -= amount;
        IERC20(asset).safeTransfer(msg.sender, amount);
    }

    function deposit(address asset, address farm, uint amount) internal {
        // Check to ensure farm has approval to spend tokens
        if(!hasApproval[farm][asset]) {
            IERC20(asset).approve(farm, MAX_INT);
            hasApproval[farm][asset] = true;
        }
        // Farm is GaugeProxy, use direct call
        IGauge(farm).deposit(amount);
        
    }

    function withdraw(address asset, address farm, uint amount) internal {
        

        // Withdraw rewards to this contract
        IGauge(farm).getReward();

        // Use direct call to claim SPIRIT
        IGauge(farm).withdraw(amount);
        
        // Can utilize a measure of the current balance of this contract and its multiplier to route the SPIRIT
        // Target Spirit-FTM LP to determine if multiplier is optimal with current inSPIRIT
        uint bal = IGauge(SPIRIT_FTM_GAUGE).balanceOf(address(this));
        
        uint spiritReward = IERC20(spirit).balanceOf(address(this));
        
        if(spiritReward == 0) {
            // Edge case handling
            return;
        }

        if(!withdrawSpirit && (bal == 0 || (PRECISION * IGauge(SPIRIT_FTM_GAUGE).derivedBalance(address(this)) / bal) < MAX_MUL)) {
            // Should lock up for inSPIRIT
            if(!hasApproval[INSPIRIT][spirit]) {
                IERC20(spirit).approve(INSPIRIT, MAX_INT);
                hasApproval[INSPIRIT][spirit] = true;
            }
            IInSpirit(INSPIRIT).create_lock(spiritReward, block.timestamp + MAX_TIME);
        } else {
            // Forward to dev wallet
            IERC20(spirit).safeTransfer(REVEST_WALLET, spiritReward);
        }
    }

    function getCustomMetadata(uint) external view override returns (string memory) {
        return metadata;
    }

    function getValue(uint fnftId) external view override returns (uint) {
        return ITokenVault(IAddressRegistry(addressRegistry).getTokenVault()).getFNFT(fnftId).depositAmount;
    }

    function getAsset(uint fnftId) external view override returns (address) {
        return ITokenVault(IAddressRegistry(addressRegistry).getTokenVault()).getFNFT(fnftId).asset;
    }

    function getOutputDisplayValues(uint fnftId) external view override returns (bytes memory byteArr) {
        DepositTracker memory info = deposits[fnftId];
        string memory tokenURI = IERC721Metadata(info.nft).tokenURI(info.nftIds[0]);
        byteArr = abi.encode(tokenURI, info.nft, info.nftIds);
    }

    function setAddressRegistry(address addressRegistry_) external override onlyOwner {
        addressRegistry = addressRegistry_;
    }

    function getAddressRegistry() external view override returns (address) {
        return addressRegistry;
    }

    function getRevest() internal view returns (IRevest) {
        return IRevest(IAddressRegistry(addressRegistry).getRevest());
    }

    function setLockupPeriod(uint period) external onlyOwner {
        lockupPeriod = period;
    }

    function mapLPCustodian(address asset, address custodian) external onlyOwner {
        lpCustodians[asset] = custodian;
    }

    function setDefaultCustodian(address custodian) external onlyOwner {
        lpCustodian = custodian;
    }

    function addFarms(address[] memory tokenPairs, address[] memory farmAdds) external onlyOwner {
        for(uint i = 0; i < tokenPairs.length; i++) {
            farms[tokenPairs[i]] = farmAdds[i];
        }
    }

    function setShouldWithdrawSpirit(bool value) external onlyOwner {
        withdrawSpirit = value;
    }

    function setWeiFee(uint fee) external onlyOwner {
        weiFee = fee;
    }


    // Implicit assumption that this contract has the minter role
    // Any contract that doesn't have the minter role will fail
    function mapNFTToAsset(uint pricePerNFT, uint maxSupply, address asset, address nft) external onlyOwner {
        nftAssetMappings[asset][nft] = NFTDetails(0, pricePerNFT, maxSupply);
    }

    function setApprovalForProxyDeposit(address account, bool approval) external onlyOwner {
        approved[account] = approval;
    }

    // Admin helper function for edge-cases
    function proxyApproval(address[] memory tokens, address[] memory spenders) external onlyOwner {
        for(uint i = 0; i < spenders.length; i++) {
            IERC20(tokens[i]).approve(spenders[i], MAX_INT);
        }
    }

    /// Proxy function to send arbitrary messages. Useful for delegating votes and similar activities
    function proxyExecute(
        address destination,
        bytes memory data
    ) external payable onlyOwner {
        (bool success, )= destination.call{value:msg.value}(data);
        require(success, 'Proxy call failed!');
    }

    function getFlatWeiFee(address) public view override returns (uint) {
        return weiFee;
    }

    function getERC20Fee(address) external pure override returns (uint) {
        return 0;
    }

    /**
     * @dev See {IERC721Receiver-onERC721Received}.
     *
     * Always returns `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }


    

}