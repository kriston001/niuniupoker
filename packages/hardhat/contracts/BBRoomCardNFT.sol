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
import "./BBInterfaces.sol";

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
    

    // Used to generate unique token IDs
    uint256 private _tokenIdCounter;

    // Used to generate unique card type IDs
    uint256 private _nftTypeIdCounter;

    // Room card base URI
    string private _baseTokenURI;

    // Game main contract address
    address public gameMainAddress;

    // Card types by ID
    mapping(uint256 => RoomCardNftType) public nftTypes;

    // Card type ID corresponding to each token ID
    mapping(uint256 => uint256) public tokenNftTypes;

    // Array of all card type IDs
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
        _tokenIdCounter = 1;
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

    modifier onlyGameTable() {
        bool isValidTable = false;
        if (gameMainAddress != address(0)) {
            if(IGameMain(gameMainAddress).isValidGameTable(msg.sender)){
                isValidTable = true;
            }else{
                isValidTable = false;
            }
        }
        require(isValidTable, "Only game table can call");
        _;
    }

    /**
     * @dev Add a new card type
     * @param name Name of the card type
     * @param maxPlayers Maximum number of players allowed
     * @param price Price to purchase this card
     * @param uriSuffix URI suffix for metadata
     * @return The ID of the newly created card type
     */
    function addType(
        string memory name,
        uint8 maxPlayers,
        uint256 price,
        string memory uriSuffix,
        uint256 maxMint,
        string memory rarity
    ) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(maxPlayers > 1, "Max players must be greater than 1");
        require(price > 0, "Price must be greater than 0");
        require(maxMint > 0, "Max mint must be greater than 0");
        require(bytes(rarity).length > 0, "Rarity cannot be empty");

        uint256 newNftTypeId = _nftTypeIdCounter;
        _nftTypeIdCounter++;

        nftTypes[newNftTypeId] = RoomCardNftType({
            id: newNftTypeId,
            name: name,
            maxPlayers: maxPlayers,
            price: price,
            uriSuffix: uriSuffix,
            active: true,
            maxMint: maxMint,
            rarity: rarity,
            minted: 0,
            __gap: [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)]
        });
        _allNftTypeIds.push(newNftTypeId);
        emit CardTypeAdded(newNftTypeId, name, maxPlayers, price, uriSuffix, maxMint, rarity);
        return newNftTypeId;
    }

    /**
     * @dev Update an existing card type
     * @param nftTypeId Card type ID to update
     * @param maxPlayers New maximum number of players
     * @param price New price
     * @param uriSuffix New URI suffix
     */
    function updateType(
        uint256 nftTypeId,
        uint8 maxPlayers,
        uint256 price,
        string memory uriSuffix,
        uint256 maxMint,
        string memory rarity
    ) external onlyOwner {
        require(nftTypes[nftTypeId].id == nftTypeId, "Card type does not exist");
        require(maxPlayers > 1, "Max players must be greater than 1");
        require(price > 0, "Price must be greater than 0");
        require(maxMint > 0, "Max mint must be greater than 0");
        require(bytes(rarity).length > 0, "Rarity cannot be empty");
        RoomCardNftType storage nftType = nftTypes[nftTypeId];
        nftType.maxPlayers = maxPlayers;
        nftType.price = price;
        nftType.uriSuffix = uriSuffix;
        nftType.maxMint = maxMint;
        nftType.rarity = rarity;
        emit CardTypeUpdated(nftTypeId, maxPlayers, price, uriSuffix, maxMint, rarity);
    }

    /**
     * @dev Set a card type's active status
     * @param nftTypeId Card type ID
     * @param active New active status
     */
    function setTypeActive(uint256 nftTypeId, bool active) external onlyOwner {
        // Verify card type exists
        require(nftTypes[nftTypeId].id == nftTypeId, "Card type does not exist");

        nftTypes[nftTypeId].active = active;
        emit CardTypeActiveStatusChanged(nftTypeId, active);
    }

    /**
     * @dev Purchase a room card
     * @param nftTypeId Card type ID
     * @return Returns the minted room card ID
     */
    function buy(uint256 nftTypeId) external payable returns (uint256) {
        RoomCardNftType storage nftType = nftTypes[nftTypeId];
        require(nftType.id == nftTypeId, "Card type does not exist");
        require(nftType.active, "Card type not active");
        require(msg.value >= nftType.price, "Insufficient payment");
        require(nftType.minted < nftType.maxMint, "Max mint reached for this card type");

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
        emit RoomCardPurchased(msg.sender, tokenId, nftType.price, nftTypeId);
        return tokenId;
    }

    /**
     * @dev Batch purchase room cards
     * @param nftTypeId Card type ID
     * @param amount Purchase quantity
     * @return Returns an array of minted room card IDs
     */
    function batchBuy(uint256 nftTypeId, uint256 amount) external payable returns (uint256[] memory) {
        RoomCardNftType storage nftType = nftTypes[nftTypeId];
        require(nftType.id == nftTypeId, "Card type does not exist");
        require(nftType.active, "Card type not active");
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= nftType.price * amount, "Insufficient payment");
        require(nftType.minted + amount <= nftType.maxMint, "Max mint reached for this card type");

        uint256[] memory tokenIds = new uint256[](amount);
        for (uint256 i = 0; i < amount; i++) {
            nftType.minted += 1;
            require(nftType.minted <= nftType.maxMint, "Max mint reached for this card type");

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
        emit BatchRoomCardPurchased(msg.sender, tokenIds, totalPrice, nftTypeId);
        return tokenIds;
    }

    /**
     * @dev Consume room card
     * @param owner Owner of the room card
     * @param tokenId Room card ID to be consumed
     */
    function consume(address owner, uint256 tokenId) external onlyGameTable {
        require(_ownerOf(tokenId) == owner, "Not approved or owner");
        _burn(tokenId);

        emit RoomCardConsumed(owner, tokenId);
    }

    function increaseMaxMint(uint256 nftTypeId, uint256 addAmount) external onlyOwner {
        require(nftTypes[nftTypeId].id == nftTypeId, "Card type does not exist");
        require(addAmount > 0, "Add amount must be greater than 0");
        nftTypes[nftTypeId].maxMint += addAmount;
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
     * @dev Check if a user owns any room cards
     * @param owner User address
     * @return Whether the user owns any room cards
     */
    function hasNft(address owner) external view returns (bool) {
        return balanceOf(owner) > 0;
    }


    /**
     * @dev 获取用户拥有的房卡信息
     * @param userAddress 用户地址
     * @return has 是否拥有房卡
     * @return details 房卡详细信息数组
     */
    function getUserNfts(address userAddress) external view returns (bool has, RoomCardNftDetail[] memory details) {
        has = balanceOf(userAddress) > 0;

        if (has) {
            uint256 balance = balanceOf(userAddress);
            details = new RoomCardNftDetail[](balance);

            for (uint256 i = 0; i < balance; i++) {
                uint256 tokenId = tokenOfOwnerByIndex(userAddress, i);
                uint256 nftTypeId = tokenNftTypes[tokenId];
                
                details[i] = RoomCardNftDetail({
                    tokenId: tokenId,
                    nftType: nftTypes[nftTypeId]
                });
            }
        } else {
            details = new RoomCardNftDetail[](0);
        }

        return (has, details);
    }

    /**
     * @dev Get card type for a specific token
     * @param tokenId Room card ID
     * @return Card type information
     */
    function getType(uint256 tokenId) external view returns (RoomCardNftType memory) {
        _requireOwned(tokenId);
        uint256 nftTypeId = tokenNftTypes[tokenId];
        return nftTypes[nftTypeId];
    }

    /**
     * @dev Get all card type IDs
     * @return Array of all card type IDs
     */
    function getAllTypeIds() external view returns (uint256[] memory) {
        return _allNftTypeIds;
    }

    /**
     * @dev Get all active card types
     * @return Arrays of card type IDs and card types
     */
    function getActiveTypes() external view returns (uint256[] memory, RoomCardNftType[] memory) {
        uint256 activeCount = 0;

        // Count active card types
        for (uint256 i = 0; i < _allNftTypeIds.length; i++) {
            uint256 typeId = _allNftTypeIds[i];
            if (nftTypes[typeId].active) {
                activeCount++;
            }
        }

        // Create arrays for active card types
        uint256[] memory activeIds = new uint256[](activeCount);
        RoomCardNftType[] memory activeTypes = new RoomCardNftType[](activeCount);

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

    /**
     * @dev Validate if room card meets game parameter requirements
     * @param tokenId Room card ID
     * @param maxPlayers Maximum number of players
     * @return Whether requirements are met
     */
    function validateParams(uint256 tokenId, uint8 maxPlayers) external view returns (bool) {
        _requireOwned(tokenId);
        uint256 nftTypeId = tokenNftTypes[tokenId];
        RoomCardNftType memory nftType = nftTypes[nftTypeId];

        return (maxPlayers <= nftType.maxPlayers);
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
    event CardTypeAdded(uint256 indexed nftTypeId, string name, uint8 maxPlayers, uint256 price, string uriSuffix, uint256 maxMint, string rarity);
    event CardTypeUpdated(uint256 indexed nftTypeId, uint8 maxPlayers, uint256 price, string uriSuffix, uint256 maxMint, string rarity);
    event CardTypeMaxMintIncreased(uint256 indexed nftTypeId, uint256 newMaxMint);
    event CardTypeActiveStatusChanged(uint256 indexed nftTypeId, bool active);
    event RoomCardPurchased(address indexed buyer, uint256 tokenId, uint256 price, uint256 nftTypeId);
    event BatchRoomCardPurchased(address indexed buyer, uint256[] tokenIds, uint256 totalPrice, uint256 nftTypeId);
    event RoomCardConsumed(address indexed owner, uint256 tokenId);
    event Withdrawn(address indexed to, uint256 amount);
}
