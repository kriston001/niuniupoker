"use client";

import { Address } from "~~/components/scaffold-eth";
import { formatEther } from "viem";

// 游戏桌信息类型定义
type GameTable = {
  name: string;
  tableContract: string;
  isActive: boolean;
  creationTime: bigint;
  banker: string;
  betAmount: bigint;
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

interface GameTableInfoProps {
  tableInfo: GameTable;
  gameState?: number; // 游戏状态
  playerCount?: number; // 玩家数量
  maxPlayers?: number; // 最大玩家数
}

const GameTableInfo = ({ tableInfo, gameState = GameState.WAITING, playerCount = 1, maxPlayers = 5 }: GameTableInfoProps) => {
  return (
    <div className="bg-base-200 rounded-box p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">游戏桌信息</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h3 className="font-bold mb-2">游戏桌名称</h3>
          <p className="text-lg">{tableInfo.name}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">庄家</h3>
          <Address address={tableInfo.banker} size="sm" />
        </div>
        <div>
          <h3 className="font-bold mb-2">下注金额</h3>
          <p className="text-lg">{formatEther(tableInfo.betAmount)} ETH</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">创建时间</h3>
          <p className="text-lg">{new Date(Number(tableInfo.creationTime) * 1000).toLocaleString()}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">游戏状态</h3>
          <p className="text-lg">{getGameStateName(gameState)}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">玩家数量</h3>
          <p className="text-lg">{playerCount}/{maxPlayers}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">合约地址</h3>
          <Address address={tableInfo.tableContract} size="sm" />
        </div>
        <div>
          <h3 className="font-bold mb-2">状态</h3>
          <p className="text-lg">{tableInfo.isActive ? "活跃" : "已结束"}</p>
        </div>
      </div>
    </div>
  );
};

export default GameTableInfo;