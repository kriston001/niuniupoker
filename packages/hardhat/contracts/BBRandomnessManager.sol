// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./BBErrors.sol";
import "./BBInterfaces.sol";
import "./BBTypes.sol";

/**
 * @title BBRandomnessManager
 * @dev 管理游戏中的随机数生成，使用Commit-Reveal模式
 */
contract BBRandomnessManager is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // 版本号
    uint256 public version;

    // 游戏主合约地址
    address public gameMainAddr;

    

    // 随机数会话结构
    struct RandomSession {
        address tableAddress;      // 游戏桌地址
        uint256 sessionId;         // 会话ID
        uint256 timeout;           // 超时时间（秒）
        uint256 deadline;          // 截止时间
        SessionState state;        // 会话状态
        uint256 finalSeed;         // 最终生成的随机种子
        address[] participants;    // 参与者列表
        mapping(address => RandomCommitment) commitments; // 参与者的提交
    }

    // 随机数提交结构
    struct RandomCommitment {
        bytes32 commitment;        // 提交的哈希值
        bool hasCommitted;         // 是否已提交
        bool hasRevealed;          // 是否已揭示
        uint256 revealedValue;     // 揭示的随机值
    }

    // 游戏桌地址 => 会话ID => 随机数会话
    mapping(address => mapping(uint256 => RandomSession)) private sessions;
    
    // 游戏桌地址 => 当前会话ID
    mapping(address => uint256) private currentSessionIds;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev 初始化合约
     */
    function initialize(address _gameMainAddr) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        
        version = 1;
        gameMainAddr = _gameMainAddr;
    }

    /**
     * @dev 设置游戏主合约地址
     * @param _gameMainAddr 游戏主合约地址
     */
    function setGameMainAddress(address _gameMainAddr) external onlyOwner {
        if (_gameMainAddr == address(0)) revert InvalidAddress();
        gameMainAddr = _gameMainAddr;
    }

    /**
     * @dev 修饰器：只允许游戏桌合约调用
     */
    modifier onlyGameTable() {
        bool isValidTable = false;
        if (gameMainAddr != address(0)) {
            if(IGameMain(gameMainAddr).isValidGameTable(msg.sender)){
                isValidTable = true;
            }else{
                isValidTable = false;
            }
        }
        if (!isValidTable) revert OnlyGameTableCanCall();
        _;
    }

    /**
     * @dev 创建新的随机数会话
     * @param _participants 参与者列表
     * @param _timeout 提交超时时间（秒）
     * @return sessionId 会话ID
     */
    function createSession(
        address[] calldata _participants,
        uint256 _timeout
    ) external onlyGameTable returns (uint256) {
        if (_participants.length == 0) revert InvalidParticipants();
        
        // 获取新的会话ID
        uint256 sessionId = currentSessionIds[msg.sender] + 1;
        currentSessionIds[msg.sender] = sessionId;
        
        // 创建新会话
        RandomSession storage session = sessions[msg.sender][sessionId];
        session.tableAddress = msg.sender;
        session.sessionId = sessionId;
        session.timeout = _timeout;
        session.deadline = block.timestamp + _timeout;
        session.state = SessionState.COMMITING;
        session.participants = _participants;
                
        return sessionId;
    }

    /**
     * @dev 提交随机数（哈希值）
     * @param _playerAddress 玩家地址
     * @param _sessionId 会话ID
     * @param _commitment 提交的哈希值
     */
    function commitRandom(
        address _playerAddress,
        uint256 _sessionId,
        bytes32 _commitment
    ) external onlyGameTable {
        address tableAddress = msg.sender;
        RandomSession storage session = sessions[tableAddress][_sessionId];
        
        // 验证会话是否存在
        if (session.tableAddress == address(0)) revert SessionNotFound();

        // 验证会话是否在提交阶段
        if(session.state != SessionState.COMMITING || block.timestamp > session.deadline) revert CommitDeadlineExpired();
        

        // 验证玩家地址是否是参与者
        bool isParticipant = false;
        for (uint256 i = 0; i < session.participants.length; i++) {
            if (session.participants[i] == _playerAddress) {
                isParticipant = true;
                break;
            }
        }
        if (!isParticipant) revert NotAParticipant();
        
        // 验证是否已经提交过
        if (session.commitments[_playerAddress].hasCommitted) revert AlreadyCommitted();
        
        // 记录提交
        session.commitments[_playerAddress].commitment = _commitment;
        session.commitments[_playerAddress].hasCommitted = true;
    }

    function goReveal(uint256 _sessionId) external onlyGameTable returns (uint256) {
        RandomSession storage session = sessions[msg.sender][_sessionId];

        // 验证会话是否存在
        if (session.tableAddress == address(0)) revert SessionNotFound();

        require(msg.sender == session.tableAddress, "Only the table can go to reveal");
        require(session.state == SessionState.COMMITING, "Only in committing state");

        //所有人都提交或者超时
        if (block.timestamp > session.deadline) {
            session.state = SessionState.REVEALING;
            session.deadline = block.timestamp + session.timeout;
            return session.deadline;
        }else{
            bool isAllCommitted = true;
            for (uint256 i = 0; i < session.participants.length; i++) {
                if (!session.commitments[session.participants[i]].hasCommitted) {
                    isAllCommitted = false;
                    break;
                }
            }
            if (isAllCommitted) {
                session.state = SessionState.REVEALING;
                session.deadline = block.timestamp + session.timeout;
                return session.deadline;
            }else{
                return 0;
            }
        }
    }

    /**
     * @dev 揭示随机数
     * @param _playerAddress 玩家地址
     * @param _sessionId 会话ID
     * @param _randomValue 随机值
     * @param _salt 盐值
     */
    function revealRandom(
        address _playerAddress,
        uint256 _sessionId,
        uint256 _randomValue,
        bytes32 _salt
    ) external onlyGameTable {
        address tableAddress = msg.sender;
        RandomSession storage session = sessions[tableAddress][_sessionId];
        
        // 验证会话是否存在
        if (session.tableAddress == address(0)) revert SessionNotFound();
        
        // 验证会话是否在揭示阶段
        if(session.state != SessionState.REVEALING || block.timestamp > session.deadline) revert RevealDeadlineExpired();
        
        // 验证调用者是否提交过
        if (!session.commitments[_playerAddress].hasCommitted) revert NotCommitted();
        
        // 验证是否已经揭示过
        if (session.commitments[_playerAddress].hasRevealed) revert AlreadyRevealed();
        
        // 验证提交的哈希
        bytes32 commitment = keccak256(abi.encodePacked(_randomValue, _playerAddress, _salt));
        if (commitment != session.commitments[_playerAddress].commitment) revert InvalidReveal();
        
        // 记录揭示
        session.commitments[_playerAddress].revealedValue = _randomValue;
        session.commitments[_playerAddress].hasRevealed = true;
        
    }

    /**
     * @dev 完成会话并生成最终随机种子
     * @param _sessionId 会话ID
     * @return finalSeed 最终随机种子
     */
    function completeSession(uint256 _sessionId) external onlyGameTable returns (uint256) {
        RandomSession storage session = sessions[msg.sender][_sessionId];
        
        // 验证会话是否存在
        if (session.tableAddress == address(0)) revert SessionNotFound();
        
        // 验证会话是否未完成
        if (session.state == SessionState.COMPLETED) revert SessionAlreadyCompleted();
        
        // 生成最终随机种子
        uint256 finalSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
        
        bool isAllRevealed = false;
        // 结合所有已揭示的随机值
        for (uint256 i = 0; i < session.participants.length; i++) {
            address participant = session.participants[i];
            if (session.commitments[participant].hasRevealed) {
                finalSeed ^= session.commitments[participant].revealedValue;
            }else{
                isAllRevealed = false;
            }
        }

        require(isAllRevealed || block.timestamp > session.deadline, "Not all participants have revealed or timeout");

        session.state = SessionState.COMPLETED;
        session.finalSeed = finalSeed;
        return finalSeed;
    }

    /**
     * @dev 获取会话状态
     * @param _tableAddress 游戏桌地址
     * @param _sessionId 会话ID
     * @return state 会话状态
     * @return deadline 截止时间
     * @return finalSeed 最终随机种子
     * @return commitCount 已提交数量
     * @return revealCount 已揭示数量
     * @return totalParticipants 总参与者数量
     */
    function getSessionStatus(address _tableAddress, uint256 _sessionId) external view returns (
        SessionState state,
        uint256 deadline,
        uint256 finalSeed,
        uint256 commitCount,
        uint256 revealCount,
        uint256 totalParticipants
    ) {
        RandomSession storage session = sessions[_tableAddress][_sessionId];
        
        // 验证会话是否存在
        if (session.tableAddress == address(0)) revert SessionNotFound();
        
        // 计算已提交和已揭示的数量
        uint256 _commitCount = 0;
        uint256 _revealCount = 0;
        for (uint256 i = 0; i < session.participants.length; i++) {
            address participant = session.participants[i];
            if (session.commitments[participant].hasCommitted) {
                _commitCount++;
            }
            if (session.commitments[participant].hasRevealed) {
                _revealCount++;
            }
        }
        
        return (
            session.state,
            session.deadline,
            session.finalSeed,
            _commitCount,
            _revealCount,
            session.participants.length
        );
    }

    /**
     * @dev 检查参与者是否已提交
     * @param _tableAddress 游戏桌地址
     * @param _sessionId 会话ID
     * @param _participant 参与者地址
     * @return hasCommitted 是否已提交
     */
    function hasCommitted(address _tableAddress, uint256 _sessionId, address _participant) external view returns (bool) {
        return sessions[_tableAddress][_sessionId].commitments[_participant].hasCommitted;
    }

    /**
     * @dev 检查参与者是否已揭示
     * @param _tableAddress 游戏桌地址
     * @param _sessionId 会话ID
     * @param _participant 参与者地址
     * @return hasRevealed 是否已揭示
     */
    function hasRevealed(address _tableAddress, uint256 _sessionId, address _participant) external view returns (bool) {
        return sessions[_tableAddress][_sessionId].commitments[_participant].hasRevealed;
    }

    /**
     * @dev 获取当前会话ID
     * @param _tableAddress 游戏桌地址
     * @return currentSessionId 当前会话ID
     */
    function getCurrentSessionId(address _tableAddress) external view returns (uint256) {
        return currentSessionIds[_tableAddress];
    }

    function getSessionDeadline(address _tableAddress, uint256 _sessionId) external view returns (uint256) {
        return sessions[_tableAddress][_sessionId].deadline;
    }

    /**
     * @dev 更新版本号
     * @param _version 新版本号
     */
    function updateVersion(uint256 _version) external onlyOwner {
        version = _version;
    }

    /**
     * @dev 授权升级函数，只有合约所有者可以升级
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
