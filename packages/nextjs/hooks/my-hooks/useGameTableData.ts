import { useCallback, useEffect, useState } from "react";
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
  refreshInterval = 15000, // 默认15秒刷新一次
}: {
  tableAddress: Address | undefined;
  playerAddress: Address | undefined;
  gameTableAbi: Abi;
  refreshInterval?: number;
}) {
  // 状态
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 公共客户端，用于multicall
  const publicClient = usePublicClient();

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
      enabled: Boolean(tableAddress && playerAddress),
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
      enabled: Boolean(tableAddress),
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
      enabled: Boolean(tableAddress),
    },
  });

  // 监听GameChanged事件
  useWatchContractEvent({
    address: tableAddress,
    abi: gameTableAbi,
    eventName: "GameChanged",
    onLogs: () => {
      refreshAllData();
    },
  });

  // 监听PlayerStateChanged事件
  useWatchContractEvent({
    address: tableAddress,
    abi: gameTableAbi,
    eventName: "PlayerStateChanged",
    onLogs: () => {
      refreshAllData();
    },
  });

  // 监听CardDealt事件
  useWatchContractEvent({
    address: tableAddress,
    abi: gameTableAbi,
    eventName: "CardDealt",
    onLogs: () => {
      refreshAllData();
    },
  });

  // 监听CardTypeCalculated事件
  useWatchContractEvent({
    address: tableAddress,
    abi: gameTableAbi,
    eventName: "CardTypeCalculated",
    onLogs: () => {
      refreshAllData();
    },
  });

  // 使用multicall一次性获取所有数据
  const fetchAllDataWithMulticall = useCallback(async () => {
    if (!tableAddress) return null;

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

      const results = await multicall(wagmiConfig, {
        contracts: calls as any[],
      });

      return {
        tableInfo: results[0].result,
        allPlayers: results[1].result,
        playerData: playerAddress ? results[2].result : null,
      };
    } catch (error) {
      console.error("Failed to fetch data with multicall:", error);
      return null;
    }
  }, [tableAddress, playerAddress, gameTableAbi]);

  // 刷新所有数据
  const refreshAllData = useCallback(async () => {
    if (isRefreshing || !tableAddress) return;

    try {
      setIsRefreshing(true);

      // 使用单独的refetch或multicall
      if (publicClient) {
        const data = await fetchAllDataWithMulticall();
        // 如果multicall失败，回退到单独的refetch
        if (!data) {
          await Promise.all([
            refetchTableInfo(),
            refetchAllPlayers(),
            playerAddress ? refetchPlayerData() : Promise.resolve(),
          ]);
        }
      } else {
        await Promise.all([
          refetchTableInfo(),
          refetchAllPlayers(),
          playerAddress ? refetchPlayerData() : Promise.resolve(),
        ]);
      }

      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    isRefreshing,
    tableAddress,
    playerAddress,
    publicClient,
    fetchAllDataWithMulticall,
    refetchTableInfo,
    refetchAllPlayers,
    refetchPlayerData,
  ]);

  // 定时刷新
  useEffect(() => {
    if (!tableAddress || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      // 只有当上次刷新时间超过指定间隔时才刷新
      if (Date.now() - lastRefreshTime >= refreshInterval) {
        refreshAllData();
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [tableAddress, refreshInterval, lastRefreshTime, refreshAllData]);

  // 初始加载
  useEffect(() => {
    if (tableAddress && !isRefreshing && lastRefreshTime === 0) {
      refreshAllData();
    }
  }, [tableAddress, isRefreshing, lastRefreshTime, refreshAllData]);

  // 当玩家地址变化时刷新
  useEffect(() => {
    if (tableAddress && playerAddress) {
      refreshAllData();
    }
  }, [tableAddress, playerAddress, refreshAllData]);

  return {
    // 数据
    playerData: playerData as Player | undefined,
    allPlayers: allPlayersData as Player[] | undefined,
    tableInfo: tableInfo as GameTable | undefined,

    // 加载状态
    isLoading: isLoadingPlayerData || isLoadingAllPlayers || isLoadingTableInfo || isRefreshing,
    isError: isPlayerDataError || isAllPlayersError || isTableInfoError,

    // 刷新函数
    refreshData: refreshAllData,

    // 元数据
    lastRefreshTime,
  };
}
