//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RektPepeRenaissance is ERC721A, Ownable {

    uint256 FLOOR_PRICE;
    uint256 MAX_MINT;

    event Mint(address indexed to, uint256 indexed quantity);
    event Burn(uint256 indexed tokenId);

    constructor() ERC721A("RektPepeRenaissance", "RPR") Ownable() {
        FLOOR_PRICE = 1 ether;
        MAX_MINT = 5;
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
            payable(owner()).send(address(this).balance)
        );
    }
}