"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { use } from "react";
import { CountdownTimer } from "@/components/countdown-timer";
import { TableInfo } from "@/components/niuniu/table/table-info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { bytesToHex, concat, formatEther, hexToBytes, keccak256, toBytes } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { readContract } from "wagmi/actions";
import { BankerControlsPanel } from "~~/components/niuniu/table/banker-controls-panel";
import { ChatPanel } from "~~/components/niuniu/table/chat-panel";
import { PlayerControlsPanel } from "~~/components/niuniu/table/player-controls-panel";
import { PlayerInfo } from "~~/components/niuniu/table/player-info";
import {
  bankerRemovePlayer,
  nextStep,
  playerContinue,
  playerFold,
  playerJoin,
  playerQuit,
  playerReady,
  playerUnready,
  startGame,
  liquidateGame
} from "~~/contracts/abis/BBGameTableABI";
import { useGameTableData } from "~~/hooks/my-hooks/useGameTableData";
import { writeContractWithCallback } from "~~/hooks/writeContractWithCallback";
import { createPushChat } from "~~/lib/push-chat";
import { delay, getGameDescription } from "~~/lib/utils";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { GameState, PlayerState, getGameStateName } from "~~/types/game-types";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~~/components/ui/alert-dialog";
import { UserX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { symbol } from "zod";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export default function TableDetail({ params }: { params: Promise<{ addr: string }> }) {
  const resolvedParams = use(params);
  const tableAddr = resolvedParams.addr;
  const { gameConfig } = useGlobalState();
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;


  const { address: connectedAddress } = useAccount();
  const { data: walletClient } = useWalletClient();

  const { playerData, allPlayers, tableInfo, myRoomCardNfts, userJoinedTablesCount, refreshData } = useGameTableData({
    refreshInterval: 8000,
    tableAddress: tableAddr,
    playerAddress: connectedAddress,
  });

  const remainingSeconds = useMemo(() => {
    if (!tableInfo?.currentRoundDeadline) return 0;
    const now = Math.floor(Date.now() / 1000);
    const deadline = Number(tableInfo.currentRoundDeadline);
    return deadline > now ? deadline - now : 0;
  }, [tableInfo]);

  // 创建PushChat实例
  const pushChat = createPushChat(connectedAddress as string, walletClient);

  // Handle timer completion
  const handleTimerComplete = async () => {
    console.log("Time's up!");
    await delay(3000);
    refreshData();
    // Here you would handle what happens when the timer runs out
  };

  function getRandomValue() {
    const randomValue = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
    return randomValue;
  }

  const handleNext = () => {
    const randomValue = getRandomValue();
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [nextStep],
      functionName: "nextStep",
      account: connectedAddress as `0x${string}`,
      args: [randomValue],
      onSuccess: async () => {
        console.log("✅ Next Step 成功");
        await refreshData();
      },
      onError: async err => {
        console.error("❌ Next Step 失败:", err);
      },
    });
  };

  const handlePlayerJoin = () => {
    if (userJoinedTablesCount >= gameConfig?.maxJoinTablesCount) {
      toast.error(`You have reached the maximum number of ${gameConfig?.maxJoinTablesCount} tables you can join`);
      return;
    }
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [playerJoin],
      functionName: "playerJoin",
      account: connectedAddress as `0x${string}`,
      gas: 4000000n,
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
    const randomValue = getRandomValue();
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [playerReady],
      functionName: "playerReady",
      account: connectedAddress as `0x${string}`,
      args: [randomValue],
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

  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const [playerToKick, setPlayerToKick] = useState<`0x${string}` | null>(null);

  const handleKickPlayer = (playerAddress: `0x${string}`) => {
    setPlayerToKick(playerAddress);
    setIsKickDialogOpen(true);
  };

  const confirmKickPlayer = () => {
    if (!playerToKick) return;
    
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [bankerRemovePlayer],
      functionName: "bankerRemovePlayer",
      account: connectedAddress as `0x${string}`,
      args: [playerToKick],
      onSuccess: async () => {
        toast.success("Player kicked successfully");
        console.log("✅ Kick Player 成功");
        if (tableInfo?.chatGroupId) {
          try {
              const success = await pushChat.removeMember(tableInfo.chatGroupId, playerToKick);
              if (success) {
                console.log("✅ 成功移除玩家");
              } else {
                console.log("⚠️ 移除玩家失败");
              }
          } catch (error) {
            console.error("❌ 移除玩家出错:", error);
          }
        }
        await refreshData();
      },
      onError: async err => {
        toast.error("Failed to kick player");
        console.error("❌ Kick Player 失败:", err);
      },
    });
    
    setIsKickDialogOpen(false);
    setPlayerToKick(null);
  };

  const handleStartGame = useCallback(
    (tokenId: string) => {
      const randomValue = getRandomValue();
      writeContractWithCallback({
        address: tableAddr as `0x${string}`,
        abi: [startGame],
        functionName: "startGame",
        args: [BigInt(tokenId), randomValue],
        value: tableInfo?.betAmount ? tableInfo.betAmount * 2n : 0n,
        account: connectedAddress as `0x${string}`,
        onSuccess: async () => {
          console.log("✅ Start Game 成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ Start Game 失败:", err);
        },
      });
    },
    [tableAddr, tableInfo?.betAmount, connectedAddress, refreshData],
  );

  const handlePlayerFold = () => {
    const randomValue = getRandomValue();
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [playerFold],
      functionName: "playerFold",
      args: [randomValue],
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
    const raiseX = tableInfo?.state == GameState.FIRST_BETTING ? tableInfo.firstBetX : tableInfo?.secondBetX;
    const randomValue = getRandomValue();
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [playerContinue],
      functionName: "playerContinue",
      account: connectedAddress as `0x${string}`,
      args: [randomValue],
      value: tableInfo?.betAmount ? tableInfo.betAmount * BigInt(raiseX || 1) : 0n,
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
      onSuccess: async () => {
        console.log("✅ Player Quit 成功");
        await refreshData();
        if (tableInfo?.chatGroupId && walletClient) {
          try {
            // 离开群组
            if (playerData?.addr != tableInfo?.bankerAddr) {
              const success = await pushChat.leaveChatGroup(tableInfo.chatGroupId);
              if (success) {
                console.log("✅ 成功离开聊天群组");
              } else {
                console.log("⚠️ 离开聊天群组失败");
              }
            }
          } catch (error) {
            console.error("❌ 离开聊天群组出错:", error);
          }
        }
      },
      onError: async err => {
        console.error("❌ Player Quit 失败:", err);
      },
    });
  };

  const handleLiquidate = () => {
    writeContractWithCallback({
      address: tableAddr as `0x${string}`,
      abi: [liquidateGame],
      functionName: "liquidateGame",
      account: connectedAddress as `0x${string}`,
      onSuccess: async () => {
        console.log("✅ Liquidate Game 成功");
        await refreshData();
      },
      onError: async err => {
        console.error("❌ Liquidate Game 失败:", err);
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
              <h1 className="text-xl font-bold text-white ml-2">Table: {tableInfo.tableName}</h1>
              <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 ml-3">Active</Badge>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 max-w-[1920px] mx-auto">
              {/* Left sidebar - Table info and action log */}
              <div className="w-full lg:w-1/5">
                {tableInfo && <TableInfo tableInfo={tableInfo} tableUpdated={refreshData} />}
                <ChatPanel tableInfo={tableInfo} />
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
                      <div className="text-amber-500 font-bold text-3xl">
                        {formatEther(tableInfo.totalPrizePool)} {symbol}
                      </div>
                      <div className="text-zinc-400 text-lg mt-2">{getGameStateName(tableInfo.state)} Round</div>
                      <div className="text-zinc-500 text-sm mt-1">
                        {getGameDescription(tableInfo, playerData || null)}
                      </div>

                      {/* Reward Animation - show when rewardAddr is not 0 */}
                      <AnimatePresence>
                        {tableInfo.rewardAddr !== "0x0000000000000000000000000000000000000000" && (
                          <motion.div 
                            className="mt-4 bg-amber-900/80 backdrop-blur-sm border border-amber-600 rounded-lg px-6 py-4 shadow-lg relative overflow-hidden"
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1, 
                              y: 0,
                              transition: { 
                                duration: 0.5 
                              }
                            }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                          >
                            {/* 背景粒子效果 */}
                            {Array.from({ length: 20 }).map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-amber-300/60"
                                initial={{ 
                                  x: Math.random() * 300 - 150,
                                  y: Math.random() * 200 - 100,
                                  opacity: 0
                                }}
                                animate={{ 
                                  x: Math.random() * 300 - 150,
                                  y: Math.random() * 200 - 100,
                                  opacity: [0, 0.8, 0],
                                  scale: [0, 1, 0]
                                }}
                                transition={{
                                  duration: 2 + Math.random() * 2,
                                  repeat: Infinity,
                                  delay: Math.random() * 2
                                }}
                              />
                            ))}
                            
                            <motion.div 
                              className="text-amber-300 font-bold text-xl relative z-10"
                              animate={{ 
                                scale: [1, 1.05, 1],
                                textShadow: [
                                  "0 0 5px rgba(251, 191, 36, 0.5)",
                                  "0 0 20px rgba(251, 191, 36, 0.8)",
                                  "0 0 5px rgba(251, 191, 36, 0.5)"
                                ]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              🎉 Pool Reward! 🎉
                            </motion.div>
                            <div className="mt-2 text-amber-100 font-medium relative z-10">
                              <motion.div 
                                className="text-sm truncate max-w-[240px] mx-auto bg-amber-950/50 py-1 px-3 rounded-full"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ 
                                  opacity: 1, 
                                  y: 0,
                                  transition: { delay: 0.2, duration: 0.4 }
                                }}
                              >
                                {tableInfo.rewardAddr === connectedAddress ? 
                                  `You ${tableInfo.rewardAddr.substring(0, 6)}...${tableInfo.rewardAddr.substring(tableInfo.rewardAddr.length - 4)}` : 
                                  `${tableInfo.rewardAddr.substring(0, 6)}...${tableInfo.rewardAddr.substring(tableInfo.rewardAddr.length - 4)}`
                                }
                              </motion.div>
                              <motion.div 
                                className="mt-2 text-xl font-bold"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ 
                                  opacity: 1,
                                  scale: 1,
                                  transition: { delay: 0.4, duration: 0.5 }
                                }}
                                whileHover={{ scale: 1.05 }}
                              >
                                <motion.span
                                  animate={{
                                    color: ["#fcd34d", "#f59e0b", "#fcd34d"]
                                  }}
                                  transition={{
                                    duration: 3,
                                    repeat: Infinity
                                  }}
                                >
                                  {formatEther(tableInfo.rewardAmount)} {symbol}
                                </motion.span>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Countdown Timer - only show when game is active */}
                      {remainingSeconds > 0 && (tableInfo.state == GameState.FIRST_BETTING ||  tableInfo.state == GameState.SECOND_BETTING) && (
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
                            tableInfo={tableInfo}
                            player={player}
                            isBanker={player.addr == tableInfo.bankerAddr}
                            isSelf={player.addr === connectedAddress}
                            showKickButton={
                              tableInfo.state === GameState.WAITING &&
                              player.state === PlayerState.JOINED &&
                              player.addr !== tableInfo.bankerAddr &&
                              playerData?.addr == tableInfo.bankerAddr
                            }
                            onKickPlayer={handleKickPlayer}
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
                      <BankerControlsPanel
                        tableInfo={tableInfo}
                        myRoomCardNfts={myRoomCardNfts}
                        onStartGameClick={handleStartGame}
                        onNextClick={handleNext}
                      />
                    </div>
                  </div>
                )}

                <div
                  className={`${tableInfo?.bankerAddr === connectedAddress ? "mt-4" : ""} bg-zinc-900/80 border border-zinc-800 rounded-lg p-6`}
                >
                  <h3 className="text-lg font-semibold text-white mb-6">Game Controls</h3>

                  {/* Player actions */}
                  {tableInfo && connectedAddress && (
                    <div className="space-y-6">
                      <PlayerControlsPanel
                        tableInfo={tableInfo}
                        playerInfo={playerData}
                        onJoinGameClick={handlePlayerJoin}
                        onReadyClick={handlePlayerReady}
                        onUnreadyClick={handlePlayerUnready}
                        onQuitClick={handlePlayerQuit}
                        onContinueClick={handlePlayerContinue}
                        onFoldClick={handlePlayerFold}
                        onLiquidateClick={handleLiquidate}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Kick Player Confirmation Dialog */}
      <AlertDialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm Kick Player</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to kick out {playerToKick} from the game table?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700" 
              onClick={confirmKickPlayer}
            >
              <UserX className="h-4 w-4 mr-2" />
              Kick Player
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
