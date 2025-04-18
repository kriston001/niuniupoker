// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBErrors.sol";
import "./sol";
import "./BBCardUtils.sol";
import "./BBPlayer.sol";
import "./BBCardDealer.sol";
import "./BBVersion.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "./BBGameHistory.sol";
import "./BBRewardPool.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./BBInterfaces.sol";



//用于把playerData数据转换成结构体用以在函数参数中传递
struct BBPlayerEntry {
    address playerAddr;
    BBPlayer playerData;
}

struct BBPlayerCardEntry {
    address playerAddr;
    uint8[5] cards;
    CardType cardType;
}

// 添加一个新的结构体用于返回游戏桌信息
struct GameTableView {
    address tableAddr; // 游戏桌合约地址
    string tableName;
    address bankerAddr;
    uint256 betAmount;
    uint256 totalPrizePool;
    uint8 playerCount;
    uint8 maxPlayers;
    uint256 creationTimestamp;
    GameState state;
    uint8 playerContinuedCount;
    uint8 playerFoldCount;
    uint8 playerReadyCount;
    address[] playerAddresses;
    uint256 currentRoundDeadline;
    uint256 playerTimeout;
    uint256 tableInactiveTimeout;
    uint256 lastActivityTimestamp;
    uint256 implementationVersion; // 添加实现版本号
}

/**
 * @title BBGameTableImplementation
 * @dev 牛牛游戏桌实现合约，管理单个游戏桌的逻辑
 */
contract BBGameTableImplementation is Initializable, ReentrancyGuardUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    using BBPlayerLib for BBPlayer;
    using BBTypes for GameState;
    using BBTypes for PlayerState;
    using BBTypes for CardType;
    using BBCardUtils for uint8[5];
    using BBCardDealer for BBCardDealer.DealerState;

    // 游戏桌数据
    string public tableName;
    address public bankerAddr;
    uint256 public betAmount;  // 固定押注金额
    uint8 public playerCount;
    uint8 public maxPlayers;
    uint256 public creationTimestamp;
    GameState public state;
    uint256 public randomRequestId;

    uint256 public gameCount; //开展的游戏场数
    uint256 public gameLiquidatedCount; //被清算的游戏场数

    uint256 public gameStartTimestamp;
    uint256 public gameEndTimestamp;
    uint8 public playerContinuedCount;
    uint8 public playerFoldCount;
    uint8 public playerReadyCount;
    uint256 public totalPrizePool;  //奖池金额
    uint256 public bankerFeePercent; // 庄家费用百分比
    uint256 public implementationVersion; // 实现版本号

    // 使用集中版本管理
    function getVersion() public pure returns (string memory) {
        return BBVersion.VERSION;
    }

    // 玩家数据
    address[] public playerAddresses;
    mapping(address => BBPlayer) public players;
    BBPlayer public banker;

    // 发牌记录
    BBCardDealer.DealerState private dealerState;

    //主合约地址
    address public gameMainAddr;
    address public gameHistoryAddr;  //游戏记录合约地址
    address public rewardPoolAddr; // 奖励池合约地址
    address public randomnessManagerAddr; // 随机数管理合约地址
    address public roomCardAddr; // 房间卡合约地址

    // 添加超时相关状态变量
    uint256 public playerTimeout; // 玩家操作超时时间，单位为秒
    uint256 public currentRoundDeadline; // 当前回合的截止时间

    uint256 public tableInactiveTimeout; // 游戏桌不活跃超时时间，单位为秒
    uint256 public lastActivityTimestamp; // 最后活动时间戳

    
    uint256 public currentRandomSessionId; // 当前随机数会话 ID

    // 事件
    event GameTableChanged(address indexed tableAddr);
    event GameTableInitialized(address indexed tableAddr, address indexed banker, uint256 version);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev 初始化函数，替代构造函数
     */
    function initialize(
        string memory _tableName,
        address _bankerAddr,
        uint256 _betAmount,
        uint8 _maxPlayers,
        address _gameMainAddr,
        uint256 _bankerFeePercent,
        uint256 _implementationVersion
    ) public initializer {
        // 初始化可升级合约
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        // 参数验证
        if (_maxPlayers < 2) revert InvalidMaxPlayers();

        tableName = _tableName;
        bankerAddr = _bankerAddr;
        betAmount = _betAmount;
        maxPlayers = _maxPlayers;
        state = GameState.WAITING;
        gameMainAddr = _gameMainAddr;
        creationTimestamp = block.timestamp;
        lastActivityTimestamp = block.timestamp; // 初始化最后活动时间
        bankerFeePercent = _bankerFeePercent;
        implementationVersion = _implementationVersion;

        // 创建庄家对象
        BBPlayer memory _banker = BBPlayer({
            playerAddr: _bankerAddr,
            isBanker: true,
            state: PlayerState.READY,
            initialBet: betAmount,
            additionalBet1: 0,
            additionalBet2: 0,
            cards: [0, 0, 0, 0, 0],
            cardType: CardType.NONE
        });
        banker = _banker;

        // 初始化发牌状态 - 暂时使用临时种子，后续会通过VRF更新
        uint256 tempSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
        dealerState.initialize(tempSeed);

        emit GameTableInitialized(address(this), _bankerAddr, _implementationVersion);
    }

    //刷新游戏配置
    function refreshConfig() internal {
        IGameMain gameMain = IGameMain(gameMainAddr);
        GameConfig config = gameMain.getGameConfig();
        playerTimeout = config.playerTimeout;
        tableInactiveTimeout = config.tableInactiveTimeout;
        randomnessManagerAddr = config.randomnessManagerAddress;
        roomCardAddr = config.roomCardAddress;
        rewardPoolAddr = config.rewardPoolAddress;
        gameHistoryAddr = config.gameHistoryAddress;
    }

    // 添加一个公共函数来获取玩家地址列表，数组需要显示定义get函数，int、string等不需要
    function getPlayerAddresses() public view returns (address[] memory) {
        return playerAddresses;
    }

    /**
     * @dev 更新最后活动时间
     */
    function _updateLastActivity() internal {
        lastActivityTimestamp = block.timestamp;
    }

    /**
     * @dev 修饰器：适用于庄家
     */
    modifier onlyBanker() {
        if (msg.sender != bankerAddr) revert NotBanker();
        _;
    }

    /**
     * @dev 修饰器：适用于玩游戏的玩家，如果庄家也参与游戏，那也算在内
     */
    modifier onlyPlayers() {
        if (players[msg.sender].playerAddr == address(0)) revert PlayerNotFound();
        _;
    }

    /**
     * @dev 修饰器：适用于非庄家的玩家
     */
    modifier onlyNotBanker() {
        if (players[msg.sender].playerAddr == address(0) || msg.sender == bankerAddr) revert PlayerNotFound();
        _;
    }

    /**
     * @dev 修饰器：适用于普通玩家和庄家
     */
    modifier onlyParticipants() {
        if (players[msg.sender].playerAddr == address(0) && msg.sender != bankerAddr) revert PlayerNotFound();
        _;
    }

    /**
     * @dev 修饰器：只允许游戏主合约调用
     */
    modifier onlyGameMain() {
        if (msg.sender != gameMainAddr) revert OnlyMainContractCanCall();
        _;
    }

    function _getLiquidatorFeePercent() internal view returns (uint256) {
        return IGameMain(gameMainAddr).liquidatorFeePercent();
    }

    function _getPlayerTimeout() internal view returns (uint256) {
        return IGameMain(gameMainAddr).playerTimeout();
    }

    function _getTableInactiveTimeout() internal view returns (uint256) {
        return IGameMain(gameMainAddr).tableInactiveTimeout();
    }

    function _getHistoryAddr() internal view returns (address) {
        return IGameMain(gameMainAddr).gameHistoryAddress();
    }

    function _getRandomnessManagerAddr() internal view returns (address) {
        return IGameMain(gameMainAddr).randomnessManagerAddress();
    }

    function _getRoomCardAddr() internal view returns (address) {
        return IGameMain(gameMainAddr).roomCardAddress();
    }

    function _getRewardPoolAddr() internal view returns (address) {
        return IGameMain(gameMainAddr).rewardPoolAddress();
    }

    /**
     * @dev 玩家加入游戏
     */
    function playerJoin() external nonReentrant {
        address playerAddr = msg.sender;
        if (players[playerAddr].playerAddr != address(0)) revert PlayerAlreadyJoined();
        if (state != GameState.WAITING) revert GameNotInWaitingState();
        if (playerCount >= maxPlayers) revert MaxPlayersReached();


        // 创建玩家对象
        BBPlayer memory player = BBPlayer({
            playerAddr: playerAddr,
            isBanker: false,
            state: PlayerState.JOINED,
            initialBet: betAmount,
            additionalBet1: 0,
            additionalBet2: 0,
            cards: [0, 0, 0, 0, 0],
            cardType: CardType.NONE
        });
        players[playerAddr] = player;
        players[playerAddr].playerJoin();


        // 添加玩家
        playerAddresses.push(playerAddr);
        playerCount++;

        _updateLastActivity();

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家准备
     */
    function playerReady() external payable onlyPlayers nonReentrant {
        if (state != GameState.WAITING) revert GameNotInWaitingState();
        address playerAddr = msg.sender;
        BBPlayer storage player = players[playerAddr];
        if (player.state != PlayerState.JOINED) revert InvalidPlayerState();
        if (msg.value != betAmount) revert InsufficientFunds();

        player.initialBet = betAmount;
        totalPrizePool += betAmount;
        playerReadyCount++;

        player.playerReady();

        _updateLastActivity();

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家取消准备
     */
    function playerUnready() external payable onlyPlayers nonReentrant {
        if (state != GameState.WAITING) revert GameNotInWaitingState();
        address playerAddr = msg.sender;
        BBPlayer storage player = players[playerAddr];
        if (player.state != PlayerState.READY) revert PlayerNotInReadyState();

        totalPrizePool -= betAmount;
        playerReadyCount--;
        player.initialBet = 0;

        player.playerUnready();

        _updateLastActivity();

        // 返还押金给玩家 - 使用更安全的 call 方法而不是 transfer
        (bool success, ) = payable(playerAddr).call{value: betAmount}("");
        if (!success) revert TransferFailed();

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家退出游戏
     */
    function playerQuit() external payable onlyNotBanker nonReentrant {
        if (state != GameState.WAITING) revert GameNotInWaitingState();
        address playerAddr = msg.sender;
        BBPlayer storage player = players[playerAddr];
        if (player.state != PlayerState.JOINED) revert InvalidPlayerState();

        // 先保存需要返还的金额
        uint256 amountToReturn = player.initialBet;

        // 移除玩家
        if(_removePlayer(playerAddr)){
            playerCount--;
        }

        _updateLastActivity();


        if(amountToReturn > 0){
            //返还押金
            (bool success, ) = payable(playerAddr).call{value: amountToReturn}("");
            if (!success) revert TransferFailed();
        }

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 庄家移除玩家
     */
    function bankerRemovePlayer(address playerAddr) external onlyBanker nonReentrant {
        if (state != GameState.WAITING) revert GameNotInWaitingState();
        if (playerAddr == bankerAddr) revert NotBanker();
        if (players[playerAddr].playerAddr == address(0)) revert PlayerNotFound();


        uint256 amountToReturn = 0;
        bool playerFound = false;

        for (uint i = 0; i < playerAddresses.length; i++) {
            address addr = playerAddresses[i];
            if(playerAddr == addr){
                BBPlayer storage player = players[playerAddr];

                // 保存需要返还的金额
                if(player.initialBet > 0){
                    amountToReturn = player.initialBet;
                }

                // 更新状态
                if(player.state == PlayerState.READY){
                    playerReadyCount--;
                    totalPrizePool -= betAmount;
                }

                // 将最后一个元素移到要删除的位置
                playerAddresses[i] = playerAddresses[playerAddresses.length - 1];
                // 移除最后一个元素
                playerAddresses.pop();
                delete players[playerAddr];

                playerCount--;
                playerFound = true;
                break;
            }
        }

        _updateLastActivity();

        // 最后进行转账
        if(playerFound && amountToReturn > 0){
            (bool success, ) = payable(playerAddr).call{value: amountToReturn}("");
            if (!success) revert TransferFailed();
        }

        if(playerFound) {
            emit GameTableChanged(address(this));
        }
    }

    // 使用交换和弹出方法移除元素
    function _removePlayer(address playerAddr) internal returns (bool) {
        for (uint i = 0; i < playerAddresses.length; i++) {
            if (playerAddresses[i] == playerAddr) {
                // 将最后一个元素移到要删除的位置
                playerAddresses[i] = playerAddresses[playerAddresses.length - 1];
                // 移除最后一个元素
                playerAddresses.pop();
                delete players[playerAddr];
                return true;
            }
        }
        return false; // 没有找到要删除的元素
    }

    function _startGame() internal {
        if (playerReadyCount != playerCount) revert NotAllPlayersReady();
        if (state != GameState.WAITING) revert GameNotInWaitingState();
        if (playerCount < 2) revert NotEnoughPlayers();

        // 刷新游戏数据
        refreshConfig();

        if (randomnessManagerAddr == address(0)) revert InvalidRandomnessManagerAddress();

        randomnessMgr = IRandomnessManager(randomnessManagerAddr);

        // 创建随机数会话
        currentRandomSessionId = randomnessMgr.createSession(
            playerAddresses,
            playerTimeout
        );

        gameCount++;
        //进入提交随机数阶段
        setState(GameState.REVEALING);
    }

    function _resetGame() internal {
        if (state != GameState.ENDED) revert GameNotEnded();
        if (block.timestamp < gameEndTimestamp + 20) revert GameNotTimeToReset();   //20秒后才能重新开局

        playerContinuedCount = 0;
        playerFoldCount = 0;
        gameStartTimestamp = 0;
        gameEndTimestamp = 0;
        playerReadyCount = 0;
        totalPrizePool = 0;
        dealerState.reset();
        for(uint i = 0; i < playerAddresses.length; i++){
            address playerAddr = playerAddresses[i];
            BBPlayer storage player = players[playerAddr];
            player.playerReset();
        }
        setState(GameState.WAITING);

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 下一步
     */
    function nextStep() external onlyBanker nonReentrant {
        if(state == GameState.WAITING) {
            _startGame();
        }
        else if(state == GameState.COMMITTING) {
            _goReveal();
        }
        else if(state == GameState.REVEALING) {
            _goFirstBetting();
        }
        else if(state == GameState.FIRST_BETTING) {
            _handleFirstBetting();
        }
        else if(state == GameState.SECOND_BETTING) {
            _handleSecondBetting();
        }
        else if(state == GameState.ENDED) {
            _resetGame();
        }

        _updateLastActivity();
    }

    /**
     * @dev 检查提交阶段状态，如果所有玩家都已提交或超时，进入揭示阶段
     */
    function _goReveal() internal {
        if (state != GameState.COMMITTING) revert GameNotInPlayingState();
        if (randomnessManagerAddr == address(0)) revert InvalidRandomnessManagerAddress();

        bool deadline = IRandomnessManager(randomnessManagerAddr).goReveal(currentRandomSessionId);

        require(deadline != 0, "GoRevealFailed");

        // 进入第一轮下注
        setState(GameState.REVEALING);
        currentRoundDeadline = deadline;
    }

    /**
     * @dev 检查揭示阶段状态，如果所有玩家都已揭示或超时，完成会话并进入下注阶段
     */
    function _goFirstBetting() internal {
        if (state != GameState.REVEALING) revert GameNotInPlayingState();
        if (randomnessManagerAddr == address(0)) revert InvalidRandomnessManagerAddress();

        // 完成随机数会话并获取最终随机种子
        uint256 finalSeed = IRandomnessManager(randomnessManagerAddr).completeSession(currentRandomSessionId);
        // 初始化发牌状态
        dealerState.initialize(finalSeed);
        dealerState.playerAddresses = playerAddresses;

        // 第一轮发牌
        dealerState.dealCardsByRoundForPlayers(playerAddresses, 1);

        // 进入第一轮下注
        setState(GameState.FIRST_BETTING);
        currentRoundDeadline = block.timestamp + _getPlayerTimeout();

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家提交随机数
     * @param commitment 提交的哈希值
     */
    function commitRandom(bytes32 commitment) external onlyPlayers nonReentrant {
        if (state != GameState.COMMITTING) revert GameNotInPlayingState();
        if (randomnessManagerAddr == address(0)) revert InvalidRandomnessManagerAddress();
        if (block.timestamp > currentRoundDeadline) revert ActionTimeOut();

        // 调用随机数管理合约提交随机数
        IRandomnessManager(randomnessManagerAddr).commitRandom(msg.sender, currentRandomSessionId, commitment);

        _updateLastActivity();
        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家揭示随机数
     * @param randomValue 随机值
     * @param salt 盐值
     */
    function revealRandom(uint256 randomValue, bytes32 salt) external onlyPlayers nonReentrant {
        if (state != GameState.REVEALING) revert GameNotInPlayingState();
        if (randomnessManagerAddr == address(0)) revert InvalidRandomnessManagerAddress();
        if (block.timestamp > currentRoundDeadline) revert ActionTimeOut();

        // 调用随机数管理合约揭示随机数
        IRandomnessManager(randomnessManagerAddr).revealRandom(msg.sender, currentRandomSessionId, randomValue, salt);

        _updateLastActivity();
        emit GameTableChanged(address(this));
    }

    function _handleFirstBetting() internal {
        //将没有操作的玩家设置成弃牌
        for(uint i = 0; i < playerAddresses.length; i++){
            address playerAddr = playerAddresses[i];
            BBPlayer storage player = players[playerAddr];
            if(player.state == PlayerState.READY){
                player.playerFold();
                playerFoldCount++;
            }
        }
        if(playerContinuedCount >= 2) {
            dealerState.dealCardsByRoundForPlayers(playerAddresses, 2);
            setState(GameState.SECOND_BETTING);
            playerContinuedCount = 0;
            playerFoldCount = 0;
        } else {
            setState(GameState.ENDED);
            _settleGame();
        }
    }

    function _handleSecondBetting() internal {
        //将没有操作的玩家设置成弃牌
        for(uint i = 0; i < playerAddresses.length; i++){
            address playerAddr = playerAddresses[i];
            BBPlayer storage player = players[playerAddr];
            if(player.state == PlayerState.FIRST_CONTINUED){
                player.playerFold();
                playerFoldCount++;
            }
        }
        if(playerContinuedCount >= 2) {
            dealerState.dealCardsByRoundForPlayers(playerAddresses, 3);
            playerContinuedCount = 0;
            playerFoldCount = 0;
            setState(GameState.ENDED);
            _settleGame();
        } else {
            setState(GameState.ENDED);
            _settleGame();
        }
    }

    function _checkCanNext() internal view returns (bool) {
        if(state == GameState.WAITING){
            //等待状态，人数大于一人并且都已准备，则可以开始游戏
            return playerCount >= 2 && playerReadyCount == playerCount;
        }else if(state == GameState.COMMITTING || state == GameState.REVEALING){
            //提交或揭示阶段，庄家可以随时检查状态
            return true;
        }else if(state == GameState.FIRST_BETTING || state == GameState.SECOND_BETTING){
            if(playerFoldCount >= playerCount - 1){
                //所有玩家都弃牌，则进入结算
                return true;
            }
            //第一、二轮下注状态，所有玩家都已行动或者超时，则可以进入下一轮
            return playerContinuedCount + playerFoldCount == playerCount || _isTimeOut();
        }else if(state == GameState.ENDED){
            return true;
        }

        return false;
    }

    function _isTimeOut() internal view returns (bool) {
        return block.timestamp > currentRoundDeadline;
    }

    /**
     * @dev 玩家弃牌
     */
    function playerFold() external onlyPlayers nonReentrant{
        if (state != GameState.FIRST_BETTING && state != GameState.SECOND_BETTING) revert GameNotInPlayingState();
        address playerAddr = msg.sender;

        // 检查是否超时
        if (_isTimeOut()) revert ActionTimeOut();

        BBPlayer storage player = players[playerAddr];

        if(state == GameState.FIRST_BETTING){
            // 第一轮弃牌
            if (player.state != PlayerState.READY) revert PlayerNotInReadyState();
        }else{
            // 第二轮弃牌
            if (player.state != PlayerState.FIRST_CONTINUED) revert InvalidPlayerState();
        }

        _updateLastActivity();
        player.playerFold();

        playerFoldCount++;

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家继续游戏
     */
    function playerContinue() external payable onlyPlayers nonReentrant{
        if (state != GameState.FIRST_BETTING && state != GameState.SECOND_BETTING) revert GameNotInPlayingState();
        address playerAddr = msg.sender;
        if (msg.value != betAmount) revert InsufficientFunds();

        // 检查是否超时
        if (_isTimeOut()) revert ActionTimeOut();

        BBPlayer storage player = players[playerAddr];
        if (address(player.playerAddr) == address(0)) revert PlayerNotFound();

        uint8 round = 1;
        if(state == GameState.FIRST_BETTING){
            // 第一轮继续
            if (player.state != PlayerState.READY) revert PlayerNotInReadyState();
        }else{
            // 第二轮继续
            round = 2;
            if (player.state != PlayerState.FIRST_CONTINUED) revert InvalidPlayerState();
        }

        player.playerContinue(betAmount);
        playerContinuedCount++;
        totalPrizePool += betAmount;

        _updateLastActivity();

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家结算游戏，如果庄家没结算的话
     */
    function playerSettle() external payable onlyPlayers nonReentrant{
        _settleGame();
    }

    function _settleGame() internal {
        if (state != GameState.ENDED) revert GameNotInEndedState();

        // 计算费用
        uint256 bankerFee = (totalPrizePool * bankerFeePercent) / 100;
        uint256 remainingPrizePool = totalPrizePool - bankerFee;

        bool extraFee = true;
        // 如果只有一个玩家继续，则该玩家获胜
        if (playerContinuedCount == 1) {
            _settleOneContinuedPlayer(remainingPrizePool);
        }
        // 如果所有玩家都弃牌，则每个人拿回自己的钱，平台和庄家不收取费用
        else if (playerFoldCount == playerCount) {
            extraFee = false;
            _settleAllFolded();
        }
        // 正常比牌
        else {
            _settleNormalGame(remainingPrizePool);
        }

        if(extraFee){
            // 统一处理庄家费用转账
            if (bankerFee > 0) {
                (bool success, ) = payable(bankerAddr).call{value: bankerFee}("");
                if (!success) revert TransferFailed();
            }
        }


        gameEndTimestamp = block.timestamp;

        // 如果设置了奖励池，尝试分配奖励
        if (rewardPoolAddr != address(0)) {
            BBRewardPool rewardPool = BBRewardPool(rewardPoolAddr);
            try rewardPool.tryDistributeReward(address(this), playerAddresses) {
                // 奖励分配成功或失败都继续游戏
            } catch {
                // 奖励分配失败不影响游戏结算
            }
        }

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 处理只有一个玩家继续的情况
     */
    function _settleOneContinuedPlayer(uint256 remainingPrizePool) internal {
        // 准备游戏结果数据
        uint256 _endTimestamp = block.timestamp;
        address[] memory _playerAddrs = playerAddresses;
        address[] memory _winnerAddrs = new address[](1);
        uint256 winnerCount = 0;

        // 创建玩家数据条目数组
        BBPlayerEntry[] memory playerEntries = new BBPlayerEntry[](playerAddresses.length);

        // 找出继续的那个玩家
        address continuedPlayer = address(0);
        for (uint i = 0; i < playerAddresses.length; i++) {
            address playerAddr = playerAddresses[i];
            BBPlayer storage player = players[playerAddr];

            // 记录玩家数据
            playerEntries[i] = BBPlayerEntry({
                playerAddr: playerAddr,
                playerData: player
            });

            // 找出继续的玩家
            if (player.state == PlayerState.FIRST_CONTINUED ||
                player.state == PlayerState.SECOND_CONTINUED) {
                continuedPlayer = playerAddr;
                _winnerAddrs[winnerCount] = playerAddr;
                winnerCount++;
            }
        }

        // 记录游戏历史
        BBGameHistory historyContract = BBGameHistory(gameHistoryAddr);
        historyContract.recordGame(
            gameStartTimestamp,
            _endTimestamp,
            totalPrizePool,
            _playerAddrs,
            _winnerAddrs,
            playerEntries,
            CardType.NONE // 没有比牌，所以没有最大牌型
        );


        // 将剩余奖池给获胜者
        if (continuedPlayer != address(0)) {
            (bool success, ) = payable(continuedPlayer).call{value: remainingPrizePool}("");
            if (!success) revert TransferFailed();
        }
    }

    /**
     * @dev 处理所有玩家都弃牌的情况
     */
    function _settleAllFolded() internal {
        // 准备游戏结果数据
        uint256 _endTimestamp = block.timestamp;
        address[] memory _playerAddrs = playerAddresses;

        // 创建临时数组来存储需要返还资金的玩家和金额
        address[] memory refundAddresses = new address[](playerAddresses.length);
        uint256[] memory refundAmounts = new uint256[](playerAddresses.length);
        uint256 refundCount = 0;

        // 创建玩家数据条目数组
        BBPlayerEntry[] memory playerEntries = new BBPlayerEntry[](playerAddresses.length);

        // 收集所有玩家数据并计算需要返还的金额
        for (uint i = 0; i < playerAddresses.length; i++) {
            address playerAddr = playerAddresses[i];
            BBPlayer storage player = players[playerAddr];

            // 记录玩家数据
            playerEntries[i] = BBPlayerEntry({
                playerAddr: playerAddr,
                playerData: player
            });

            // 计算需要返还的金额（玩家的所有押注）
            uint256 refundAmount = player.totalBet();
            if (refundAmount > 0) {
                refundAddresses[refundCount] = playerAddr;
                refundAmounts[refundCount] = refundAmount;
                refundCount++;
            }
        }

        // 记录游戏历史（没有赢家）
        BBGameHistory historyContract = BBGameHistory(gameHistoryAddr);
        historyContract.recordGame(
            gameStartTimestamp,
            _endTimestamp,
            totalPrizePool,
            _playerAddrs,
            new address[](0), // 没有赢家
            playerEntries,
            CardType.NONE // 没有比牌，所以没有最大牌型
        );

        // 返还每个玩家的押注
        for (uint i = 0; i < refundCount; i++) {
            (bool success, ) = payable(refundAddresses[i]).call{value: refundAmounts[i]}("");
            if (!success) revert TransferFailed();
        }
    }


    /**
     * @dev 处理正常比牌的情况
     */
    function _settleNormalGame(uint256 remainingPrizePool) internal {
        CardType _maxCardType = CardType.NONE;

        // 准备游戏结果数据
        uint256 _endTimestamp = block.timestamp;
        address[] memory _playerAddrs = playerAddresses;
        address[] memory _winnerAddrs = new address[](playerAddresses.length);
        uint256 winnerCount = 0;

        // 创建玩家数据条目数组
        BBPlayerEntry[] memory playerEntries = new BBPlayerEntry[](playerAddresses.length);

        // 计算每个玩家的牌型
        for (uint i = 0; i < playerAddresses.length; i++) {
            address playerAddr = playerAddresses[i];
            BBPlayer storage player = players[playerAddr];

            // 玩家的牌
            uint8[5] memory allCards = dealerState.getPlayerAllCards(playerAddr);

            // 计算牌型
            CardType cardType = dealerState.calculateCardType(playerAddr);

            // 赋值给玩家
            player.cards = allCards;
            player.cardType = cardType;

            // 更新最大牌型
            if (uint8(player.cardType) > uint8(_maxCardType)) {
                _maxCardType = player.cardType;
            }

            // 记录玩家数据
            playerEntries[i] = BBPlayerEntry({
                playerAddr: playerAddr,
                playerData: player
            });
        }

        // 如果所有玩家都没有牛牌型，则比较最大牌
        if (_maxCardType == CardType.NONE) {
            (_winnerAddrs, winnerCount) = _settleNormalGameWithNoBull(_winnerAddrs);
        } else {
            // 找出获胜者（有牛牌型的情况）
            for (uint i = 0; i < playerAddresses.length; i++) {
                address playerAddr = playerAddresses[i];
                BBPlayer storage player = players[playerAddr];

                // 如果是获胜者，添加到获胜者数组
                if (player.cardType == _maxCardType) {
                    _winnerAddrs[winnerCount] = playerAddr;
                    winnerCount++;
                }
            }
        }

        // 调整获胜者数组大小
        assembly ("memory-safe")  {
            mstore(_winnerAddrs, winnerCount)
        }

        // 记录游戏历史
        BBGameHistory historyContract = BBGameHistory(gameHistoryAddr);
        historyContract.recordGame(
            gameStartTimestamp,
            _endTimestamp,
            totalPrizePool,
            _playerAddrs,
            _winnerAddrs,
            playerEntries,
            _maxCardType
        );


        // 分配奖金给获胜者
        if (winnerCount > 0) {
            // 每个获胜者应得的奖金
            uint256 prizePerWinner = remainingPrizePool / winnerCount;

            // 分配奖金给每个获胜者
            for (uint i = 0; i < winnerCount; i++) {
                address winnerAddr = _winnerAddrs[i];
                (bool success, ) = payable(winnerAddr).call{value: prizePerWinner}("");
                if (!success) revert TransferFailed();
            }

            // 处理可能的舍入误差，将剩余的少量奖金给第一个获胜者
            uint256 remainingPrize = remainingPrizePool - (prizePerWinner * winnerCount);
            if (remainingPrize > 0) {
                (bool success, ) = payable(_winnerAddrs[0]).call{value: remainingPrize}("");
                if (!success) revert TransferFailed();
            }
        }
    }

    /**
     * @dev 处理没有牛牌型的情况
     */
    function _settleNormalGameWithNoBull(address[] memory _winnerAddrs) internal view returns (address[] memory, uint256){
        uint8 maxCard = 0;
        uint256 winnerCount = 0;

        // 先找出所有玩家中的最大牌
        for (uint i = 0; i < playerAddresses.length; i++) {
            address playerAddr = playerAddresses[i];
            BBPlayer storage player = players[playerAddr];

            // 找出玩家五张牌中的最大牌
            uint8 playerMaxCard = 0;
            for (uint j = 0; j < 5; j++) {
                uint8 cardValue = player.cards[j] % 13;
                // 修正：A是最小的(值为1)，K是最大的(值为13)
                if (cardValue == 0) cardValue = 1; // A的值为1
                if (cardValue > playerMaxCard) {
                    playerMaxCard = cardValue;
                }
            }

            // 更新全局最大牌
            if (playerMaxCard > maxCard) {
                maxCard = playerMaxCard;
            }
        }

        // 找出拥有最大牌的玩家
        for (uint i = 0; i < playerAddresses.length; i++) {
            address playerAddr = playerAddresses[i];
            BBPlayer storage player = players[playerAddr];

            // 检查玩家是否有最大牌
            uint8 playerMaxCard = 0;
            for (uint j = 0; j < 5; j++) {
                uint8 cardValue = player.cards[j] % 13;
                // 修正：A是最小的(值为1)，K是最大的(值为13)
                if (cardValue == 0) cardValue = 1; // A的值为1
                if (cardValue > playerMaxCard) {
                    playerMaxCard = cardValue;
                }
            }

            if (playerMaxCard == maxCard) {
                _winnerAddrs[winnerCount] = playerAddr;
                winnerCount++;
            }
        }

        return (_winnerAddrs, winnerCount);
    }

    /**
     * @dev 清算不活跃的游戏桌
     * 任何人都可以调用此函数来清算长时间不活跃的游戏桌
     * 庄家的押金将被分配给玩家和清算人
     */
    function liquidateInactiveTable() external nonReentrant returns (bool) {
        // 检查游戏桌是否超时
        if (block.timestamp <= lastActivityTimestamp + tableInactiveTimeout) revert TableNotInactive();
        if (state != GameState.FIRST_BETTING || state != GameState.SECOND_BETTING) revert TableNotInBetting();

        // 计算庄家的押金
        uint256 bankerBet = players[bankerAddr].totalBet();

        // 清算人的奖励 (从庄家押金中收取)
        uint256 liquidatorReward = bankerBet * liquidatorFeePercent / 100;

        // 剩余的庄家押金平均分配给所有玩家
        uint256 remainingBankerBet = bankerBet - liquidatorReward;
        uint256 playerRewardTotal = 0;

        // 计算有多少玩家可以分配奖励（不包括庄家）
        uint256 eligiblePlayerCount = playerAddresses.length - 1;

        // 创建临时数组存储需要支付的地址和金额
        address[] memory paymentAddresses = new address[](playerAddresses.length);
        uint256[] memory paymentAmounts = new uint256[](playerAddresses.length);
        uint256 paymentCount = 0;

        // 如果没有其他玩家，清算人获得全部奖励
        if (eligiblePlayerCount == 0) {
            liquidatorReward = bankerBet;
            remainingBankerBet = 0;
        } else {
            // 计算每个玩家的奖励
            uint256 rewardPerPlayer = remainingBankerBet / eligiblePlayerCount;

            // 计算每个玩家应得的金额
            for (uint i = 0; i < playerAddresses.length; i++) {
                address playerAddr = playerAddresses[i];
                BBPlayer storage player = players[playerAddr];

                if (playerAddr != bankerAddr) {
                    uint256 totalPayment = 0;

                    // 计算玩家应得的总金额（押金 + 奖励）
                    if (player.totalBet() > 0) {
                        totalPayment += player.totalBet();
                    }

                    // 添加奖励金额
                    totalPayment += rewardPerPlayer;

                    // 记录需要支付的金额
                    if (totalPayment > 0) {
                        paymentAddresses[paymentCount] = playerAddr;
                        paymentAmounts[paymentCount] = totalPayment;
                        paymentCount++;
                    }

                    playerRewardTotal += rewardPerPlayer;
                }
            }
        }

        // 处理可能的舍入误差
        uint256 actualDistributed = playerRewardTotal + liquidatorReward;
        if (actualDistributed < bankerBet) {
            liquidatorReward += (bankerBet - actualDistributed);
        }

        // 更新状态
        for (uint i = 0; i < playerAddresses.length; i++) {
            delete players[playerAddresses[i]];
        }

        playerAddresses = new address[](0);
        playerCount = 0;
        playerReadyCount = 0;
        playerContinuedCount = 0;
        playerFoldCount = 0;
        totalPrizePool = 0;

        setState(GameState.LIQUIDATED);

        // 通知 GameMain 合约移除这个游戏桌
        (bool success, ) = gameMainAddr.call(
            abi.encodeWithSignature("removeGameTable(address, uint)", address(this), 1)
        );
        if (!success) revert OnlyMainContractCanCall();

        // 所有状态更新完成后，进行转账操作
        // 然后进行其他转账
        for (uint i = 0; i < paymentCount; i++) {
            (bool otherSuccess, ) = payable(paymentAddresses[i]).call{value: paymentAmounts[i]}("");
            if (!otherSuccess) revert TransferFailed();
        }

        // 支付清算人奖励
        (bool liquidatorSuccess, ) = payable(msg.sender).call{value: liquidatorReward}("");
        if (!liquidatorSuccess) revert TransferFailed();

        emit GameTableChanged(address(this));

        return success;
    }


    /**
     * @dev 设置游戏状态
     */
    function setState(GameState _state) internal {
        state = _state;

        // 如果进入下注阶段，为所有玩家设置操作截止时间
        if (_state == GameState.FIRST_BETTING || _state == GameState.SECOND_BETTING) {
            currentRoundDeadline = block.timestamp + playerTimeout;
        }

        _updateLastActivity(); // 更新最后活动时间

        emit GameTableChanged(address(this));
    }

    // 获取所有玩家数据
    function getAllPlayerData() external view returns (BBPlayer[] memory) {
        BBPlayer[] memory playerData = new BBPlayer[](playerAddresses.length);
        for (uint i = 0; i < playerAddresses.length; i++) {
            address playerAddr = playerAddresses[i];
            playerData[i] = players[playerAddr];
        }

        return playerData;
    }

    // 获取单个玩家数据
    function getPlayerData(address playerAddr) external view returns (BBPlayer memory) {
        if (players[playerAddr].playerAddr == address(0)) revert PlayerNotFound();
        return players[playerAddr];
    }

    // 获取玩家卡牌数据
    function getAllPlayerCards() external view returns (BBPlayerCardEntry[] memory) {
       BBPlayerCardEntry[] memory playerCardsData = new BBPlayerCardEntry[](playerAddresses.length);
        for (uint i = 0; i < playerAddresses.length; i++) {
            address playerAddr = playerAddresses[i];
            uint8[5] memory cards = dealerState.getPlayerAllCards(playerAddr);
            CardType cardType = BBCardUtils.calculateCardType(cards);
            playerCardsData[i] = BBPlayerCardEntry({
                playerAddr: playerAddr,
                cards: cards,
                cardType: cardType
            });
        }

        return playerCardsData;
    }


    // 修改 getTableInfo 函数
    function getTableInfo() external view returns (GameTableView memory) {
        return GameTableView({
            // balance: address(this).balance / 1 ether,
            tableAddr: address(this),
            tableName: tableName,
            bankerAddr: bankerAddr,
            betAmount: betAmount,
            totalPrizePool: totalPrizePool,
            playerCount: playerCount,
            maxPlayers: maxPlayers,
            creationTimestamp: creationTimestamp,
            state: state,
            playerContinuedCount: playerContinuedCount,
            playerFoldCount: playerFoldCount,
            playerReadyCount: playerReadyCount,
            playerAddresses: playerAddresses,
            currentRoundDeadline: currentRoundDeadline,
            playerTimeout: playerTimeout,
            tableInactiveTimeout: tableInactiveTimeout,
            lastActivityTimestamp: lastActivityTimestamp,
            implementationVersion: implementationVersion
        });
    }

    function isPlayer(address playerAddr) external view returns (bool) {
        return players[playerAddr].playerAddr != address(0);
    }

    /**
     * @dev 设置随机数管理器地址
     * @param _randomnessManagerAddr 随机数管理器地址
     */
    function setRandomnessManagerAddress(address _randomnessManagerAddr) external onlyGameMain {
        if (_randomnessManagerAddr == address(0)) revert InvalidRandomnessManagerAddress();
        randomnessManagerAddr = _randomnessManagerAddr;
    }

    receive() external payable {}

    /**
     * @dev 授权升级函数，只有合约所有者可以升级
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
