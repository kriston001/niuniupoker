// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./BBVersion.sol";
import "./BBInterfaces.sol";

/**
 * @title BBGameTableFactory
 * @dev 游戏桌工厂合约，使用信标代理模式创建游戏桌
 */
contract BBGameTableFactory is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // 信标合约地址
    address public beacon;
    
    // 版本号，用于跟踪实现合约的版本
    uint256 public version;
    
    // 事件
    event ImplementationUpdated(address indexed oldImpl, address indexed newImpl, uint256 version);
    
    // 使用集中版本管理
    function getVersion() public pure returns (string memory) {
        return BBVersion.VERSION;
    }
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address _beacon) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        
        beacon = _beacon;
        version = 1;
    }
    
    /**
     * @dev 更新实现合约地址（通过信标）
     * @param _implementation 新的实现合约地址
     */
    function updateImplementation(address _implementation) external onlyOwner {
        require(_implementation != address(0), "Invalid implementation address");
        
        // 获取当前实现地址
        address oldImpl = UpgradeableBeacon(beacon).implementation();
        
        // 更新信标中的实现地址
        UpgradeableBeacon(beacon).upgradeTo(_implementation);
        
        version++;
        
        emit ImplementationUpdated(oldImpl, _implementation, version);
    }
    
    /**
     * @dev 创建游戏桌
     * @param tableId 游戏桌ID
     * @param tableName 游戏桌名称
     * @param bankerAddr 庄家地址
     * @param betAmount 下注金额
     * @param maxPlayers 最大玩家数
     * @param gameMainAddr 游戏主合约地址
     * @param bankerFeePercent 庄家费用百分比
     * @return 新创建的游戏桌地址
     */
    function createGameTable(
        uint256 tableId,
        string memory tableName,
        address bankerAddr,
        uint256 betAmount,
        uint8 maxPlayers,
        address gameMainAddr,
        uint8 bankerFeePercent
    ) external returns (address) {
        // 准备初始化数据
        bytes memory initData = abi.encodeWithSelector(
            IGameTableImplementation.initialize.selector,
            tableId,
            tableName,
            bankerAddr,
            betAmount,
            maxPlayers,
            gameMainAddr,
            bankerFeePercent,
            version
        );
        
        // 创建指向信标的代理
        BeaconProxy proxy = new BeaconProxy(beacon, initData);
        
        return address(proxy);
    }
    
    /**
     * @dev 授权升级
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}