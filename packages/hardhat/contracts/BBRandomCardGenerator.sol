// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title RandomCardGenerator
 * @dev 随机牌生成工具
 */
library BBRandomCardGenerator {
    /**
     * @dev 生成第一轮牌（3张）
     */
    function generateFirstCards(uint256 seed, address player) internal pure returns (uint8[3] memory) {
        uint8[3] memory cards;
        uint256 hash = uint256(keccak256(abi.encodePacked(seed, player)));
        
        for (uint8 i = 0; i < 3; i++) {
            hash = uint256(keccak256(abi.encodePacked(hash, i)));
            // 生成1-52的牌
            cards[i] = uint8((hash % 52) + 1);
            
            // 确保不重复
            for (uint8 j = 0; j < i; j++) {
                if (cards[j] == cards[i]) {
                    i--;
                    break;
                }
            }
        }
        
        return cards;
    }
    
    /**
     * @dev 生成第二轮牌（2张），确保与第一轮牌不重复
     */
    function generateSecondCards(uint256 seed, address player, uint8[3] memory firstCards) internal pure returns (uint8[2] memory) {
        uint8[2] memory cards;
        uint256 hash = uint256(keccak256(abi.encodePacked(seed, player, "second")));
        
        for (uint8 i = 0; i < 2; i++) {
            hash = uint256(keccak256(abi.encodePacked(hash, i)));
            // 生成1-52的牌
            cards[i] = uint8((hash % 52) + 1);
            
            // 确保不与第一轮牌重复
            bool duplicate;
            do {
                duplicate = false;
                for (uint8 j = 0; j < 3; j++) {
                    if (firstCards[j] == cards[i]) {
                        duplicate = true;
                        hash = uint256(keccak256(abi.encodePacked(hash, "retry")));
                        cards[i] = uint8((hash % 52) + 1);
                        break;
                    }
                }
                
                // 确保不与第二轮已发的牌重复
                for (uint8 j = 0; j < i; j++) {
                    if (cards[j] == cards[i]) {
                        duplicate = true;
                        hash = uint256(keccak256(abi.encodePacked(hash, "retry")));
                        cards[i] = uint8((hash % 52) + 1);
                        break;
                    }
                }
            } while (duplicate);
        }
        
        return cards;
    }
}