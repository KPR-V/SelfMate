// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {CountryCodes} from "@selfxyz/contracts/contracts/libraries/CountryCode.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Nomaddating is
    SelfVerificationRoot,
    Ownable,
    ReentrancyGuard,
    Pausable
{
    using Math for uint256;
    uint256 public totalUsers;
    bytes32 immutable configID;
    mapping(address => bool) public verifiedHumans;

    error InvalidFunctionCall(bytes4 selector);

    constructor(
        address _identityVerificationHubV2Address,
        string memory _scopeSeed
    )
        SelfVerificationRoot(_identityVerificationHubV2Address, _scopeSeed)
        Ownable(msg.sender)
    {
 string[] memory forbiddenCountries = new string[](3);
    forbiddenCountries[0] = CountryCodes.PAKISTAN;
    forbiddenCountries[1] = CountryCodes.AZERBAIJAN; 
    forbiddenCountries[2] = CountryCodes.KAZAKHSTAN;


        SelfUtils.UnformattedVerificationConfigV2 memory rawConfig = SelfUtils
            .UnformattedVerificationConfigV2({
                olderThan: 18,
                forbiddenCountries: forbiddenCountries,
                ofacEnabled: true
            });
        SelfStructs.VerificationConfigV2 memory formattedConfig = SelfUtils
            .formatVerificationConfigV2(rawConfig);

        configID = IIdentityVerificationHubV2(_identityVerificationHubV2Address)
            .setVerificationConfigV2(formattedConfig);
    }

    modifier onlyVerifiedHuman() {
        require(
            verifiedHumans[msg.sender],
            "Must be Self Protocol verified human"
        );
        _;
    }

    function getCurrentScope() public view returns (uint256) {
        return _scope;
    }

    event UserVerified(
        address indexed user,
        ISelfVerificationRoot.GenericDiscloseOutputV2 output,
        bytes userData
    );

    function getConfigId(
        bytes32,
        bytes32,
        bytes memory userDefinedData
    ) public view override returns (bytes32) {
        return configID;
    }

    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory _output,
        bytes memory _userData
    ) internal override nonReentrant whenNotPaused {
        address userAddress = address(uint160(uint256(_output.userIdentifier)));
        require(!verifiedHumans[userAddress], "User already verified");
        verifiedHumans[userAddress] = true;
        totalUsers++;
        emit UserVerified(userAddress, _output, _userData);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
    function removeVerifiedHuman(address user) external onlyOwner {
        verifiedHumans[user] = false;
    }

    fallback() external payable {
        revert InvalidFunctionCall(msg.sig);
    }
}
