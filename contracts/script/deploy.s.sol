// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Nomaddating } from "../src/nomaddating.sol";
import { BaseScript } from "./Base.s.sol";
import { console } from "forge-std/console.sol";


contract DeployNomaddating is BaseScript {
  
    error DeploymentFailed();
    function run() public broadcast returns (Nomaddating nomaddating) {
        address hubAddress = vm.envAddress("IDENTITY_VERIFICATION_HUB_ADDRESS");
        string memory scopeSeed = vm.envString("SCOPE_SEED");
        nomaddating = new Nomaddating(hubAddress, scopeSeed);
        console.log("Nomaddating deployed to:", address(nomaddating));
        console.log("Identity Verification Hub:", hubAddress);
        console.log("Scope Seed:", scopeSeed);
        console.log("Scope Value:", nomaddating.getCurrentScope());
        console.log("Contract Owner:", nomaddating.owner());
        if (address(nomaddating) == address(0)) revert DeploymentFailed();
        if (nomaddating.getCurrentScope() == 0) revert DeploymentFailed();
        console.log("Deployment verification completed successfully!");
    }
}
