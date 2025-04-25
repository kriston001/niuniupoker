import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, MessageSquare, MinusCircle, PlayCircle, RefreshCw, Send, Trophy } from "lucide-react";
import { checkNext } from "~~/lib/utils";
import { GameState, GameTable } from "~~/types/game-types";

export function BankerControlsPanel({
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
  const [startMsg, setStartMsg] = useState<string | undefined>(undefined);
  const [tableReady, setTableReady] = useState(false);

  const getQuality = useCallback(
    (typeId: string) => {
      const card = myRoomCardNfts.find(card => card.nftType.id === typeId);
      return card ? card.quantity : 0;
    },
    [myRoomCardNfts],
  );

  useEffect(() => {
    // 检查桌子是否准备好
    if (
      tableInfo.state == GameState.WAITING &&
      (tableInfo.playerReadyCount < tableInfo.playerCount || tableInfo.playerCount < 2)
    ) {
      setStartMsg("Waiting for more players to be ready...");
      setTableReady(false);
      return;
    } else if (selectedRoomCardTypeId === undefined) {
      setStartMsg("Please select a room card");
      setTableReady(false);
      return;
    } else if (selectedRoomCardTypeId && getQuality(selectedRoomCardTypeId) <= 0) {
      setStartMsg("You don't have enough room cards");
      setTableReady(false);
      return;
    }
    setStartMsg(undefined);
    setTableReady(true);
  }, [selectedRoomCardTypeId, tableInfo, myRoomCardNfts, getQuality]); // 添加所有依赖项

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
            <Button
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium shadow-md"
              disabled={!tableReady}
              onClick={handleStartGame}
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Start Game
            </Button>
          </div>
          {startMsg && <p className="text-xs text-amber-500 mt-2">{startMsg}</p>}
        </div>
      )}

      {tableInfo.state != GameState.WAITING && (
        <div>
          {(() => {
            const { b, name, desc } = checkNext(tableInfo);
            return (
              <Button
                size="lg"
                disabled={!b}
                onClick={handleNext}
                className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
              >
                <ChevronRight className="mr-2 h-5 w-5" />
                {name}
                {desc && <span className="text-xs text-zinc-400">{desc}</span>}
              </Button>
            );
          })()}
        </div>
      )}
    </div>
  );
}
