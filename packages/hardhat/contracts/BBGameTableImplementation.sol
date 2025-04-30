// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBCardUtils.sol";
import "./BBPlayer.sol";
import "./BBTypes.sol";
import "./BBCardDealer.sol";
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
    uint256 public bankerStakeAmount;  //庄家的押金
    uint256 public totalIncome; // 总收入

    // 第一、二轮下注金额是第一轮的倍数，默认2
    uint8 public firstBetX;
    uint8 public secondBetX;

    uint256 public gameRound; //游戏场次
    uint256 public gameLiquidatedCount; //被清算的游戏场数

    uint256 public finalSeed; // 最后一次使用的种子

    uint256 public gameStartTimestamp;
    uint256 public gameEndTimestamp;
    uint8 public playerContinuedCount;
    uint8 public playerReadyCount;
    uint256 public totalPrizePool;  //奖池金额
    uint8 public bankerFeePercent; // 庄家费用百分比
    uint8 public liquidatorFeePercent; // 清算人费用百分比
    uint256 public implementationVersion; // 实现版本号

    // 玩家数据
    BBPlayer[] public players;

    // 发牌记录
    BBCardDealer.DealerState private dealerState;

    //主合约地址
    address public gameMainAddr;
    address public rewardPoolAddr; // 奖励池合约地址
    address public roomCardAddr; // 房间卡合约地址

    // 添加超时相关状态变量
    uint256 public playerTimeout; // 玩家操作超时时间，单位为秒
    uint256 public currentRoundDeadline; // 当前回合的截止时间

    uint256 public tableInactiveTimeout; // 游戏桌不活跃超时时间，单位为秒
    uint256 public lastActivityTimestamp; // 最后活动时间戳

    //庄家奖励
    address public rewardAddr; // 奖励地址
    uint256 public rewardAmount; // 奖励金额

    string public chatGroupId; // 聊天组ID

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
        uint8 _firstRaise,
        uint8 _secondRaise,
        uint256 _implementationVersion
    ) external {
        // 确保只初始化一次的检查
        require(creationTimestamp == 0, "Already initialized");
        
        _transferOwnership(_gameMainAddr);

        // 参数验证
        require(_maxPlayers >= 2, "Invalid max players");

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

        firstBetX = _firstRaise;
        secondBetX = _secondRaise;


        refreshConfig();

        emit GameTableInitialized(address(this), _bankerAddr, _implementationVersion);
    }

    //刷新游戏配置
    function refreshConfig() internal {
        IGameMain gameMain = IGameMain(gameMainAddr);
        GameConfig memory config = gameMain.getGameConfig();
        playerTimeout = config.playerTimeout * playerCount;
        liquidatorFeePercent = config.liquidatorFeePercent;
        tableInactiveTimeout = config.tableInactiveTimeout;
        roomCardAddr = config.roomCardAddress;
        rewardPoolAddr = config.rewardPoolAddress;
    }

    // 添加一个公共函数来获取玩家地址列表，数组需要显示定义get函数，int、string等不需要
    function getPlayerAddresses() public view returns (address[] memory) {
        // 如果没有玩家，直接返回空数组
        if (playerCount == 0) {
            return new address[](0);
        }

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

    // 添加编辑table的函数
    function editGameTable(
        string memory _tableName,
        uint256 _betAmount,
        uint8 _maxPlayers,
        uint8 _bankerFeePercent,
        uint8 _firstRaise,
        uint8 _secondRaise
    ) external onlyBanker nonReentrant {
        IGameMain gameMain = IGameMain(gameMainAddr);
        GameConfig memory config = gameMain.getGameConfig();
        
        require(_betAmount != 0, "Bet amount too small");
        require(_maxPlayers > 0 && _maxPlayers <= config.maxPlayers, "Invalid max players");
        require(_bankerFeePercent <= config.maxBankerFeePercent, "Invalid banker fee percent");
        require(bytes(_tableName).length > 0 && bytes(_tableName).length <= 20, "Invalid table name");
        require(_firstRaise >= 1 && _firstRaise <= 4, "Invalid first raise");
        require(_secondRaise >= 1 && _secondRaise <= 4, "Invalid second raise");
        
        tableName = _tableName;
        betAmount = _betAmount;
        maxPlayers = _maxPlayers;
        bankerFeePercent = _bankerFeePercent;
        firstBetX = _firstRaise;
        secondBetX = _secondRaise;
        
        emit GameTableChanged(address(this));
    }

    /**
     * @dev 更新最后活动时间
     */
    function _updateLastActivity() internal {
        lastActivityTimestamp = block.timestamp;
    }

    modifier onlyParticipant() {
        if(msg.sender != bankerAddr) {
            _getPlayer(msg.sender);
        }
        _;
    }

    /**
     * @dev 修饰器：适用于庄家
     */
    modifier onlyBanker() {
        require(msg.sender == bankerAddr, "not banker");
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
     * @dev 修饰器：只允许游戏主合约调用
     */
    modifier onlyGameMain() {
        require(msg.sender == gameMainAddr, "only main contract can call");
        _;
    }


    /**
     * @dev 庄家为游戏桌设置奖励池
     * @param poolId 奖励池ID
     */
    function setTableRewardPool(uint256 poolId) external onlyBanker nonReentrant {
        require(rewardPoolAddr != address(0), "Invalid reward pool address");
        bool isBankerPool = IRewardPool(rewardPoolAddr).isBankerPool(bankerAddr, poolId);
        require(isBankerPool, "poolId is not your pool");

        rewardPoolId = poolId;
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
                players[i].totalBet = 0;
                players[i].hasActedThisRound = false;
                players[i].cards = [0, 0, 0, 0, 0];
                players[i].cardType = CardType.NONE;
                playerCount++;
                return i;
            }
        }

        players.push(BBPlayer({
            addr: playerAddr,
            state: PlayerState.JOINED,
            totalBet: 0,
            hasActedThisRound: false,
            isWinner: false,
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
        require(false, "Player not found");
        return 0;
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
        players[index].totalBet = 0;
        players[index].hasActedThisRound = false;
        players[index].isWinner = false;
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

    // 更新聊天群组ID
    function updateChatGroupId(string memory _chatGroupId) external onlyBanker {
        chatGroupId = _chatGroupId;
    }


    /**
     * @dev 玩家加入游戏
     */
    function playerJoin() external nonReentrant {
        address playerAddr = msg.sender;
        require(!_isPlayerExists(playerAddr), "Player already joined");
        require(state == GameState.WAITING, "Game not in waiting state");
        require(playerCount < maxPlayers, "Max players reached");

        _addPlayer(playerAddr);

        _updateLastActivity();

        IGameMain(gameMainAddr).userJoinTable(playerAddr);

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家准备
     */
    function playerReady(bytes32 randomValue) external payable onlyPlayers nonReentrant {
        require(randomValue != bytes32(0), "Invalid random value");
        require(state == GameState.WAITING, "Game not in waiting state");
        address playerAddr = msg.sender;
        (, BBPlayer storage player) = _getPlayer(playerAddr);
        require(player.state == PlayerState.JOINED, "Player not in joined state");
        require(msg.value == betAmount, "Insufficient funds");

        player.totalBet = betAmount;
        totalPrizePool += betAmount;
        playerReadyCount++;

        player.playerReady();

        _updateLastActivity();

        _updateFinalSeed(randomValue);

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家取消准备
     */
    function playerUnready() external payable onlyPlayers nonReentrant {
        require(state == GameState.WAITING, "Game not in waiting state");
        address playerAddr = msg.sender;
        (, BBPlayer storage player) = _getPlayer(playerAddr);
        require(player.state == PlayerState.READY, "Player not in ready state");

        totalPrizePool -= betAmount;
        playerReadyCount--;
        player.totalBet = 0;

        player.playerUnready();

        _updateLastActivity();

        // 返还押金给玩家 - 使用更安全的 call 方法而不是 transfer
        (bool success, ) = payable(playerAddr).call{value: betAmount}("");
        require(success, "transfer failed");

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家退出游戏
     */
    function playerQuit() external payable onlyPlayers nonReentrant {
        require(state == GameState.WAITING || state == GameState.SETTLED, "Game not in waiting or settled state");
        address playerAddr = msg.sender;
        (uint8 playerIndex, BBPlayer storage player) = _getPlayer(playerAddr);
        if(state == GameState.WAITING){
            require(player.state == PlayerState.JOINED || player.state == PlayerState.READY, "Player not in JOINED or READY state");

            // 先保存需要返还的金额
            uint256 amountToReturn = player.totalBet;

            if(player.state == PlayerState.READY){
                playerReadyCount--;
                totalPrizePool -= amountToReturn;
            }

            // 移除玩家
            _removePlayerByIndex(playerIndex);

            if(amountToReturn > 0){
                //返还押金
                (bool success, ) = payable(playerAddr).call{value: amountToReturn}("");
                require(success, "transfer failed");
            }
        }else{
            // 移除玩家
            _removePlayerByIndex(playerIndex);
        }  
        
        IGameMain(gameMainAddr).userLeaveTable(playerAddr);

        _updateLastActivity();

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 庄家移除玩家
     */
    function bankerRemovePlayer(address playerAddr) external onlyBanker nonReentrant {
        require(state == GameState.WAITING, "Game not in waiting state");
        require(playerAddr != bankerAddr, "Can not remove banker");
        (uint8 playerIndex, BBPlayer storage player) = _getPlayer(playerAddr);


        uint256 amountToReturn = 0;
        if(player.totalBet > 0){
            amountToReturn = player.totalBet;
        }
        if(player.state == PlayerState.READY){
            playerReadyCount--;
            totalPrizePool -= amountToReturn;
        }
        _removePlayerByIndex(playerIndex);
        _updateLastActivity();

        IGameMain(gameMainAddr).userLeaveTable(playerAddr);

        // 最后进行转账
        if(amountToReturn > 0){
            (bool success, ) = payable(playerAddr).call{value: amountToReturn}("");
            require(success, "transfer failed");
        }

        emit GameTableChanged(address(this));
    }

    function _updateFinalSeed(bytes32 randomValue) internal {
        finalSeed = uint256(keccak256(abi.encodePacked(
            finalSeed,
            block.prevrandao,
            block.timestamp,
            msg.sender,
            randomValue
        )));
    }

    function startGame(uint256 roomCardId, bytes32 randomValue) external payable onlyBanker nonReentrant {
        require(randomValue!= bytes32(0), "Invalid random value");
        // 刷新游戏数据
        refreshConfig();

        require(roomCardId != 0, "Invalid room card params");
        require(roomCardAddr != address(0), "Invalid room card contract");
        require(playerReadyCount == playerCount, "Not all players ready");
        require(state == GameState.WAITING, "Game not in waiting state");
        require(playerCount >= 2, "Not enough players");

        // 庄家需要押金
        require(msg.value == betAmount, "Insufficient funds");
        bankerStakeAmount = betAmount;

        //验证房卡
        IRoomCardNFT roomCard = IRoomCardNFT(roomCardAddr);
        require(roomCard.validateParams(roomCardId, playerCount), "Invalid room card params");
 
        // 消耗房卡
        roomCard.consume(msg.sender, roomCardId);
        
        gameRound++;

        _updateFinalSeed(randomValue);

        _startFirstBetting();
    }

    function _resetGame() internal {
        playerContinuedCount = 0;
        gameStartTimestamp = 0;
        gameEndTimestamp = 0;
        currentRoundDeadline = 0;
        playerReadyCount = 0;
        totalPrizePool = 0;
        rewardAddr = address(0);
        rewardAmount = 0;
        dealerState.reset();
        for(uint i = 0; i < players.length; i++){
            if(players[i].isValid()){
                players[i].playerReset();
            }  
        }
        setState(GameState.WAITING);
    }

    function _canSettleGame() internal view returns (bool) {
        if(state == GameState.WAITING || state == GameState.SETTLED || state == GameState.LIQUIDATED){
            return false;
        }
        if(state == GameState.ENDED){
            return true;
        }


        if(state == GameState.FIRST_BETTING || state == GameState.SECOND_BETTING){
            (uint8 foldedCount, uint8 totalActed) = _getPlayerActionCounts();

            bool onlyOneLeft = playerContinuedCount == 1 && foldedCount == playerCount - 1;
            bool noOneLeft = foldedCount == playerCount;
            bool isDeadlinePassed = _isTimeOut();
            bool noOneActed = totalActed == 0;
            bool lessOneContinued = playerContinuedCount <= 1;  //小于等于一个人继续

            if (onlyOneLeft || noOneLeft || (isDeadlinePassed && lessOneContinued) || (isDeadlinePassed && noOneActed)) {
                // 可以结算
                return true;
            } else {
                return false;
            }
        }

        return false;
    }

    /**
     * @dev 下一步
     */
    function nextStep(bytes32 randomValue) external onlyBanker nonReentrant {
        require(randomValue != bytes32(0), "Invalid random value");
        if(_canSettleGame()){
            _settleGame();

            _updateFinalSeed(randomValue);
            _updateLastActivity();
            emit GameTableChanged(address(this));
            return;
        }
        
        (bool canMove, , string memory reason) = canMoveToNextStep();
        require(canMove, reason);
        if(state == GameState.FIRST_BETTING) {
            _startSecondBetting();
        }
        else if(state == GameState.SECOND_BETTING) {
            _endGame();
        }
        else if(state == GameState.SETTLED) {
            _resetGame();
        }

        // 将所有人设置为未操作状态
        for(uint i = 0; i < players.length; i++){
            if(players[i].isValid()){
                players[i].hasActedThisRound = false;
            }
        }
        
        _updateFinalSeed(randomValue);
        _updateLastActivity();
        emit GameTableChanged(address(this));
    }

    function _dealCardsByRound(uint8 round) internal {
        dealerState.initialize(finalSeed);
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
                if(players[i].isValid() && players[i].state == PlayerState.ACTIVE){
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
        // 将所有玩家设置成active状态
        for (uint256 i = 0; i < players.length; i++) {
            BBPlayer storage player = players[i];
            if(player.isValid()){
                player.state = PlayerState.ACTIVE;
            }
        }

        // 初始化发牌状态
        dealerState.reset();

        // 第一轮发牌
        _dealCardsByRound(1);

        // 进入第一轮下注
        setState(GameState.FIRST_BETTING);
    }

    function _getPlayerActionCounts() internal view returns (uint8, uint8){
        uint8 foldedCount = 0;
        uint8 actedCount = 0;
        for(uint i = 0; i < players.length; i++){
            BBPlayer storage player = players[i];
            if(player.isValid()){
                if(player.state == PlayerState.FOLDED){
                    foldedCount++;
                }
                if(player.hasActedThisRound){
                    actedCount++;
                }
            }
        }

        return (foldedCount, actedCount);
    }

    

    function _startSecondBetting() internal {
        for(uint i = 0; i < players.length; i++){
            BBPlayer storage player = players[i];
            if(player.isValid() && !player.hasActedThisRound){
                player.playerFold();
            }
        }

        _dealCardsByRound(2);
        setState(GameState.SECOND_BETTING);
        playerContinuedCount = 0;
    }

    function _endGame() internal {
        for(uint i = 0; i < players.length; i++){
            BBPlayer storage player = players[i];
            if(player.isValid() && !player.hasActedThisRound){
                player.playerFold();
            }
        }

        _dealCardsByRound(3);
        setState(GameState.ENDED);
        _settleGame();
    }

    function _allPlayersActed() public view returns (bool){
        for(uint i = 0; i < players.length; i++){
            BBPlayer storage player = players[i];
            if(player.isValid()){
                if(player.state != PlayerState.FOLDED && !player.hasActedThisRound){
                    return false;
                }
            }
        }
        return true;
    }

    function canMoveToNextStep() public view returns (bool canMove, string memory title, string memory reason) {
        if (state == GameState.LIQUIDATED) {
            return (false, "", "Game has been liquidated");
        }else if(state == GameState.SETTLED){
            return (true, "Play Again", "");
        }else if (state == GameState.ENDED) {
            return (true, "Settle Game", "");
        }else if(state == GameState.SETTLED){
            return (true, "Play Again", "");
        }else if (state == GameState.FIRST_BETTING || state == GameState.SECOND_BETTING) {

            if (playerCount == 0) {
                // 如果没有玩家，直接返回
                return (false, "", "No players in game");
            }

            bool isDeadlinePassed = _isTimeOut();
            bool allPlayersActed = _allPlayersActed();

            if (_canSettleGame()) {
                return (true, "Settle Game", "");
            } else if (allPlayersActed || isDeadlinePassed) {
                return (true, "Next Round", "");
            } else {
                return (false, "Next Round", "Waiting for players to act");
            }
        }

        return (false, "", "Unknown state");
    }


    function _isTimeOut() internal view returns (bool) {
        return currentRoundDeadline > 0 && block.timestamp > currentRoundDeadline;
    }

    /**
     * @dev 玩家弃牌
     */
    function playerFold(bytes32 randomValue) external onlyPlayers nonReentrant{
        require(randomValue!= bytes32(0), "Invalid random value");
        require(state == GameState.FIRST_BETTING || state == GameState.SECOND_BETTING, "Game not in playing state");
        address playerAddr = msg.sender;

        // 检查是否超时
        require(!_isTimeOut(), "action timeout");

        (, BBPlayer storage player) = _getPlayer(playerAddr);
        require(player.state == PlayerState.ACTIVE && player.hasActedThisRound == false, "Player not in active state or has acted");

        _updateLastActivity();
        player.playerFold();

        _updateFinalSeed(randomValue);

        emit GameTableChanged(address(this));
    }

    /**
     * @dev 玩家继续游戏
     */
    function playerContinue(bytes32 randomValue) external payable onlyPlayers nonReentrant{
        require(randomValue!= bytes32(0), "Invalid random value");
        require(state == GameState.FIRST_BETTING || state == GameState.SECOND_BETTING, "Game not in playing state");
        address playerAddr = msg.sender;

        uint256 needBetAmount = 0;

        if(state == GameState.FIRST_BETTING){
            needBetAmount = betAmount * firstBetX;
        }else{
            needBetAmount = betAmount * secondBetX;
        }

        require(msg.value == needBetAmount, "Insufficient funds");

        // 检查是否超时
        require(!_isTimeOut(), "action timeout");

        (, BBPlayer storage player) = _getPlayer(playerAddr);
        require(player.state == PlayerState.ACTIVE && player.hasActedThisRound == false, "Player not in active state or has acted");

        player.playerContinue(needBetAmount);
        playerContinuedCount++;
        totalPrizePool += needBetAmount;

        _updateLastActivity();

        _updateFinalSeed(randomValue);

        emit GameTableChanged(address(this));
    }

    function _gameTimeout() internal view returns (bool)  {
        require(state == GameState.FIRST_BETTING || state == GameState.SECOND_BETTING, "Game not in playing state"); 

        // 检查是否超时
        return block.timestamp > lastActivityTimestamp + tableInactiveTimeout;
    }

    /**
     * @dev 玩家结算游戏，如果庄家没结算的话
     */
    function playerSettle() external payable onlyPlayers nonReentrant{
        require(_gameTimeout(), "Game not timeout");

        _settleGame();
    }

    function _settleGame() internal {
        setState(GameState.SETTLED);

        gameEndTimestamp = block.timestamp;


        bool noOneContinued = playerContinuedCount == 0;

        // 计算费用
        uint256 bankerFee = (totalPrizePool * bankerFeePercent) / 100;
        if(noOneContinued){
            // 如果没有人继续，庄家不收取费用
            bankerFee = 0;
        }
        uint256 remainingPrizePool = totalPrizePool - bankerFee;

        uint256 bankerTotal = bankerFee + bankerStakeAmount;
        bankerStakeAmount = 0;

        // 如果只有一个玩家继续，则该玩家获胜
        if (playerContinuedCount == 1) {
            _settleOneContinuedPlayer(remainingPrizePool);
        }
        // 如果没有人继续，则每个人拿回自己的钱
        else if (noOneContinued) {
            _settleAllFolded();
        }
        // 正常比牌
        else {
            _settleNormalGame(remainingPrizePool);
        }

        // 统一处理庄家费用转账，庄家抽成+庄家押金
        if (bankerTotal > 0) {
            totalIncome += bankerFee;
            (bool success, ) = payable(bankerAddr).call{value: bankerTotal}("");
            require(success, "transfer to banker failed");
        }

        // 如果设置了奖励池，尝试分配奖励
        if (rewardPoolAddr != address(0) && rewardPoolId != 0) {
            address[] memory playerAddresses = getPlayerAddresses();
            IRewardPool rewardPool = IRewardPool(rewardPoolAddr);
            try rewardPool.tryDistributeReward(rewardPoolId, playerAddresses, finalSeed) returns (address winAddr, uint256 winAmount){
                if(winAddr != address(0)){
                    // 有人获奖，设置获奖的人信息
                    rewardAddr = winAddr;
                    rewardAmount = winAmount;
                }
            } catch {
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
            BBPlayer storage player = players[i];
            if (player.isValid()) {
                // 找出继续的玩家
                if (player.state == PlayerState.ACTIVE &&
                    player.hasActedThisRound) {
                    continuedPlayer = player.addr;
                    winnerAddrs[winnerCount] = player.addr;
                    player.isWinner = true;
                    winnerCount++;
                }

                playerBets[index] = player.totalBet;
                playerCards[index] = player.cards;
                playerAddresses[index] = player.addr;

                index++;
            }
        }

        // 将剩余奖池给获胜者
        if (continuedPlayer != address(0)) {
            (bool success, ) = payable(continuedPlayer).call{value: remainingPrizePool}("");
            require(success, "transfer to winners failed");
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
            if (players[i].isValid()) {
                BBPlayer storage player = players[i];

                // 计算需要返还的金额（玩家的所有押注）
                uint256 refundAmount = player.totalBet;
                if (refundAmount > 0) {
                    refundAddresses[refundCount] = player.addr;
                    refundAmounts[refundCount] = refundAmount;
                    refundCount++;
                }

                playerBets[index] = players[i].totalBet;
                playerCards[index] = players[i].cards;
                playerAddresses[index] = players[i].addr;
                index++;
            }        
        }

        // 返还每个玩家的押注
        for (uint i = 0; i < refundCount; i++) {
            (bool success, ) = payable(refundAddresses[i]).call{value: refundAmounts[i]}("");
            require(success, "refund failed");
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

                playerBets[index] = player.totalBet;
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
                        player.isWinner = true;
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
                require(success, "transfer to winners failed");
            }

            // 处理可能的舍入误差，将剩余的少量奖金给第一个获胜者
            uint256 remainingPrize = remainingPrizePool - (prizePerWinner * winnerCount);
            if (remainingPrize > 0) {
                (bool success, ) = payable(winnerAddrs[0]).call{value: remainingPrize}("");
                require(success, "transfer to winners failed");
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
        require(block.timestamp > lastActivityTimestamp + tableInactiveTimeout, "Table not inactive");
        require(msg.sender != bankerAddr, "Banker cannot liquidate");
        require(state == GameState.FIRST_BETTING || state == GameState.SECOND_BETTING, "Table not in gaming");

        // 清算人的奖励 (从庄家押金中收取)
        uint256 liquidatorReward = bankerStakeAmount * liquidatorFeePercent / 100;

        // 剩余的庄家押金平均分配给所有玩家
        uint256 remainingBankerBet = bankerStakeAmount - liquidatorReward;
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
            liquidatorReward = bankerStakeAmount;
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
                    totalPayment += player.totalBet;

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
        if (actualDistributed < bankerStakeAmount) {
            liquidatorReward += (bankerStakeAmount - actualDistributed);
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
        totalPrizePool = 0;
        gameLiquidatedCount++;

        setState(GameState.LIQUIDATED);

        // 所有状态更新完成后，进行转账操作
        // 然后进行其他转账
        for (uint i = 0; i < paymentCount; i++) {
            (bool otherSuccess, ) = payable(paymentAddresses[i]).call{value: paymentAmounts[i]}("");
            require(otherSuccess, "transfer to players failed");
        }

        // 支付清算人奖励
        (bool liquidatorSuccess, ) = payable(msg.sender).call{value: liquidatorReward}("");
        require(liquidatorSuccess, "transfer to liquidator failed");

        emit GameTableChanged(address(this));
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
        BBPlayer[] memory playerData = new BBPlayer[](playerCount);
        uint8 index = 0;
        for (uint i = 0; i < players.length; i++) {
            if(players[i].isValid()){
                playerData[index] = players[i];
                playerData[index].cardType = BBCardUtils.calculateCardType(players[i].cards);
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


    function getTableInfo() external view returns (GameTableView memory) {
        IRewardPool rewardPool = IRewardPool(rewardPoolAddr);
        (bool canNext, string memory nextTitle, string memory nextReason) = canMoveToNextStep();
        // 创建一个空的 RewardPoolInfo 结构体
        RewardPoolInfo memory emptyRewardPoolInfo;
        if (rewardPoolId != 0) {
            emptyRewardPoolInfo = rewardPool.getRewardPoolInfo(bankerAddr, rewardPoolId);
        }

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
            playerReadyCount: playerReadyCount,
            playerAddresses: getPlayerAddresses(),
            currentRoundDeadline: currentRoundDeadline,
            playerTimeout: playerTimeout,
            tableInactiveTimeout: tableInactiveTimeout,
            lastActivityTimestamp: lastActivityTimestamp,
            rewardPoolId: rewardPoolId,
            rewardPoolInfo: emptyRewardPoolInfo, // 奖励池信息，如果没有奖励池，则返回空结构体
            implementationVersion: implementationVersion,
            firstBetX: firstBetX,
            secondBetX: secondBetX,
            bankerStakeAmount: bankerStakeAmount,
            canNext: canNext,
            nextTitle: nextTitle,
            nextReason: nextReason,
            rewardAddr: rewardAddr,
            rewardAmount: rewardAmount,
            chatGroupId: chatGroupId
        });
    }

    function getTableInfoShort() external view returns (GameTableInfoShort memory) {
        IRewardPool rewardPool = IRewardPool(rewardPoolAddr);

        // 创建一个空的 RewardPoolInfo 结构体
        RewardPoolInfo memory emptyRewardPoolInfo;
        if (rewardPoolId != 0) {
            emptyRewardPoolInfo = rewardPool.getRewardPoolInfo(bankerAddr, rewardPoolId);
        }

        return GameTableInfoShort({
            active: active,
            gameRound: gameRound,
            gameLiquidatedCount: gameLiquidatedCount,
            tableAddr: address(this),
            tableId: tableId,
            tableName: tableName,
            bankerAddr: bankerAddr,
            betAmount: betAmount,
            bankerFeePercent: bankerFeePercent,
            playerCount: playerCount,
            maxPlayers: maxPlayers,
            state: state,
            lastActivityTimestamp: lastActivityTimestamp,
            rewardPoolId: rewardPoolId,
            rewardPoolInfo: emptyRewardPoolInfo // 奖励池信息，如果没有奖励池，则返回空结构体
        });
    }

    function isPlayer(address playerAddr) external view returns (bool) {
        _getPlayer(playerAddr);
        return true;
    }

    receive() external payable {}
}
