// SPDX-License-Identifier: GNU-GPL v3.0 or later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Mock721 is ERC721 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) { 
        _mint(msg.sender, 0);
        _mint(msg.sender, 1);
    }
}
 