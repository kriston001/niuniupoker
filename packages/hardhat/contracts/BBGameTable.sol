// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBErrors.sol";
import "./BBTypes.sol";
import "./BBCardUtils.sol";
import "./BBPlayer.sol";
import "./BBCardDealer.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IBBGameHistory {
    function recordGame(
        uint256 startTime,
        uint256 endTime,
        uint256 totalPrizePool,
        address[] memory playerAddrs,
        address[] memory winnerAddrs,
        BBPlayerEntry[] memory playerEntries,
        BBTypes.CardType maxCardType
    ) external;
}

//用于把playerData数据转换成结构体用以在函数参数中传递
struct BBPlayerEntry {
    address playerAddr;
    BBPlayer playerData;
}

// 添加一个新的结构体用于返回游戏桌信息
struct GameTableView {
    // uint256 balance;
    address tableAddr; // 游戏桌合约地址
    string tableName;
    address bankerAddr;
    uint256 betAmount;
    uint256 totalPrizePool;
    uint8 playerCount;
    uint8 maxPlayers;
    uint256 creationTimestamp;
    BBTypes.GameState state;
    uint8 playerContinuedCount;
    uint8 playerFoldCount;
    uint8 playerReadyCount;
    address[] playerAddresses;
    uint256 currentRoundDeadline;
    uint256 playerTimeout;
    uint256 tableInactiveTimeout;
    uint256 lastActivityTimestamp;
}

/**
 * @title BBGameTable
 * @dev 牛牛游戏桌合约，管理单个游戏桌的逻辑
 */
contract BBGameTable is ReentrancyGuard {
    using BBPlayerLib for BBPlayer;
    using BBTypes for BBTypes.GameState;
    using BBTypes for BBTypes.PlayerState;
    using BBTypes for BBTypes.CardType;
    using BBCardUtils for uint8[5];
    using BBCardDealer for BBCardDealer.DealerState;

    // 游戏桌数据
    string public tableName;
    address public bankerAddr;
    uint256 public betAmount;  // 固定押注金额
    uint8 public playerCount;
    uint8 public maxPlayers;
    uint256 public creationTimestamp;
    BBTypes.GameState public state;
    uint256 public randomRequestId;

    uint256 gameStartTimestamp;
    uint256 gameEndTimestamp;
    uint8 public playerContinuedCount;
    uint8 public playerFoldCount;
    uint8 public playerReadyCount;
    uint256 public totalPrizePool;  //奖池金额
    uint256 public platformFeePercent; // 平台费用百分比

    // 玩家数据
    address[] public playerAddresses;
    mapping(address => BBPlayer) public players;
    BBPlayer public banker;

    // 发牌记录
    BBCardDealer.DealerState private dealerState;

    //主合约地址
    address public gameMainAddr;

    // 添加超时相关状态变量
    uint256 public playerTimeout; // 玩家操作超时时间，单位为秒
    uint256 public currentRoundDeadline; // 当前回合的截止时间

    uint256 public tableInactiveTimeout; // 游戏桌不活跃超时时间，单位为秒
    uint256 public lastActivityTimestamp; // 最后活动时间戳

    address public gameHistoryAddr;

    // 事件
    event GameChanged(address indexed tableAddr);

    /**
     * @dev 构造函数
     */
    constructor(
        string memory _tableName,
        address _bankerAddr,
        uint256 _betAmount,
        uint8 _maxPlayers,
        address _gameMainAddr,
        uint256 _playerTimeout,
        uint256 _tableInactiveTimeout,
        address _gameHistoryAddr,
        uint256 _platformFeePercent
    ) {
        // 参数验证
        if (_maxPlayers < 2 || _maxPlayers > 10) revert InvalidMaxPlayers();
        if (_playerTimeout < 60) revert InvalidPlayerTimeout(); // 最小超时时间为60秒
        if (_tableInactiveTimeout < 3600) revert InvalidTableInactiveTimeout(); // 最小不活跃超时时间为1小时

        tableName = _tableName;
        bankerAddr = _bankerAddr;
        betAmount = _betAmount;
        maxPlayers = _maxPlayers;
        state = BBTypes.GameState.WAITING;
        gameMainAddr = _gameMainAddr;
        playerTimeout = _playerTimeout;
        tableInactiveTimeout = _tableInactiveTimeout;
        creationTimestamp = block.timestamp;
        lastActivityTimestamp = block.timestamp; // 初始化最后活动时间
        gameHistoryAddr = _gameHistoryAddr;
        platformFeePercent = _platformFeePercent;


        // 创建庄家对象
        BBPlayer memory _banker = BBPlayer({
            playerAddr: _bankerAddr,
            isBanker: true,
            state: BBTypes.PlayerState.READY,
            initialBet: betAmount,
            additionalBet1: 0,
            additionalBet2: 0,
            cards: [0, 0, 0, 0, 0],
            cardType: BBTypes.CardType.NONE
        });
        banker = _banker;
        players[_bankerAddr] = banker;
        playerAddresses.push(bankerAddr);
        playerReadyCount = 1;
        playerCount = 1;
        totalPrizePool += betAmount;

        // 初始化发牌状态 - 暂时使用临时种子，后续会通过VRF更新
        uint256 tempSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
        dealerState.initialize(tempSeed);
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
     * @dev 修饰器：适用于普通玩家
     */
    modifier onlyPlayers() {
        if (players[msg.sender].playerAddr == address(0) || msg.sender == bankerAddr) revert PlayerNotFound();
        _;
    }

    /**
     * @dev 修饰器：适用于普通玩家和庄家
     */
    modifier onlyParticipants() {
        if (players[msg.sender].playerAddr == address(0)) revert PlayerNotFound();
        _;
    }


    /**
     * @dev 玩家加入游戏
     */
    function playerJoin() external nonReentrant {
        address playerAddr = msg.sender;
        if (state != BBTypes.GameState.WAITING) revert GameNotInWaitingState();
        if (playerCount >= maxPlayers) revert MaxPlayersReached();


        // 创建玩家对象
        BBPlayer memory player = BBPlayer({
            playerAddr: playerAddr,
            isBanker: false,
            state: BBTypes.PlayerState.JOINED,
            initialBet: betAmount,
            additionalBet1: 0,
            additionalBet2: 0,
            cards: [0, 0, 0, 0, 0],
            cardType: BBTypes.CardType.NONE
        });
        players[playerAddr] = player;
        players[playerAddr].playerJoin();


        // 添加玩家
        playerAddresses.push(playerAddr);
        playerCount++;

        _updateLastActivity();
    }

    /**
     * @dev 玩家准备
     */
    function playerReady() external payable onlyParticipants nonReentrant {
        if (state != BBTypes.GameState.WAITING) revert GameNotInWaitingState();
        address playerAddr = msg.sender;
        BBPlayer storage player = players[playerAddr];
        if (player.state != BBTypes.PlayerState.JOINED) revert InvalidPlayerState();
        if (msg.value != betAmount) revert InsufficientFunds();

        player.initialBet = betAmount;
        totalPrizePool += betAmount;
        playerReadyCount++;

        _updateLastActivity();
        player.playerReady();
    }

    /**
     * @dev 玩家取消准备
     */
    function playerUnready() external payable onlyParticipants nonReentrant {
        if (state != BBTypes.GameState.WAITING) revert GameNotInWaitingState();
        address playerAddr = msg.sender;
        BBPlayer storage player = players[playerAddr];
        if (player.state != BBTypes.PlayerState.READY) revert PlayerNotInReadyState();

        totalPrizePool -= betAmount;
        playerReadyCount--;
        player.initialBet = 0;

        _updateLastActivity();
        player.playerUnready();

        // 返还押金给玩家
        payable(playerAddr).transfer(betAmount);
    }

    /**
     * @dev 玩家退出游戏
     */
    function playerQuit() external payable onlyPlayers nonReentrant {
        if (state != BBTypes.GameState.WAITING) revert GameNotInWaitingState();
        address playerAddr = msg.sender;
        BBPlayer storage player = players[playerAddr];
        if (player.state != BBTypes.PlayerState.JOINED) revert InvalidPlayerState();


        // 移除玩家
        if(_removePlayer(playerAddr)){
            playerCount--;
        }

        _updateLastActivity();

        if(player.initialBet > 0){
            //返还押金
            payable(playerAddr).transfer(player.initialBet);
        }
    }

    /**
     * @dev 庄家解散游戏桌
     */
    function bankerDisband() external onlyBanker nonReentrant {
        if (state != BBTypes.GameState.WAITING) revert GameNotInWaitingState();

        // 创建一个临时数组来存储需要返还资金的玩家和金额
        address[] memory refundAddresses = new address[](playerAddresses.length);
        uint256[] memory refundAmounts = new uint256[](playerAddresses.length);
        uint256 refundCount = 0;

        // 先收集所有需要返还的金额
        for (uint i = 0; i < playerAddresses.length; i++) {
            address playerAddr = playerAddresses[i];
            BBPlayer storage player = players[playerAddr];
            if(player.initialBet > 0){
                refundAddresses[refundCount] = playerAddr;
                refundAmounts[refundCount] = player.initialBet;
                refundCount++;
            }
            delete players[playerAddr];
        }

        // 更新所有状态
        playerAddresses = new address[](0);
        playerCount = 0;
        playerReadyCount = 0;
        totalPrizePool = 0;
        setState(BBTypes.GameState.NONE);

        // 最后进行所有转账
        for (uint i = 0; i < refundCount; i++) {
            payable(refundAddresses[i]).transfer(refundAmounts[i]);
        }
    }

    /**
     * @dev 庄家移除玩家
     */
    function bankerRemovePlayer(address playerAddr) external onlyBanker nonReentrant {
        if (state != BBTypes.GameState.WAITING) revert GameNotInWaitingState();
        if (playerAddr == bankerAddr) revert NotBanker();
        if (players[playerAddr].playerAddr == address(0)) revert PlayerNotFound();

        _updateLastActivity();

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
                if(player.state == BBTypes.PlayerState.READY){
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

        // 最后进行转账
        if(playerFound && amountToReturn > 0){
            payable(playerAddr).transfer(amountToReturn);
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
        if (state != BBTypes.GameState.WAITING) revert GameNotInWaitingState();
        if (playerCount < 2) revert NotEnoughPlayers();

        // 第一轮发牌
        dealerState.dealCardsByRoundForPlayers(playerAddresses, 1);

        gameStartTimestamp = block.timestamp;

        setState(BBTypes.GameState.FIRST_BETTING);
    }

    /**
     * @dev 下一步
     */
    function nextStep() external onlyBanker nonReentrant {
        if (!_checkCanNext()) revert GameNotInWaitingState();

        if(state == BBTypes.GameState.WAITING){
            _startGame();
        }else if (state == BBTypes.GameState.FIRST_BETTING || state == BBTypes.GameState.SECOND_BETTING) {
            if(playerContinuedCount > 1){
                if(state == BBTypes.GameState.FIRST_BETTING){
                    // 第二轮发牌
                    dealerState.dealCardsByRoundForPlayers(playerAddresses, 2);
                    setState(BBTypes.GameState.SECOND_BETTING);
                    playerContinuedCount = 0;
                    playerFoldCount = 0;
                }else{
                    // 第三轮发牌
                    dealerState.dealCardsByRoundForPlayers(playerAddresses, 3);
                    playerContinuedCount = 0;
                    playerFoldCount = 0;
                    _endGame();
                }
            }else{
                // 只有一个玩家继续，进入结算阶段
                _endGame();
            }
        }
    }

    // 获取是否可以进入下一步
    function checkCanNext() external view onlyParticipants returns (bool) {
        return _checkCanNext();
    }

    function _checkCanNext() internal view returns (bool) {
        if(state == BBTypes.GameState.WAITING){
            //等待状态，人数大于一人并且都已准备，则可以开始游戏
            return playerCount >= 2 && playerReadyCount == playerCount;
        }else if(state == BBTypes.GameState.FIRST_BETTING || state == BBTypes.GameState.SECOND_BETTING){
            //第一、二轮下注状态，所有玩家都已行动，则可以进入第二轮
            return playerContinuedCount + playerFoldCount + _timeoutPlayerCount() == playerCount;
        }else if(state == BBTypes.GameState.ENDED){
            return true;
        }

        return false;
    }

    //获取超时玩家数量
    function _timeoutPlayerCount() internal view returns (uint8) {
        uint8 count = 0;
        for (uint i = 0; i < playerAddresses.length; i++) {
            address playerAddr = playerAddresses[i];
            if(_checkTimeout(playerAddr)){
                count++;
            }
        }
        return count;
    }

    function timeoutPlayerCount() external view onlyParticipants returns (uint8) {
        return _timeoutPlayerCount();
    }

    // 添加检查超时的内部函数
    function _checkTimeout(address playerAddr) internal view returns (bool) {
        if (state != BBTypes.GameState.FIRST_BETTING && state != BBTypes.GameState.SECOND_BETTING) {
            return false;
        }

        BBPlayer storage player = players[playerAddr];
        bool needsAction = (state == BBTypes.GameState.FIRST_BETTING && player.state == BBTypes.PlayerState.READY) ||
                          (state == BBTypes.GameState.SECOND_BETTING && player.state == BBTypes.PlayerState.FIRST_CONTINUED);

        return needsAction && block.timestamp > currentRoundDeadline;
    }

    /**
     * @dev 玩家弃牌
     */
    function playerFold() external onlyParticipants nonReentrant{
        if (state != BBTypes.GameState.FIRST_BETTING && state != BBTypes.GameState.SECOND_BETTING) revert GameNotInPlayingState();
        address playerAddr = msg.sender;

        // 检查是否超时
        if (_checkTimeout(playerAddr)) revert NotYourTurn();

        BBPlayer storage player = players[playerAddr];

        if(state == BBTypes.GameState.FIRST_BETTING){
            // 第一轮弃牌
            if (player.state != BBTypes.PlayerState.READY) revert PlayerNotInReadyState();
        }else{
            // 第二轮弃牌
            if (player.state != BBTypes.PlayerState.FIRST_CONTINUED) revert InvalidPlayerState();
        }

        _updateLastActivity();
        player.playerFold();

        playerFoldCount++;
    }

    /**
     * @dev 玩家继续游戏
     */
    function playerContinue() external payable onlyParticipants nonReentrant{
        if (state != BBTypes.GameState.FIRST_BETTING && state != BBTypes.GameState.SECOND_BETTING) revert GameNotInPlayingState();
        address playerAddr = msg.sender;
        if (msg.value != betAmount) revert InsufficientFunds();

        // 检查是否超时
        if (_checkTimeout(playerAddr)) revert NotYourTurn();

        BBPlayer storage player = players[playerAddr];
        if (address(player.playerAddr) == address(0)) revert PlayerNotFound();

        uint8 round = 1;
        if(state == BBTypes.GameState.FIRST_BETTING){
            // 第一轮继续
            if (player.state != BBTypes.PlayerState.READY) revert PlayerNotInReadyState();
        }else{
            // 第二轮继续
            round = 2;
            if (player.state != BBTypes.PlayerState.FIRST_CONTINUED) revert InvalidPlayerState();
        }

        player.playerContinue(betAmount);
        playerContinuedCount++;
        totalPrizePool += betAmount;

        _updateLastActivity();
    }


    function _endGame() internal {
        // 设置游戏状态为结束
        setState(BBTypes.GameState.ENDED);
        gameEndTimestamp = block.timestamp;

        // 计算平台费用
        uint256 platformFee = (totalPrizePool * platformFeePercent) / 10000;
        uint256 remainingPrizePool = totalPrizePool;

        // 如果有平台费用，则从奖池中扣除
        if (platformFee > 0) {
            remainingPrizePool -= platformFee;
        }

        // 计算每个玩家的牌型
        for (uint i = 0; i < playerAddresses.length; i++) {
            address playerAddr = playerAddresses[i];
            BBPlayer storage player = players[playerAddr];


            // 玩家的牌
            uint8[5] memory allCards = dealerState.getPlayerAllCards(playerAddr);

            // 计算牌型
            BBTypes.CardType cardType = dealerState.calculateCardType(playerAddr);

            // 赋值给玩家
            player.cards = allCards;
            player.cardType = cardType;
        }

        // 准备游戏结果数据
        uint256 _endTimestamp = block.timestamp;
        address[] memory _playerAddrs = playerAddresses;
        address[] memory _winnerAddrs = new address[](playerAddresses.length);
        uint256 winnerCount = 0;
        BBTypes.CardType _maxCardType = BBTypes.CardType.NONE;

        // 创建玩家数据条目数组
        BBPlayerEntry[] memory playerEntries = new BBPlayerEntry[](playerAddresses.length);

        // 填充玩家数据并找出最大牌型
        for (uint i = 0; i < playerAddresses.length; i++) {
            address playerAddr = playerAddresses[i];
            BBPlayer storage player = players[playerAddr];

            // 记录玩家数据
            playerEntries[i] = BBPlayerEntry({
                playerAddr: playerAddr,
                playerData: player
            });

            // 更新最大牌型
            if (uint8(player.cardType) > uint8(_maxCardType)) {
                _maxCardType = player.cardType;
            }

            // 如果是获胜者，添加到获胜者数组
            if (player.cardType == _maxCardType) {
                _winnerAddrs[winnerCount] = playerAddr;
                winnerCount++;
            }
        }

        // 调整获胜者数组大小
        assembly {
            mstore(_winnerAddrs, winnerCount)
        }

        // 记录游戏历史
        IBBGameHistory historyContract = IBBGameHistory(gameHistoryAddr);
        historyContract.recordGame(
            gameStartTimestamp,
            _endTimestamp,
            totalPrizePool,
            _playerAddrs,
            _winnerAddrs,
            playerEntries,
            _maxCardType
        );

        // 所有状态更新和记录完成后，进行转账操作

        // 首先转账平台费用
        if (platformFee > 0) {
            // 调用主合约的函数增加待提取的平台费用
            (bool success, ) = gameMainAddr.call{
                value: platformFee
            }(abi.encodeWithSignature("addPendingPlatformFee(uint256)", platformFee));

            // 如果转账失败，整个结算过程失败
            if (!success) revert TransferFailed();
        }

        // 然后分配奖金给获胜者
        if (winnerCount > 0) {
            // 每个获胜者应得的奖金
            uint256 prizePerWinner = remainingPrizePool / winnerCount;

            // 分配奖金给每个获胜者
            for (uint i = 0; i < winnerCount; i++) {
                address winnerAddr = _winnerAddrs[i];
                payable(winnerAddr).transfer(prizePerWinner);
            }

            // 处理可能的舍入误差，将剩余的少量奖金给第一个获胜者
            uint256 remainingPrize = remainingPrizePool - (prizePerWinner * winnerCount);
            if (remainingPrize > 0) {
                payable(_winnerAddrs[0]).transfer(remainingPrize);
            }
        }
    }

    /**
     * @dev 清算不活跃的游戏桌
     * 任何人都可以调用此函数来清算长时间不活跃的游戏桌
     * 庄家的押金将被分配给玩家和清算人
     */
    function liquidateInactiveTable() external nonReentrant returns (bool) {
        // 检查游戏桌是否超时
        if (block.timestamp <= lastActivityTimestamp + tableInactiveTimeout) revert TableNotInactive();
        if (state == BBTypes.GameState.LIQUIDATED || state == BBTypes.GameState.ENDED) revert TableAlreadyLiquidated();

        // 计算庄家的押金
        uint256 bankerBet = players[bankerAddr].totalBet();

        // 计算平台费用 (从庄家押金中收取)
        uint256 platformFee = (bankerBet * platformFeePercent) / 10000;

        // 清算人的奖励 (20% 的庄家押金)
        uint256 liquidatorReward = bankerBet * 20 / 100;

        // 剩余的庄家押金平均分配给所有玩家
        uint256 remainingBankerBet = bankerBet - liquidatorReward - platformFee;
        uint256 playerRewardTotal = 0;

        // 平台费用转账将在最后进行

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

        setState(BBTypes.GameState.LIQUIDATED);

        // 通知 GameMain 合约移除这个游戏桌
        (bool success, ) = gameMainAddr.call(
            abi.encodeWithSignature("removeGameTable(address)", address(this))
        );
        if (!success) revert OnlyMainContractCanCall();

        // 所有状态更新完成后，进行转账操作

        // 首先转账平台费用
        if (platformFee > 0) {
            // 调用主合约的函数增加待提取的平台费用
            (bool feeSuccess, ) = gameMainAddr.call{
                value: platformFee
            }(abi.encodeWithSignature("addPendingPlatformFee(uint256)", platformFee));

            // 如果转账失败，整个清算过程失败
            if (!feeSuccess) revert TransferFailed();
        }

        // 然后进行其他转账
        for (uint i = 0; i < paymentCount; i++) {
            payable(paymentAddresses[i]).transfer(paymentAmounts[i]);
        }

        // 支付清算人奖励
        payable(msg.sender).transfer(liquidatorReward);

        return success;
    }


    /**
     * @dev 设置游戏状态
     */
    function setState(BBTypes.GameState _state) internal {
        state = _state;

        // 如果进入下注阶段，为所有玩家设置操作截止时间
        if (_state == BBTypes.GameState.FIRST_BETTING || _state == BBTypes.GameState.SECOND_BETTING) {
            currentRoundDeadline = block.timestamp + playerTimeout;
        }

        _updateLastActivity(); // 更新最后活动时间
        emit GameChanged(address(this));
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
        return players[playerAddr];
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
            lastActivityTimestamp: lastActivityTimestamp
        });
    }

    function isPlayer(address playerAddr) external view returns (bool) {
        return players[playerAddr].playerAddr != address(0);
    }

    receive() external payable {}
}

