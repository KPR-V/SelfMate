// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { console } from "forge-std/console.sol";
import { BaseScript } from "./Base.s.sol";
import "../src/IdentityStorage.sol";

contract Deploy is BaseScript {
    function run() public broadcast returns (IdentityStorage identityStorage) {
        identityStorage = new IdentityStorage();
        console.log("IdentityStorage deployed to:", address(identityStorage));
        
        // Log deployment address
        require(address(identityStorage) != address(0), "Deployment failed");
    }
}