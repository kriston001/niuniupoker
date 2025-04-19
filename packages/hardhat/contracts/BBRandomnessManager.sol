// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./BBErrors.sol";
import "./BBInterfaces.sol";
import "./BBTypes.sol";
import "./BBStructs.sol";

/**
 * @title BBRandomnessManager
 * @dev 管理游戏中的随机数生成，使用Commit-Reveal模式
 */
contract BBRandomnessManager is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // 版本号
    uint256 public version;

    // 游戏主合约地址
    address public gameMainAddr;
    
    // 游戏桌地址 => 当前会话
    mapping(address => RandomSession) private sessions;

    // 预留 50 个 slot 给将来新增变量用，防止存储冲突
    uint256[50] private __gap;

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
     * @return success 是否成功
     */
    function createSession() external onlyGameTable returns (bool) {
        RandomSession storage session = sessions[msg.sender];
        if (session.tableAddress != address(0)) {
            return false;
        }
        session.tableAddress = msg.sender;
        session.state = SessionState.READY;
        return true;
    }

    function startCommit(address[] calldata _participants, uint256 _timeout) external returns (uint256) {
        RandomSession storage session = sessions[msg.sender];
        if (session.tableAddress == address(0)) revert SessionNotFound();
        require(msg.sender == session.tableAddress, "Only the table can start commit");
        require(session.state == SessionState.READY, "Only in ready state");
        session.timeout = _timeout;
        session.participants = _participants;
        session.state = SessionState.COMMITING;
        session.deadline = block.timestamp + session.timeout;
        return session.deadline;
    }

    /**
     * @dev 提交随机数（哈希值）
     * @param _playerAddress 玩家地址
     * @param _commitment 提交的哈希值
     */
    function commitRandom(address _playerAddress, bytes32 _commitment) external {
        address tableAddress = msg.sender;
        RandomSession storage session = sessions[tableAddress];
        if (session.tableAddress == address(0)) revert SessionNotFound();
        require(msg.sender == session.tableAddress, "Only the table can start commit");
        if(session.state != SessionState.COMMITING || block.timestamp > session.deadline) revert CommitDeadlineExpired();

        bool isParticipant = false;
        for (uint256 i = 0; i < session.participants.length; i++) {
            if (session.participants[i] == _playerAddress) {
                isParticipant = true;
                break;
            }
        }
        if (!isParticipant) revert NotAParticipant();
        if (session.commitments[_playerAddress].hasCommitted) revert AlreadyCommitted();
        session.commitments[_playerAddress].commitment = _commitment;
        session.commitments[_playerAddress].hasCommitted = true;
    }

    function startReveal() external returns (uint256) {
        RandomSession storage session = sessions[msg.sender];
        if (session.tableAddress == address(0)) revert SessionNotFound();
        require(msg.sender == session.tableAddress, "Only the table can go to reveal");
        require(session.state == SessionState.COMMITING, "Only in committing state");

        if (block.timestamp > session.deadline) {
            session.state = SessionState.REVEALING;
            session.deadline = block.timestamp + session.timeout;
            return session.deadline;
        } else {
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
            } else {
                return 0;
            }
        }
    }

    /**
     * @dev 揭示随机数
     * @param _playerAddress 玩家地址
     * @param _randomValue 随机值
     * @param _salt 盐值
     */
    function revealRandom(
        address _playerAddress,
        uint256 _randomValue,
        bytes32 _salt
    ) external {
        address tableAddress = msg.sender;
        RandomSession storage session = sessions[tableAddress];
        require(msg.sender == session.tableAddress, "Only the table can start commit");
        if(session.state != SessionState.REVEALING || block.timestamp > session.deadline) revert RevealDeadlineExpired(); 
        if (!session.commitments[_playerAddress].hasCommitted) revert NotCommitted();
        if (session.commitments[_playerAddress].hasRevealed) revert AlreadyRevealed();
        
        bytes32 commitment = keccak256(abi.encodePacked(_randomValue, _playerAddress, _salt));
        if (commitment != session.commitments[_playerAddress].commitment) revert InvalidReveal();
        session.commitments[_playerAddress].revealedValue = _randomValue;
        session.commitments[_playerAddress].hasRevealed = true;
    }

    /**
     * @dev 完成会话并生成最终随机种子
     * @return finalSeed 最终随机种子
     */
    function completeSession() external returns (uint256) {
        RandomSession storage session = sessions[msg.sender];
        require(msg.sender == session.tableAddress, "Only the table can start commit");
        if (session.state != SessionState.REVEALING) revert SessionNotRevealing();

        uint256 finalSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
        bool isAllRevealed = true;
        for (uint256 i = 0; i < session.participants.length; i++) {
            address participant = session.participants[i];
            if (session.commitments[participant].hasRevealed) {
                finalSeed ^= session.commitments[participant].revealedValue;
            } else {
                isAllRevealed = false;
            }
        }
        require(isAllRevealed || block.timestamp > session.deadline, "Not all participants have revealed or timeout");

        //改成ready 以备下次使用
        session.state = SessionState.READY;
        // Delete commitments for all participants
        for (uint256 i = 0; i < session.participants.length; i++) {
            delete session.commitments[session.participants[i]];
        }
        delete session.participants;
        session.deadline = 0;
        session.timeout = 0;

        return finalSeed;
    }


    /**
     * @dev 检查参与者是否已提交
     * @param _tableAddress 游戏桌地址
     * @param _participant 参与者地址
     * @return hasCommitted 是否已提交
     */
    function hasCommitted(address _tableAddress, address _participant) external view returns (bool) {
        return sessions[_tableAddress].commitments[_participant].hasCommitted;
    }

    /**
     * @dev 检查参与者是否已揭示
     * @param _tableAddress 游戏桌地址
     * @param _participant 参与者地址
     * @return hasRevealed 是否已揭示
     */
    function hasRevealed(address _tableAddress, address _participant) external view returns (bool) {
        return sessions[_tableAddress].commitments[_participant].hasRevealed;
    }

    function getSessionDeadline(address _tableAddress) external view returns (uint256) {
        return sessions[_tableAddress].deadline;
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

