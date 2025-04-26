// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library SafeMath {
    // Safe increment for any uint type
    function increment(uint value) internal pure returns (uint) {
        unchecked {
            uint result = value + 1;
            require(result > value, "SafeMath: increment overflow");
            return result;
        }
    }

    // Safe decrement for any uint type
    function decrement(uint value) internal pure returns (uint) {
        require(value > 0, "SafeMath: decrement underflow");
        return value - 1;
    }

    // Safe addition for any uint type
    function add(uint a, uint b) internal pure returns (uint) {
        uint result = a + b;
        require(result >= a, "SafeMath: addition overflow");
        return result;
    }

    // Safe subtraction for any uint type
    function sub(uint a, uint b) internal pure returns (uint) {
        require(b <= a, "SafeMath: subtraction underflow");
        return a - b;
    }
}
