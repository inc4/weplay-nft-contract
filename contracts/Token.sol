// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";  // // Use for OpenSea integration
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


// Use for OpenSea integration
contract OwnableDelegateProxy {}

contract ProxyRegistry {
  mapping(address => OwnableDelegateProxy) public proxies;
}


contract Token is AccessControl, ERC721URIStorage, Ownable {
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  Counters.Counter private tokenCounter;
  address proxyRegistryAddress;  // The address of the OpenSea proxy registry


  constructor(address _proxyRegistryAddress) ERC721("WePlay", "WPL") {
    proxyRegistryAddress = _proxyRegistryAddress;
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


  // Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
  function isApprovedForAll(address owner, address operator) override public view returns (bool) {
    ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
    if (address(proxyRegistry.proxies(owner)) == operator) {
      return true;
    }
    return super.isApprovedForAll(owner, operator);
  }

}
