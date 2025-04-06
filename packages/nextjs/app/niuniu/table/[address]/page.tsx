"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useWriteContract, useReadContract } from 'wagmi';

// 游戏桌信息类型定义
type GameTable = {
  tableAddr: string;
  tableName: string;
  bankerAddr: string;
  betAmount: bigint;
  playerCount: number;
  maxPlayers: number;
  creationTimestamp: bigint;
  state: number;
  continuedPlayerCount: number;
  foldPlayerCount: number;
  playerReadyCount: number;
  playerAddresses: string[];
  currentRoundDeadline: bigint;
};


// 玩家状态枚举
enum PlayerState {
  NONE = 0,
  JOINED = 1,
  READY = 2,
  FIRST_FOLDED = 3,
  FIRST_CONTINUED = 4,
  SECOND_FOLDED = 5,
  SECOND_CONTINUED = 6
}

// 游戏状态枚举
enum GameState {
  NONE = 0,
  WAITING = 1,
  FIRST_BETTING = 2,
  SECOND_BETTING = 3,
  ENDED = 4
}

// 牌型枚举
enum CardType {
  NONE = 0,
  NO_BULL = 1,
  BULL_1 = 2,
  BULL_2 = 3,
  BULL_3 = 4,
  BULL_4 = 5,
  BULL_5 = 6,
  BULL_6 = 7,
  BULL_7 = 8,
  BULL_8 = 9,
  BULL_9 = 10,
  BULL_BULL = 11,
  FIVE_BOMB = 12,
  FIVE_SMALL = 13,
  FIVE_FLOWERS = 14
}

// 获取牌型名称
const getCardTypeName = (cardType: number) => {
  switch (cardType) {
    case CardType.NONE: return "无牌型";
    case CardType.NO_BULL: return "没牛";
    case CardType.BULL_1: return "牛一";
    case CardType.BULL_2: return "牛二";
    case CardType.BULL_3: return "牛三";
    case CardType.BULL_4: return "牛四";
    case CardType.BULL_5: return "牛五";
    case CardType.BULL_6: return "牛六";
    case CardType.BULL_7: return "牛七";
    case CardType.BULL_8: return "牛八";
    case CardType.BULL_9: return "牛九";
    case CardType.BULL_BULL: return "牛牛";
    case CardType.FIVE_BOMB: return "五炸";
    case CardType.FIVE_SMALL: return "五小";
    case CardType.FIVE_FLOWERS: return "五花";
    default: return "未知";
  }
};

// 获取玩家状态名称
const getPlayerStateName = (state: number) => {
  switch (state) {
    case PlayerState.NONE: return "未加入";
    case PlayerState.JOINED: return "已加入";
    case PlayerState.READY: return "已准备";
    case PlayerState.FIRST_FOLDED: return "第一轮弃牌";
    case PlayerState.FIRST_CONTINUED: return "第一轮继续";
    case PlayerState.SECOND_FOLDED: return "第二轮弃牌";
    case PlayerState.SECOND_CONTINUED: return "第二轮继续";
    default: return "未知";
  }
};

// 获取游戏状态名称
const getGameStateName = (state: number) => {
  switch (state) {
    case GameState.NONE: return "未初始化";
    case GameState.WAITING: return "等待中";
    case GameState.FIRST_BETTING: return "第一轮下注";
    case GameState.SECOND_BETTING: return "第二轮下注";
    case GameState.ENDED: return "已结束";
    default: return "未知";
  }
};

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
const playerJoinABI = [
  {
    inputs: [],
    name: "playerJoin",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  }
] as const;

const startGameABI = [
  {
    inputs: [],
    name: "startGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }
] as const;

const GameTablePage = () => {
  const params = useParams();
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isBetting, setIsBetting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取游戏桌地址
  const tableAddress = typeof params.address === "string" ? params.address : "";

  // 读取游戏桌信息
  const { data: tableInfo, isLoading: isLoadingTableInfo } = useScaffoldReadContract({
    contractName: "BBGameMain",
    functionName: "getGameTableInfo",
    args: [tableAddress],
    watch: true,
  });

  // 读取用户余额
  const { data: userBalance, isLoading: isLoadingBalance } = useScaffoldReadContract({
    contractName: "BBGameMain",
    functionName: "getUserBalance",
    args: [connectedAddress],
    watch: true,
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
      setIsJoining(true);
      console.log("加入游戏", tableAddress);
      
      // 直接调用合约
      await writeContract({
        address: tableAddress as `0x${string}`,
        abi: playerJoinABI,
        functionName: 'playerJoin',
        value: tableInfo.betAmount,
        gas: 500000n  // 添加固定的 gas 限制
      });
      
      refreshData();
    } catch (error) {
      console.error("加入游戏失败:", error);
    } finally {
      setIsJoining(false);
    }
  };

  // 开始游戏
  const handleStartGame = async () => {
    if (!connectedAddress || !tableInfo) return;
    
    try {
      setIsStarting(true);
      console.log("开始游戏", tableAddress);
      
      // 直接调用合约
      await writeContract({
        address: tableAddress as `0x${string}`,
        abi: startGameABI,
        functionName: 'startGame'
      });
      
      refreshData();
    } catch (error) {
      console.error("开始游戏失败:", error);
    } finally {
      setIsStarting(false);
    }
  };

  // 下注
  const handleBet = async (isContinue: boolean) => {
    if (!connectedAddress || !tableInfo) return;
    
    try {
      setIsBetting(true);
      // 这里需要调用游戏桌合约的bet方法
      console.log("下注", tableAddress, isContinue);
      
      // 模拟下注
      await new Promise(resolve => setTimeout(resolve, 2000));
      refreshData();
    } catch (error) {
      console.error("下注失败:", error);
    } finally {
      setIsBetting(false);
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
          {connectedAddress !== tableInfo.bankerAddr && !tableInfo.playerAddresses.includes(connectedAddress) && (
            <button 
              className={`btn btn-primary ${isJoining ? "loading" : ""}`}
              onClick={handleJoinGame}
              disabled={isJoining}
            >
              {isJoining ? "加入中..." : "加入游戏"}
            </button>
          )}
          
          {connectedAddress === tableInfo.bankerAddr && (
            <button 
              className={`btn btn-primary ${isStarting ? "loading" : ""}`}
              onClick={handleStartGame}
              disabled={isStarting}
            >
              {isStarting ? "开始中..." : "开始游戏"}
            </button>
          )}
          
          {/* 下注按钮 - 在适当的游戏状态下显示 */}
          <button 
            className={`btn btn-success ${isBetting ? "loading" : ""}`}
            onClick={() => handleBet(true)}
            disabled={isBetting}
          >
            {isBetting ? "下注中..." : "继续游戏"}
          </button>
          
          <button 
            className={`btn btn-error ${isBetting ? "loading" : ""}`}
            onClick={() => handleBet(false)}
            disabled={isBetting}
          >
            {isBetting ? "下注中..." : "弃牌"}
          </button>
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
          {/* 庄家 */}
          <div className="border border-primary rounded-box p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">庄家</h3>
              <span className="badge badge-primary">已准备</span>
            </div>
            <Address address={tableInfo.bankerAddr} size="sm" />
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <Card value={0} />
              <Card value={0} />
              <Card value={0} />
              <Card value={0} />
              <Card value={0} />
            </div>
          </div>
          
          {/* 空位 */}
          <div className="border border-base-300 rounded-box p-4 flex items-center justify-center">
            <p className="text-xl text-base-content/50">等待玩家加入...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTablePage;