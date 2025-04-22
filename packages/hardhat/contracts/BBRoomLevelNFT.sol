// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./BBVersion.sol";
import "./BBStructs.sol";

/**
 * @title BBRoomLevel
 * @dev Niu Niu game room level NFT contract that determines how many rooms a player can create
 */
contract BBRoomLevelNFT is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    using Strings for uint256;

    

    // Level details structure for returning comprehensive information
    struct NftDetail {
        uint256 tokenId;         // Level token ID
        RoomLevelNftType nftType;     // Level type information
    }

    // Used to generate unique token IDs
    uint256 private _tokenIdCounter;

    // Used to generate unique level type IDs
    uint256 private _nftTypeIdCounter;

    // Room level base URI
    string private _baseTokenURI;

    // Game main contract address
    address public gameMainAddress;

    // Level types by ID
    mapping(uint256 => RoomLevelNftType) public nftTypes;

    // Level type ID corresponding to each token ID
    mapping(uint256 => uint256) public tokenNftTypes;

    // Array of all level type IDs
    uint256[] private _allNftTypeIds;

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
        _nftTypeIdCounter = 1; // Start from 1
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
    function addType(
        string memory name,
        uint256 maxRooms,
        uint256 price,
        string memory uriSuffix,
        uint256 maxMint,
        string memory rarity
    ) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(maxRooms > 0, "Max rooms must be greater than 0");
        require(price > 0, "Price must be greater than 0");
        require(maxMint > 0, "Max mint must be greater than 0");

        uint256 newNftTypeId = _nftTypeIdCounter;
        _nftTypeIdCounter++;

        nftTypes[newNftTypeId] = RoomLevelNftType({
            id: newNftTypeId,
            name: name,
            maxRooms: maxRooms,
            price: price,
            uriSuffix: uriSuffix,
            active: true,
            maxMint: maxMint,
            minted: 0,
            rarity: rarity,
            __gap: [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)]
        });

        _allNftTypeIds.push(newNftTypeId);

        emit LevelTypeAdded(newNftTypeId, name, maxRooms, price, uriSuffix);
        return newNftTypeId;
    }

    /**
     * @dev Update an existing level type
     * @param nftTypeId Level type ID to update
     * @param maxRooms New maximum number of rooms
     * @param price New price
     * @param uriSuffix New URI suffix
     */
    function updateType(
        uint256 nftTypeId,
        uint256 maxRooms,
        uint256 price,
        string memory uriSuffix,
        uint256 maxMint,
        string memory rarity
    ) external onlyOwner {
        require(nftTypes[nftTypeId].id == nftTypeId, "Level type does not exist");
        require(maxRooms > 0, "Max rooms must be greater than 0");
        require(price > 0, "Price must be greater than 0");
        require(maxMint > 0, "Max mint must be greater than 0");

        RoomLevelNftType storage nftType = nftTypes[nftTypeId];
        nftType.maxRooms = maxRooms;
        nftType.price = price;
        nftType.uriSuffix = uriSuffix;
        nftType.maxMint = maxMint;
        nftType.rarity = rarity;

        emit LevelTypeUpdated(nftTypeId, maxRooms, price, uriSuffix);
    }

    /**
     * @dev Set a level type's active status
     * @param nftTypeId Level type ID
     * @param active New active status
     */
    function setTypeActive(uint256 nftTypeId, bool active) external onlyOwner {
        // Verify level type exists
        require(nftTypes[nftTypeId].id == nftTypeId, "Level type does not exist");

        nftTypes[nftTypeId].active = active;
        emit LevelTypeActiveStatusChanged(nftTypeId, active);
    }

    /**
     * @dev Purchase a room level
     * @param nftTypeId Level type ID
     * @return Returns the minted level token ID
     */
    function buy(uint256 nftTypeId) external payable returns (uint256) {
        RoomLevelNftType storage nftType = nftTypes[nftTypeId];
        require(nftType.id == nftTypeId, "Level type does not exist");
        require(nftType.active, "Level type not active");
        require(msg.value >= nftType.price, "Insufficient payment");
        require(nftType.minted < nftType.maxMint, "Max mint reached for this level type");

        nftType.minted += 1;
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        tokenNftTypes[tokenId] = nftTypeId;
        
        if (msg.value > nftType.price) {
            uint256 refundAmount = msg.value - nftType.price;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund failed");
        }

        emit RoomLevelPurchased(msg.sender, tokenId, nftType.price, nftTypeId);
        return tokenId;
    }

    /**
     * @dev Batch purchase room levels
     * @param nftTypeId Level type ID
     * @param amount Purchase quantity
     * @return Returns an array of minted room level IDs
     */
    function batchBuy(uint256 nftTypeId, uint256 amount) external payable returns (uint256[] memory) {
        RoomLevelNftType storage nftType = nftTypes[nftTypeId];
        require(nftType.id == nftTypeId, "Level type does not exist");
        require(nftType.active, "Level type not active");
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= nftType.price * amount, "Insufficient payment");
        require(nftType.minted + amount <= nftType.maxMint, "Max mint reached for this level type");

        uint256[] memory tokenIds = new uint256[](amount);
        for (uint256 i = 0; i < amount; i++) {
            nftType.minted += 1;
            require(nftType.minted <= nftType.maxMint, "Max mint reached for this level type");

            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            _safeMint(msg.sender, tokenId);
            tokenIds[i] = tokenId;
            tokenNftTypes[tokenId] = nftTypeId;
        }

        uint256 totalPrice = nftType.price * amount;
        if (msg.value > totalPrice) {
            uint256 refundAmount = msg.value - totalPrice;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund failed");
        }

        emit BatchRoomLevelPurchased(msg.sender, tokenIds, totalPrice, nftTypeId);
        return tokenIds;
    }

    function increaseMaxMint(uint256 nftTypeId, uint256 addAmount) external onlyOwner {
        require(nftTypes[nftTypeId].id == nftTypeId, "Level type does not exist");
        require(addAmount > 0, "Add amount must be greater than 0");
        nftTypes[nftTypeId].maxMint += addAmount;
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
            uint256 nftTypeId = tokenNftTypes[tokenId];

            // Add this token's max rooms to the total
            totalMaxRooms += nftTypes[nftTypeId].maxRooms;
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

        uint256 nftTypeId = tokenNftTypes[tokenId];
        string memory baseURI = _baseURI();
        string memory suffix = nftTypes[nftTypeId].uriSuffix;

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
    function hasNft(address user) external view returns (bool) {
        return balanceOf(user) > 0;
    }

    /**
     * @dev Get user's room level information
     * @param userAddress User address to check
     * @return has Whether the user has any room level
     * @return details Array of level details
     * @return totalMaxRooms Total maximum rooms allowed
     */
    function getUserNfts(address userAddress) external view returns (
        bool has,
        NftDetail[] memory details,
        uint256 totalMaxRooms
    ) {
        has = balanceOf(userAddress) > 0;

        if (has) {
            uint256 balance = balanceOf(userAddress);
            details = new NftDetail[](balance);

            totalMaxRooms = 0;
            for (uint256 i = 0; i < balance; i++) {
                uint256 tokenId = tokenOfOwnerByIndex(userAddress, i);
                uint256 nftTypeId = tokenNftTypes[tokenId];
                
                details[i] = NftDetail({
                    tokenId: tokenId,
                    nftType: nftTypes[nftTypeId]
                });
                
                totalMaxRooms += nftTypes[nftTypeId].maxRooms;
            }
        } else {
            details = new NftDetail[](0);
            totalMaxRooms = 0;
        }

        return (has, details, totalMaxRooms);
    }

    /**
     * @dev Get level type for a specific token
     * @param tokenId Level token ID
     * @return Level type information
     */
    function getType(uint256 tokenId) external view returns (RoomLevelNftType memory) {
        _requireOwned(tokenId);
        uint256 nftTypeId = tokenNftTypes[tokenId];
        return nftTypes[nftTypeId];
    }

    /**
     * @dev Get all level type IDs
     * @return Array of all level type IDs
     */
    function getAllTypeIds() external view returns (uint256[] memory) {
        return _allNftTypeIds;
    }

    /**
     * @dev Get all active level types
     * @return Arrays of level type IDs and level types
     */
    function getActiveTypes() external view returns (uint256[] memory, RoomLevelNftType[] memory) {
        uint256 activeCount = 0;

        // Count active level types
        for (uint256 i = 0; i < _allNftTypeIds.length; i++) {
            uint256 typeId = _allNftTypeIds[i];
            if (nftTypes[typeId].active) {
                activeCount++;
            }
        }

        // Create arrays for active level types
        uint256[] memory activeIds = new uint256[](activeCount);
        RoomLevelNftType[] memory activeTypes = new RoomLevelNftType[](activeCount);

        // Fill arrays
        uint256 index = 0;
        for (uint256 i = 0; i < _allNftTypeIds.length; i++) {
            uint256 typeId = _allNftTypeIds[i];
            if (nftTypes[typeId].active) {
                activeIds[index] = typeId;
                activeTypes[index] = nftTypes[typeId];
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
    event LevelTypeAdded(uint256 indexed nftTypeId, string name, uint256 maxRooms, uint256 price, string uriSuffix);
    event LevelTypeUpdated(uint256 indexed nftTypeId, uint256 maxRooms, uint256 price, string uriSuffix);
    event LevelTypeActiveStatusChanged(uint256 indexed nftTypeId, bool active);
    event RoomLevelPurchased(address indexed buyer, uint256 tokenId, uint256 price, uint256 nftTypeId);
    event BatchRoomLevelPurchased(address indexed buyer, uint256[] tokenIds, uint256 totalPrice, uint256 nftTypeId);
    event RoomLevelUpgraded(address indexed owner, uint256 tokenId, uint256 oldLevelTypeId, uint256 newLevelTypeId, uint256 pricePaid);
    event Withdrawn(address indexed to, uint256 amount);
}



