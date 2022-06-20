//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC721A.sol";
import "./RPRSmartWallet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract RektPepeRenaissance is ERC721A, Ownable, ReentrancyGuard {

    string private BASE_URI;
    uint256 public immutable amountForDevs;
    uint256 public immutable amountForAuctionAndDev;
    uint256 public immutable maxPerAddressDuringMint;
    uint256 public immutable seedRoundCap;
    uint256 public immutable seedSaleDuration = 4 hours;
    address public immutable smartWalletTemplate;
    struct SaleConfig {
        uint32 preSaleStartTime;
        uint64 seedRoundPrice;
        uint64 publicPrice;
        uint64 prePrice;
    }

    SaleConfig public saleConfig;
    mapping(address => uint256) public allowlist;

    event Mint(address indexed to, uint256 indexed quantity);
    event Burn(uint256 indexed tokenId);

    modifier callerIsUser() {
        require(msg.sender == tx.origin, "Caller is another contract");
        _;
    }

    constructor(
        uint256 maxBatchSize_,
        uint256 collectionSize_,
        uint256 seedRoundCap_,
        uint256 amountForAuctionAndDev_,
        uint256 amountForDevs_,
        string memory baseUri_
    ) ERC721A("RektPepeRenaissance", "RPR", maxBatchSize_, collectionSize_) {
        maxPerAddressDuringMint = maxBatchSize_;
        amountForAuctionAndDev = amountForAuctionAndDev_;
        amountForDevs = amountForDevs_;
        BASE_URI = baseUri_;
        seedRoundCap = seedRoundCap_;
        RPRSmartWallet smartWallet = new RPRSmartWallet();
        smartWalletTemplate = address(smartWallet);
    }
    /*
        These methods serve as wrappers and will be removed whenever Charlie finishes his tests
    */
    function mint(address to, uint256 quanitity) public onlyOwner {
        _safeMint(to, quanitity);   
        emit Mint(to, quanitity);
    }
    function payable_mint(address to, uint256 quantity) public payable returns (bool) {
        require(quantity <= maxBatchSize, "Max mint of 5");
        require(msg.value >= 1 ether * quantity, "Insufficient funds for floor price");
        _safeMint(to, quantity);
        emit Mint(to, quantity);
    }
    /*
        WARNING:    BURNING TOKENS WITH ASSETS REMAINING IN THEIR 
                    ASSOCIATED SMART WALLET WILL RESULT IN THE ASSETS BEING LOST FOREVER.
    */
    function burn(uint256 tokenId) public {
        bool isApprovedOrOwner = (_msgSender() == ownerOf(tokenId) ||
            getApproved(tokenId) == _msgSender() ||
            isApprovedForAll(ownerOf(tokenId), _msgSender()));

        require(isApprovedOrOwner, "You are not the owner or approved");
        _burn(tokenId);
    }
    function transfer(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId);
    }
 
    function seedRoundMint(uint256 quantity) external payable callerIsUser {
        uint256 price = uint256(saleConfig.seedRoundPrice);
        require(price != 0, "Seed round not yet started");
        require(block.timestamp < uint256(saleConfig.preSaleStartTime), "seed round is over");
        require(allowlist[msg.sender] > 0, "Ineligible for seed round mint");
        require(allowlist[msg.sender] >= quantity, "Attempting to mint more than allowed");
        require(totalSupply() + quantity <= seedRoundCap, "reached max supply");
        // Might be able to do this unchecked
        allowlist[msg.sender] -= quantity;
        _safeMint(msg.sender, quantity);
        refundIfOver(quantity * price);
        emit Mint(msg.sender, quantity);
    }
    // param2 is currently unused
    function preSaleMint(uint256 quantity)
        external
        payable
        callerIsUser
    {
        SaleConfig memory config = saleConfig;
        uint256 prePrice = uint256(config.prePrice);
        uint256 preSaleStartTime = uint256(config.preSaleStartTime);
        require(
            isPreSaleOn(prePrice, preSaleStartTime),
            "Pre-sale not yet started"
        );
        require(totalSupply() + quantity <= collectionSize, "reached max supply");
        require(
            numberMinted(msg.sender) + quantity <= maxPerAddressDuringMint,
            "can not mint this many"
        );
        _safeMint(msg.sender, quantity);
        refundIfOver(prePrice * quantity);
        emit Mint(msg.sender, quantity);
    }
    function publicSaleMint(uint256 quantity)
        external
        payable
        callerIsUser
    {
        SaleConfig memory config = saleConfig;
        uint256 publicPrice = uint256(config.publicPrice);
        uint256 publicSaleStartTime = uint256(config.preSaleStartTime + seedSaleDuration);

        require(
            isPublicSaleOn(publicPrice, publicSaleStartTime),
            "public sale has not begun yet"
        );
        require(totalSupply() + quantity <= collectionSize, "reached max supply");
        require(
            numberMinted(msg.sender) + quantity <= maxPerAddressDuringMint,
            "can not mint this many"
        );
        _safeMint(msg.sender, quantity);
        refundIfOver(publicPrice * quantity);
        emit Mint(msg.sender, quantity);
    }

    function refundIfOver(uint256 price) private {
        require(msg.value >= price, "Insufficient funds");
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }

    function isPublicSaleOn(
        uint256 publicPriceWei,
        uint256 publicSaleStartTime
    ) internal view returns (bool) {
        return
        publicPriceWei != 0 &&
        block.timestamp >= publicSaleStartTime;
    }

    function isPreSaleOn(
        uint256 prePriceWei,
        uint256 preSaleStartTime
    ) internal view returns (bool) {
        return
        prePriceWei != 0 &&
        block.timestamp >= preSaleStartTime &&
        block.timestamp < preSaleStartTime + seedSaleDuration;
    }

    function setSaleConfig(
        uint32 preSaleStartTime_,
        uint64 publicPriceWei_,
        uint64 prePriceWei_
    ) external onlyOwner {
        saleConfig = SaleConfig(
            preSaleStartTime_,
            0, //seedRound price
            publicPriceWei_,
            prePriceWei_
        );
    }

    function enableSeedRound() external onlyOwner {
        require(
            saleConfig.seedRoundPrice == 0,
            "seed round already enabled"
        );
        saleConfig.seedRoundPrice = 0.07 ether;
    }

    function seedAllowlist(address[] memory addresses, uint256[] memory numSlots)
        external
        onlyOwner
    {
        require(
        addresses.length == numSlots.length,
        "addresses does not match numSlots length"
        );
        for (uint256 i = 0; i < addresses.length; i++) {
            allowlist[addresses[i]] = numSlots[i];
        }
    }
      // For marketing etc.
    function devMint(uint256 quantity) external onlyOwner {
        require(
        totalSupply() + quantity <= amountForDevs,
        "too many already minted before dev mint"
        );
        require(
        quantity % maxBatchSize == 0,
        "can only mint a multiple of the maxBatchSize"
        );
        uint256 numChunks = quantity / maxBatchSize;
        for (uint256 i = 0; i < numChunks; i++) {
        _safeMint(msg.sender, maxBatchSize);
        }
    }

    function setOwnersExplicit(uint256 quantity) external onlyOwner nonReentrant {
        _setOwnersExplicit(quantity);
    }
    function withdrawCharity() external onlyOwner nonReentrant {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }
    function _baseURI() internal view virtual override returns (string memory) {
        return BASE_URI;
    }
    function setBaseURI(string memory _new) external onlyOwner {
        BASE_URI = _new;
    }
    function numberMinted(address owner) public view returns (uint256) {
        return _numberMinted(owner);
    }
    function getOwnershipData(uint256 tokenId)
        external
        view
        returns (TokenOwnership memory)
    {
        return ownershipOf(tokenId);
    }

    /*
        Smart Wallet Methods
    */

    function getWalletForTokenId(uint256 tokenId) private returns (RPRSmartWallet wallet) {
        wallet = RPRSmartWallet(Clones.cloneDeterministic(smartWalletTemplate, keccak256(abi.encode(tokenId))));
    }

    function getWalletAddressForTokenId(uint256 tokenId) public returns (address walletAddress) {
        walletAddress = Clones.cloneDeterministic(smartWalletTemplate, keccak256(abi.encode(tokenId)));
    }
    // Should only the wallets owner be able to deposit ether into it? Technically anyone can figure out the address
    // and just send ether to it? Is this method even needed? Are any of these methods actually needed? Is it 
    // enough to just provide the address of the smart wallet and let the user do as they will?

    function depositERC20(address _contract, uint256 amount, uint256 walletId) external callerIsUser {
        IERC20(_contract).transferFrom(_msgSender(), getWalletAddressForTokenId(walletId), amount);
    }

    function depositERC721(address _contract, uint256 tokenId, uint256 walletId) external callerIsUser {
        IERC721(_contract).safeTransferFrom(_msgSender(), getWalletAddressForTokenId(walletId), tokenId);
    }

    function withdrawEther(uint256 walletId) external callerIsUser {
        TokenOwnership memory ownership = ownershipOf(walletId);

        require(_msgSender() == ownership.addr, "Only the token owner can withdraw ether");

        getWalletForTokenId(walletId).withdrawEther(_msgSender());
    }

    function withdrawERC20(address _contract, uint256 amount, uint256 walletId) external callerIsUser {
        TokenOwnership memory ownership = ownershipOf(walletId);

        require(_msgSender() == ownership.addr, "Only the token owner can withdraw ERC20");

        getWalletForTokenId(walletId).withdrawERC20(_contract, amount, _msgSender());
    }

    function withdrawERC721(address _contract, uint256 tokenId, uint256 walletId) external callerIsUser {
        TokenOwnership memory ownership = ownershipOf(walletId);

        require(_msgSender() == ownership.addr, "Only the token owner can withdraw ERC721");

        getWalletForTokenId(walletId).withdrawERC721(_contract, tokenId, _msgSender());
    }
    
}