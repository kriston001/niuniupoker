import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, MinusCircle, PlayCircle, Send } from "lucide-react";
import { GameState, GameTable } from "~~/types/game-types";

export function BankerControlsPanel({ tableInfo }: { tableInfo: GameTable }) {
  const [selectedRoomCard, setSelectedRoomCard] = useState<string | undefined>(undefined);
  const roomCards = [
    {
      id: "RC-001",
      name: "Gold Room Card",
      maxPlayers: 6,
      quantity: 2,
    },
    {
      id: "RC-002",
      name: "Diamond Room Card",
      maxPlayers: 8,
      quantity: 1,
    },
    {
      id: "RC-003",
      name: "Platinum Room Card",
      maxPlayers: 4,
      quantity: 3,
    },
    {
      id: "RC-004",
      name: "VIP Room Card",
      maxPlayers: 10,
      quantity: 1,
    },
  ];

  function tableIsReady(tableInfo: GameTable) {
    return (
      tableInfo.state == GameState.WAITING &&
      tableInfo.playerReadyCount == tableInfo.playerCount &&
      tableInfo.playerCount >= 2
    );
  }

  const [tableReady] = useState(tableIsReady(tableInfo));

  function handleStartGame() {
    console.log("Game started with room card:", selectedRoomCard);
  }

  return (
    <div>
      <div>
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <label className="text-sm text-zinc-400 block mb-2">Select Room Card</label>
            <Select value={selectedRoomCard} onValueChange={setSelectedRoomCard}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-10">
                <SelectValue placeholder="Select room card">
                  {selectedRoomCard &&
                    roomCards.map(
                      card =>
                        card.id === selectedRoomCard && (
                          <div key={card.id} className="flex items-center justify-between w-full">
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium text-amber-400">{card.name}</span>
                              <span className="text-xs text-zinc-400">Max {card.maxPlayers} players</span>
                            </div>
                          </div>
                        ),
                    )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {roomCards.map(card => (
                  <SelectItem key={card.id} value={card.id} className="text-white focus:bg-zinc-800 focus:text-white">
                    <div className="flex items-center justify-between w-full py-1 pr-4">
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-amber-400">{card.name}</span>
                        <span className="text-xs text-zinc-400">Max {card.maxPlayers} players</span>
                      </div>
                      {card.quantity > 0 && (
                        <span className="text-xs text-amber-500 absolute right-8">x{card.quantity}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium shadow-md"
            disabled={!selectedRoomCard || !tableReady}
            onClick={handleStartGame}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Start Game
          </Button>
        </div>
        {!tableReady && <p className="text-xs text-amber-500 mt-2">Waiting for more players to be ready...</p>}
      </div>
      <div></div>
    </div>
  );
}
