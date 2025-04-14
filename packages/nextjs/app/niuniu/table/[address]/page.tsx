"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import Card from "~~/components/niuniu/Card";
import GameTableInfo from "~~/components/niuniu/GameTableInfo";
import { Address } from "~~/components/scaffold-eth";
import BBContractAbis from "~~/contracts/contractABIs";
import { useGameTableData } from "~~/hooks/my-hooks/useGameTableData";
import { useWriteContractWithCallback } from "~~/hooks/useWriteContractWithCallback";
import { checkNext, getPlayerCardTypeName, getPlayerCards } from "~~/utils/my-tools/funcs";
import {
  CardType,
  GameState,
  Player,
  PlayerCard,
  PlayerState,
  getCardTypeName,
  getGameStateName,
  getPlayerStateName,
} from "~~/utils/my-tools/types";

const GameTablePage = () => {
  const params = useParams();
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const [isDoing, setIsDoing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // 使用自定义的 Hook
  const { writeContractWithCallback, isPending } = useWriteContractWithCallback();

  // 获取游戏桌地址
  const tableAddress =
    typeof params.address === "string" && params.address.startsWith("0x")
      ? (params.address as `0x${string}`)
      : undefined;
  const gameTableAbi = BBContractAbis.BBGameTable.abi;

  // 使用新的钩子获取游戏桌数据
  const {
    tableInfo,
    playerData: selfPlayerData,
    allPlayers: players,
    allPlayersCard: playerCards,
    isLoading: isLoadingTableInfo,
    refreshData,
  } = useGameTableData({
    tableAddress,
    playerAddress: connectedAddress,
    gameTableAbi,
    refreshInterval: 15000, // 15秒自动刷新一次
  });

  // 如果tableInfo为空，显示加载中
  if (!tableInfo) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">正在加载游戏桌信息...</h1>
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // 返回游戏大厅
  const goToLobby = () => {
    router.push("/niuniu");
  };

  // 加入游戏
  const handleJoinGame = async () => {
    if (!connectedAddress || !tableInfo) return;

    try {
      setIsDoing(true);
      await writeContractWithCallback({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: "playerJoin",
        account: connectedAddress as `0x${string}`, // 明确指定账户
        onSuccess: async () => {
          console.log("✅ 交易成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error: any) {
      console.error("加入游戏失败:", error);
    } finally {
      setIsDoing(false);
    }
  };

  // 准备游戏
  const handleReadyGame = async () => {
    if (!selfPlayerData || !tableInfo) return;

    try {
      setIsDoing(true);
      await writeContractWithCallback({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: "playerReady",
        value: tableInfo.betAmount,
        account: connectedAddress as `0x${string}`, // 明确指定账户
        onSuccess: async () => {
          console.log("✅ 交易成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error: any) {
      console.error("准备游戏失败:", error);
    } finally {
      setIsDoing(false);
    }
  };

  // 取消准备游戏
  const handleUnreadyGame = async () => {
    if (!selfPlayerData || !tableInfo || !connectedAddress) return;

    try {
      setIsDoing(true);

      await writeContractWithCallback({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: "playerUnready",
        account: connectedAddress as `0x${string}`, // 明确指定账户
        onSuccess: async () => {
          console.log("✅ 交易成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error: any) {
      console.error("取消准备失败:", error);
    } finally {
      setIsDoing(false);
    }
  };

  // 离开游戏
  const handleQuitGame = async () => {
    if (!selfPlayerData || !tableInfo || !connectedAddress) return;

    try {
      setIsDoing(true);

      await writeContractWithCallback({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: "playerQuit",
        account: connectedAddress as `0x${string}`, // 明确指定账户
        onSuccess: async () => {
          console.log("✅ 交易成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error: any) {
      console.error("离开游戏失败:", error);
    } finally {
      setIsDoing(false);
    }
  };

  // 庄家踢出玩家
  const handleBankerRemovePlayer = async (playerAddr: string) => {
    if (!selfPlayerData || !tableInfo || !connectedAddress) return;
    if (!selfPlayerData.isBanker) return;
    if (!playerAddr) return;
    if (playerAddr == selfPlayerData.playerAddr) return;

    try {
      setIsRemoving(true);

      await writeContractWithCallback({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: "bankerRemovePlayer",
        args: [playerAddr],
        account: connectedAddress as `0x${string}`, // 明确指定账户
        onSuccess: async () => {
          console.log("✅ 交易成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error: any) {
      console.error("庄家踢出玩家失败:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  // 开始游戏
  const handleStartGame = async () => {
    if (!selfPlayerData || !tableInfo || !connectedAddress) return;
    if (!selfPlayerData.isBanker) return;

    try {
      setIsDoing(true);

      await writeContractWithCallback({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: "nextStep",
        account: connectedAddress as `0x${string}`, // 明确指定账户
        onSuccess: async () => {
          console.log("✅ 交易成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error: any) {
      console.error("开始游戏失败:", error);
    } finally {
      setIsDoing(false);
    }
  };

  // 继续游戏
  const handleContinueGame = async () => {
    if (!selfPlayerData || !tableInfo || !connectedAddress) return;

    try {
      setIsDoing(true);

      await writeContractWithCallback({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: "playerContinue",
        account: connectedAddress as `0x${string}`, // 明确指定账户
        gas: BigInt(300000), // 设置固定的 gas 限制
        value: tableInfo.betAmount, // 需要支付额外的下注金额
        onSuccess: async () => {
          console.log("✅ 交易成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error: any) {
      console.error("继续游戏失败:", error);
    } finally {
      setIsDoing(false);
    }
  };

  // 弃牌
  const handleFoldGame = async () => {
    if (!selfPlayerData || !tableInfo || !connectedAddress) return;

    try {
      setIsDoing(true);

      // 使用带有 nonce 管理的合约写入函数
      await writeContractWithCallback({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: "playerFold",
        account: connectedAddress as `0x${string}`, // 明确指定账户
        onSuccess: async () => {
          console.log("✅ 交易成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error: any) {
      console.error("弃牌失败:", error);
    } finally {
      setIsDoing(false);
    }
  };

  // 下一步
  const handleNextGame = async () => {
    if (!selfPlayerData || !tableInfo || !connectedAddress) return;

    try {
      await writeContractWithCallback({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: "nextStep",
        account: connectedAddress as `0x${string}`, // 明确指定账户
        gas: BigInt(8000000), // 设置固定的 gas 限制
        onSuccess: async () => {
          console.log("✅ 交易成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error: any) {
      console.error("下一步失败:", error);
    } finally {
    }
  };

  // 如果地址无效或游戏桌不存在
  if (!tableAddress) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">无效的游戏桌地址</h1>
        <button className="btn btn-primary" onClick={goToLobby}>
          返回游戏大厅
        </button>
      </div>
    );
  }

  if (!tableInfo) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">游戏桌不存在</h1>
        <button className="btn btn-primary" onClick={goToLobby}>
          返回游戏大厅
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{tableInfo.tableName}</h1>
        <button className="btn btn-outline" onClick={goToLobby}>
          返回游戏大厅
        </button>
      </div>

      {/* 游戏桌信息 */}
      {/* <div className="bg-base-200 rounded-box p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">游戏桌信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold mb-2">庄家</h3>
            <Address address={tableInfo.bankerAddr} />
          </div>
          <div>
            <h3 className="font-bold mb-2">下注金额</h3>
            <p>{formatEther(tableInfo.betAmount)} ETH</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">创建时间</h3>
            <p>{new Date(Number(tableInfo.creationTimestamp) * 1000).toLocaleString()}</p>
          </div>
        </div>
      </div> */}

      <GameTableInfo tableInfo={tableInfo} />

      {/* 游戏状态 - 从合约中获取 */}
      <div className="bg-base-200 rounded-box p-6 mb-8">
        <div className="mt-6 flex flex-wrap gap-4">
          {/* 根据游戏状态和玩家角色显示不同的按钮 */}
          {!selfPlayerData && tableInfo.state == GameState.WAITING && tableInfo.playerCount < tableInfo.maxPlayers && (
            <button
              className={`btn btn-primary ${isPending ? "loading" : ""}`}
              onClick={handleJoinGame}
              disabled={isPending}
            >
              加入游戏
            </button>
          )}

          {selfPlayerData && selfPlayerData.state == PlayerState.JOINED && tableInfo.state == GameState.WAITING && (
            <button className="btn btn-primary" onClick={handleReadyGame}>
              准备
            </button>
          )}

          {selfPlayerData && selfPlayerData.state == PlayerState.READY && tableInfo.state == GameState.WAITING && (
            <button className="btn btn-primary" onClick={handleUnreadyGame}>
              取消准备
            </button>
          )}

          {selfPlayerData &&
            (selfPlayerData.state == PlayerState.JOINED || selfPlayerData.state == PlayerState.READY) &&
            tableInfo.state == GameState.WAITING && (
              <button className="btn btn-primary" onClick={handleQuitGame}>
                离开游戏
              </button>
            )}

          {/* {selfPlayerData &&
            selfPlayerData.isBanker &&
            tableInfo.state === 1 &&
            tableInfo.playerCount > 1 &&
            tableInfo.playerReadyCount == tableInfo.playerCount && (
              <button className="btn btn-primary" onClick={handleStartGame}>
                开始游戏
              </button>
            )} */}

          {selfPlayerData &&
            selfPlayerData.isBanker &&
            (() => {
              const { b, name } = checkNext(tableInfo);
              if (b) {
                return (
                  <button className="btn btn-primary" onClick={handleNextGame}>
                    {name}
                  </button>
                );
              }
            })()}

          {selfPlayerData &&
            ((tableInfo.state === GameState.FIRST_BETTING && selfPlayerData.state == PlayerState.READY) ||
              (tableInfo.state === GameState.SECOND_BETTING &&
                selfPlayerData.state == PlayerState.FIRST_CONTINUED)) && (
              <button className="btn btn-primary" onClick={() => handleContinueGame()}>
                加注
              </button>
            )}

          {selfPlayerData &&
            ((tableInfo.state === GameState.FIRST_BETTING && selfPlayerData.state == PlayerState.READY) ||
              (tableInfo.state === GameState.SECOND_BETTING &&
                selfPlayerData.state == PlayerState.FIRST_CONTINUED)) && (
              <button className="btn btn-primary" onClick={() => handleFoldGame()}>
                弃牌
              </button>
            )}
        </div>
      </div>

      {/* 玩家卡牌区域 */}
      <div className="bg-base-200 rounded-box p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">您的卡牌</h2>
        <div className="flex flex-wrap gap-4 justify-center mb-4">
          {selfPlayerData && playerCards && playerCards.length > 0
            ? // 找到当前玩家的卡牌数据
              (() => {
                const cards = getPlayerCards(selfPlayerData.playerAddr, playerCards);
                return cards.map((cardValue: number, index: number) => (
                  <Card key={`player-card-${index}`} value={cardValue} size="lg" />
                ));
              })()
            : // 如果没有卡牌数据，显示5张背面朝上的卡牌
              Array(5)
                .fill(0)
                .map((_, index) => <Card key={`empty-card-${index}`} value={0} />)}
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">
            牌型:{" "}
            {(() => {
              if (selfPlayerData && playerCards && playerCards.length > 0) {
                return getPlayerCardTypeName(selfPlayerData.playerAddr, playerCards);
              } else {
                return getCardTypeName(CardType.NONE);
              }
            })()}
          </p>
        </div>
      </div>

      {/* 其他玩家区域 - 模拟数据 */}
      <div className="bg-base-200 rounded-box p-6">
        <h2 className="text-2xl font-bold mb-4">其他玩家</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players &&
            players
              .filter((player: Player) => player.playerAddr.toLowerCase() !== connectedAddress?.toLowerCase())
              .map((player: Player) => (
                <div key={player.playerAddr} className="border border-primary rounded-box p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{player.isBanker ? "庄家" : ""}</h3>
                    {selfPlayerData?.isBanker && tableInfo.state == GameState.WAITING && (
                      <button
                        className={`btn btn-error ${isRemoving ? "loading" : ""}`}
                        onClick={() => handleBankerRemovePlayer(player.playerAddr)}
                        disabled={isRemoving}
                      >
                        踢出房间
                      </button>
                    )}
                    <span className="badge badge-primary">{getPlayerStateName(player.state)}</span>
                  </div>
                  <Address address={player.playerAddr} size="sm" />
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {playerCards && playerCards.length > 0
                      ? (() => {
                          const cards = getPlayerCards(player.playerAddr, playerCards);
                          return cards.map((cardValue: number, index: number) => (
                            <Card key={`player-card-${index}`} value={cardValue} />
                          ));
                        })()
                      : // 如果没有卡牌数据，显示5张背面朝上的卡牌
                        Array(5)
                          .fill(0)
                          .map((_, index) => <Card key={`player-${player.playerAddr}-default-${index}`} value={0} />)}
                  </div>
                  {playerCards && playerCards.length > 0 && (
                    <div className="text-center mt-2">
                      <p className="font-bold">
                        牌型:{" "}
                        {(() => {
                          if (selfPlayerData && playerCards && playerCards.length > 0) {
                            return getPlayerCardTypeName(player.playerAddr, playerCards);
                          } else {
                            return getCardTypeName(CardType.NONE);
                          }
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              ))}

          {/* 空位 */}
          {tableInfo.playerCount < tableInfo.maxPlayers && (
            <div className="border border-base-300 rounded-box p-4 flex items-center justify-center">
              <p className="text-xl text-base-content/50">等待玩家加入...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameTablePage;
