"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

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

const NiuNiuPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tableName, setTableName] = useState("");
  const [betAmount, setBetAmount] = useState("0.01");
  const [maxPlayers, setMaxPlayers] = useState(5);

  // 读取所有游戏桌信息
  const { data: gameTables, isLoading: isLoadingTables } = useScaffoldReadContract({
    contractName: "BBGameMain",
    functionName: "getAllGameTables",
    watch: true,
  });

  // 读取用户余额
  const { data: userBalance, isLoading: isLoadingBalance } = useScaffoldReadContract({
    contractName: "BBGameMain",
    functionName: "getUserBalance",
    args: [connectedAddress],
    watch: true,
  });

  // 创建游戏桌合约写入
  const { writeContractAsync: writeGameMainAsync } = useScaffoldWriteContract({
    contractName: "BBGameMain"
  });

  // 处理创建游戏桌
  const handleCreateTable = async () => {
    if (!connectedAddress) return;
    
    try {
      setIsCreatingTable(true);
      const parsedBetAmount = parseEther(betAmount);
      
      await writeGameMainAsync({
        functionName: "createGameTable",
        args: [tableName, parsedBetAmount, maxPlayers],
        value: parsedBetAmount,
      });
      
      // 重置表单
      setTableName("");
      setBetAmount("0.01");
      setMaxPlayers(5);
    } catch (error) {
      console.error("创建游戏桌失败:", error);
    } finally {
      setIsCreatingTable(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">牛牛游戏大厅</h1>
        <p className="text-xl">创建或加入一个游戏桌开始玩牛牛</p>
      </div>

      {/* 用户信息 */}
      {connectedAddress && (
        <div className="bg-base-200 rounded-box p-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">您的账户</h2>
              <Address address={connectedAddress} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">账户余额</h2>
              <Balance address={connectedAddress} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">游戏余额</h2>
              {isLoadingBalance ? (
                <div className="animate-pulse h-6 w-24 bg-base-300 rounded"></div>
              ) : (
                <div className="text-xl">{userBalance ? formatEther(userBalance) : "0"} ETH</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 创建游戏桌 */}
      <div className="bg-base-200 rounded-box p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">创建新游戏桌</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">
              <span className="label-text font-bold">游戏桌名称</span>
            </label>
            <input
              type="text"
              placeholder="输入游戏桌名称"
              className="input input-bordered w-full"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text font-bold">下注金额 (ETH)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="输入下注金额"
              className="input input-bordered w-full"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text font-bold">最大玩家数</span>
            </label>
            <input
              type="number"
              min="2"
              max="10"
              placeholder="输入最大玩家数"
              className="input input-bordered w-full"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button
              className={`btn btn-primary w-full ${isCreatingTable ? "loading" : ""}`}
              onClick={handleCreateTable}
              disabled={!connectedAddress || isCreatingTable || !tableName || parseFloat(betAmount) <= 0}
            >
              {isCreatingTable ? "创建中..." : "创建游戏桌"}
            </button>
          </div>
        </div>
      </div>

      {/* 游戏桌列表 */}
      <div className="bg-base-200 rounded-box p-6">
        <h2 className="text-2xl font-bold mb-4">可用游戏桌</h2>
        {isLoadingTables ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : gameTables && gameTables.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>游戏桌名称</th>
                  <th>庄家</th>
                  <th>下注金额</th>
                  <th>玩家数量</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {gameTables.map((table: GameTable, index: number) => (
                  <tr key={index}>
                    <td>{table.tableName}</td>
                    <td>
                      <Address address={table.bankerAddr} size="sm" />
                    </td>
                    <td>{formatEther(table.betAmount)} ETH</td>
                    <td>{table.playerCount}/{table.maxPlayers}</td>
                    <td>{getGameState(table.state)}</td>
                    <td>{new Date(Number(table.creationTimestamp) * 1000).toLocaleString()}</td>
                    <td>
                      <Link href={`/niuniu/table/${table.tableAddr}`} passHref>
                        <button className="btn btn-sm btn-primary">进入</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl">暂无可用游戏桌，创建一个新的游戏桌开始游戏吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NiuNiuPage;

// 添加一个辅助函数来转换游戏状态
const getGameState = (state: number): string => {
  switch (state) {
    case 0:
      return "等待中";
    case 1:
      return "第一轮下注";
    case 2:
      return "第二轮下注";
    case 3:
      return "已结束";
    default:
      return "未知状态";
  }
};