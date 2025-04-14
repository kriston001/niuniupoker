// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BBTypes.sol";
import "./BBVersion.sol";

/**
 * @title CardUtils
 * @dev 牌型计算和比较的工具库
 */
library BBCardUtils {
    // 使用集中版本管理
    function getVersion() public pure returns (string memory) {
        return BBVersion.VERSION;
    }
    using BBTypes for BBTypes.CardType;

    /**
     * @dev 合并两轮牌
     */
    function combineCards(uint8[3] memory firstCards, uint8[2] memory secondCards) internal pure returns (uint8[5] memory) {
        uint8[5] memory allCards;

        for (uint8 i = 0; i < 3; i++) {
            allCards[i] = firstCards[i];
        }

        for (uint8 i = 0; i < 2; i++) {
            allCards[i + 3] = secondCards[i];
        }

        return allCards;
    }

    /**
     * @dev 计算牌型
     */
    function calculateCardType(uint8[5] memory cards) internal pure returns (BBTypes.CardType) {
        // 检查是否有无效牌（0表示无效牌）
        for (uint8 i = 0; i < 5; i++) {
            if (cards[i] == 0) {
                return BBTypes.CardType.NONE;
            }
        }
        
        // 转换牌面值（1-13）和花色（0-3）
        uint8[5] memory values;
        for (uint8 i = 0; i < 5; i++) {
            values[i] = ((cards[i] - 1) % 13) + 1;
        }

        // 检查特殊牌型
        if (isFiveFlower(values)) {
            return BBTypes.CardType.FIVE_FLOWERS;
        }
        
        if (isFiveBomb(values)) {
            return BBTypes.CardType.FIVE_BOMB;
        }

        if (isFiveSmall(values)) {
            return BBTypes.CardType.FIVE_SMALL;
        }

        // 计算牛牛牌型
        return calculateBullType(values);
    }

    /**
     * @dev 检查是否是五花牛（5张牌都是JQK）
     */
    function isFiveFlower(uint8[5] memory values) internal pure returns (bool) {
        for (uint8 i = 0; i < 5; i++) {
            if (values[i] < 11) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev 检查是否是炸弹牛（4张相同点数）
     */
    function isFiveBomb(uint8[5] memory values) internal pure returns (bool) {
        // 统计每个点数出现的次数
        uint8[14] memory counts;

        for (uint8 i = 0; i < 5; i++) {
            counts[values[i]]++;
        }

        // 检查是否有点数出现4次
        for (uint8 i = 1; i <= 13; i++) {
            if (counts[i] == 4) {
                return true;
            }
        }

        return false;
    }

    /**
     * @dev 检查是否是五小牛（5张牌点数和小于等于10）
     */
    function isFiveSmall(uint8[5] memory values) internal pure returns (bool) {
        uint8 sum = 0;

        for (uint8 i = 0; i < 5; i++) {
            // J、Q、K的点数都按10计算
            uint8 value = values[i] > 10 ? 10 : values[i];
            sum += value;
        }

        return sum <= 10;
    }

    /**
     * @dev 计算有牛牌型
     */
    function calculateBullType(uint8[5] memory values) internal pure returns (BBTypes.CardType) {
        // 转换点数（J、Q、K都按10计算）
        uint8[5] memory points;
        uint8 sum = 0;

        for (uint8 i = 0; i < 5; i++) {
            points[i] = values[i] > 10 ? 10 : values[i];
            sum += points[i];
        }

        // 尝试所有可能的3张牌组合，看是否能凑成10的倍数
        for (uint8 i = 0; i < 3; i++) {
            for (uint8 j = i + 1; j < 4; j++) {
                for (uint8 k = j + 1; k < 5; k++) {
                    uint8 threeSum = points[i] + points[j] + points[k];

                    if (threeSum % 10 == 0) {
                        // 找到一个有效组合，计算剩余两张牌的点数和
                        uint8 remainingSum = sum - threeSum;
                        uint8 remainder = remainingSum % 10;

                        if (remainder == 0) {
                            return BBTypes.CardType.BULL_BULL;
                        } else {
                            // 返回对应的牛几，需要加1来对应正确的枚举值
                            return BBTypes.CardType(remainder + 1);
                        }
                    }
                }
            }
        }

        // 没有找到有效组合，返回无牛
        return BBTypes.CardType.NO_BULL;
    }

    /**
     * @dev 比较两个牌型的大小
     * @return 1 如果cardType1大于cardType2，0 如果相等，-1 如果cardType1小于cardType2
     */
    function compareCardType(BBTypes.CardType cardType1, BBTypes.CardType cardType2) internal pure returns (int8) {
        if (uint8(cardType1) > uint8(cardType2)) {
            return 1;
        } else if (uint8(cardType1) < uint8(cardType2)) {
            return -1;
        } else {
            return 0;
        }
    }
}
