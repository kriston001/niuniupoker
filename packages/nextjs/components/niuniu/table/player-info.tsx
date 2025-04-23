import { HandResultDisplay } from "@/components/hand-result-display";
import { CardSuit, CardValue, PokerCard } from "@/components/poker-card";
import { convertCardNumber, truncateAddress } from "@/lib/utils";
import { CardType, Player, PlayerState } from "@/types/game-types";

export function PlayerInfo({ player, isBanker, isSelf }: { player: Player; isBanker: boolean; isSelf: boolean }) {
  return (
    <div>
      {/* Hand result display with visual effects */}
      {player.cardType != CardType.NONE && (
        <HandResultDisplay result={player.cardType} className="translate-y-[-3rem]" />
      )}

      {/* Ready indicator */}
      {player.state === PlayerState.READY && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 px-4 py-1.5 rounded-full backdrop-blur-sm font-bold text-lg transition-all duration-500 text-emerald-300 bg-emerald-900/40 shadow-[0_0_15px_rgba(16,185,129,0.5)] translate-y-[-3rem]">
          Ready
        </div>
      )}

      <div
        className={`
                          relative rounded-lg p-2 text-center
                          ${player.state === PlayerState.FIRST_FOLDED || player.state === PlayerState.SECOND_FOLDED ? "opacity-50" : ""}
                          ${isSelf ? "bg-zinc-800/80 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-zinc-800/50"}
                          backdrop-blur-sm transition-all duration-300
                        `}
      >
        {/* Player info */}
        <div className="text-sm font-medium text-white truncate mb-2">{truncateAddress(player.addr)}</div>

        {/* Player cards */}
        {player.cards ? (
          <div className="mt-1 h-20 relative">
            <div className="flex justify-center relative h-full">
              {player.cards.map((cardValue, cardIndex) => {
                const card = convertCardNumber(cardValue);
                return (
                  <PokerCard
                    key={cardIndex}
                    hidden={cardValue === 0}
                    suit={card.suit as CardSuit}
                    value={card.value as CardValue}
                    className="absolute transition-all duration-200 hover:translate-y-[-5px]"
                    style={{
                      left: `${cardIndex * 24}px`,
                      transform: `rotate(${(cardIndex - Math.floor(player.cards.length / 2)) * 5}deg)`,
                      transformOrigin: "bottom center",
                      zIndex: cardIndex,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex justify-center relative h-20">
            {player.state !== PlayerState.FIRST_FOLDED &&
              player.state !== PlayerState.SECOND_FOLDED &&
              Array(5)
                .fill(0)
                .map((_, cardIndex) => (
                  <PokerCard
                    key={cardIndex}
                    suit="spades"
                    value="A"
                    hidden
                    className="absolute"
                    style={{
                      left: `${cardIndex * 20}px`,
                      transform: `rotate(${(cardIndex - 2) * 8}deg)`,
                      transformOrigin: "bottom center",
                      zIndex: cardIndex,
                    }}
                  />
                ))}
          </div>
        )}

        {/* Dealer indicator */}
        {isBanker && (
          <div className="absolute -top-1 -right-1 px-2 h-5 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center border border-zinc-800">
            Owner
          </div>
        )}

        {/* Folded indicator */}
        {(player.state === PlayerState.FIRST_FOLDED || player.state === PlayerState.SECOND_FOLDED) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
            <span className="text-red-400 font-medium">Folded</span>
          </div>
        )}
      </div>
    </div>
  );
}
