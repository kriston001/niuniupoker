"use client";

import { useEffect, useRef, useState } from "react";
import { use } from "react";
import { useParams } from "next/navigation";
import { CountdownTimer } from "@/components/countdown-timer";
import { HandResultDisplay } from "@/components/hand-result-display";
import { TableInfo } from "@/components/niuniu/table/table-info";
import { PokerCard } from "@/components/poker-card";
import { PokerHand } from "@/components/poker-hand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { truncateAddress } from "@/lib/utils";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Gift,
  Info,
  MessageSquare,
  MinusCircle,
  PhoneCall,
  PlayCircle,
  RefreshCw,
  Send,
  Shuffle,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { BankerControlsPanel } from "~~/components/niuniu/table/banker-controls-panel";
import { ChatPanel } from "~~/components/niuniu/table/chat-panel";
import { PlayerInfo } from "~~/components/niuniu/table/player-info";
import { useGameTableData } from "~~/hooks/my-hooks/useGameTableData";
import { CardType } from "~~/types/game-types";

// Sample table data
const tableData = {
  id: "table-123",
  name: "High Rollers VIP",
  dealerAddress: "0x1234567890abcdef1234567890abcdef12345678",
  betAmount: 0.5,
  currentPlayers: 5,
  maxPlayers: 6,
  status: "active",
  reward: 5,
  createdAt: "2024-04-17T08:27:59.000Z",
  round: 3,
  pot: 2.5,
  timeRemaining: 45, // seconds
  rewardInfo: "High Roller",
  totalPool: 500,
  perWinPayout: 10,
  winRate: 20,
  gamesPlayed: 152,
  settlements: 48,
  allPlayersReady: false,
};

// Sample room cards data with poker hands
const roomCards = [
  {
    id: "RC-001",
    name: "Gold Room Card",
    maxPlayers: 6,
    quantity: 2,
    hand: [
      { suit: "hearts", value: "A" },
      { suit: "hearts", value: "K" },
      { suit: "hearts", value: "Q" },
      { suit: "hearts", value: "J" },
      { suit: "hearts", value: "10" },
    ],
  },
  {
    id: "RC-002",
    name: "Diamond Room Card",
    maxPlayers: 8,
    quantity: 1,
    hand: [
      { suit: "spades", value: "A" },
      { suit: "spades", value: "A" },
      { suit: "hearts", value: "A" },
      { suit: "diamonds", value: "A" },
      { suit: "clubs", value: "K" },
    ],
  },
  {
    id: "RC-003",
    name: "Platinum Room Card",
    maxPlayers: 4,
    quantity: 3,
    hand: [
      { suit: "clubs", value: "10" },
      { suit: "clubs", value: "J" },
      { suit: "clubs", value: "Q" },
      { suit: "clubs", value: "K" },
      { suit: "clubs", value: "A" },
    ],
  },
  {
    id: "RC-004",
    name: "VIP Room Card",
    maxPlayers: 10,
    quantity: 1,
    hand: [
      { suit: "diamonds", value: "7" },
      { suit: "diamonds", value: "8" },
      { suit: "diamonds", value: "9" },
      { suit: "diamonds", value: "10" },
      { suit: "diamonds", value: "J" },
    ],
  },
];

// Card mapping helper
const cardValueMap: Record<number, any> = {
  1: { value: "A", suit: "spades" },
  2: { value: "2", suit: "hearts" },
  3: { value: "3", suit: "diamonds" },
  4: { value: "4", suit: "clubs" },
  5: { value: "5", suit: "spades" },
  6: { value: "6", suit: "hearts" },
  7: { value: "7", suit: "diamonds" },
  8: { value: "8", suit: "clubs" },
  9: { value: "9", suit: "spades" },
  10: { value: "10", suit: "hearts" },
  11: { value: "J", suit: "diamonds" },
  12: { value: "Q", suit: "clubs" },
  13: { value: "K", suit: "spades" },
};

// Sample players data
const playersData = [
  {
    id: 1,
    name: "Player 1",
    addr: "0x1234...5678",
    chips: 2.8,
    betAmount: 0.5,
    status: "ready",
    position: 0, // 正上方位置
    cards: [7, 8, 9, 10, 36],
    cardType: CardType.BULL_9,
    isDealer: true,
  },
  {
    id: 2,
    name: "Player 2",
    addr: "0xabcd...ef12",
    chips: 1.5,
    betAmount: 0.5,
    status: "ready",
    position: 1, // 右上方位置
    cards: [2, 3, 4, 5, 6],
    cardType: CardType.BULL_8,
    isDealer: false,
  },
  {
    id: 3,
    name: "Player 3",
    addr: "0x7890...abcd",
    chips: 3.2,
    betAmount: 0.5,
    status: "ready",
    position: 2, // 右下方位置
    cards: [1, 2, 44, 4, 5],
    cardType: CardType.BULL_3,
    isDealer: false,
  },
  {
    id: 4,
    name: "Player 4",
    addr: "0xdef1...2345",
    chips: 0.8,
    betAmount: 0.5,
    status: "thinking",
    position: 3, // 正下方位置
    cards: [9, 10, 26, 12, 13],
    cardType: CardType.BULL_9,
    isDealer: false,
  },
  {
    id: 5,
    name: "Player 5",
    addr: "0x5678...9012",
    chips: 1.2,
    betAmount: 0.5,
    status: "ready",
    position: 4, // 左下方位置
    cards: [3, 4, 5, 6, 7],
    cardType: CardType.BULL_5,
    isDealer: false,
  },
  {
    id: 6,
    name: "Player 6",
    addr: "0x9012...3456",
    chips: 1.8,
    betAmount: 0.5,
    status: "ready",
    position: 5, // 左上方位置
    cards: [8, 9, 10, 11, 12],
    cardType: CardType.BULL_7,
    isDealer: false,
  },
];

// Sample action log
const actionLog = [
  { id: 1, player: "Player 1", action: "started the game", timestamp: "08:28:15" },
  { id: 2, player: "Player 2", action: "joined the table", timestamp: "08:28:30" },
  { id: 3, player: "Player 3", action: "joined the table", timestamp: "08:28:45" },
  { id: 4, player: "Player 4", action: "joined the table", timestamp: "08:29:00" },
  { id: 5, player: "Player 5", action: "joined the table", timestamp: "08:29:15" },
  { id: 6, player: "Player 1", action: "dealt the cards", timestamp: "08:30:00" },
  { id: 7, player: "Player 2", action: "is ready", timestamp: "08:30:15" },
  { id: 8, player: "Player 3", action: "is ready", timestamp: "08:30:30" },
  { id: 9, player: "Player 5", action: "folded", timestamp: "08:30:45" },
  { id: 10, player: "Player 1", action: "revealed Niu 9", timestamp: "08:31:00" },
  { id: 11, player: "Player 2", action: "revealed Niu 5", timestamp: "08:31:15" },
];

export default function TableDetail({ params }: { params: Promise<{ addr: string }> }) {
  const resolvedParams = use(params);

  const [isDealer, setIsDealer] = useState(true); // For demo purposes
  const [currentPlayer, setCurrentPlayer] = useState(playersData[0]);
  const [gamePhase, setGamePhase] = useState("waiting"); // waiting, betting, dealing, revealing, settling
  const [timeRemaining, setTimeRemaining] = useState(tableData.timeRemaining);
  const [selectedRoomCard, setSelectedRoomCard] = useState<string | undefined>(undefined);
  const [tableReady, setTableReady] = useState(false);

  const { address: connectedAddress } = useAccount();

  console.log("ddd: ", connectedAddress, resolvedParams.addr);

  const { playerData, allPlayers, tableInfo, refreshData } = useGameTableData({
    refreshInterval: 0,
    tableAddress: resolvedParams.addr,
    playerAddress: connectedAddress,
  });

  // Get current user (for demo, we'll assume player 1)
  useEffect(() => {
    const player = playersData.find(p => p.id === 1);
    if (player) {
      setCurrentPlayer(player);
      setIsDealer(player.isDealer);
    }

    // Check if all players are ready
    const allReady = playersData.filter(p => p.status === "ready").length >= 3;
    setTableReady(allReady);
  }, []);

  // Handle timer completion
  const handleTimerComplete = () => {
    console.log("Time's up!");
    // Here you would handle what happens when the timer runs out
  };

  // Handle start game
  const handleStartGame = () => {
    setGamePhase("betting");
    console.log("Game started with room card:", selectedRoomCard);
  };

  // 计算最优玩家位置的函数
  const calculateOptimalPositions = (playerCount: number, currentPlayerIndex: number) => {
    let basePositions: number[] = [];

    // 修改基础位置计算，确保对称性
    switch (playerCount) {
      case 1:
        basePositions = [180];
        break;
      case 2:
        basePositions = [180, 0];
        break;
      case 3:
        basePositions = [180, 300, 60];
        break;
      case 4:
        basePositions = [180, 270, 0, 90];
        break;
      case 5:
        basePositions = [180, 252, 324, 36, 108];
        break;
      case 6:
        // 修改六人位置，确保完全对称
        basePositions = [180, 230, 300, 0, 60, 120];
        break;
      default:
        return [];
    }

    // 根据当前玩家位置旋转整个布局
    if (currentPlayerIndex > 0) {
      const rotation = basePositions[currentPlayerIndex] - 180;
      return basePositions.map(angle => (360 + angle - rotation) % 360);
    }

    return basePositions;
  };

  return (
    <div className="min-h-screen">
      {/* 移除 container 类，让内容可以充分利用屏幕宽度 */}
      <div className="px-6 py-6">
        <div className="flex items-center mb-6 max-w-[1920px] mx-auto">
          <Button variant="ghost" className="p-0 h-8 w-8" asChild>
            <a href="/">
              <ArrowLeft className="h-5 w-5 text-zinc-400" />
            </a>
          </Button>
          <h1 className="text-xl font-bold text-white ml-2">Table: {tableData.name}</h1>
          <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 ml-3">Active</Badge>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-[1920px] mx-auto">
          {/* Left sidebar - Table info and action log */}
          <div className="w-full lg:w-1/5">
            {tableInfo && <TableInfo tableInfo={tableInfo} />}
            <ChatPanel />
          </div>

          {/* Middle - Poker table */}
          <div className="w-full lg:w-3/5">
            <div
              className="relative bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden"
              style={{ height: "calc(100vh - 200px)" }}
            >
              {/* Table background */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 z-0"></div>

              {/* Poker table */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[75%] bg-gradient-to-br from-emerald-900/80 to-emerald-800/80 rounded-[50%] border-8 border-zinc-700 shadow-lg z-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] h-[90%] rounded-[50%] border-2 border-emerald-600/30"></div>

                {/* Table center info */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20">
                  <div className="text-white font-bold text-2xl mb-2">{tableData.name}</div>
                  <div className="text-amber-500 font-bold text-3xl">{tableData.pot} ETH</div>
                  <div className="text-zinc-400 text-lg mt-2">Round {tableData.round}</div>

                  {/* Countdown Timer - only show when game is active */}
                  {gamePhase !== "waiting" && (
                    <div className="mt-6">
                      <CountdownTimer
                        initialSeconds={tableData.timeRemaining}
                        onComplete={handleTimerComplete}
                        className="bg-black/30 backdrop-blur-sm rounded-full px-8 py-3 text-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Players around the table - with enhanced card display */}
              {playersData.map((player, index) => {
                const currentPlayerIndex = playersData.findIndex(p => p.addr === connectedAddress);
                const positions = calculateOptimalPositions(playersData.length, currentPlayerIndex);
                const angle = (positions[index] - 90) * (Math.PI / 180);

                // 调整半径和位置偏移
                const radius = 38;
                let offsetY = 0;

                // 简化位置调整逻辑，只保留上下偏移
                if (angle > Math.PI * 0.7 && angle < Math.PI * 1.3) {
                  // 底部玩家，向上偏移
                  offsetY = -5;
                } else if (angle < Math.PI * 0.3 || angle > Math.PI * 1.7) {
                  // 顶部玩家，向下偏移
                  offsetY = 5;
                }

                const left = 50 + radius * Math.cos(angle);
                const top = 50 + radius * Math.sin(angle) + offsetY;

                return (
                  <div
                    key={player.id}
                    className="absolute w-[200px] z-20 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                    }}
                  >
                    <PlayerInfo player={player} isBanker={player.isDealer} isSelf={player.addr === connectedAddress} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar - Game controls */}
          <div className="w-full lg:w-1/5">
            {tableInfo && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Owner Controls</h3>
                <div className="space-y-6">
                  <BankerControlsPanel tableInfo={tableInfo} />
                </div>
              </div>
            )}

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Game Controls</h3>

              {/* Player actions */}
              <div className="space-y-6">
                {/* Betting controls */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-zinc-400">Betting</h4>
                  <div className="flex flex-col gap-3">
                    <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                      <Coins className="mr-2 h-5 w-5" />
                      Bet 0.1 ETH
                    </Button>
                    <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                      <Coins className="mr-2 h-5 w-5" />
                      Bet 0.5 ETH
                    </Button>
                    <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                      <Coins className="mr-2 h-5 w-5" />
                      Bet 1.0 ETH
                    </Button>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                {/* Game actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-zinc-400">Actions</h4>
                  <div className="flex flex-col gap-3">
                    <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white">
                      <X className="mr-2 h-5 w-5" />
                      Fold
                    </Button>

                    {/* Dealer actions */}
                    {isDealer && gamePhase !== "waiting" && (
                      <>
                        <Button size="lg" className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">
                          <ChevronRight className="mr-2 h-5 w-5" />
                          Next Step
                        </Button>
                        <Button size="lg" className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">
                          <Ban className="mr-2 h-5 w-5" />
                          Kick Player
                        </Button>
                        <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                          <Trophy className="mr-2 h-5 w-5" />
                          Settle Game
                        </Button>
                        <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                          <RefreshCw className="mr-2 h-5 w-5" />
                          Play Again
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
