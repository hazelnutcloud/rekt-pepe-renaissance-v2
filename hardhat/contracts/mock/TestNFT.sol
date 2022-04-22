// SPDX-License-Identifier: GNU-GPL v3.0 or later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract TestNFT is ERC721PresetMinterPauserAutoId {
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721PresetMinterPauserAutoId(name, symbol, baseTokenURI) { }
}
 