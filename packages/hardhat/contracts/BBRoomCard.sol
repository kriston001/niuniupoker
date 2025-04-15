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
 * @title BBRoomCard
 * @dev Niu Niu game room card NFT contract, consumed when creating game tables
 */
contract BBRoomCard is 
    Initializable, 
    ERC721Upgradeable, 
    ERC721EnumerableUpgradeable, 
    OwnableUpgradeable, 
    UUPSUpgradeable 
{
    using Strings for uint256;
    // Room card type enumeration
    enum RoomCardType {
        SILVER,    // Silver
        GOLD,      // Gold
        DIAMOND    // Diamond
    }
    
    // Game parameter limits corresponding to room card types
    struct RoomCardConfig {
        uint256 maxBetAmount;    // Maximum bet amount
        uint8 maxPlayers;        // Maximum number of players
        uint256 price;           // Room card price
        string uriSuffix;        // URI suffix
    }
    
    // Used to generate unique token IDs
    uint256 private _tokenIdCounter;
    
    // Room card base URI
    string private _baseTokenURI;
    
    // Game main contract address
    address public gameMainAddress;
    
    // Room card type configurations
    mapping(RoomCardType => RoomCardConfig) public roomCardConfigs;
    
    // Room card type corresponding to each tokenId
    mapping(uint256 => RoomCardType) public tokenTypes;
    
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
        
        // Initialize default room card configurations
        _initDefaultRoomCardConfigs();
    }
    
    /**
     * @dev Initialize default room card configurations
     */
    function _initDefaultRoomCardConfigs() internal {
        // Silver room card configuration
        roomCardConfigs[RoomCardType.SILVER] = RoomCardConfig({
            maxBetAmount: 0.1 ether,
            maxPlayers: 5,
            price: 0.05 ether,
            uriSuffix: "silver"
        });
        
        // Gold room card configuration
        roomCardConfigs[RoomCardType.GOLD] = RoomCardConfig({
            maxBetAmount: 0.5 ether,
            maxPlayers: 8,
            price: 0.1 ether,
            uriSuffix: "gold"
        });
        
        // Diamond room card configuration
        roomCardConfigs[RoomCardType.DIAMOND] = RoomCardConfig({
            maxBetAmount: 1 ether,
            maxPlayers: 10,
            price: 0.2 ether,
            uriSuffix: "diamond"
        });
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
     * @dev Purchase a room card
     * @param cardType Room card type
     * @return Returns the minted room card ID
     */
    function buyRoomCard(RoomCardType cardType) external payable returns (uint256) {
        uint256 price = roomCardConfigs[cardType].price;
        require(price > 0, "Invalid card type");
        require(msg.value >= price, "Insufficient payment");
        
        // Mint new room card
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        
        // Record room card type
        tokenTypes[tokenId] = cardType;
        
        // If payment amount exceeds room card price, refund excess ETH
        if (msg.value > price) {
            uint256 refundAmount = msg.value - price;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund failed");
        }
        
        emit RoomCardPurchased(msg.sender, tokenId, price, cardType);
        return tokenId;
    }

    /**
     * @dev Batch purchase room cards
     * @param cardType Room card type
     * @param amount Purchase quantity
     * @return Returns an array of minted room card IDs
     */
    function batchBuyRoomCard(RoomCardType cardType, uint256 amount) external payable returns (uint256[] memory) {
        require(amount > 0, "Amount must be greater than 0");
        uint256 price = roomCardConfigs[cardType].price;
        require(price > 0, "Invalid card type");
        require(msg.value >= price * amount, "Insufficient payment");
        
        uint256[] memory tokenIds = new uint256[](amount);
        
        // Batch mint room cards
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            _safeMint(msg.sender, tokenId);
            tokenIds[i] = tokenId;
            
            // Record room card type
            tokenTypes[tokenId] = cardType;
        }
        
        // If payment amount exceeds total room card price, refund excess ETH
        uint256 totalPrice = price * amount;
        if (msg.value > totalPrice) {
            uint256 refundAmount = msg.value - totalPrice;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund failed");
        }
        
        emit BatchRoomCardPurchased(msg.sender, tokenIds, totalPrice, cardType);
        return tokenIds;
    }

    /**
     * @dev Consume room card
     * @param owner Owner of the room card
     * @param tokenId Room card ID to be consumed
     */
    function consumeRoomCard(address owner, uint256 tokenId) external {
        // Only allow game main contract to call
        require(msg.sender == gameMainAddress, "Only game main contract can consume room cards");
        require(_ownerOf(tokenId) == owner, "Not approved or owner");
        
        // Burn room card
        _burn(tokenId);
        
        emit RoomCardConsumed(owner, tokenId, tokenTypes[tokenId]);
    }

    /**
     * @dev Update room card type configuration
     * @param cardType Room card type
     * @param config New configuration
     */
    function updateRoomCardConfig(RoomCardType cardType, RoomCardConfig memory config) external onlyOwner {
        require(config.price > 0, "Price must be greater than 0");
        require(config.maxBetAmount > 0, "Max bet amount must be greater than 0");
        require(config.maxPlayers > 0, "Max players must be greater than 0");
        
        roomCardConfigs[cardType] = config;
        emit RoomCardConfigUpdated(cardType, config);
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
     * @dev Override tokenURI function, returns different URIs based on room card type
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId); // 使用_requireOwned替代_exists检查
        
        RoomCardType cardType = tokenTypes[tokenId];
        string memory baseURI = _baseURI();
        string memory suffix = roomCardConfigs[cardType].uriSuffix;
        
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
     * @dev Check if a user owns any room cards
     * @param owner User address
     * @return Whether the user owns any room cards
     */
    function hasRoomCard(address owner) external view returns (bool) {
        return balanceOf(owner) > 0;
    }

    /**
     * @dev Get all room card IDs owned by a user
     * @param owner User address
     * @return Array of room card IDs
     */
    function getRoomCardsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get room card type
     * @param tokenId Room card ID
     * @return Room card type
     */
    function getRoomCardType(uint256 tokenId) external view returns (RoomCardType) {
        _requireOwned(tokenId); // 使用_requireOwned替代_exists检查
        return tokenTypes[tokenId];
    }
    
    function _increaseBalance(address account, uint128 value) internal virtual override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._increaseBalance(account, value);
    }

    function getRoomCardConfig(uint256 tokenId) external view returns (RoomCardConfig memory) {
        _requireOwned(tokenId); // 使用_requireOwned替代_exists检查
        return roomCardConfigs[tokenTypes[tokenId]];
    }
    
    /**
     * @dev Validate if room card meets game parameter requirements
     * @param tokenId Room card ID
     * @param betAmount Bet amount
     * @param maxPlayers Maximum number of players
     * @return Whether requirements are met
     */
    function validateRoomCardParams(uint256 tokenId, uint256 betAmount, uint8 maxPlayers) external view returns (bool) {
        _requireOwned(tokenId); // 使用_requireOwned替代_exists检查
        RoomCardConfig memory config = roomCardConfigs[tokenTypes[tokenId]];
        
        return (betAmount <= config.maxBetAmount && 
                maxPlayers <= config.maxPlayers);
    }

    // 注意：_beforeTokenTransfer函数在OpenZeppelin合约库的最新版本中已被移除
    // 现在使用_update函数来处理代币转移逻辑

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Upgradeable, ERC721EnumerableUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Internal function to check if a token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // Authorize upgrade
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Function that must be implemented by contracts that need to receive funds
     */
    receive() external payable {}

    // Event definitions
    event RoomCardPurchased(address indexed buyer, uint256 tokenId, uint256 price, RoomCardType cardType);
    event BatchRoomCardPurchased(address indexed buyer, uint256[] tokenIds, uint256 totalPrice, RoomCardType cardType);
    event RoomCardConsumed(address indexed owner, uint256 tokenId, RoomCardType cardType);
    event RoomCardConfigUpdated(RoomCardType cardType, RoomCardConfig config);
    event Withdrawn(address indexed to, uint256 amount);
}