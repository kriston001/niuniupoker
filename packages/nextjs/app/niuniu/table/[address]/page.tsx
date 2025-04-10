"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useWriteContract, useReadContract, useWatchContractEvent } from 'wagmi';
import { GameState, PlayerState, CardType, GameTable, Player, getCardTypeName, getPlayerStateName, getGameStateName } from "~~/utils/my-tools/types";
import { useDynamicReadContract } from "~~/hooks/my-hooks/useDynamicReadContract"
import BBContractAbis from "~~/contracts/contractABIs";

// 卡牌组件
const Card = ({ value }: { value: number }) => {
  if (value === 0) {
    return <div className="w-16 h-24 bg-base-300 rounded-lg flex items-center justify-center">?</div>;
  }

  // 计算牌面值和花色
  const suit = Math.floor((value - 1) / 13);
  const rank = (value - 1) % 13 + 1;

  // 花色符号
  const suitSymbols = ["♠", "♥", "♣", "♦"];
  const suitSymbol = suitSymbols[suit];
  const isRed = suit === 1 || suit === 3;

  // 牌面值
  let rankDisplay = rank.toString();
  if (rank === 1) rankDisplay = "A";
  if (rank === 11) rankDisplay = "J";
  if (rank === 12) rankDisplay = "Q";
  if (rank === 13) rankDisplay = "K";

  return (
    <div className="w-16 h-24 bg-white rounded-lg flex flex-col items-center justify-center border border-gray-300 shadow-md">
      <div className={`text-lg font-bold ${isRed ? "text-red-600" : "text-black"}`}>{rankDisplay}</div>
      <div className={`text-2xl ${isRed ? "text-red-600" : "text-black"}`}>{suitSymbol}</div>
    </div>
  );
};

// 在文件顶部定义ABI




const GameTablePage = () => {
  const params = useParams();
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const [isDoing, setIsDoing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取游戏桌地址
  const tableAddress = typeof params.address === "string" ? params.address : "";

  // 读取游戏桌信息
  const { data: tableInfo, isLoading: isLoadingTableInfo } = useScaffoldReadContract({
    contractName: "BBGameMain",
    functionName: "getGameTableInfo",
    args: [tableAddress],
    watch: true,
  }) as { data: GameTable | undefined, isLoading: boolean };

  const gameTableAbi = BBContractAbis.BBGameTable.abi;
  
  // 读取自己的信息
  const { data: selfPlayerData } = useDynamicReadContract({
    contractAddress: tableAddress as `0x${string}`,
    abi: gameTableAbi,
    functionName: 'getPlayerData',
    args: [connectedAddress],
    onSuccess: (data) => {
    },
    onError: (error) => {
    },
    // 新增参数：仅在 connectedAddress 存在时启用查询
    enabled: Boolean(connectedAddress),
  });

  // 读取所有玩家的信息
  const { data: players } = useDynamicReadContract({
    contractAddress: tableAddress as `0x${string}`,
    abi: gameTableAbi,
    functionName: 'getAllPlayerData',
    onSuccess: (data) => {
    },
    onError: (error) => {
    },
  });

  // 刷新数据
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 返回游戏大厅
  const goToLobby = () => {
    router.push("/niuniu");
  };

  // 使用公共客户端直接调用合约
  const { writeContractAsync: writeContract } = useWriteContract();

  // 加入游戏
  const handleJoinGame = async () => {
    if (!connectedAddress || !tableInfo) return;
    
    try {
      setIsDoing(true);      
      // 直接调用合约
      await writeContract({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: 'playerJoin',
        // gas: 500000n  // 添加固定的 gas 限制
      });
    } catch (error) {
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
      
      // 直接调用合约
      await writeContract({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: 'playerReady',
        value: tableInfo.betAmount,
      });
      
    } catch (error) {
      console.error("准备游戏失败:", error);
    } finally {
      setIsDoing(false);
    }
  };
  
  // 取消准备游戏
  const handleUnreadyGame = async () => {
    if (!selfPlayerData || !tableInfo) return;
    
    try {
      setIsDoing(true);
      
      // 直接调用合约
      await writeContract({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: 'playerUnready',
      });
    } catch (error) {
      console.error("取消准备失败:", error);
    } finally {
      setIsDoing(false);
    }
  };

  // 离开游戏
  const handleQuitGame = async () => {
    if (!selfPlayerData || !tableInfo) return;
    
    try {
      setIsDoing(true);
      
      // 直接调用合约
      await writeContract({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: 'playerQuit',
      });
    } catch (error) {
      console.error("离开游戏失败:", error);
    } finally {
      setIsDoing(false);
    }
  };

  // 庄家踢出玩家
  const handleBankerRemovePlayer = async (playerAddr: string) => {
    if (!selfPlayerData || !tableInfo) return;
    if (!selfPlayerData.isBanker) return;
    if (!playerAddr) return;
    if (playerAddr == selfPlayerData.playerAddr) return;
    
    try {
      setIsRemoving(true);
      
      // 直接调用合约
      await writeContract({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: 'bankerRemovePlayer',
        args: [playerAddr]
      });
      
      refreshData();
    } catch (error) {
      console.error("庄家踢出玩家失败:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  // 开始游戏
  const handleStartGame = async () => {
    if (!selfPlayerData || !tableInfo) return;
    if (!selfPlayerData.isBanker) return;
    
    try {
      setIsDoing(true);
      
      // 直接调用合约
      await writeContract({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: 'nextStep'
      });
      
      refreshData();
    } catch (error) {
      console.error("开始游戏失败:", error);
    } finally {
      setIsDoing(false);
    }
  };


  // 继续游戏
  const handleContinueGame = async () => {
    if (!selfPlayerData || !tableInfo) return;
    
    try {
      setIsDoing(true);
      
      // 直接调用合约
      await writeContract({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: 'playerContinue'
      });
      
    } catch (error) {
      console.error("继续游戏失败:", error);
    } finally {
      setIsDoing(false);
    }
  };


  // 弃牌
  const handleFoldGame = async () => {
    if (!selfPlayerData || !tableInfo) return;
    
    try {
      setIsDoing(true);
      
      // 直接调用合约
      await writeContract({
        address: tableAddress as `0x${string}`,
        abi: gameTableAbi,
        functionName: 'playerFold'
      });
    } catch (error) {
      console.error("弃牌失败:", error);
    } finally {
      setIsDoing(false);
    }
  };

  if (isLoadingTableInfo) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tableInfo) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">游戏桌不存在</h1>
        <button className="btn btn-primary" onClick={goToLobby}>返回游戏大厅</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{tableInfo.tableName}</h1>
        <button className="btn btn-outline" onClick={goToLobby}>返回游戏大厅</button>
      </div>

      {/* 游戏桌信息 */}
      <div className="bg-base-200 rounded-box p-6 mb-8">
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
      </div>

      {/* 游戏状态 - 这里是模拟数据，实际应该从合约中获取 */}
      <div className="bg-base-200 rounded-box p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">游戏状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-2">当前状态</h3>
            <p className="text-xl">{getGameStateName(GameState.WAITING)}</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">玩家数量</h3>
            <p className="text-xl">{tableInfo.playerCount}/{tableInfo.maxPlayers}</p>
          </div>
        </div>

        {/* 游戏操作按钮 */}
        <div className="mt-6 flex flex-wrap gap-4">
          {/* 根据游戏状态和玩家角色显示不同的按钮 */}
          {!selfPlayerData && tableInfo.state == GameState.WAITING && tableInfo.playerCount < tableInfo.maxPlayers && (
            <button 
              className={`btn btn-primary ${isDoing ? "loading" : ""}`}
              onClick={handleJoinGame}
              disabled={isDoing}
            >
              {isDoing ? "加入中..." : "加入游戏"}
            </button>
          )}

          {selfPlayerData && selfPlayerData.state == PlayerState.JOINED && tableInfo.state == GameState.WAITING && (
            <button 
              className={`btn btn-primary ${isDoing ? "loading" : ""}`}
              onClick={handleReadyGame}
              disabled={isDoing}
            >
              {isDoing ? "准备中..." : "准备"}
            </button>
          )}

          {selfPlayerData && selfPlayerData.state == PlayerState.READY && tableInfo.state == GameState.WAITING && (
            <button 
              className={`btn btn-primary ${isDoing ? "loading" : ""}`}
              onClick={handleUnreadyGame}
              disabled={isDoing}
            >
              {isDoing ? "取消中..." : "取消准备"}
            </button>
          )}

          {selfPlayerData && (selfPlayerData.state == PlayerState.JOINED || selfPlayerData.state == PlayerState.READY) && tableInfo.state == GameState.WAITING && (
            <button 
              className={`btn btn-primary ${isDoing ? "loading" : ""}`}
              onClick={handleQuitGame}
              disabled={isDoing}
            >
              {isDoing ? "离开中..." : "离开游戏"}
            </button>
          )}
          
          {selfPlayerData && selfPlayerData.isBanker && tableInfo.state === 1 && tableInfo.playerCount > 1 && tableInfo.playerReadyCount == tableInfo.playerCount && (
            <button 
              className={`btn btn-primary ${isDoing ? "loading" : ""}`}
              onClick={handleStartGame}
              disabled={isDoing}
            >
              {isDoing ? "开始中..." : "开始游戏"}
            </button>
          )}
          
          
          {selfPlayerData && ((tableInfo.state === GameState.FIRST_BETTING && selfPlayerData.state == PlayerState.READY) || 
          (tableInfo.state === GameState.SECOND_BETTING && selfPlayerData.state == PlayerState.FIRST_CONTINUED))  && (
            <button 
              className={`btn btn-success ${isDoing ? "loading" : ""}`}
              onClick={() => handleContinueGame()}
              disabled={isDoing}
            >
              {isDoing ? "加注中..." : "加注"}
            </button>
          )}
          
          
          {selfPlayerData && ((tableInfo.state === GameState.FIRST_BETTING && selfPlayerData.state == PlayerState.READY) || 
          (tableInfo.state === GameState.SECOND_BETTING && selfPlayerData.state == PlayerState.FIRST_CONTINUED))  && (
            <button 
              className={`btn btn-error ${isDoing ? "loading" : ""}`}
              onClick={() => handleFoldGame()}
              disabled={isDoing}
            >
              {isDoing ? "弃牌中..." : "弃牌"}
            </button>
          )}


        </div>
      </div>

      {/* 玩家卡牌区域 - 模拟数据 */}
      <div className="bg-base-200 rounded-box p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">您的卡牌</h2>
        <div className="flex flex-wrap gap-4 justify-center mb-4">
          <Card value={0} />
          <Card value={0} />
          <Card value={0} />
          <Card value={0} />
          <Card value={0} />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">牌型: {getCardTypeName(CardType.NONE)}</p>
        </div>
      </div>

      {/* 其他玩家区域 - 模拟数据 */}
      <div className="bg-base-200 rounded-box p-6">
        <h2 className="text-2xl font-bold mb-4">其他玩家</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players && players.filter((player: Player) => 
            player.playerAddr.toLowerCase() !== connectedAddress?.toLowerCase()
          ).map((player: Player, index: number) => (
            <div className="border border-primary rounded-box p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">{player.isBanker ? '庄家' : ''}</h3>
                {selfPlayerData.isBanker && tableInfo.state == GameState.WAITING && (
                  <button 
                    className={`btn btn-error ${isRemoving ? "loading" : ""}`}
                    onClick={() => handleBankerRemovePlayer(player.playerAddr)}
                    disabled={isRemoving}
                  >踢出房间</button>
                )}
                <span className="badge badge-primary">{ getPlayerStateName(player.state) }</span>
              </div>
              <Address address={ player.playerAddr } size="sm" />
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <Card value={0} />
                <Card value={0} />
                <Card value={0} />
                <Card value={0} />
                <Card value={0} />
              </div>
            </div>
          ))}
          
          {/* 空位 */}
          {tableInfo.playerCount < tableInfo.maxPlayers  && (
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