// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./BBErrors.sol";

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
        uint256 commitDeadline;    // 提交截止时间
        uint256 revealDeadline;    // 揭示截止时间
        bool isCompleted;          // 会话是否完成
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

    // 事件
    event SessionCreated(address indexed tableAddress, uint256 indexed sessionId, uint256 commitDeadline, uint256 revealDeadline);
    event RandomCommitted(address indexed tableAddress, uint256 indexed sessionId, address indexed participant);
    event RandomRevealed(address indexed tableAddress, uint256 indexed sessionId, address indexed participant, uint256 revealedValue);
    event SessionCompleted(address indexed tableAddress, uint256 indexed sessionId, uint256 finalSeed);
    event GameMainAddressUpdated(address indexed gameMainAddr);
    event VersionUpdated(uint256 version);

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
        emit GameMainAddressUpdated(_gameMainAddr);
    }

    /**
     * @dev 修饰器：只允许游戏桌合约调用
     */
    modifier onlyGameTable() {
        // 检查调用者是否是有效的游戏桌
        bool isValidTable = false;
        if (gameMainAddr != address(0)) {
            // 调用游戏主合约的isValidGameTable函数
            (bool success, bytes memory data) = gameMainAddr.staticcall(
                abi.encodeWithSignature("isValidGameTable(address)", msg.sender)
            );
            if (success && data.length >= 32) {
                isValidTable = abi.decode(data, (bool));
            }
        }
        if (!isValidTable) revert OnlyGameTableCanCall();
        _;
    }

    /**
     * @dev 创建新的随机数会话
     * @param _participants 参与者列表
     * @param _commitTimeout 提交超时时间（秒）
     * @param _revealTimeout 揭示超时时间（秒）
     * @return sessionId 会话ID
     */
    function createSession(
        address[] calldata _participants,
        uint256 _commitTimeout,
        uint256 _revealTimeout
    ) external onlyGameTable returns (uint256) {
        if (_participants.length == 0) revert InvalidParticipants();
        
        // 获取新的会话ID
        uint256 sessionId = currentSessionIds[msg.sender] + 1;
        currentSessionIds[msg.sender] = sessionId;
        
        // 创建新会话
        RandomSession storage session = sessions[msg.sender][sessionId];
        session.tableAddress = msg.sender;
        session.sessionId = sessionId;
        session.commitDeadline = block.timestamp + _commitTimeout;
        session.revealDeadline = session.commitDeadline + _revealTimeout;
        session.isCompleted = false;
        session.participants = _participants;
        
        emit SessionCreated(msg.sender, sessionId, session.commitDeadline, session.revealDeadline);
        
        return sessionId;
    }

    /**
     * @dev 提交随机数（哈希值）
     * @param _tableAddress 游戏桌地址
     * @param _sessionId 会话ID
     * @param _commitment 提交的哈希值
     */
    function commitRandom(
        address _tableAddress,
        uint256 _sessionId,
        bytes32 _commitment
    ) external {
        RandomSession storage session = sessions[_tableAddress][_sessionId];
        
        // 验证会话是否存在
        if (session.tableAddress == address(0)) revert SessionNotFound();
        
        // 验证会话是否在提交阶段
        if (block.timestamp > session.commitDeadline) revert CommitDeadlineExpired();
        
        // 验证会话是否未完成
        if (session.isCompleted) revert SessionAlreadyCompleted();
        
        // 验证调用者是否是参与者
        bool isParticipant = false;
        for (uint256 i = 0; i < session.participants.length; i++) {
            if (session.participants[i] == msg.sender) {
                isParticipant = true;
                break;
            }
        }
        if (!isParticipant) revert NotAParticipant();
        
        // 验证是否已经提交过
        if (session.commitments[msg.sender].hasCommitted) revert AlreadyCommitted();
        
        // 记录提交
        session.commitments[msg.sender].commitment = _commitment;
        session.commitments[msg.sender].hasCommitted = true;
        
        emit RandomCommitted(_tableAddress, _sessionId, msg.sender);
    }

    /**
     * @dev 揭示随机数
     * @param _tableAddress 游戏桌地址
     * @param _sessionId 会话ID
     * @param _randomValue 随机值
     * @param _salt 盐值
     */
    function revealRandom(
        address _tableAddress,
        uint256 _sessionId,
        uint256 _randomValue,
        bytes32 _salt
    ) external {
        RandomSession storage session = sessions[_tableAddress][_sessionId];
        
        // 验证会话是否存在
        if (session.tableAddress == address(0)) revert SessionNotFound();
        
        // 验证会话是否在揭示阶段
        if (block.timestamp <= session.commitDeadline) revert RevealPhaseNotStarted();
        if (block.timestamp > session.revealDeadline) revert RevealDeadlineExpired();
        
        // 验证会话是否未完成
        if (session.isCompleted) revert SessionAlreadyCompleted();
        
        // 验证调用者是否提交过
        if (!session.commitments[msg.sender].hasCommitted) revert NotCommitted();
        
        // 验证是否已经揭示过
        if (session.commitments[msg.sender].hasRevealed) revert AlreadyRevealed();
        
        // 验证提交的哈希
        bytes32 commitment = keccak256(abi.encodePacked(_randomValue, msg.sender, _salt));
        if (commitment != session.commitments[msg.sender].commitment) revert InvalidReveal();
        
        // 记录揭示
        session.commitments[msg.sender].revealedValue = _randomValue;
        session.commitments[msg.sender].hasRevealed = true;
        
        emit RandomRevealed(_tableAddress, _sessionId, msg.sender, _randomValue);
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
        if (session.isCompleted) revert SessionAlreadyCompleted();
        
        // 生成最终随机种子
        uint256 finalSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
        
        // 结合所有已揭示的随机值
        for (uint256 i = 0; i < session.participants.length; i++) {
            address participant = session.participants[i];
            if (session.commitments[participant].hasRevealed) {
                finalSeed ^= session.commitments[participant].revealedValue;
            }
        }
        
        // 标记会话为已完成
        session.isCompleted = true;
        session.finalSeed = finalSeed;
        
        emit SessionCompleted(msg.sender, _sessionId, finalSeed);
        
        return finalSeed;
    }

    /**
     * @dev 获取会话状态
     * @param _tableAddress 游戏桌地址
     * @param _sessionId 会话ID
     * @return isCompleted 会话是否完成
     * @return commitDeadline 提交截止时间
     * @return revealDeadline 揭示截止时间
     * @return finalSeed 最终随机种子
     * @return commitCount 已提交数量
     * @return revealCount 已揭示数量
     * @return totalParticipants 总参与者数量
     */
    function getSessionStatus(address _tableAddress, uint256 _sessionId) external view returns (
        bool isCompleted,
        uint256 commitDeadline,
        uint256 revealDeadline,
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
            session.isCompleted,
            session.commitDeadline,
            session.revealDeadline,
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

    /**
     * @dev 更新版本号
     * @param _version 新版本号
     */
    function updateVersion(uint256 _version) external onlyOwner {
        version = _version;
        emit VersionUpdated(_version);
    }

    /**
     * @dev 授权升级函数，只有合约所有者可以升级
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
