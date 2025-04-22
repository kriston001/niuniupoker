import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { multicall } from "@wagmi/core";
import { Address } from "viem";
import { usePublicClient, useReadContract, useWatchContractEvent } from "wagmi";
import { GameTableChanged, getAllPlayerData, getPlayerData, getTableInfo } from "~~/contracts/abis/BBGameTableABI";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { GameTable, Player, PlayerCard } from "~~/types/game-types";

/**
 * 游戏桌数据钩子
 *
 * 该钩子使用多种策略来保持数据的实时性：
 * 1. 事件监听：监听合约事件，当事件触发时刷新数据
 * 2. 手动刷新：提供刷新函数，可以在需要时手动刷新数据
 * 3. 定时刷新：定期刷新数据，作为备份机制
 *
 * @param tableAddress 游戏桌合约地址
 * @param playerAddress 当前玩家地址
 * @param gameTableAbi 游戏桌合约ABI
 * @param refreshInterval 自动刷新间隔（毫秒），默认15秒
 * @returns 游戏桌数据和操作函数
 */
export function useGameTableData({
  tableAddress,
  playerAddress,
  refreshInterval = 10000, // 默认10秒刷新一次
}: {
  tableAddress: Address | undefined;
  playerAddress: Address | undefined;
  refreshInterval?: number;
}) {
  // 所有 ref 的初始化
  const refreshLockRef = useRef(false);
  const lastRefreshTimeRef = useRef<number>(0);
  const refreshIntervalRef = useRef(refreshInterval);
  const refreshAllDataRef = useRef<(() => Promise<void>) | null>(null);
  
  

  // 读取合约数据
  const {
    data: playerData,
    refetch: refetchPlayerData,
  } = useReadContract({
    address: tableAddress,
    abi: [getPlayerData],
    functionName: "getPlayerData",
    args: [playerAddress],
    query: {
      enabled: Boolean(tableAddress && playerAddress && tableAddress !== "" && playerAddress !== ""),
    },
  });

  const {
    data: allPlayersData,
    refetch: refetchAllPlayers,
  } = useReadContract({
    address: tableAddress,
    abi: [getAllPlayerData],
    functionName: "getAllPlayerData",
    query: {
      enabled: Boolean(tableAddress && tableAddress !== ""),
    },
  });

  const {
    data: tableInfo,
    refetch: refetchTableInfo,
  } = useReadContract({
    address: tableAddress,
    abi: [getTableInfo],
    functionName: "getTableInfo",
    query: {
      enabled: Boolean(tableAddress && tableAddress !== ""),
    },
  });

  // 将 refetch 函数存储在 ref 中
  const refetchTableInfoRef = useRef(refetchTableInfo);
  const refetchAllPlayersRef = useRef(refetchAllPlayers);
  const refetchPlayerDataRef = useRef(refetchPlayerData);

  // 更新 refetch 函数的 ref
  useEffect(() => {
    refetchTableInfoRef.current = refetchTableInfo;
    refetchAllPlayersRef.current = refetchAllPlayers;
    refetchPlayerDataRef.current = refetchPlayerData;
  }, [refetchTableInfo, refetchAllPlayers, refetchPlayerData]);

  // 刷新数据函数
  const refreshAllData = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 2000) return;
    if (refreshLockRef.current) return;
    if (!tableAddress || tableAddress === "") return;

    refreshLockRef.current = true;
    try {
      console.log("refreshAllData");
      await Promise.all([
        refetchTableInfoRef.current?.(),
        refetchAllPlayersRef.current?.(),
        playerAddress ? refetchPlayerDataRef.current?.() : Promise.resolve(),
      ]);
      lastRefreshTimeRef.current = now;
    } finally {
      refreshLockRef.current = false;
    }
  }, [tableAddress, playerAddress]); // 只依赖这两个地址

  // 更新 refreshAllData ref
  useEffect(() => {
    refreshAllDataRef.current = refreshAllData;
  }, [refreshAllData]);

  // 监听地址变化并刷新数据
  useEffect(() => {
    if (!tableAddress || tableAddress === "") return;
    refreshAllData();
  }, [tableAddress, playerAddress]); // 只在地址变化时刷新

  // 定时刷新
  useEffect(() => {
    if (refreshIntervalRef.current <= 0) return;
    if (!tableAddress || tableAddress === "") return;

    const intervalId = setInterval(() => {
      refreshAllDataRef.current?.();
    }, refreshIntervalRef.current);

    return () => clearInterval(intervalId);
  }, [tableAddress]); // 只在 tableAddress 变化时重设定时器

  // 事件监听
  useWatchContractEvent({
    address: tableAddress,
    abi: [GameTableChanged],
    eventName: "GameTableChanged",
    onLogs: () => {
      refreshAllDataRef.current?.();
    },
    onError: error => {
      console.error("Error watching GameTableChanged event:", error);
    },
    enabled: Boolean(tableAddress && tableAddress !== ""),
  });

  // 检查玩家数据是否有效
  const validPlayerData = playerData as Player | undefined;
  const isValidPlayer =
    validPlayerData &&
    validPlayerData.addr !== "0x0000000000000000000000000000000000000000" &&
    validPlayerData.state !== 0;

  // 返回值
  return useMemo(
    () => ({
      playerData: isValidPlayer ? validPlayerData : undefined,
      allPlayers: allPlayersData as Player[] | undefined,
      tableInfo: tableInfo as GameTable | undefined,
      refreshData: refreshAllData,
    }),
    [validPlayerData, allPlayersData, tableInfo, refreshAllData]
  );
}

