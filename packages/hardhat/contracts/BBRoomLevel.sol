// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./BBVersion.sol";

/**
 * @title BBRoomLevel
 * @dev Niu Niu game room level NFT contract that determines how many rooms a player can create
 */
contract BBRoomLevel is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    using Strings for uint256;

    // Room level structure
    struct LevelType {
        uint256 id;              // Unique identifier for the level type
        string name;             // Name of the level (e.g., "BRONZE", "SILVER", "GOLD")
        uint256 maxRooms;        // Maximum number of rooms allowed with this level
        uint256 price;           // Price to purchase this level
        string uriSuffix;        // URI suffix for metadata
        bool active;             // Whether this level type is active
    }

    // Level details structure for returning comprehensive information
    struct LevelDetails {
        uint256 tokenId;         // Level token ID
        uint256 levelTypeId;     // Level type ID
        string name;             // Level type name
        uint256 maxRooms;        // Maximum number of rooms allowed
        string uriSuffix;        // URI suffix
    }

    // Used to generate unique token IDs
    uint256 private _tokenIdCounter;

    // Used to generate unique level type IDs
    uint256 private _levelTypeIdCounter;

    // Room level base URI
    string private _baseTokenURI;

    // Game main contract address
    address public gameMainAddress;

    // Level types by ID
    mapping(uint256 => LevelType) public levelTypes;

    // Level type ID corresponding to each token ID
    mapping(uint256 => uint256) public tokenLevelTypes;

    // Array of all level type IDs
    uint256[] private _allLevelTypeIds;

    // Using centralized version management
    function getVersion() public pure returns (string memory) {
        return BBVersion.VERSION;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialization function, replaces constructor
     */
    function initialize(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) public initializer {
        __ERC721_init(name, symbol);
        __ERC721Enumerable_init();
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        _baseTokenURI = baseTokenURI;
        _tokenIdCounter = 0;
        _levelTypeIdCounter = 1; // Start from 1
    }

    /**
     * @dev Set the game main contract address
     * @param _gameMainAddress Game main contract address
     */
    function setGameMainAddress(address _gameMainAddress) external onlyOwner {
        require(_gameMainAddress != address(0), "Invalid game main address");
        gameMainAddress = _gameMainAddress;
    }

    /**
     * @dev Add a new level type
     * @param name Name of the level type
     * @param maxRooms Maximum number of rooms allowed
     * @param price Price to purchase this level
     * @param uriSuffix URI suffix for metadata
     * @return The ID of the newly created level type
     */
    function addLevelType(
        string memory name,
        uint256 maxRooms,
        uint256 price,
        string memory uriSuffix
    ) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(maxRooms > 0, "Max rooms must be greater than 0");
        require(price > 0, "Price must be greater than 0");

        // Generate new level type ID
        uint256 newLevelTypeId = _levelTypeIdCounter;
        _levelTypeIdCounter++;

        // Create new level type
        levelTypes[newLevelTypeId] = LevelType({
            id: newLevelTypeId,
            name: name,
            maxRooms: maxRooms,
            price: price,
            uriSuffix: uriSuffix,
            active: true
        });

        // Add to list of all level types
        _allLevelTypeIds.push(newLevelTypeId);

        emit LevelTypeAdded(newLevelTypeId, name, maxRooms, price, uriSuffix);
        return newLevelTypeId;
    }

    /**
     * @dev Update an existing level type
     * @param levelTypeId Level type ID to update
     * @param maxRooms New maximum number of rooms
     * @param price New price
     * @param uriSuffix New URI suffix
     */
    function updateLevelType(
        uint256 levelTypeId,
        uint256 maxRooms,
        uint256 price,
        string memory uriSuffix
    ) external onlyOwner {
        // Verify level type exists
        require(levelTypes[levelTypeId].id == levelTypeId, "Level type does not exist");
        require(maxRooms > 0, "Max rooms must be greater than 0");
        require(price > 0, "Price must be greater than 0");

        LevelType storage levelType = levelTypes[levelTypeId];
        levelType.maxRooms = maxRooms;
        levelType.price = price;
        levelType.uriSuffix = uriSuffix;

        emit LevelTypeUpdated(levelTypeId, maxRooms, price, uriSuffix);
    }

    /**
     * @dev Set a level type's active status
     * @param levelTypeId Level type ID
     * @param active New active status
     */
    function setLevelTypeActive(uint256 levelTypeId, bool active) external onlyOwner {
        // Verify level type exists
        require(levelTypes[levelTypeId].id == levelTypeId, "Level type does not exist");

        levelTypes[levelTypeId].active = active;
        emit LevelTypeActiveStatusChanged(levelTypeId, active);
    }

    /**
     * @dev Purchase a room level
     * @param levelTypeId Level type ID
     * @return Returns the minted level token ID
     */
    function buyRoomLevel(uint256 levelTypeId) external payable returns (uint256) {
        LevelType memory levelType = levelTypes[levelTypeId];
        // Verify level type exists and is active
        require(levelType.id == levelTypeId, "Level type does not exist");
        require(levelType.active, "Level type not active");
        require(msg.value >= levelType.price, "Insufficient payment");

        // Mint new level token
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);

        // Record level type ID
        tokenLevelTypes[tokenId] = levelTypeId;

        // If payment amount exceeds level price, refund excess ETH
        if (msg.value > levelType.price) {
            uint256 refundAmount = msg.value - levelType.price;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund failed");
        }

        emit RoomLevelPurchased(msg.sender, tokenId, levelType.price, levelTypeId);
        return tokenId;
    }

    /**
     * @dev Upgrade a room level
     * @param tokenId Current level token ID
     * @param newLevelTypeId New level type ID
     */
    function upgradeRoomLevel(uint256 tokenId, uint256 newLevelTypeId) external payable {
        // Verify ownership
        require(_ownerOf(tokenId) == msg.sender, "Not the owner of this token");

        // Get current level type
        uint256 currentLevelTypeId = tokenLevelTypes[tokenId];
        LevelType memory currentLevelType = levelTypes[currentLevelTypeId];

        // Get new level type
        LevelType memory newLevelType = levelTypes[newLevelTypeId];
        require(newLevelType.id == newLevelTypeId, "New level type does not exist");
        require(newLevelType.active, "New level type not active");

        // Verify new level has higher max rooms
        require(newLevelType.maxRooms > currentLevelType.maxRooms, "New level must allow more rooms");

        // Calculate price difference
        uint256 priceDifference = newLevelType.price > currentLevelType.price ?
                                 newLevelType.price - currentLevelType.price : 0;

        require(msg.value >= priceDifference, "Insufficient payment for upgrade");

        // Update level type
        tokenLevelTypes[tokenId] = newLevelTypeId;

        // Refund excess payment
        if (msg.value > priceDifference) {
            uint256 refundAmount = msg.value - priceDifference;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund failed");
        }

        emit RoomLevelUpgraded(msg.sender, tokenId, currentLevelTypeId, newLevelTypeId, priceDifference);
    }

    /**
     * @dev Get the maximum number of rooms a user can create
     * @param user User address
     * @return Maximum number of rooms the user can create (sum of all level NFTs owned)
     */
    function getMaxRooms(address user) external view returns (uint256) {
        uint256 balance = balanceOf(user);

        // If user has no level tokens, return default value (0 or 1 depending on your requirements)
        if (balance == 0) {
            return 0; // Default value, can be changed as needed
        }

        // Calculate total max rooms from all level tokens owned by the user
        uint256 totalMaxRooms = 0;

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            uint256 levelTypeId = tokenLevelTypes[tokenId];

            // Add this token's max rooms to the total
            totalMaxRooms += levelTypes[levelTypeId].maxRooms;
        }

        return totalMaxRooms;
    }

    /**
     * @dev Set base URI
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Override base URI function
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override tokenURI function, returns different URIs based on level type
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        uint256 levelTypeId = tokenLevelTypes[tokenId];
        string memory baseURI = _baseURI();
        string memory suffix = levelTypes[levelTypeId].uriSuffix;

        return bytes(baseURI).length > 0 ?
            string(abi.encodePacked(baseURI, suffix, "/", tokenId.toString())) : "";
    }

    /**
     * @dev Withdraw ETH from the contract
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit Withdrawn(owner(), balance);
    }

    /**
     * @dev Check if a user has a room level
     * @param user User address
     * @return Whether the user has a room level
     */
    function hasRoomLevel(address user) external view returns (bool) {
        return balanceOf(user) > 0;
    }

    /**
     * @dev Get all level details for a user
     * @param user User address
     * @return Array of level details for all NFTs owned by the user
     */
    function getUserLevelDetails(address user) external view returns (LevelDetails[] memory) {
        uint256 balance = balanceOf(user);

        if (balance == 0) {
            // Return empty array if user has no levels
            return new LevelDetails[](0);
        }

        // Create array to hold all level details
        LevelDetails[] memory details = new LevelDetails[](balance);

        // Populate details for each level token
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            uint256 levelTypeId = tokenLevelTypes[tokenId];
            LevelType memory levelType = levelTypes[levelTypeId];

            details[i] = LevelDetails({
                tokenId: tokenId,
                levelTypeId: levelTypeId,
                name: levelType.name,
                maxRooms: levelType.maxRooms,
                uriSuffix: levelType.uriSuffix
            });
        }

        return details;
    }

    /**
     * @dev Get level type for a specific token
     * @param tokenId Level token ID
     * @return Level type information
     */
    function getLevelType(uint256 tokenId) external view returns (LevelType memory) {
        _requireOwned(tokenId);
        uint256 levelTypeId = tokenLevelTypes[tokenId];
        return levelTypes[levelTypeId];
    }

    /**
     * @dev Get all level type IDs
     * @return Array of all level type IDs
     */
    function getAllLevelTypeIds() external view returns (uint256[] memory) {
        return _allLevelTypeIds;
    }

    /**
     * @dev Get all active level types
     * @return Arrays of level type IDs and level types
     */
    function getActiveLevelTypes() external view returns (uint256[] memory, LevelType[] memory) {
        uint256 activeCount = 0;

        // Count active level types
        for (uint256 i = 0; i < _allLevelTypeIds.length; i++) {
            uint256 typeId = _allLevelTypeIds[i];
            if (levelTypes[typeId].active) {
                activeCount++;
            }
        }

        // Create arrays for active level types
        uint256[] memory activeIds = new uint256[](activeCount);
        LevelType[] memory activeTypes = new LevelType[](activeCount);

        // Fill arrays
        uint256 index = 0;
        for (uint256 i = 0; i < _allLevelTypeIds.length; i++) {
            uint256 typeId = _allLevelTypeIds[i];
            if (levelTypes[typeId].active) {
                activeIds[index] = typeId;
                activeTypes[index] = levelTypes[typeId];
                index++;
            }
        }

        return (activeIds, activeTypes);
    }

    function _increaseBalance(address account, uint128 value) internal virtual override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._increaseBalance(account, value);
    }

    /**
     * @dev Override _update to prevent transfers
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) returns (address) {
        address from = _ownerOf(tokenId);

        // If this is a transfer (not a mint or burn), prevent it
        if (from != address(0) && to != address(0)) {
            // Only allow transfers initiated by the contract itself
            require(auth == address(this), "BBRoomLevel: NFT is not transferable");
        }

        return super._update(to, tokenId, auth);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Upgradeable, ERC721EnumerableUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Authorize upgrade
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Function that must be implemented by contracts that need to receive funds
     */
    receive() external payable {}

    // Event definitions
    event LevelTypeAdded(uint256 indexed levelTypeId, string name, uint256 maxRooms, uint256 price, string uriSuffix);
    event LevelTypeUpdated(uint256 indexed levelTypeId, uint256 maxRooms, uint256 price, string uriSuffix);
    event LevelTypeActiveStatusChanged(uint256 indexed levelTypeId, bool active);
    event RoomLevelPurchased(address indexed buyer, uint256 tokenId, uint256 price, uint256 levelTypeId);
    event RoomLevelUpgraded(address indexed owner, uint256 tokenId, uint256 oldLevelTypeId, uint256 newLevelTypeId, uint256 pricePaid);
    event Withdrawn(address indexed to, uint256 amount);
}
