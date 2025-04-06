"use client";

interface CardProps {
  value: number;
  size?: "sm" | "md" | "lg";
}

const Card = ({ value, size = "md" }: CardProps) => {
  // 尺寸类
  const sizeClasses = {
    sm: "w-10 h-14 text-xs",
    md: "w-16 h-24 text-base",
    lg: "w-20 h-32 text-lg"
  };

  // 如果卡牌值为0，显示背面
  if (value === 0) {
    return (
      <div className={`${sizeClasses[size]} bg-base-300 rounded-lg flex items-center justify-center shadow-md`}>
        <span className="text-base-content/70 font-bold">?</span>
      </div>
    );
  }

  // 计算牌面值和花色
  const suit = Math.floor((value - 1) / 13);
  const rank = (value - 1) % 13 + 1;

  // 花色符号
  const suitSymbols = ["♠", "♥", "♣", "♦"];
  const suitSymbol = suitSymbols[suit];
  const isRed = suit === 1 || suit === 3;

  // 牌面值
  let rankDisplay = rank.toString();
  if (rank === 1) rankDisplay = "A";
  if (rank === 11) rankDisplay = "J";
  if (rank === 12) rankDisplay = "Q";
  if (rank === 13) rankDisplay = "K";

  return (
    <div className={`${sizeClasses[size]} bg-white rounded-lg flex flex-col items-center justify-center border border-gray-300 shadow-md relative overflow-hidden`}>
      <div className="absolute top-1 left-1">
        <div className={`text-sm font-bold ${isRed ? "text-red-600" : "text-black"}`}>{rankDisplay}</div>
        <div className={`text-sm ${isRed ? "text-red-600" : "text-black"}`}>{suitSymbol}</div>
      </div>
      <div className={`text-2xl ${isRed ? "text-red-600" : "text-black"}`}>{suitSymbol}</div>
      <div className="absolute bottom-1 right-1 rotate-180">
        <div className={`text-sm font-bold ${isRed ? "text-red-600" : "text-black"}`}>{rankDisplay}</div>
        <div className={`text-sm ${isRed ? "text-red-600" : "text-black"}`}>{suitSymbol}</div>
      </div>
    </div>
  );
};

export default Card;