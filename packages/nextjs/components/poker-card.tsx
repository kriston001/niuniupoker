import type React from "react";
import { cn } from "@/lib/utils";

export type CardSuit = "spades" | "hearts" | "diamonds" | "clubs";
export type CardValue = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface PokerCardProps {
  suit: CardSuit;
  value: CardValue;
  hidden?: boolean;
  small?: boolean;
  className?: string;
  style?: React.CSSProperties;
  large?: boolean;
}

export function PokerCard({
  suit,
  value,
  hidden = false,
  small = false,
  large = false,
  className,
  style,
}: PokerCardProps) {
  // Determine color based on suit
  const isRed = suit === "hearts" || suit === "diamonds";
  const textColor = isRed ? "text-red-500" : "text-zinc-900"; // 改为深灰色而不是白色

  // Get suit symbol
  const getSuitSymbol = (suit: CardSuit) => {
    switch (suit) {
      case "spades":
        return "♠";
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
    }
  };

  const suitSymbol = getSuitSymbol(suit);

  if (hidden) {
    return (
      <div
        className={cn(
          "relative rounded-md overflow-hidden flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-600 shadow-md",
          small ? "w-8 h-12" : large ? "w-24 h-32" : "w-16 h-20",
          className,
        )}
        style={style}
      >
        <div className="absolute inset-0 bg-zinc-800 opacity-90"></div>
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center">
            <div className="w-1/2 h-1/2 rounded-full bg-zinc-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-md overflow-hidden flex flex-col bg-zinc-900 border border-zinc-700 shadow-md",
        small ? "w-8 h-12 p-0.5" : large ? "w-24 h-32 p-3" : "w-16 h-20 p-2",
        className,
      )}
      style={style}
    >
      <div className="absolute inset-0 bg-white opacity-90"></div>
      <div className={cn("relative flex justify-between items-start gap-1", textColor)}>
        <span className={cn("font-bold", small ? "text-sm" : large ? "text-2xl" : "text-lg")}>{value}</span>
        <span className={cn("", small ? "text-sm" : large ? "text-2xl" : "text-lg")}>{suitSymbol}</span>
      </div>
      <div className={cn("relative flex-grow flex items-center justify-center my-1", textColor)}>
        <span className={cn("", small ? "text-2xl" : large ? "text-6xl" : "text-4xl")}>{suitSymbol}</span>
      </div>
      <div className={cn("relative flex justify-between items-end gap-1 rotate-180", textColor)}>
        <span className={cn("font-bold", small ? "text-sm" : large ? "text-2xl" : "text-lg")}>{value}</span>
        <span className={cn("", small ? "text-sm" : large ? "text-2xl" : "text-lg")}>{suitSymbol}</span>
      </div>
    </div>
  );
}


