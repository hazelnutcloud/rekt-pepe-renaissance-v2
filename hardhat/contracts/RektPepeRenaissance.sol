//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RektPepeRenaissance is ERC721A, Ownable {
    event Mint(address indexed to, uint256 indexed quantity);

    constructor() ERC721A("RektPepeRenaissance", "RPR") Ownable() {

    }
    function mint(address to, uint256 quantity) public onlyOwner {
        _mint(to, quantity);
        emit Mint(to, quantity);
    }
}