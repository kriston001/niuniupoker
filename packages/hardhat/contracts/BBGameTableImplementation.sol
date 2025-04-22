// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBErrors.sol";
import "./BBCardUtils.sol";
import "./BBPlayer.sol";
import "./BBTypes.sol";
import "./BBCardDealer.sol";
import "./BBVersion.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./BBInterfaces.sol";

/**
 * @title BBGameTableImplementation
 * @dev 牛牛游戏桌实现合约，管理单个游戏桌的逻辑
 */
contract BBGameTableImplementation is ReentrancyGuard, Ownable {
    using BBPlayerLib for BBPlayer;
    using BBCardUtils for uint8[5];
    using BBCardDealer for BBCardDealer.DealerState;

    // 游戏桌数据
    bool public active;
    uint256 public tableId; // 游戏桌ID
    string public tableName;
    address public bankerAddr;
    uint256 public betAmount;  // 固定押注金额
    uint8 public playerCount;
    uint8 public maxPlayers;
    uint256 public creationTimestamp;
    GameState public state;
    uint256 public rewardPoolId;

    uint256 public gameRound; //游戏场次
    uint256 public gameLiquidatedCount; //被清算的游戏场数

    uint256 public gameStartTimestamp;
    uint256 public gameEndTimestamp;
    uint8 public playerContinuedCount;
    uint8 public playerFoldCount;
    uint8 public playerReadyCount;
    uint256 public totalPrizePool;  //奖池金额
    uint8 public bankerFeePercent; // 庄家费用百分比
    uint8 public liquidatorFeePercent; // 清算人费用百分比
    uint256 public implementationVersion; // 实现版本号

    // 使用集中版本管理
    function getVersion() public pure returns (string memory) {
        return BBVersion.VERSION;
    }

    // 玩家数据
    BBPlayer[] public players;

    // 发牌记录
    BBCardDealer.DealerState private dealerState;

    //主合约地址
    address public gameMainAddr;
    address public rewardPoolAddr; // 奖励池合约地址
    address public randomnessManagerAddr; // 随机数管理合约地址
    address public roomCardAddr; // 房间卡合约地址

    // 添加超时相关状态变量
    uint256 public playerTimeout; // 玩家操作超时时间，单位为秒
    uint256 public currentRoundDeadline; // 当前回合的截止时间

    uint256 public tableInactiveTimeout; // 游戏桌不活跃超时时间，单位为秒
    uint256 public lastActivityTimestamp; // 最后活动时间戳

    
    // 预留 50 个 slot 给将来新增变量用，防止存储冲突
    uint256[50] private __gap;

    // 事件
    event GameTableChanged(address indexed tableAddr);
    event GameTableInitialized(address indexed tableAddr, address indexed banker, uint256 version);
    event CreateGameHistory(address indexed tableAddr, uint256 round, uint256 gameStartTimestamp, uint256 gameEndTimestamp, address[] playerAddrs, address[] winnerAddrs, uint256[] playerBets, uint8[5][] playerCards);


    // 修改构造函数，传入初始所有者
    constructor() Ownable(msg.sender){
        // 构造函数体可以为空，因为所有权已经在 Ownable 构造函数中设置
    }
   
    /**
     * @dev 初始化函数，替代构造函数
     */
    function initialize(
        uint256 _tableId,
        string memory _tableName,
        address _bankerAddr,
        uint256 _betAmount,
        uint8 _maxPlayers,
        address _gameMainAddr,
        uint8 _bankerFeePercent,
        uint256 _implementationVersion
    ) external {
        // 确保只初始化一次的检查
        require(creationTimestamp == 0, "Already initialized");
        
        _transferOwnership(_gameMainAddr);

        // 参数验证
        if (_maxPlayers < 2) revert InvalidMaxPlayers();

        active = true;
        tableId = _tableId;
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

        // 初始化发牌状态 - 暂时使用临时种子，后续会通过VRF更新
        uint256 tempSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
        dealerState.initialize(tempSeed);

        emit GameTableInitialized(address(this), _bankerAddr, _implementationVersion);
    }

    //刷新游戏配置
    function refreshConfig() internal {
        IGameMain gameMain = IGameMain(gameMainAddr);
        GameConfig memory config = gameMain.getGameConfig();
        playerTimeout = config.playerTimeout;
        liquidatorFeePercent = config.liquidatorFeePercent;
        tableInactiveTimeout = config.tableInactiveTimeout;
        randomnessManagerAddr = config.randomnessManagerAddress;
        roomCardAddr = config.roomCardAddress;
        rewardPoolAddr = config.rewardPoolAddress;
    }

    // 添加一个公共函数来获取玩家地址列表，数组需要显示定义get函数，int、string等不需要
    function getPlayerAddresses() public view returns (address[] memory) {
        address[] memory playerAddresses = new address[](playerCount);
        uint count = 0;
        for(uint i = 0; i < players.length; i++){
            if(players[i].addr != address(0)){
                playerAddresses[count] = players[i].addr;
                count++;
            }
        }

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
        _getPlayer(msg.sender);
        _;
    }

    /**
     * @dev 修饰器：适用于非庄家的玩家
     */
    modifier onlyNotBanker() {
        (, BBPlayer storage player) = _getPlayer(msg.sender);
        if (msg.sender == bankerAddr) revert PlayerNotFound();
        _;
    }

    /**
     * @dev 修饰器：只允许游戏主合约调用
     */
    modifier onlyGameMain() {
        if (msg.sender != gameMainAddr) revert OnlyMainContractCanCall();
        _;
    }

    /**
     * @dev 庄家为游戏桌设置奖励池
     * @param poolId 奖励池ID
     */
    function setTableRewardPool(uint256 poolId) external onlyBanker nonReentrant {
        if(rewardPoolAddr == address(0)) revert InvalidRewardPoolAddress();

        if(IRewardPool(rewardPoolAddr).isBankerPool(bankerAddr, poolId)){
            rewardPoolId = poolId;
        }else{
            revert NotPoolOwner();
        }
    }

    /**
     * @dev 庄家移除游戏桌的奖励池
     */
    function removeTableRewardPool() external onlyBanker nonReentrant {
        rewardPoolId = 0;
    }

    //添加玩家
    function _addPlayer(address playerAddr) internal returns (uint256) {
        //遍历players找到空闲的位置
        for(uint8 i = 0; i < players.length; i++){
            if(players[i].addr == address(0)){
                players[i].addr = playerAddr;
                players[i].state = PlayerState.JOINED;
                players[i].initialBet = betAmount;
                players[i].additionalBet1 = 0;
                players[i].additionalBet2 = 0;
                players[i].cards = [0, 0, 0, 0, 0];
                players[i].cardType = CardType.NONE;
                playerCount++;
                return i;
            }
        }

        players.push(BBPlayer({
            addr: playerAddr,
            state: PlayerState.JOINED,
            initialBet: betAmount,
            additionalBet1: 0,
            additionalBet2: 0,
            cards: [0, 0, 0, 0, 0],
            cardType: CardType.NONE,
            __gap: [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)]
        })); 

        playerCount++;
        return players.length - 1;   
    }

    function _getPlayerIndex(address playerAddr) internal view returns (uint8) {
        for (uint8 i = 0; i < players.length; i++) {
            if (players[i].addr == playerAddr) {
                return i;
            }
        }
        revert PlayerNotFound();
    }

    function _getPlayer(address playerAddr) internal view returns (uint8 index, BBPlayer storage) {
        uint8 playerIndex = _getPlayerIndex(playerAddr);
        return (playerIndex, players[playerIndex]);
    }

    //移除玩家
    function _removePlayer(address playerAddr) internal {
        uint8 index = _getPlayerIndex(playerAddr);
        _removePlayerByIndex(index);
    }

    function _removePlayerByIndex(uint8 index) internal {
        players[index].addr = address(0);
        players[index].state = PlayerState.NONE;
        players[index].initialBet = 0;
        players[index].additionalBet1 = 0;
        players[index].additionalBet2 = 0;
        players[index].cards = [0, 0, 0, 0, 0];
        players[index].cardType = CardType.NONE;

        playerCount--;
    }

    function _isPlayerExists(address playerAddr) internal view returns (bool) {
        for (uint8 i = 0; i < players.length; i++) {
            if (players[i].isValid() && players[i].addr == playerAddr) {
                return true;
            }
        }
        return false;
    }


    /**
     * @dev 玩家加入游戏
     */
    function playerJoin() external nonReentrant {
        address playerAddr = msg.sender;
        if(_isPlayerExists(playerAddr)) revert PlayerAlreadyJoined();
        if (state != GameState.WAITING) revert GameNotInWaitingState();
        if (playerCount >= maxPlayers) revert MaxPlayersReached();

        _addPlayer(playerAddr);

        _updateLastActivity();

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家准备
     */
    function playerReady() external payable onlyPlayers nonReentrant {
        if (state != GameState.WAITING) revert GameNotInWaitingState();
        address playerAddr = msg.sender;
        (, BBPlayer storage player) = _getPlayer(playerAddr);
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
        (, BBPlayer storage player) = _getPlayer(playerAddr);
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
        (uint8 playerIndex, BBPlayer storage player) = _getPlayer(playerAddr);
        if (player.state != PlayerState.JOINED || player.state != PlayerState.READY) revert InvalidPlayerState();

        // 先保存需要返还的金额
        uint256 amountToReturn = player.initialBet;

        // 移除玩家
        _removePlayerByIndex(playerIndex);

        if(amountToReturn > 0){
            //返还押金
            (bool success, ) = payable(playerAddr).call{value: amountToReturn}("");
            if (!success) revert TransferFailed();
        }

        _updateLastActivity();

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 庄家移除玩家
     */
    function bankerRemovePlayer(address playerAddr) external onlyBanker nonReentrant {
        if (state != GameState.WAITING) revert GameNotInWaitingState();
        if (playerAddr == bankerAddr) revert NotBanker();
        (uint8 playerIndex, BBPlayer storage player) = _getPlayer(playerAddr);


        uint256 amountToReturn = 0;
        if(player.initialBet > 0){
            amountToReturn = player.initialBet;
        }
        if(player.state == PlayerState.READY){
            playerReadyCount--;
            totalPrizePool -= betAmount;
        }
        _removePlayerByIndex(playerIndex);
        _updateLastActivity();

        // 最后进行转账
        if(amountToReturn > 0){
            (bool success, ) = payable(playerAddr).call{value: amountToReturn}("");
            if (!success) revert TransferFailed();
        }


        emit GameTableChanged(address(this));
    }

    function startGame(uint256 roomCardId) external payable onlyBanker nonReentrant {
        // 刷新游戏数据
        refreshConfig();

        if (roomCardId == 0) revert InvalidRoomCardParams();
        if (roomCardAddr == address(0)) revert InvalidRoomCardContract();
        if (playerReadyCount != playerCount) revert NotAllPlayersReady();
        if (state != GameState.WAITING) revert GameNotInWaitingState();
        if (playerCount < 2) revert NotEnoughPlayers();

        // 庄家需要押金
        if (msg.value != betAmount) revert InsufficientFunds();

        //验证房卡
        IRoomCardNFT roomCard = IRoomCardNFT(roomCardAddr);
        if (!roomCard.validateParams(roomCardId, playerCount)) revert InvalidRoomCardParams();
 
        // 消耗房卡
        try roomCard.consume(msg.sender, roomCardId) {
            // 房卡消耗成功
        } catch {
            revert RoomCardConsumptionFailed();
        }
        
        if (randomnessManagerAddr == address(0)) revert InvalidRandomnessManagerAddress();

        IRandomnessManager randomnessMgr = IRandomnessManager(randomnessManagerAddr);

        // 开始随机数阶段
        address[] memory playerAddresses = getPlayerAddresses();
        randomnessMgr.startCommit(
            playerAddresses,
            playerTimeout
        );

        gameRound++;
        //进入提交随机数阶段
        setState(GameState.COMMITTING);
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
        for(uint i = 0; i < players.length; i++){
            if(players[i].isValid()){
                players[i].playerReset();
            }  
        }
        setState(GameState.WAITING);

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 下一步
     */
    function nextStep() external onlyBanker nonReentrant {
        if(state == GameState.COMMITTING) {
            _startReveal();
        }
        else if(state == GameState.REVEALING) {
            _startFirstBetting();
        }
        else if(state == GameState.FIRST_BETTING) {
            _startSecondBetting();
        }
        else if(state == GameState.SECOND_BETTING) {
            _endGame();
        }
        else if(state == GameState.ENDED) {
            _resetGame();
        }

        _updateLastActivity();
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
        IRandomnessManager(randomnessManagerAddr).commitRandom(msg.sender, commitment);

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
        IRandomnessManager(randomnessManagerAddr).revealRandom(msg.sender, randomValue, salt);

        _updateLastActivity();
        emit GameTableChanged(address(this));
    }

    /**
     * @dev 检查提交阶段状态，如果所有玩家都已提交或超时，进入揭示阶段
     */
    function _startReveal() internal {
        if (state != GameState.COMMITTING) revert GameNotInPlayingState();
        if (randomnessManagerAddr == address(0)) revert InvalidRandomnessManagerAddress();

        uint256 deadline = IRandomnessManager(randomnessManagerAddr).startReveal();

        require(deadline != 0, "GoRevealFailed");

        // 进入揭示阶段
        setState(GameState.REVEALING);
        currentRoundDeadline = deadline;
    }

    function _dealCardsByRound(uint8 round) internal {
        if(round == 1){
            // 第一轮发牌，每个玩家发3张牌
            for(uint i = 0; i < players.length; i++){
                if(players[i].isValid()){
                    uint8[] memory newCards = dealerState.dealCardsByRoundForPlayer(players[i].addr, round);
                    for(uint j = 0; j < 3; j++){
                        players[i].cards[j] = newCards[j];
                    }
                }
            }
        }else{
            // 第二、三轮发牌
            for(uint i = 0; i < players.length; i++){
                if(players[i].isValid()){
                    uint8[] memory newCards = dealerState.dealCardsByRoundForPlayer(players[i].addr, round);
                    // 合并第一轮和第二轮的牌
                    for(uint j = 0; j < newCards.length; j++){
                        players[i].cards[j + round + 1] = newCards[j];
                    }
                }
            }
        }
    }

    /**
     * @dev 检查揭示阶段状态，如果所有玩家都已揭示或超时，完成会话并进入下注阶段
     */
    function _startFirstBetting() internal {
        if (state != GameState.REVEALING) revert GameNotInPlayingState();
        if (randomnessManagerAddr == address(0)) revert InvalidRandomnessManagerAddress();

        // 完成随机数会话并获取最终随机种子
        uint256 finalSeed = IRandomnessManager(randomnessManagerAddr).completeSession();

        // 初始化发牌状态
        dealerState.initialize(finalSeed);
        dealerState.reset();


        // 第一轮发牌
        _dealCardsByRound(1);

        // 进入第一轮下注
        setState(GameState.FIRST_BETTING);

        emit GameTableChanged(address(this));
    }

    

    function _startSecondBetting() internal {
        if (state!= GameState.FIRST_BETTING) revert GameNotInPlayingState();

        if(playerFoldCount >= playerCount - 1){
            //所有玩家都弃牌，则进入结算
            setState(GameState.ENDED);
            _settleGame();
        }else if(playerContinuedCount + playerFoldCount == playerCount || _isTimeOut()){
            //所有玩家都已行动或者超时，则可以进入下一轮
            //将没有操作的玩家设置成弃牌
            for(uint i = 0; i < players.length; i++){
                BBPlayer storage player = players[i];
                if(player.addr != address(0) && player.state == PlayerState.READY){
                    player.playerFold();
                    playerFoldCount++;
                }
            }

            if(playerContinuedCount >= 2) {
                _dealCardsByRound(2);
                setState(GameState.SECOND_BETTING);
                playerContinuedCount = 0;
                playerFoldCount = 0;
            } else {
                setState(GameState.ENDED);
                _settleGame();
            }
        }else{
            revert GameNotInPlayingState();
        }
    }

    function _endGame() internal {
        if (state != GameState.SECOND_BETTING) revert GameNotInPlayingState();

        if(playerFoldCount >= playerCount - 1){
            //所有玩家都弃牌，则进入结算
            setState(GameState.ENDED);
            _settleGame();
        }else if(playerContinuedCount + playerFoldCount == playerCount || _isTimeOut()){
            //所有玩家都已行动或者超时，则可以进入下一轮
            //将没有操作的玩家设置成弃牌
            for(uint i = 0; i < players.length; i++){
                BBPlayer storage player = players[i];
                if(player.addr != address(0) && (player.state == PlayerState.FIRST_CONTINUED || player.state == PlayerState.FIRST_FOLDED)){
                    player.playerFold();
                    playerFoldCount++;
                }
            }

            _dealCardsByRound(3);
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

        (, BBPlayer storage player) = _getPlayer(playerAddr);

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

        (, BBPlayer storage player) = _getPlayer(playerAddr);

        if(state == GameState.FIRST_BETTING){
            // 第一轮继续
            if (player.state != PlayerState.READY) revert PlayerNotInReadyState();
        }else{
            // 第二轮继续
            if (player.state != PlayerState.FIRST_CONTINUED) revert InvalidPlayerState();
        }

        player.playerContinue(betAmount);
        playerContinuedCount++;
        totalPrizePool += betAmount;

        _updateLastActivity();

        emit GameTableChanged(address(this));
    }

    function _gameTimeout() internal view returns (bool)  {
        if (state!= GameState.COMMITTING && state!= GameState.REVEALING && state!= GameState.FIRST_BETTING && state!= GameState.SECOND_BETTING) revert GameNotInPlayingState(); 

        // 检查是否超时
        return block.timestamp > lastActivityTimestamp + tableInactiveTimeout;
    }

    /**
     * @dev 玩家结算游戏，如果庄家没结算的话
     */
    function playerSettle() external payable onlyPlayers nonReentrant{
        require(_gameTimeout(), "GameTimeout");

        _settleGame();
    }

    function _settleGame() internal {
        if (state != GameState.ENDED) revert GameNotInEndedState();
        gameEndTimestamp = block.timestamp;

        // 计算费用
        uint256 bankerFee = (totalPrizePool * bankerFeePercent) / 100;
        uint256 remainingPrizePool = totalPrizePool - bankerFee;

        // 如果只有一个玩家继续，则该玩家获胜
        if (playerContinuedCount == 1) {
            _settleOneContinuedPlayer(remainingPrizePool);
        }
        // 如果所有玩家都弃牌，则每个人拿回自己的钱
        else if (playerFoldCount == playerCount) {
            _settleAllFolded();
        }
        // 正常比牌
        else {
            _settleNormalGame(remainingPrizePool);
        }

        // 统一处理庄家费用转账
        if (bankerFee > 0) {
            (bool success, ) = payable(bankerAddr).call{value: bankerFee}("");
            if (!success) revert TransferFailed();
        }

        // 如果设置了奖励池，尝试分配奖励
        if (rewardPoolAddr != address(0)) {
            address[] memory playerAddresses = getPlayerAddresses();
            IRewardPool rewardPool = IRewardPool(rewardPoolAddr);
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
        address[] memory winnerAddrs = new address[](1);
        uint256[] memory playerBets = new uint256[](playerCount);
        uint8[5][] memory playerCards = new uint8[5][](playerCount);
        address[] memory playerAddresses = new address[](playerCount);
        uint256 winnerCount = 0;

        // 找出继续的那个玩家
        address continuedPlayer = address(0);
        uint8 index = 0;
        for (uint i = 0; i < players.length; i++) {
            if (players[i].addr != address(0)) {
                // 找出继续的玩家
                if (players[i].state == PlayerState.FIRST_CONTINUED ||
                    players[i].state == PlayerState.SECOND_CONTINUED) {
                    continuedPlayer = players[i].addr;
                    winnerAddrs[winnerCount] = players[i].addr;
                    winnerCount++;
                }

                playerBets[index] = players[i].totalBet();
                playerCards[index] = players[i].cards;
                playerAddresses[index] = players[i].addr;

                index++;
            }
        }

        // 将剩余奖池给获胜者
        if (continuedPlayer != address(0)) {
            (bool success, ) = payable(continuedPlayer).call{value: remainingPrizePool}("");
            if (!success) revert TransferFailed();
        }

        emit CreateGameHistory(address(this), gameRound, gameStartTimestamp, gameEndTimestamp, playerAddresses, winnerAddrs, playerBets, playerCards);
    }

    /**
     * @dev 处理所有玩家都弃牌的情况
     */
    function _settleAllFolded() internal {
        // 创建临时数组来存储需要返还资金的玩家和金额
        address[] memory refundAddresses = new address[](playerCount);
        uint256[] memory refundAmounts = new uint256[](playerCount);
        uint256[] memory playerBets = new uint256[](playerCount);
        uint8[5][] memory playerCards = new uint8[5][](playerCount);
        address[] memory playerAddresses = new address[](playerCount);
        address[] memory winnerAddrs = new address[](0);
        uint256 refundCount = 0;

        // 收集所有玩家数据并计算需要返还的金额
        uint8 index = 0;
        for (uint i = 0; i < players.length; i++) {
            if (players[i].addr != address(0)) {
                BBPlayer storage player = players[i];

                // 计算需要返还的金额（玩家的所有押注）
                uint256 refundAmount = player.totalBet();
                if (refundAmount > 0) {
                    refundAddresses[refundCount] = player.addr;
                    refundAmounts[refundCount] = refundAmount;
                    refundCount++;
                }

                playerBets[index] = players[i].totalBet();
                playerCards[index] = players[i].cards;
                playerAddresses[index] = players[i].addr;
                index++;
            }        
        }

        // 返还每个玩家的押注
        for (uint i = 0; i < refundCount; i++) {
            (bool success, ) = payable(refundAddresses[i]).call{value: refundAmounts[i]}("");
            if (!success) revert TransferFailed();
        }

        emit CreateGameHistory(address(this), gameRound, gameStartTimestamp, gameEndTimestamp, playerAddresses, winnerAddrs, playerBets, playerCards);
    }


    /**
     * @dev 处理正常比牌的情况
     */
    function _settleNormalGame(uint256 remainingPrizePool) internal {
        CardType _maxCardType = CardType.NONE;

        // 准备游戏结果数据
        address[] memory winnerAddrs = new address[](playerCount);
        uint256[] memory playerBets = new uint256[](playerCount);
        uint8[5][] memory playerCards = new uint8[5][](playerCount);
        address[] memory playerAddresses = new address[](playerCount);
        uint256 winnerCount = 0;


        // 计算每个玩家的牌型
        uint8 index = 0;
        for (uint i = 0; i < players.length; i++) {
            BBPlayer storage player = players[i];
            if (player.isValid()) {
                player.cardType = BBCardUtils.calculateCardType(player.cards);
                // 更新最大牌型
                if (uint8(player.cardType) > uint8(_maxCardType)) {
                    _maxCardType = player.cardType;
                }

                playerBets[index] = player.totalBet();
                playerCards[index] = player.cards;
                playerAddresses[index] = player.addr;
                index++;
            }
        }

        // 如果所有玩家都没有牛牌型，则比较最大牌
        if (_maxCardType == CardType.NONE) {
            (winnerAddrs, winnerCount) = _settleNormalGameWithNoBull();
        } else {
            // 找出获胜者（有牛牌型的情况）
            for (uint i = 0; i < players.length; i++) {
                BBPlayer storage player = players[i];
                if (player.isValid()) {
                    // 如果是获胜者，添加到获胜者数组
                    if (player.cardType == _maxCardType) {
                        winnerAddrs[winnerCount] = player.addr;
                        winnerCount++;
                    }
                }
            }
        }

        // 调整获胜者数组大小
        assembly ("memory-safe")  {
            mstore(winnerAddrs, winnerCount)
        }


        // 分配奖金给获胜者
        if (winnerCount > 0) {
            // 每个获胜者应得的奖金
            uint256 prizePerWinner = remainingPrizePool / winnerCount;

            // 分配奖金给每个获胜者
            for (uint i = 0; i < winnerCount; i++) {
                address winnerAddr = winnerAddrs[i];
                (bool success, ) = payable(winnerAddr).call{value: prizePerWinner}("");
                if (!success) revert TransferFailed();
            }

            // 处理可能的舍入误差，将剩余的少量奖金给第一个获胜者
            uint256 remainingPrize = remainingPrizePool - (prizePerWinner * winnerCount);
            if (remainingPrize > 0) {
                (bool success, ) = payable(winnerAddrs[0]).call{value: remainingPrize}("");
                if (!success) revert TransferFailed();
            }
        }

        emit CreateGameHistory(address(this), gameRound, gameStartTimestamp, gameEndTimestamp, playerAddresses, winnerAddrs, playerBets, playerCards);
    }

    /**
     * @dev 处理没有牛牌型的情况
     */
    function _settleNormalGameWithNoBull() internal view returns (address[] memory, uint256){
        uint8 maxCard = 0;
        uint256 winnerCount = 0;
        address[] memory winnerAddrs = new address[](playerCount);

        // 先找出所有玩家中的最大牌
        for (uint i = 0; i < players.length; i++) {
            BBPlayer storage player = players[i];
            if(player.isValid()){
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
        }

        // 找出拥有最大牌的玩家
        for (uint i = 0; i < players.length; i++) {
            BBPlayer storage player = players[i];
            if(player.isValid()){
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
                    winnerAddrs[winnerCount] = player.addr;
                    winnerCount++;
                }
            }  
        }

        // 调整获胜者数组大小
        assembly ("memory-safe")  {
            mstore(winnerAddrs, winnerCount)
        }

        return (winnerAddrs, winnerCount);
    }

    /**
     * @dev 清算不活跃的游戏桌
     * 此函数来清算长时间不活跃的游戏桌
     * 庄家的押金将被分配给玩家和清算人
     */
    function liquidateInactiveTable() external onlyPlayers nonReentrant {
        // 检查游戏桌是否超时
        if (block.timestamp <= lastActivityTimestamp + tableInactiveTimeout) revert TableNotInactive();
        if (msg.sender == bankerAddr) revert BankerCannotLiquidate();
        if (state != GameState.COMMITTING || state != GameState.REVEALING || state != GameState.SECOND_BETTING || state != GameState.SECOND_BETTING) revert TableNotInBetting();

        // 计算庄家的押金，庄家每局不管玩不玩都需要押金
        uint256 bankerBet = betAmount;

        // 清算人的奖励 (从庄家押金中收取)
        uint256 liquidatorReward = bankerBet * liquidatorFeePercent / 100;

        // 剩余的庄家押金平均分配给所有玩家
        uint256 remainingBankerBet = bankerBet - liquidatorReward;
        uint256 playerRewardTotal = 0;

        // 计算有多少玩家可以分配奖励（不包括庄家）
        uint8 eligiblePlayerCount = 0;
        for(uint8 i = 0; i < players.length; i++){
            BBPlayer storage player = players[i];
            if(player.isValid() && player.addr != bankerAddr){
                eligiblePlayerCount++;
            }
        }

        // 创建临时数组存储需要支付的地址和金额
        address[] memory paymentAddresses = new address[](eligiblePlayerCount);
        uint256[] memory paymentAmounts = new uint256[](eligiblePlayerCount);
        uint256 paymentCount = 0;

        // 如果没有其他玩家，清算人获得全部奖励
        if (eligiblePlayerCount == 0) {
            liquidatorReward = bankerBet;
            remainingBankerBet = 0;
        } else {
            // 计算每个玩家的奖励
            uint256 rewardPerPlayer = remainingBankerBet / eligiblePlayerCount;

            // 计算每个玩家应得的金额
            for (uint i = 0; i < players.length; i++) {
                BBPlayer storage player = players[i];
                if(player.isValid() && player.addr != bankerAddr){
                    uint256 totalPayment = 0;

                    // 计算玩家应得的总金额（押金 + 奖励）
                    totalPayment += player.totalBet();

                    // 添加奖励金额
                    totalPayment += rewardPerPlayer;

                    // 记录需要支付的金额
                    if (totalPayment > 0) {
                        paymentAddresses[paymentCount] = player.addr;
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

        // 重置玩家状态
        for (uint i = 0; i < players.length; i++) {
            if(players[i].isValid()){
                players[i].playerReset();
            }
        }

        playerCount = 0;
        playerReadyCount = 0;
        playerContinuedCount = 0;
        playerFoldCount = 0;
        totalPrizePool = 0;
        gameLiquidatedCount++;

        setState(GameState.LIQUIDATED);

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
    }


    /**
     * @dev 设置游戏状态
     */
    function setState(GameState _state) internal {
        state = _state;

        // 如果进入下注阶段，为所有玩家设置操作截止时间
        if (_state == GameState.COMMITTING || _state == GameState.REVEALING || _state == GameState.FIRST_BETTING || _state == GameState.SECOND_BETTING) {
            currentRoundDeadline = block.timestamp + playerTimeout;
        }

        _updateLastActivity(); // 更新最后活动时间

        emit GameTableChanged(address(this));
    }

    // 获取所有玩家数据
    function getAllPlayerData() external view returns (BBPlayer[] memory) {
        BBPlayer[] memory playerData = new BBPlayer[](playerCount);
        uint8 index = 0;
        for (uint i = 0; i < players.length; i++) {
            if(players[i].isValid()){
                playerData[i] = players[i];
                playerData[i].cardType = BBCardUtils.calculateCardType(players[i].cards);
                index++;
            }
        }

        return playerData;
    }

    // 获取单个玩家数据
    function getPlayerData(address playerAddr) external view returns (BBPlayer memory) {
        (, BBPlayer storage player) = _getPlayer(playerAddr);
        BBPlayer memory playerData = player;
        playerData.cardType = BBCardUtils.calculateCardType(player.cards);
        return playerData;
    }


    // 修改 getTableInfo 函数
    function getTableInfo() external view returns (GameTableView memory) {
        IRewardPool rewardPool = IRewardPool(rewardPoolAddr);
        return GameTableView({
            // balance: address(this).balance / 1 ether,
            active: active,
            gameRound: gameRound,
            gameLiquidatedCount: gameLiquidatedCount,
            tableAddr: address(this),
            tableId: tableId,
            tableName: tableName,
            bankerAddr: bankerAddr,
            betAmount: betAmount,
            bankerFeePercent: bankerFeePercent,
            totalPrizePool: totalPrizePool,
            playerCount: playerCount,
            maxPlayers: maxPlayers,
            creationTimestamp: creationTimestamp,
            state: state,
            liquidatorFeePercent: liquidatorFeePercent,
            playerContinuedCount: playerContinuedCount,
            playerFoldCount: playerFoldCount,
            playerReadyCount: playerReadyCount,
            playerAddresses: getPlayerAddresses(),
            currentRoundDeadline: currentRoundDeadline,
            playerTimeout: playerTimeout,
            tableInactiveTimeout: tableInactiveTimeout,
            lastActivityTimestamp: lastActivityTimestamp,
            rewardPoolId: rewardPoolId,
            rewardPoolInfo: rewardPoolId != 0 ? rewardPool.getRewardPoolInfo(bankerAddr, rewardPoolId) : 
            RewardPoolInfo(0, "", address(0), 0, 0, 0, 0, [uint256(0), uint256(0), uint256(0), 
            uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)]), // 奖励池信息，如果没有奖励池，则返回空结构体
            implementationVersion: implementationVersion
        });
    }

    function isPlayer(address playerAddr) external view returns (bool) {
        _getPlayer(playerAddr);
        return true;
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
}
