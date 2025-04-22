import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CardType, getCardTypeName } from "@/types/game-types";

interface HandResultDisplayProps {
  result: CardType | null;
  className?: string;
}

export function HandResultDisplay({ result, className }: HandResultDisplayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (result) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [result]);

  if (!result) return null;

  // 根据牌型确定样式
  const getHandStyles = () => {
    switch (result) {
      case CardType.NO_BULL:
        return "text-zinc-300 bg-zinc-800/70";
      case CardType.BULL_1:
      case CardType.BULL_2:
      case CardType.BULL_3:
      case CardType.BULL_4:
      case CardType.BULL_5:
        return "text-blue-300 bg-blue-900/40 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-float-small";
      case CardType.BULL_6:
      case CardType.BULL_7:
      case CardType.BULL_8:
      case CardType.BULL_9:
        return "text-amber-300 bg-amber-900/40 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse-slow animate-float";
      case CardType.BULL_BULL:
        return "bg-gradient-to-r from-purple-500 via-amber-500 to-pink-500 text-transparent bg-clip-text shadow-[0_0_30px_rgba(236,72,153,0.7)] animate-shimmer animate-float";
      case CardType.FIVE_BOMB:
        return "text-red-300 bg-red-900/40 shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse-fast animate-float";
      case CardType.FIVE_SMALL:
        return "text-emerald-300 bg-emerald-900/40 shadow-[0_0_25px_rgba(16,185,129,0.7)] animate-pulse-fast animate-float";
      case CardType.FIVE_FLOWERS:
        return "bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 text-transparent bg-clip-text shadow-[0_0_30px_rgba(236,72,153,0.7)] animate-shimmer animate-float";
      default:
        return "text-zinc-300 bg-zinc-800/70";
    }
  };

  const isSpecialType =
    result === CardType.BULL_BULL ||
    result === CardType.FIVE_BOMB ||
    result === CardType.FIVE_SMALL ||
    result === CardType.FIVE_FLOWERS;

  return (
    <div
      className={cn(
        "absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 px-4 py-1.5 rounded-full backdrop-blur-sm font-bold text-lg transition-all duration-500",
        getHandStyles(),
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {getCardTypeName(result)}
      {isSpecialType && <div className="absolute inset-0 -z-10 rounded-full animate-pulse-glow opacity-70"></div>}
    </div>
  );
}
