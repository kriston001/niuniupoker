// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC1967.sol";
import "./BBGameTableImplementation.sol";
import "./BBVersion.sol";

/**
 * @title BBGameTableFactory
 * @dev 游戏桌工厂合约，使用克隆模式创建游戏桌
 */
contract BBGameTableFactory is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // 游戏桌代理地址（这是一个可升级的代理合约地址）
    address payable public proxyAddress;

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

    function initialize(address _proxyAddress) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        proxyAddress = payable(_proxyAddress);
        version = 1;
    }

    /**
     * @dev 更新实现合约地址
     * @param _implementation 新的实现合约地址
     */
    function updateImplementation(address _implementation) external onlyOwner {
        require(_implementation != address(0), "Invalid implementation address");

        // 获取当前实现地址
        address oldImpl;
        assembly {
            // 从代理合约中读取实现地址
            // ERC1967代理存储实现地址的存储槽
            let slot := 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
            oldImpl := sload(slot)
        }

        // 升级代理合约的实现
        // 使用低级别的调用方式来升级代理
        (bool success, ) = proxyAddress.call(
            abi.encodeWithSignature("upgradeTo(address)", _implementation)
        );
        require(success, "Upgrade failed");

        version++;

        emit ImplementationUpdated(oldImpl, _implementation, version);
    }

    /**
     * @dev 创建游戏桌
     * @param tableName 游戏桌名称
     * @param bankerAddr 庄家地址
     * @param betAmount 下注金额
     * @param maxPlayers 最大玩家数
     * @param gameMainAddr 游戏主合约地址
     * @param bankerFeePercent 庄家费用百分比
     * @return 新创建的游戏桌地址
     */
    function createGameTable(
        string memory tableName,
        address bankerAddr,
        uint256 betAmount,
        uint8 maxPlayers,
        address gameMainAddr,
        uint8 bankerFeePercent
    ) external returns (address) {
        // 克隆代理合约，这样所有克隆都会指向同一个可升级的代理
        address payable clone = payable(Clones.clone(proxyAddress));

        // 初始化克隆的合约
        BBGameTableImplementation(clone).initialize(
            tableName,
            bankerAddr,
            betAmount,
            maxPlayers,
            gameMainAddr,
            bankerFeePercent,
            version
        );

        return clone;
    }

    /**
     * @dev 授权升级
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
