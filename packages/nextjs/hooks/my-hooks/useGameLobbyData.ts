import { useCallback, useEffect, useState } from "react";
import { useWatchContractEvent } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { GameTable } from "~~/utils/my-tools/types";

/**
 * 游戏大厅数据钩子
 *
 * 该钩子使用多种策略来保持数据的实时性：
 * 1. 事件监听：监听合约事件，当事件触发时刷新数据
 * 2. 手动刷新：提供刷新函数，可以在需要时手动刷新数据
 * 3. 定时刷新：定期刷新数据，作为备份机制
 *
 * @param refreshInterval 自动刷新间隔（毫秒），默认15秒
 * @returns 游戏大厅数据和操作函数
 */
export function useGameLobbyData({
  refreshInterval = 15000, // 默认15秒刷新一次
}: {
  refreshInterval?: number;
} = {}) {
  // 状态
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 读取所有游戏桌信息
  const {
    data: gameTables,
    isLoading: isLoadingTables,
    refetch: refetchGameTables,
  } = useScaffoldReadContract({
    contractName: "BBGameMain",
    functionName: "getAllGameTables",
  });

  // 创建游戏桌合约写入
  const { writeContractAsync: writeGameMainAsync } = useScaffoldWriteContract({
    contractName: "BBGameMain",
  });

  // 监听GameTableCreated事件
  useWatchContractEvent({
    address: process.env.NEXT_PUBLIC_BBGAMEMAIN_CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "tableAddr",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "banker",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "betAmount",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint8",
            name: "maxPlayers",
            type: "uint8",
          },
        ],
        name: "GameTableCreated",
        type: "event",
      },
    ],
    eventName: "GameTableCreated",
    onLogs: () => {
      refreshData();
    },
  });

  // 监听GameTableRemoved事件
  useWatchContractEvent({
    address: process.env.NEXT_PUBLIC_BBGAMEMAIN_CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "tableAddr",
            type: "address",
          },
        ],
        name: "GameTableRemoved",
        type: "event",
      },
    ],
    eventName: "GameTableRemoved",
    onLogs: () => {
      refreshData();
    },
  });

  // 刷新数据
  const refreshData = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      await refetchGameTables();
      setLastRefreshTime(Date.now());
    } catch (error) {
      console.error("Failed to refresh game tables:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetchGameTables]);

  // 定时刷新
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      // 只有当上次刷新时间超过指定间隔时才刷新
      if (Date.now() - lastRefreshTime >= refreshInterval) {
        refreshData();
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, lastRefreshTime, refreshData]);

  // 初始加载
  useEffect(() => {
    if (!isRefreshing && lastRefreshTime === 0) {
      refreshData();
    }
  }, [isRefreshing, lastRefreshTime, refreshData]);

  return {
    // 数据
    gameTables: gameTables as GameTable[] | undefined,

    // 加载状态
    isLoading: isLoadingTables || isRefreshing,

    // 操作函数
    refreshData,
    writeGameMainAsync,

    // 元数据
    lastRefreshTime,
  };
}
