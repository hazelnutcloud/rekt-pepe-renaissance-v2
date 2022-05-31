//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RektPepeRenaissance is ERC721A, Ownable, ReentrancyGuard {

    string private BASE_URI;
    uint256 public immutable amountForDevs;
    uint256 public immutable amountForAuctionAndDev;
    uint256 public immutable maxPerAddressDuringMint;
    uint256 public immutable seedRoundCap;
    uint256 public immutable seedSaleDuration = 4 hours;
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
    function mint(address to, uint256 quanitity) public onlyOwner {
        _mint(to, quanitity);   
        emit Mint(to, quanitity);
    }
    function payable_mint(address to, uint256 quantity) public payable returns (bool) {
        require(quantity <= MAX_MINT, "Max mint of 5");
        require(msg.value >= FLOOR_PRICE * quantity, "Insufficient funds for floor price");
        _mint(to, quantity);
        emit Mint(to, quantity);
    }
    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender);
        _burn(tokenId);
        emit Burn(tokenId);
    }
    function transfer(address from, address to, uint256 tokenId) public {
        require(from == msg.sender);
        safeTransferFrom(from, to, tokenId);
    }
    function withdrawCharity() public payable onlyOwner {
        require(
            amountForAuctionAndDev_ <= collectionSize_,
            "larger collection size needed"
        );
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
        refundIfOver(price);
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
        require(msg.value >= price, "Need to send more ETH.");
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
    /* Maintaining this function for charlie's tests. Will be removed soon. */
    function payable_mint(address to, uint256 quantity) public payable{
        // require(quantity <= MAX_MINT, "Max mint of 5");
        // require(msg.value >= FLOOR_PRICE * quantity, "Insufficient funds for floor price");
        _safeMint(to, quantity);
        emit Mint(to, quantity);
    }
}