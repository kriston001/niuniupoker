import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronRight, MessageSquare, MinusCircle, PlayCircle, RefreshCw, Send, Trophy } from "lucide-react";
import { formatEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { GameState, GameTable } from "~~/types/game-types";

export const BankerControlsPanel = memo(function BankerControlsPanel({
  tableInfo,
  myRoomCardNfts,
  onStartGameClick,
  onNextClick,
}: {
  tableInfo: GameTable;
  myRoomCardNfts: any[];
  onStartGameClick?: (tokenId: string) => void;
  onNextClick?: () => void;
}) {
  const [selectedRoomCardTypeId, setSelectedRoomCardTypeId] = useState<string | undefined>(undefined);
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;

  const getQuality = useCallback(
    (typeId: string) => {
      const card = myRoomCardNfts.find(card => card.nftType.id === typeId);
      return card ? card.quantity : 0;
    },
    [myRoomCardNfts],
  );

  // 4. 使用 useMemo 优化复杂计算，使用这个不会导致一直重新渲染
  const { tableReady, startMsg } = useMemo(() => {
    if (tableInfo.state !== GameState.WAITING) {
      return { tableReady: false, startMsg: undefined };
    }
    if (tableInfo.playerReadyCount < tableInfo.playerCount) {
      return { tableReady: false, startMsg: "Waiting for more players to be ready..." };
    }
    if (tableInfo.playerCount < 2) {
      return { tableReady: false, startMsg: "Need at least 2 players..." };
    }
    if (!selectedRoomCardTypeId) {
      return { tableReady: false, startMsg: "Please select a room card" };
    }
    if (getQuality(selectedRoomCardTypeId) <= 0) {
      return { tableReady: false, startMsg: "You don't have enough room cards" };
    }
    return { tableReady: true, startMsg: undefined };
  }, [tableInfo, selectedRoomCardTypeId, getQuality]);

  function handleStartGame() {
    const card = myRoomCardNfts.find(card => card.nftType.id === selectedRoomCardTypeId);
    console.log("card", card);
    onStartGameClick?.(card.tokenIds[0]);
  }

  function handleNext() {
    onNextClick?.();
  }

  return (
    <div>
      {tableInfo.state == GameState.WAITING && (
        <div>
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <label className="text-sm text-zinc-400 block mb-2">Select Room Card</label>
              <Select value={selectedRoomCardTypeId} onValueChange={setSelectedRoomCardTypeId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-10">
                  <SelectValue placeholder="Select room card">
                    {selectedRoomCardTypeId &&
                      myRoomCardNfts.map(
                        card =>
                          card.nftType.id === selectedRoomCardTypeId && (
                            <div key={card.nftType.id} className="flex items-center justify-between w-full">
                              <div className="flex flex-col items-start">
                                <span className="text-sm font-medium text-amber-400">{card.nftType.name}</span>
                                <span className="text-xs text-zinc-400">Max {card.nftType.maxPlayers} players</span>
                              </div>
                            </div>
                          ),
                      )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {myRoomCardNfts.length > 0 ? (
                    myRoomCardNfts.map(card => (
                      <SelectItem
                        key={card.nftType.id}
                        value={card.nftType.id}
                        disabled={tableInfo.playerCount > card.nftType.maxPlayers}
                        className="text-white focus:bg-zinc-800 focus:text-white"
                      >
                        <div className="flex items-center justify-between w-full py-1 pr-4">
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium text-amber-400">{card.nftType.name}</span>
                            <span className="text-xs text-zinc-400">Max {card.nftType.maxPlayers} players</span>
                          </div>
                          {card.quantity > 0 && (
                            <span className="text-xs text-amber-500 absolute right-8">x{card.quantity}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="py-3 px-2 text-center flex flex-col gap-3">
                      <span className="text-sm text-zinc-500">No room card NFTs available</span>
                      <Button
                        onClick={() => (window.location.href = "/nft")}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium"
                      >
                        Go Mint
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium shadow-md"
                    disabled={!tableReady}
                    onClick={handleStartGame}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start Game – Stake {formatEther(tableInfo.betAmount * 2n)} {symbol}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>You’ll get the stake back after the game ends.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {startMsg && <p className="text-xs text-amber-500 mt-2">{startMsg}</p>}
        </div>
      )}

      {tableInfo.state != GameState.WAITING && (
        <div>
          {(() => {
            return (
              <div className="flex flex-col gap-2">
                <Button
                  size="lg"
                  disabled={!tableInfo.canNext}
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-md border-0"
                >
                  <ChevronRight className="mr-2 h-5 w-5" />
                  {tableInfo.nextTitle}
                </Button>
                {tableInfo.nextReason && (
                  <div className="text-center text-amber-400 text-sm font-medium">{tableInfo.nextReason}</div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
});
