import { useEffect, useRef, useState } from "react";
import { multicall } from "@wagmi/core";
import { type Abi } from "abitype";
import { Address } from "viem";
import { usePublicClient, useReadContract, useWatchContractEvent } from "wagmi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { GameTable, Player } from "~~/utils/my-tools/types";

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
  gameTableAbi,
  refreshInterval = 10000, // 默认15秒刷新一次
}: {
  tableAddress: Address | undefined;
  playerAddress: Address | undefined;
  gameTableAbi: Abi;
  refreshInterval?: number;
}) {
  // 公共客户端，用于multicall
  // const publicClient = usePublicClient();

  // 读取玩家数据
  const {
    data: playerData,
    isLoading: isLoadingPlayerData,
    isError: isPlayerDataError,
    refetch: refetchPlayerData,
  } = useReadContract({
    address: tableAddress,
    abi: gameTableAbi,
    functionName: "getPlayerData",
    args: [playerAddress],
    query: {
      enabled: Boolean(tableAddress && playerAddress && tableAddress !== "" && playerAddress !== ""),
    },
  });

  // 读取所有玩家数据
  const {
    data: allPlayersData,
    isLoading: isLoadingAllPlayers,
    isError: isAllPlayersError,
    refetch: refetchAllPlayers,
  } = useReadContract({
    address: tableAddress,
    abi: gameTableAbi,
    functionName: "getAllPlayerData",
    query: {
      enabled: Boolean(tableAddress && tableAddress !== ""),
    },
  });

  // 读取游戏桌信息
  const {
    data: tableInfo,
    isLoading: isLoadingTableInfo,
    isError: isTableInfoError,
    refetch: refetchTableInfo,
  } = useReadContract({
    address: tableAddress,
    abi: gameTableAbi,
    functionName: "getTableInfo",
    query: {
      enabled: Boolean(tableAddress && tableAddress !== ""),
    },
  });

  // 监听游戏状态变化事件
  useWatchContractEvent({
    address: tableAddress,
    abi: gameTableAbi,
    eventName: "GameTableChanged",
    onLogs: logs => {
      console.log("GameTableChanged event:", logs);
      refreshAllData();
    },
    onError: error => {
      console.error("Error watching GameTableChanged event:", error);
    },
    enabled: Boolean(tableAddress && tableAddress !== ""),
  });

  // 使用multicall一次性获取所有数据
  const fetchAllDataWithMulticall = async () => {
    if (!tableAddress || tableAddress === "") return null;

    try {
      interface ContractCall {
        address: string;
        abi: any;
        functionName: string;
        args?: any[];
      }

      const baseCall = {
        address: tableAddress,
        abi: gameTableAbi,
      } as const;

      const calls: ContractCall[] = [
        {
          ...baseCall,
          functionName: "getTableInfo",
        },
        {
          ...baseCall,
          functionName: "getAllPlayerData",
        },
      ];

      // If there's a player address, add player data query
      if (playerAddress) {
        calls.push({
          ...baseCall,
          functionName: "getPlayerData",
          args: [playerAddress],
        });
      }

      console.log("执行 multicall...");
      const results = await multicall(wagmiConfig, {
        contracts: calls as any[],
      });

      console.log("multicall 结果:", results);
      return {
        tableInfo: results[0].result,
        allPlayers: results[1].result,
        playerData: playerAddress ? results[2].result : null,
      };
    } catch (error) {
      console.error("Failed to fetch data with multicall:", error);
      return null;
    }
  };

  // 刷新所有数据 - 普通函数，不使用 useCallback
  const refreshAllData = async () => {
    if (!tableAddress) {
      console.log("没有有效的 tableAddress，跳过刷新");
      return;
    }

    console.log("开始刷新数据...");

    try {
      // if (publicClient) {
      //   const data = await fetchAllDataWithMulticall();
      //   if (data) {
      //     console.log("使用 multicall 成功获取数据");
      //     // 这里不需要额外的 refetch，因为 multicall 已经获取了最新数据
      //     return;
      //   }
      //   console.log("multicall 失败，回退到单独请求");
      // }

      await Promise.all([
        refetchTableInfo(),
        refetchAllPlayers(),
        playerAddress ? refetchPlayerData() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("刷新数据失败:", error);
    } finally {
    }
  };

  const refreshAllDataRef = useRef(refreshAllData);
  const refreshIntervalRef = useRef(refreshInterval);

  // 初始加载时执行一次
  useEffect(() => {
    if (!tableAddress || tableAddress === "") return;
    refreshAllDataRef.current();
  }, [tableAddress]); // 只在表地址变化时执行

  // 定时执行 - 只在组件挂载时设置一次定时器
  useEffect(() => {
    if (refreshIntervalRef.current <= 0) return;

    const intervalId = setInterval(() => {
      if (!tableAddress || tableAddress === "") return;
      refreshAllDataRef.current();
    }, refreshIntervalRef.current);

    // 组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, [tableAddress]);

  // 检查玩家数据是否有效（玩家地址不为零地址且状态不为NONE）
  const validPlayerData = playerData as Player | undefined;
  const isValidPlayer =
    validPlayerData &&
    validPlayerData.playerAddr !== "0x0000000000000000000000000000000000000000" &&
    validPlayerData.state !== 0; // PlayerState.NONE = 0

  return {
    // 数据
    playerData: isValidPlayer ? validPlayerData : undefined,
    allPlayers: allPlayersData as Player[] | undefined,
    tableInfo: tableInfo as GameTable | undefined,

    // 加载状态
    isLoading: isLoadingPlayerData || isLoadingAllPlayers || isLoadingTableInfo,
    isError: isPlayerDataError || isAllPlayersError || isTableInfoError,

    // 刷新函数
    refreshData: refreshAllData,
  };
}
