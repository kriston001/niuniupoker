import { HandResultDisplay } from "@/components/hand-result-display";
import { CardSuit, CardValue, PokerCard } from "@/components/poker-card";
import { convertCardNumber, getPlayerGameStateName, truncateAddress } from "@/lib/utils";
import { CardType, GameState, GameTable, Player, PlayerState } from "@/types/game-types";
import { Button } from "~~/components/ui/button";
import { UserX } from "lucide-react";

export function PlayerInfo({
  tableInfo,
  player,
  isBanker,
  isSelf,
  showKickButton,
  onKickPlayer,
}: {
  tableInfo: GameTable;
  player: Player;
  isBanker: boolean;
  isSelf: boolean;
  showKickButton: boolean;
  onKickPlayer?: (playerAddress: `0x${string}`) => void;
}) {
  return (
    <div>
      {/* Hand result display with visual effects */}
      {player.cardType != CardType.NONE && (
        <HandResultDisplay result={player.cardType} className="translate-y-[-3rem]" />
      )}

      {/* Winner animation */}
      {player.isWinner && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-yellow-300/30 to-amber-500/30 rounded-lg"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-50">
            <div className="animate-bounce flex flex-col items-center">
              <div className="text-yellow-300 text-2xl font-bold drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]">
                WINNER!
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="animate-spin-slow text-2xl"
                    style={{ 
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: `${1.5 + i * 0.2}s`
                    }}
                  >
                    ✨
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-firework"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ready indicator */}
      {getPlayerGameStateName(tableInfo, player) !== "" && getPlayerGameStateName(tableInfo, player) !== "Folded" && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 px-4 py-1.5 rounded-full backdrop-blur-sm font-bold text-lg transition-all duration-500 text-emerald-300 bg-emerald-900/40 shadow-[0_0_15px_rgba(16,185,129,0.5)] translate-y-[-3rem]">
          {getPlayerGameStateName(tableInfo, player)}
        </div>
      )}

      <div
        className={`
                          relative rounded-lg p-2 text-center
                          ${player.state === PlayerState.FOLDED ? "opacity-80" : ""}
                          ${isSelf ? "bg-zinc-800/80 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "bg-zinc-800/50"}
                          backdrop-blur-sm transition-all duration-300
                        `}
      >
        {/* Player info */}
        <div className="text-sm font-medium text-white truncate mb-2">{truncateAddress(player.addr)}</div>

        {/* Kick player button - only shown when table is in WAITING state and current user is banker */}
        {showKickButton && (
          <Button 
            variant="destructive" 
            size="lg" 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 py-0 h-8 text-xs flex items-center z-50"
            onClick={() => onKickPlayer?.(player.addr)}
          >
            <UserX className="h-3 w-3 mr-1" />
            Kick Player
          </Button>
        )}

        {/* Player cards */}
        {player.cards ? (
          <div className="mt-1 h-20 relative pl-2.5">
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
            {player.state !== PlayerState.FOLDED &&
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
        {player.state === PlayerState.FOLDED && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 font-bold text-2xl transform rotate-[-15deg] z-50 bg-black/50 px-4 py-2 rounded-lg shadow-lg">
            FOLDED
          </span>
        )}
      </div>
    </div>
  );
}
