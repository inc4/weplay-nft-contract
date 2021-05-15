// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Token is AccessControl, ERC721URIStorage {
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  Counters.Counter private tokenCounter;

  constructor() ERC721("WePlay", "WPL") {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(MINTER_ROLE, msg.sender);
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  function mint(address to, string memory uri) public onlyRole(MINTER_ROLE) returns (uint256) {
    Counters.increment(tokenCounter);

    uint256 id = Counters.current(tokenCounter);
    _mint(to, id);
    _setTokenURI(id, uri);

    return id;
  }
}
