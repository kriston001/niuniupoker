// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Multicall3
/// @notice Aggregate results from multiple function calls
/// @dev Multicall & Multicall2 backwards-compatible
/// @dev Aggregate methods are marked `payable` to save 24 gas per call
/// @author Michael Elliot <mike@makerdao.com>
/// @author Joshua Levine <joshua@makerdao.com>
/// @author Nick Johnson <arachnid@notdot.net>
/// @author Andreas Bigger <andreas@nascent.xyz>
/// @author Matt Solomon <matt@mattsolomon.dev>
contract Multicall3 {
    struct Call {
        address target;
        bytes callData;
    }

    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Call3Value {
        address target;
        bool allowFailure;
        uint256 value;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    /// @notice Aggregate calls and return the block number and results
    /// @param calls An array of Call structs
    /// @return blockNumber The block number
    /// @return returnData An array of bytes containing the responses
    function aggregate(Call[] calldata calls) public payable returns (uint256 blockNumber, bytes[] memory returnData) {
        blockNumber = block.number;
        uint256 length = calls.length;
        returnData = new bytes[](length);
        for (uint256 i = 0; i < length;) {
            (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
            require(success, "Multicall3: call failed");
            returnData[i] = ret;
            unchecked { ++i; }
        }
    }

    /// @notice Aggregate calls, ensuring each returns success if required
    /// @param calls An array of Call3 structs
    /// @return returnData An array of Result structs
    function aggregate3(Call3[] calldata calls) public payable returns (Result[] memory returnData) {
        uint256 length = calls.length;
        returnData = new Result[](length);
        for (uint256 i = 0; i < length;) {
            (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
            if (calls[i].allowFailure || success) {
                returnData[i] = Result(success, ret);
            } else {
                revert("Multicall3: call failed");
            }
            unchecked { ++i; }
        }
    }

    /// @notice Aggregate calls with a msg value
    /// @notice Reverts if msg.value is less than the sum of the call values
    /// @param calls An array of Call3Value structs
    /// @return returnData An array of Result structs
    function aggregate3Value(Call3Value[] calldata calls) public payable returns (Result[] memory returnData) {
        uint256 valAccumulator;
        uint256 length = calls.length;
        returnData = new Result[](length);
        for (uint256 i = 0; i < length;) {
            uint256 val = calls[i].value;
            // Humanity will be extinct long before this overflows
            unchecked { valAccumulator += val; }
            (bool success, bytes memory ret) = calls[i].target.call{value: val}(calls[i].callData);
            if (calls[i].allowFailure || success) {
                returnData[i] = Result(success, ret);
            } else {
                revert("Multicall3: call failed");
            }
            unchecked { ++i; }
        }
        // Finally, check whether the accumulated value is equal to the msg.value
        require(msg.value == valAccumulator, "Multicall3: value mismatch");
    }

    /// @notice Aggregate calls and return the current block number, the hash of the previous block, and an array of results
    /// @param calls An array of Call structs
    /// @return blockNumber The block number
    /// @return blockHash The block hash
    /// @return returnData An array of Result structs
    function blockAndAggregate(Call[] calldata calls) public payable returns (uint256 blockNumber, bytes32 blockHash, Result[] memory returnData) {
        blockNumber = block.number;
        blockHash = blockhash(block.number - 1);
        uint256 length = calls.length;
        returnData = new Result[](length);
        for (uint256 i = 0; i < length;) {
            (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
            returnData[i] = Result(success, ret);
            unchecked { ++i; }
        }
    }

    /// @notice Aggregate calls, ensuring each returns success if required, and return the current block number, the hash of the previous block, and an array of results
    /// @param requireSuccess If true, require all calls to succeed
    /// @param calls An array of Call structs
    /// @return blockNumber The block number
    /// @return blockHash The block hash
    /// @return returnData An array of Result structs
    function tryBlockAndAggregate(bool requireSuccess, Call[] calldata calls) public payable returns (uint256 blockNumber, bytes32 blockHash, Result[] memory returnData) {
        blockNumber = block.number;
        blockHash = blockhash(block.number - 1);
        uint256 length = calls.length;
        returnData = new Result[](length);
        for (uint256 i = 0; i < length;) {
            (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
            if (requireSuccess) {
                require(success, "Multicall3: call failed");
            }
            returnData[i] = Result(success, ret);
            unchecked { ++i; }
        }
    }

    /// @notice Aggregate calls, ensuring each returns success if required, and return the current block number and an array of results
    /// @param requireSuccess If true, require all calls to succeed
    /// @param calls An array of Call structs
    /// @return blockNumber The block number
    /// @return returnData An array of Result structs
    function tryAggregate(bool requireSuccess, Call[] calldata calls) public payable returns (uint256 blockNumber, Result[] memory returnData) {
        blockNumber = block.number;
        uint256 length = calls.length;
        returnData = new Result[](length);
        for (uint256 i = 0; i < length;) {
            (bool success, bytes memory ret) = calls[i].target.call(calls[i].callData);
            if (requireSuccess) {
                require(success, "Multicall3: call failed");
            }
            returnData[i] = Result(success, ret);
            unchecked { ++i; }
        }
    }

    /// @notice Returns the current block number
    /// @return blockNumber The block number
    function getBlockNumber() public view returns (uint256 blockNumber) {
        blockNumber = block.number;
    }

    /// @notice Returns the current block hash
    /// @return blockHash The block hash
    function getBlockHash() public view returns (bytes32 blockHash) {
        blockHash = blockhash(block.number - 1);
    }

    /// @notice Returns the current block timestamp
    /// @return timestamp The block timestamp
    function getCurrentBlockTimestamp() public view returns (uint256 timestamp) {
        timestamp = block.timestamp;
    }

    /// @notice Returns the current block difficulty
    /// @return difficulty The block difficulty
    function getCurrentBlockDifficulty() public view returns (uint256 difficulty) {
        difficulty = block.difficulty;
    }

    /// @notice Returns the current block gas limit
    /// @return gaslimit The block gas limit
    function getCurrentBlockGasLimit() public view returns (uint256 gaslimit) {
        gaslimit = block.gaslimit;
    }

    /// @notice Returns the current block coinbase
    /// @return coinbase The block coinbase
    function getCurrentBlockCoinbase() public view returns (address coinbase) {
        coinbase = block.coinbase;
    }

    /// @notice Returns the last block hash
    /// @return blockHash The block hash
    function getLastBlockHash() public view returns (bytes32 blockHash) {
        blockHash = blockhash(block.number - 1);
    }

    /// @notice Returns the chain id
    /// @return chainid The chain id
    function getChainId() public view returns (uint256 chainid) {
        chainid = block.chainid;
    }

    /// @notice Returns the current base fee
    /// @return basefee The base fee
    function getBasefee() public view returns (uint256 basefee) {
        basefee = block.basefee;
    }

    /// @notice Returns the balance of an address
    /// @param addr The address
    /// @return balance The balance
    function getEthBalance(address addr) public view returns (uint256 balance) {
        balance = addr.balance;
    }

    /// @notice Returns the hash of a block
    /// @param blockNumber The block number
    /// @return blockHash The block hash
    function getBlockHash(uint256 blockNumber) public view returns (bytes32 blockHash) {
        blockHash = blockhash(blockNumber);
    }
}


