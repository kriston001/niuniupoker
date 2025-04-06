"use client";

import Card from "./Card";

// 牌型枚举
enum CardType {
  NONE = 0,
  NO_BULL = 1,
  BULL_1 = 2,
  BULL_2 = 3,
  BULL_3 = 4,
  BULL_4 = 5,
  BULL_5 = 6,
  BULL_6 = 7,
  BULL_7 = 8,
  BULL_8 = 9,
  BULL_9 = 10,
  BULL_BULL = 11,
  FIVE_BOMB = 12,
  FIVE_SMALL = 13,
  FIVE_FLOWERS = 14
}

// 获取牌型名称
const getCardTypeName = (cardType: number) => {
  switch (cardType) {
    case CardType.NONE: return "无牌型";
    case CardType.NO_BULL: return "没牛";
    case CardType.BULL_1: return "牛一";
    case CardType.BULL_2: return "牛二";
    case CardType.BULL_3: return "牛三";
    case CardType.BULL_4: return "牛四";
    case CardType.BULL_5: return "牛五";
    case CardType.BULL_6: return "牛六";
    case CardType.BULL_7: return "牛七";
    case CardType.BULL_8: return "牛八";
    case CardType.BULL_9: return "牛九";
    case CardType.BULL_BULL: return "牛牛";
    case CardType.FIVE_BOMB: return "五炸";
    case CardType.FIVE_SMALL: return "五小";
    case CardType.FIVE_FLOWERS: return "五花";
    default: return "未知";
  }
};

interface PlayerCardsProps {
  cards: number[];
  cardType: number;
  isCurrentPlayer?: boolean;
  size?: "sm" | "md" | "lg";
}

const PlayerCards = ({ cards = [0, 0, 0, 0, 0], cardType = CardType.NONE, isCurrentPlayer = false, size = "md" }: PlayerCardsProps) => {
  return (
    <div className={`${isCurrentPlayer ? 'bg-base-200' : ''} rounded-box p-4`}>
      <div className="flex flex-wrap gap-2 justify-center mb-2">
        {cards.map((card, index) => (
          <Card key={index} value={card} size={size} />
        ))}
      </div>
      <div className="text-center">
        <p className={`font-bold ${size === 'sm' ? 'text-sm' : 'text-lg'}`}>
          牌型: {getCardTypeName(cardType)}
        </p>
      </div>
    </div>
  );
};

export default PlayerCards;