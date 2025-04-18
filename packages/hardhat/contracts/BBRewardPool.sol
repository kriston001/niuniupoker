// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./BBErrors.sol";
import "./BBTypes.sol";
import "./BBVersion.sol";
import "./BBStructs.sol";

/**
 * @title BBRewardPool
 * @dev 牛牛游戏奖励池合约，允许庄家创建奖励池，在游戏结束时随机奖励玩家
 */
contract BBRewardPool is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    

    // 状态变量
    uint256 private nextPoolId;                           // 下一个奖励池ID
    mapping(address => RewardPoolInfo[]) private bankerPools;      // 庄家拥有的奖励池

    // 游戏主合约地址
    address public gameMainAddr;

    // 最大概率值（100 = 100%）
    uint256 private constant MAX_PROBABILITY = 100;

    // 使用集中版本管理
    function getVersion() public pure returns (string memory) {
        return BBVersion.VERSION;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev 初始化函数，替代构造函数
     * @param _gameMainAddr 游戏主合约地址
     */
    function initialize(address _gameMainAddr) public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        if (_gameMainAddr == address(0)) revert InvalidGameMainAddress();
        gameMainAddr = _gameMainAddr;
        nextPoolId = 1;
    }

    /**
     * @dev 创建新的奖励池
     * @param _totalReward 总奖励金额
     * @param _rewardPerGame 每局游戏奖励金额
     * @param _winProbability 中奖概率（以百分之一为单位，例如10表示10%的概率）
     */
    function createRewardPool(uint256 _totalReward, uint256 _rewardPerGame, uint256 _winProbability) external payable nonReentrant {
        // 验证参数
        if (_rewardPerGame == 0 || _totalReward == 0) revert InvalidRewardAmount();
        if (_winProbability == 0 || _winProbability > MAX_PROBABILITY) revert InvalidWinProbability();
        if (msg.value != _totalReward) revert InsufficientFunds();

        // 创建奖励池
        RewardPoolInfo memory pool;
        pool.poolId = nextPoolId++;
        pool.banker = msg.sender;
        pool.totalAmount = _totalReward;
        pool.rewardPerGame = _rewardPerGame;
        pool.winProbability = _winProbability;
        pool.remainingAmount = _totalReward;

        // 添加到庄家的奖励池列表
        bankerPools[msg.sender].push(pool);

        emit RewardPoolCreated(pool.poolId, msg.sender, msg.value, _rewardPerGame, _winProbability);
    }

    /**
     * @dev 庄家删除奖励池并取回剩余资金
     * @param _poolId 要删除的奖励池ID
     */
    function removeRewardPool(uint256 _poolId) external onlyOwner nonReentrant {
        RewardPoolInfo[] storage pools = bankerPools[msg.sender];
        
        // 查找并验证奖励池
        uint256 poolIndex = type(uint256).max;
        for (uint256 i = 0; i < pools.length; i++) {
            if (pools[i].poolId == _poolId) {
                poolIndex = i;
                break;
            }
        }
        
        if (poolIndex == type(uint256).max) revert RewardPoolNotActive();
        
        RewardPoolInfo storage pool = pools[poolIndex];
        uint256 remainingAmount = pool.remainingAmount;

        // 从数组中移除奖励池（通过将最后一个元素移到要删除的位置）
        if (poolIndex != pools.length - 1) {
            pools[poolIndex] = pools[pools.length - 1];
        }
        pools.pop();

        // 转账剩余资金给庄家
        (bool success, ) = payable(msg.sender).call{value: remainingAmount}("");
        if (!success) revert TransferFailed();

        emit RewardPoolRemoved(_poolId, msg.sender, remainingAmount);
    }

    /**
     * @dev 游戏结束时尝试分配奖励
     * @param _tableAddr 游戏桌地址
     * @param _players 参与游戏的玩家地址数组
     * @return 是否分配了奖励
     */
    function tryDistributeReward(address _tableAddr, address[] calldata _players) external nonReentrant returns (bool) {
        // 验证调用者是游戏桌合约
        if (msg.sender != _tableAddr) revert OnlyGameTableCanCall();

        // 验证游戏桌有奖励池
        RewardPoolUsage storage usage = tableRewardPools[_tableAddr];
        if (!usage.active) return false;

        uint256 poolId = usage.poolId;
        RewardPoolInfo storage pool = rewardPools[poolId];

        // 验证奖励池活跃且有足够的资金
        if (!pool.active || pool.remainingAmount < pool.rewardPerGame) return false;

        // 验证有玩家参与
        if (_players.length == 0) return false;

        // 生成随机数决定是否发放奖励
        uint256 randomValue = _generateRandomNumber(_tableAddr, block.timestamp) % MAX_PROBABILITY;

        // 如果随机数小于中奖概率，则发放奖励
        if (randomValue < pool.winProbability) {
            // 随机选择一名玩家
            uint256 winnerIndex = _generateRandomNumber(_tableAddr, randomValue) % _players.length;
            address winner = _players[winnerIndex];

            // 更新奖励池余额
            pool.remainingAmount -= pool.rewardPerGame;

            // 转账奖励给获胜者
            (bool success, ) = payable(winner).call{value: pool.rewardPerGame}("");
            if (!success) revert TransferFailed();

            emit RewardDistributed(poolId, _tableAddr, winner, pool.rewardPerGame);
            return true;
        }

        return false;
    }

    /**
     * @dev 获取指定地址的所有奖励池
     * @param _banker 庄家地址
     * @return 奖励池信息数组
     */
    function getBankerPools(address _banker) external view returns (RewardPoolInfo[] memory) {
        return bankerPools[_banker];
    }

    /**
     * @dev 获取指定庄家的指定奖励池信息
     * @param _banker 庄家地址
     * @param _poolId 奖励池ID
     * @return 奖励池信息
     */
    function getRewardPoolInfo(address _banker, uint256 _poolId) external view returns (RewardPoolInfo memory) {
        RewardPoolInfo[] memory pools = bankerPools[_banker];
        for (uint256 i = 0; i < pools.length; i++) {
            if (pools[i].poolId == _poolId) {
                return pools[i];
            }
        }
        revert RewardPoolNotActive();
    }

    /**
     * @dev 更新奖励池的剩余金额（内部函数）
     * @param _banker 庄家地址
     * @param _poolId 奖励池ID
     * @param _amount 要减少的金额
     */
    function _updateRewardPoolAmount(address _banker, uint256 _poolId, uint256 _amount) internal {
        RewardPoolInfo[] storage pools = bankerPools[_banker];
        for (uint256 i = 0; i < pools.length; i++) {
            if (pools[i].poolId == _poolId) {
                if (pools[i].remainingAmount < _amount) revert InsufficientFunds();
                pools[i].remainingAmount -= _amount;
                return;
            }
        }
        revert RewardPoolNotActive();
    }

    /**
     * @dev 获取使用特定奖励池的所有游戏桌
     * @param _poolId 奖励池ID
     * @return 游戏桌地址数组
     */
    function getPoolTables(uint256 _poolId) external view returns (address[] memory) {
        return poolTables[_poolId];
    }

    /**
     * @dev 从奖励池的使用列表中移除游戏桌（内部函数）
     * @param _poolId 奖励池ID
     * @param _tableAddr 游戏桌地址
     */
    function _removeTableFromPool(uint256 _poolId, address _tableAddr) internal {
        address[] storage tables = poolTables[_poolId];
        for (uint256 i = 0; i < tables.length; i++) {
            if (tables[i] == _tableAddr) {
                // 将最后一个元素移到要删除的位置，然后删除最后一个元素
                if (i < tables.length - 1) {
                    tables[i] = tables[tables.length - 1];
                }
                tables.pop();
                break;
            }
        }
    }

    /**
     * @dev 生成伪随机数（内部函数）
     * @param _seed1 种子1
     * @param _seed2 种子2
     * @return 伪随机数
     */
    function _generateRandomNumber(address _seed1, uint256 _seed2) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            _seed1,
            _seed2,
            block.timestamp,
            block.difficulty,
            blockhash(block.number - 1)
        )));
    }

    /**
     * @dev 设置游戏主合约地址
     * @param _gameMainAddr 新的游戏主合约地址
     */
    function setGameMainAddress(address _gameMainAddr) external onlyOwner {
        if (_gameMainAddr == address(0)) revert InvalidGameMainAddress();
        gameMainAddr = _gameMainAddr;
        emit GameMainAddressUpdated(_gameMainAddr);
    }

    /**
     * @dev 实现UUPS可升级合约所需的授权检查
     * @param newImplementation 新的实现合约地址
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // 事件定义
    event RewardPoolCreated(uint256 indexed poolId, address indexed banker, uint256 totalAmount, uint256 rewardPerGame, uint256 winProbability);
    event RewardPoolRemoved(uint256 indexed poolId, address indexed banker, uint256 remainingAmount);
    event TableRewardPoolSet(address indexed tableAddr, uint256 indexed poolId, address indexed banker);
    event TableRewardPoolRemoved(address indexed tableAddr, uint256 indexed poolId, address indexed banker);
    event RewardDistributed(uint256 indexed poolId, address indexed tableAddr, address indexed winner, uint256 amount);
    event GameMainAddressUpdated(address indexed gameMainAddr);

    
}
