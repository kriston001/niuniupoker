"use client";

import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";
import { useGameLobbyData } from "../../hooks/my-hooks/useGameLobbyData";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import BBContractAbis from "~~/contracts/contractABIs";
import { useWriteContractWithCallback } from "~~/hooks/useWriteContractWithCallback";
import { getGameStateName } from "~~/utils/my-tools/types";
import RoomCard from "~~/components/niuniu/RoomCard";

const NiuNiuPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tableName, setTableName] = useState("");
  const [betAmount, setBetAmount] = useState("0.01");
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [selectedRoomCardId, setSelectedRoomCardId] = useState<number | null>(null);
  const [roomCardEnabled, setRoomCardEnabled] = useState(false);
  const [userRoomCards, setUserRoomCards] = useState<{hasCard: boolean, cardIds: bigint[]}>({hasCard: false, cardIds: []});

  const gameMainAbi = BBContractAbis.BBGameMain.abi;

  // 使用自定义钩子获取游戏大厅数据
  const {
    gameTables,
    isLoading: isLoadingTables,
    refreshData,
  } = useGameLobbyData({
    gameMainAbi,
    refreshInterval: 15000, // 15秒自动刷新一次
  });

  // 使用自定义的 Hook
  const { writeContractWithCallback } = useWriteContractWithCallback();

  // 处理创建游戏桌
  const handleCreateTable = async () => {
    if (!connectedAddress) return;

    try {
      setIsCreatingTable(true);
      const parsedBetAmount = parseEther(betAmount);

      // 如果启用了房卡功能且没有选择房卡，提示用户
      if (roomCardEnabled && selectedRoomCardId === null) {
        alert("请选择一张房卡用于创建游戏桌");
        setIsCreatingTable(false);
        return;
      }

      // 准备合约调用参数
      const contractArgs = roomCardEnabled && selectedRoomCardId !== null
        ? [tableName, parsedBetAmount, maxPlayers, selectedRoomCardId]
        : [tableName, parsedBetAmount, maxPlayers];
      
      console.log("创建游戏桌参数:", {
        roomCardEnabled,
        selectedRoomCardId,
        contractArgs
      });

      await writeContractWithCallback({
        address: BBContractAbis.BBGameMain.address,
        abi: gameMainAbi,
        functionName: "createGameTable",
        args: contractArgs,
        value: parsedBetAmount,
        account: connectedAddress as `0x${string}`,
        onSuccess: async () => {
          console.log("✅ 交易成功");
          // 重置表单
          setTableName("");
          setBetAmount("0.01");
          setMaxPlayers(5);
          setSelectedRoomCardId(null);

          // 刷新游戏桌列表
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error) {
      console.error("创建游戏桌失败:", error);
    } finally {
      setIsCreatingTable(false);
    }
  };

  // 处理房卡选择
  const handleRoomCardSelect = (cardId: number) => {
    setSelectedRoomCardId(cardId);
  };

  // 处理房卡变化
  const handleRoomCardChange = () => {
    // 房卡变化后刷新数据
    refreshData();
  };

  // 从RoomCard组件获取房卡启用状态
  const handleRoomCardEnabledChange = (enabled: boolean) => {
    setRoomCardEnabled(enabled);
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
          </div>
        </div>
      )}

      {/* 房卡管理 */}
      <RoomCard 
        onRoomCardChange={handleRoomCardChange} 
        onSelectCard={handleRoomCardSelect}
        selectedCardId={selectedRoomCardId}
        onRoomCardEnabledChange={handleRoomCardEnabledChange}
      />

      {/* 创建游戏桌 */}
      <div className="bg-base-200 rounded-box p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">创建新游戏桌</h2>
        {roomCardEnabled && (
          <div className="alert alert-info mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{selectedRoomCardId !== null ? `已选择房卡 #${selectedRoomCardId}，将使用此房卡创建游戏桌` : '请在上方选择一张房卡用于创建游戏桌'}</span>
          </div>
        )}
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
              onChange={e => setTableName(e.target.value)}
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
              onChange={e => setBetAmount(e.target.value)}
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
              onChange={e => setMaxPlayers(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button
              className={`btn btn-primary w-full ${isCreatingTable ? "loading" : ""}`}
              onClick={handleCreateTable}
              disabled={!connectedAddress || isCreatingTable || !tableName || parseFloat(betAmount) <= 0 || (roomCardEnabled && selectedRoomCardId === null)}
            >
              {isCreatingTable ? "创建中..." : "创建游戏桌"}
            </button>
          </div>
        </div>
      </div>

      {/* 游戏桌列表 */}
      <div className="bg-base-200 rounded-box p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">可用游戏桌</h2>
          <button className="btn btn-outline btn-sm" onClick={() => refreshData()} disabled={isLoadingTables}>
            {isLoadingTables ? "刷新中..." : "刷新列表"}
          </button>
        </div>
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
                {gameTables.map(table => (
                  <tr key={table.tableAddr}>
                    <td>{table.tableName}</td>
                    <td>
                      <Address address={table.bankerAddr} size="sm" />
                    </td>
                    <td>{formatEther(table.betAmount)} ETH</td>
                    <td>
                      {table.playerCount}/{table.maxPlayers}
                    </td>
                    <td>{getGameStateName(table.state)}</td>
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
