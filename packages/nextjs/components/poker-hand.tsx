import { PokerCard } from "./poker-card"

type CardSuit = "spades" | "hearts" | "diamonds" | "clubs"
type CardValue = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"

interface Card {
  suit: CardSuit
  value: CardValue
}

interface PokerHandProps {
  cards: Card[]
  className?: string
}

export function PokerHand({ cards, className }: PokerHandProps) {
  return (
    <div className={`relative h-28 ${className}`}>
      {cards.map((card, index) => (
        <PokerCard
          key={index}
          suit={card.suit}
          value={card.value}
          large
          className="absolute shadow-lg transition-all duration-200 hover:translate-y-[-5px]"
          style={{
            left: `${index * 35}px`,  // 增加了水平间距
            transform: `rotate(${(index - Math.floor(cards.length / 2)) * 8}deg)`,  // 从5度改为8度
            transformOrigin: "bottom center",
            zIndex: index,
          }}
        />
      ))}
    </div>
  )
}

