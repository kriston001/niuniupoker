"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useMemo } from "react";
import { CountdownTimer } from "@/components/countdown-timer";
import { TableInfo } from "@/components/niuniu/table/table-info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { BankerControlsPanel } from "~~/components/niuniu/table/banker-controls-panel";
import { ChatPanel } from "~~/components/niuniu/table/chat-panel";
import { PlayerControlsPanel } from "~~/components/niuniu/table/player-controls-panel";
import { PlayerInfo } from "~~/components/niuniu/table/player-info";
import {
  playerContinue,
  playerFold,
  playerJoin,
  playerQuit,
  playerReady,
  playerUnready,
} from "~~/contracts/abis/BBGameTableABI";
import { useGameTableData } from "~~/hooks/my-hooks/useGameTableData";
import { useWriteContractWithCallback } from "~~/hooks/useWriteContractWithCallback";
import { CardType, getGameStateName } from "~~/types/game-types";

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

export default function TableDetail({ params }: { params: Promise<{ addr: string }> }) {
  const resolvedParams = use(params);
  const tableAddr = resolvedParams.addr;

  const [isDealer, setIsDealer] = useState(true); // For demo purposes
  const [currentPlayer, setCurrentPlayer] = useState(playersData[0]);
  const [gamePhase, setGamePhase] = useState("waiting"); // waiting, betting, dealing, revealing, settling
  const [timeRemaining, setTimeRemaining] = useState(tableData.timeRemaining);
  const [selectedRoomCard, setSelectedRoomCard] = useState<string | undefined>(undefined);
  const [tableReady, setTableReady] = useState(false);

  const { address: connectedAddress } = useAccount();

  const { playerData, allPlayers, tableInfo, myRoomCardNfts, refreshData } = useGameTableData({
    refreshInterval: 0,
    tableAddress: tableAddr,
    playerAddress: connectedAddress,
  });

  const remainingSeconds = useMemo(() => {
    if (!tableInfo?.currentRoundDeadline) return 0;
    const now = Math.floor(Date.now() / 1000);
    const deadline = Number(tableInfo.currentRoundDeadline);
    return deadline > now ? deadline - now : 0;
  }, [tableInfo?.currentRoundDeadline]);

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

  const { writeContractWithCallback } = useWriteContractWithCallback();

  const handlePlayerJoin = () => {
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [playerJoin],
      functionName: "playerJoin",
      account: connectedAddress as `0x${string}`,
      onSuccess: async () => {
        console.log("✅ Join Game 成功");
        await refreshData();
      },
      onError: async err => {
        console.error("❌ Join Game 失败:", err);
      },
    });
  };

  const handlePlayerReady = () => {
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [playerReady],
      functionName: "playerReady",
      account: connectedAddress as `0x${string}`,
      value: tableInfo?.betAmount,
      onSuccess: async () => {
        console.log("✅ Player Ready 成功");
        await refreshData();
      },
      onError: async err => {
        console.error("❌ Player Ready 失败:", err);
      },
    });
  };

  const handlePlayerUnready = () => {
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [playerUnready],
      functionName: "playerUnready",
      account: connectedAddress as `0x${string}`,
      onSuccess: async () => {
        console.log("✅ Player Unready 成功");
        await refreshData();
      },
      onError: async err => {
        console.error("❌ Player Unready 失败:", err);
      },
    });
  };

  const handlePlayerFold = () => {
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [playerFold],
      functionName: "playerFold",
      account: connectedAddress as `0x${string}`,
      onSuccess: async () => {
        console.log("✅ Player Fold 成功");
        await refreshData();
      },
      onError: async err => {
        console.error("❌ Player Fold 失败:", err);
      },
    });
  };

  const handlePlayerContinue = () => {
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [playerContinue],
      functionName: "playerContinue",
      account: connectedAddress as `0x${string}`,
      onSuccess: async () => {
        console.log("✅ Player Continue 成功");
        await refreshData();
      },
      onError: async err => {
        console.error("❌ Player Continue 失败:", err);
      },
    });
  };

  const handlePlayerQuit = () => {
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [playerQuit],
      functionName: "playerQuit",
      account: connectedAddress as `0x${string}`,
      gas: 1000000n,
      onSuccess: async () => {
        console.log("✅ Player Quit 成功");
        await refreshData();
      },
      onError: async err => {
        console.error("❌ Player Quit 失败:", err);
      },
    });
  };

  // Handle start game

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
    <div>
      {tableInfo && (
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
                      <div className="text-white font-bold text-2xl mb-2">{tableInfo.tableName}</div>
                      <div className="text-amber-500 font-bold text-3xl">
                        {formatEther(tableInfo.totalPrizePool)} ETH
                      </div>
                      <div className="text-zinc-400 text-lg mt-2">Round {getGameStateName(tableInfo.state)}</div>

                      {/* Countdown Timer - only show when game is active */}
                      {remainingSeconds > 0 && (
                        <div className="mt-6">
                          <CountdownTimer
                            initialSeconds={remainingSeconds}
                            onComplete={handleTimerComplete}
                            className="bg-black/30 backdrop-blur-sm rounded-full px-8 py-3 text-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Players around the table - with enhanced card display */}
                  {allPlayers &&
                    allPlayers.map((player, index) => {
                      const currentPlayerIndex = allPlayers.findIndex(p => p.addr === connectedAddress);
                      const positions = calculateOptimalPositions(allPlayers.length, currentPlayerIndex);
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
                          key={index}
                          className="absolute w-[200px] z-20 transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                          }}
                        >
                          <PlayerInfo
                            player={player}
                            isBanker={player.addr == tableInfo.bankerAddr}
                            isSelf={player.addr === connectedAddress}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Right sidebar - Game controls */}
              <div className="w-full lg:w-1/5">
                {tableInfo && tableInfo.bankerAddr === connectedAddress && (
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Owner Controls</h3>
                    <div className="space-y-6">
                      <BankerControlsPanel tableInfo={tableInfo} myRoomCardNfts={myRoomCardNfts} />
                    </div>
                  </div>
                )}

                <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Game Controls</h3>

                  {/* Player actions */}
                  {tableInfo && (
                    <div className="space-y-6">
                      <PlayerControlsPanel
                        tableInfo={tableInfo}
                        playerInfo={playerData}
                        onJoinGameClick={handlePlayerJoin}
                        onReadyClick={handlePlayerReady}
                        onUnreadyClick={handlePlayerUnready}
                        onLeaveClick={handlePlayerQuit}
                        onContinueClick={handlePlayerContinue}
                        onFoldClick={handlePlayerFold}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

