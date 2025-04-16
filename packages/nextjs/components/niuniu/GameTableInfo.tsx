"use client";

import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { GameTable, getGameStateName } from "~~/types/game-types";

interface GameTableInfoProps {
  tableInfo: GameTable;
}

const GameTableInfo = ({ tableInfo }: GameTableInfoProps) => {
  return (
    <div className="bg-base-200 rounded-box p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">游戏桌信息</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h3 className="font-bold mb-2">游戏桌名称</h3>
          <p className="text-lg">{tableInfo.tableName}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">庄家</h3>
          <Address address={tableInfo.bankerAddr} size="sm" />
        </div>
        <div>
          <h3 className="font-bold mb-2">下注金额</h3>
          <p className="text-lg">{formatEther(tableInfo.betAmount)} ETH</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">创建时间</h3>
          <p className="text-lg">{new Date(Number(tableInfo.creationTimestamp) * 1000).toLocaleString()}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">游戏状态</h3>
          <p className="text-lg">{getGameStateName(tableInfo.state)}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">玩家数量</h3>
          <p className="text-lg">
            {tableInfo.playerCount}/{tableInfo.maxPlayers}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameTableInfo;
