// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IdentityStorage {
    
    // Simple mapping from wallet address to blob ID
    mapping(address => string) public userToBlobId;
    
    // Array to store all addresses that have stored blob IDs
    address[] public userAddresses;
    
    // Events
    event BlobIdStored(address indexed user, string blobId);
    
    constructor() {}
    
    /**
     * @dev Store blob ID for the calling user's wallet address
     * @param blobId The Walrus blob ID to store
     */
    function storeBlobId(string memory blobId) external {
        require(bytes(blobId).length > 0, "Blob ID cannot be empty");
        
        // Only add to array if this is the first time storing for this user
        if (bytes(userToBlobId[msg.sender]).length == 0) {
            userAddresses.push(msg.sender);
        }
        
        userToBlobId[msg.sender] = blobId;
        
        emit BlobIdStored(msg.sender, blobId);
    }
    
    /**
     * @dev Get blob ID for a specific user
     * @param user The wallet address to query
     * @return The blob ID associated with the user
     */
    function getUserBlobId(address user) external view returns (string memory) {
        return userToBlobId[user];
    }
    
    /**
     * @dev Get all user addresses that have stored blob IDs
     * @return Array of all user addresses
     */
    function getAllUserAddresses() external view returns (address[] memory) {
        return userAddresses;
    }
    
    /**
     * @dev Get all blob IDs for all users
     * @return addresses Array of user addresses
     * @return blobIds Array of corresponding blob IDs
     */
    function getAllBlobIds() external view returns (address[] memory addresses, string[] memory blobIds) {
        uint256 length = userAddresses.length;
        addresses = new address[](length);
        blobIds = new string[](length);
        
        for (uint256 i = 0; i < length; i++) {
            addresses[i] = userAddresses[i];
            blobIds[i] = userToBlobId[userAddresses[i]];
        }
        
        return (addresses, blobIds);
    }
    
    /**
     * @dev Get total number of users who have stored blob IDs
     * @return The count of users
     */
    function getTotalUsers() external view returns (uint256) {
        return userAddresses.length;
    }
}