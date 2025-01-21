// contracts/ERC20Token.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Token is ERC20, Ownable {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000 * 10**18); // Mint 1000 tokens to the deployer
    }
        // Mint function to create new tokens
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
