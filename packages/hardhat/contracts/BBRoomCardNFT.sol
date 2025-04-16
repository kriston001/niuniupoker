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
 * @dev Niu Niu game room card NFT contract with dynamic card types
 */
contract BBRoomCardNFT is
    Initializable,
    ERC721Upgradeable,
    ERC721EnumerableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    using Strings for uint256;

    // Room card type structure - combines type and config in one structure
    struct CardType {
        uint256 id;              // Unique identifier for the card type
        string name;             // Name of the card type (e.g., "SILVER", "GOLD", "DIAMOND")
        uint256 maxBetAmount;    // Maximum bet amount allowed with this card
        uint8 maxPlayers;        // Maximum number of players allowed
        uint256 price;           // Price to purchase this card
        string uriSuffix;        // URI suffix for metadata
        bool active;             // Whether this card type is active
    }

    // Used to generate unique token IDs
    uint256 private _tokenIdCounter;

    // Used to generate unique card type IDs
    uint256 private _cardTypeIdCounter;

    // Room card base URI
    string private _baseTokenURI;

    // Game main contract address
    address public gameMainAddress;

    // Card types by ID
    mapping(uint256 => CardType) public cardTypes;

    // Card type ID corresponding to each token ID
    mapping(uint256 => uint256) public tokenCardTypes;

    // Array of all card type IDs
    uint256[] private _allCardTypeIds;

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
        _cardTypeIdCounter = 1; // Start from 1
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
     * @dev Add a new card type
     * @param name Name of the card type
     * @param maxBetAmount Maximum bet amount allowed
     * @param maxPlayers Maximum number of players allowed
     * @param price Price to purchase this card
     * @param uriSuffix URI suffix for metadata
     * @return The ID of the newly created card type
     */
    function addCardType(
        string memory name,
        uint256 maxBetAmount,
        uint8 maxPlayers,
        uint256 price,
        string memory uriSuffix
    ) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(maxBetAmount > 0, "Max bet amount must be greater than 0");
        require(maxPlayers > 1, "Max players must be greater than 1");
        require(price > 0, "Price must be greater than 0");

        // Generate new card type ID
        uint256 newCardTypeId = _cardTypeIdCounter;
        _cardTypeIdCounter++;

        // Create new card type
        cardTypes[newCardTypeId] = CardType({
            id: newCardTypeId,
            name: name,
            maxBetAmount: maxBetAmount,
            maxPlayers: maxPlayers,
            price: price,
            uriSuffix: uriSuffix,
            active: true
        });

        // Add to list of all card types
        _allCardTypeIds.push(newCardTypeId);

        emit CardTypeAdded(newCardTypeId, name, maxBetAmount, maxPlayers, price, uriSuffix);
        return newCardTypeId;
    }

    /**
     * @dev Update an existing card type
     * @param cardTypeId Card type ID to update
     * @param maxBetAmount New maximum bet amount
     * @param maxPlayers New maximum number of players
     * @param price New price
     * @param uriSuffix New URI suffix
     */
    function updateCardType(
        uint256 cardTypeId,
        uint256 maxBetAmount,
        uint8 maxPlayers,
        uint256 price,
        string memory uriSuffix
    ) external onlyOwner {
        // Verify card type exists
        require(cardTypes[cardTypeId].id == cardTypeId, "Card type does not exist");
        require(maxBetAmount > 0, "Max bet amount must be greater than 0");
        require(maxPlayers > 1, "Max players must be greater than 1");
        require(price > 0, "Price must be greater than 0");

        CardType storage cardType = cardTypes[cardTypeId];
        cardType.maxBetAmount = maxBetAmount;
        cardType.maxPlayers = maxPlayers;
        cardType.price = price;
        cardType.uriSuffix = uriSuffix;

        emit CardTypeUpdated(cardTypeId, maxBetAmount, maxPlayers, price, uriSuffix);
    }

    /**
     * @dev Set a card type's active status
     * @param cardTypeId Card type ID
     * @param active New active status
     */
    function setCardTypeActive(uint256 cardTypeId, bool active) external onlyOwner {
        // Verify card type exists
        require(cardTypes[cardTypeId].id == cardTypeId, "Card type does not exist");

        cardTypes[cardTypeId].active = active;
        emit CardTypeActiveStatusChanged(cardTypeId, active);
    }

    /**
     * @dev Purchase a room card
     * @param cardTypeId Card type ID
     * @return Returns the minted room card ID
     */
    function buyRoomCard(uint256 cardTypeId) external payable returns (uint256) {
        CardType memory cardType = cardTypes[cardTypeId];
        // Verify card type exists and is active
        require(cardType.id == cardTypeId, "Card type does not exist");
        require(cardType.active, "Card type not active");
        require(msg.value >= cardType.price, "Insufficient payment");

        // Mint new room card
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);

        // Record card type ID
        tokenCardTypes[tokenId] = cardTypeId;

        // If payment amount exceeds card price, refund excess ETH
        if (msg.value > cardType.price) {
            uint256 refundAmount = msg.value - cardType.price;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund failed");
        }

        emit RoomCardPurchased(msg.sender, tokenId, cardType.price, cardTypeId);
        return tokenId;
    }

    /**
     * @dev Batch purchase room cards
     * @param cardTypeId Card type ID
     * @param amount Purchase quantity
     * @return Returns an array of minted room card IDs
     */
    function batchBuyRoomCard(uint256 cardTypeId, uint256 amount) external payable returns (uint256[] memory) {
        CardType memory cardType = cardTypes[cardTypeId];
        // Verify card type exists and is active
        require(cardType.id == cardTypeId, "Card type does not exist");
        require(cardType.active, "Card type not active");
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= cardType.price * amount, "Insufficient payment");

        uint256[] memory tokenIds = new uint256[](amount);

        // Batch mint room cards
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            _safeMint(msg.sender, tokenId);
            tokenIds[i] = tokenId;

            // Record card type ID
            tokenCardTypes[tokenId] = cardTypeId;
        }

        // If payment amount exceeds total card price, refund excess ETH
        uint256 totalPrice = cardType.price * amount;
        if (msg.value > totalPrice) {
            uint256 refundAmount = msg.value - totalPrice;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "Refund failed");
        }

        emit BatchRoomCardPurchased(msg.sender, tokenIds, totalPrice, cardTypeId);
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

        // Get card type ID before burning
        uint256 cardTypeId = tokenCardTypes[tokenId];

        // Burn room card
        _burn(tokenId);

        emit RoomCardConsumed(owner, tokenId, cardTypeId);
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
        _requireOwned(tokenId);

        uint256 cardTypeId = tokenCardTypes[tokenId];
        string memory baseURI = _baseURI();
        string memory suffix = cardTypes[cardTypeId].uriSuffix;

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

    // 定义卡片详细信息结构体
    struct CardDetail {
        uint256 tokenId;       // 卡片的token ID
        CardType cardType;     // 继承CardType的所有属性
    }

    /**
     * @dev Get all room cards with details owned by a user
     * @param owner User address
     * @return Array of card details including token ID and card type information
     */
    function getRoomCardsByOwner(address owner) external view returns (CardDetail[] memory) {
        uint256 balance = balanceOf(owner);
        CardDetail[] memory cards = new CardDetail[](balance);

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            uint256 cardTypeId = tokenCardTypes[tokenId];
            
            cards[i] = CardDetail({
                tokenId: tokenId,
                cardType: cardTypes[cardTypeId]
            });
        }

        return cards;
    }

    /**
     * @dev 获取用户拥有的房卡信息
     * @param userAddress 用户地址
     * @return hasCard 是否拥有房卡
     * @return cardDetails 房卡详细信息数组
     */
    function getUserRoomCards(address userAddress) external view returns (bool hasCard, CardDetail[] memory cardDetails) {
        hasCard = balanceOf(userAddress) > 0;

        if (hasCard) {
            uint256 balance = balanceOf(userAddress);
            cardDetails = new CardDetail[](balance);

            for (uint256 i = 0; i < balance; i++) {
                uint256 tokenId = tokenOfOwnerByIndex(userAddress, i);
                uint256 cardTypeId = tokenCardTypes[tokenId];
                
                cardDetails[i] = CardDetail({
                    tokenId: tokenId,
                    cardType: cardTypes[cardTypeId]
                });
            }
        } else {
            cardDetails = new CardDetail[](0);
        }

        return (hasCard, cardDetails);
    }

    /**
     * @dev Get card type for a specific token
     * @param tokenId Room card ID
     * @return Card type information
     */
    function getCardType(uint256 tokenId) external view returns (CardType memory) {
        _requireOwned(tokenId);
        uint256 cardTypeId = tokenCardTypes[tokenId];
        return cardTypes[cardTypeId];
    }

    /**
     * @dev Get all card type IDs
     * @return Array of all card type IDs
     */
    function getAllCardTypeIds() external view returns (uint256[] memory) {
        return _allCardTypeIds;
    }

    /**
     * @dev Get all active card types
     * @return Arrays of card type IDs and card types
     */
    function getActiveCardTypes() external view returns (uint256[] memory, CardType[] memory) {
        uint256 activeCount = 0;

        // Count active card types
        for (uint256 i = 0; i < _allCardTypeIds.length; i++) {
            uint256 typeId = _allCardTypeIds[i];
            if (cardTypes[typeId].active) {
                activeCount++;
            }
        }

        // Create arrays for active card types
        uint256[] memory activeIds = new uint256[](activeCount);
        CardType[] memory activeTypes = new CardType[](activeCount);

        // Fill arrays
        uint256 index = 0;
        for (uint256 i = 0; i < _allCardTypeIds.length; i++) {
            uint256 typeId = _allCardTypeIds[i];
            if (cardTypes[typeId].active) {
                activeIds[index] = typeId;
                activeTypes[index] = cardTypes[typeId];
                index++;
            }
        }

        return (activeIds, activeTypes);
    }

    /**
     * @dev Validate if room card meets game parameter requirements
     * @param tokenId Room card ID
     * @param betAmount Bet amount
     * @param maxPlayers Maximum number of players
     * @return Whether requirements are met
     */
    function validateRoomCardParams(uint256 tokenId, uint256 betAmount, uint8 maxPlayers) external view returns (bool) {
        _requireOwned(tokenId);
        uint256 cardTypeId = tokenCardTypes[tokenId];
        CardType memory cardType = cardTypes[cardTypeId];

        return (betAmount <= cardType.maxBetAmount &&
                maxPlayers <= cardType.maxPlayers);
    }

    function _increaseBalance(address account, uint128 value) internal virtual override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._increaseBalance(account, value);
    }

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

    // Authorize upgrade
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Function that must be implemented by contracts that need to receive funds
     */
    receive() external payable {}

    // Event definitions
    event CardTypeAdded(uint256 indexed cardTypeId, string name, uint256 maxBetAmount, uint8 maxPlayers, uint256 price, string uriSuffix);
    event CardTypeUpdated(uint256 indexed cardTypeId, uint256 maxBetAmount, uint8 maxPlayers, uint256 price, string uriSuffix);
    event CardTypeActiveStatusChanged(uint256 indexed cardTypeId, bool active);
    event RoomCardPurchased(address indexed buyer, uint256 tokenId, uint256 price, uint256 cardTypeId);
    event BatchRoomCardPurchased(address indexed buyer, uint256[] tokenIds, uint256 totalPrice, uint256 cardTypeId);
    event RoomCardConsumed(address indexed owner, uint256 tokenId, uint256 cardTypeId);
    event Withdrawn(address indexed to, uint256 amount);
}
