import { useEffect, useRef } from "react";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { GameTableCreated, GameTableRemoved, getNewestGameTables } from "~~/contracts/abis/BBGameMainABI";
import scaffoldConfig from "~~/scaffold.config";
import { GameTable } from "~~/types/game-types";

export function useGameLobbyData({ refreshInterval = 10000 }: { refreshInterval?: number }) {
  const refreshLockRef = useRef(false);
  // const lastRefreshTimeRef = useRef<number>(0);
  const refreshIntervalRef = useRef(refreshInterval);

  const {
    data: gameTables,
    isLoading: isLoadingTables,
    refetch: refetchGameTables,
  } = useReadContract({
    address: scaffoldConfig.contracts.BBGameMain,
    abi: [getNewestGameTables],
    functionName: "getNewestGameTables",
  });

  // refetchGameTables 保存在 ref 中，防止依赖变化引发副作用
  const refetchRef = useRef(refetchGameTables);
  refetchRef.current = refetchGameTables;

  const refreshData = async () => {
    // 添加节流：如果距离上次刷新不足2秒，则跳过
    // const now = Date.now();
    // if (now - lastRefreshTimeRef.current < 2000) {
    //   return;
    // }
    console.log("刷新lobby数据");

    if (refreshLockRef.current) return;
    refreshLockRef.current = true;

    try {
      await refetchRef.current();
      // lastRefreshTimeRef.current = now;
    } catch (err) {
      console.error("刷新游戏桌失败:", err);
    } finally {
      refreshLockRef.current = false;
    }
  };

  // 将 refreshData 保存到 ref 中
  const refreshDataRef = useRef(refreshData);
  refreshDataRef.current = refreshData;

  // ✅ 初始加载时刷新一次
  useEffect(() => {
    refreshDataRef.current();
  }, []);

  // ✅ 定时刷新
  useEffect(() => {
    if (refreshIntervalRef.current <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      refreshDataRef.current();
    }, refreshIntervalRef.current);

    return () => {
      clearInterval(intervalId);
    };
  }, []); // 空依赖数组，只在组件挂载时设置一次定时器

  // ✅ 事件监听（创建）
  useWatchContractEvent({
    address: scaffoldConfig.contracts.BBGameMain,
    abi: [GameTableCreated],
    eventName: "GameTableCreated",
    onLogs: logs => {
      console.log("收到 GameTableCreated 事件:", logs);
      refreshDataRef.current();
    },
    onError: e => console.error("监听 GameTableCreated 出错:", e),
    enabled: true,
  });

  // ✅ 事件监听（移除）
  useWatchContractEvent({
    address: scaffoldConfig.contracts.BBGameMain,
    abi: [GameTableRemoved],
    eventName: "GameTableRemoved",
    onLogs: logs => {
      console.log("收到 GameTableRemoved 事件:", logs);
      refreshDataRef.current();
    },
    onError: e => console.error("监听 GameTableRemoved 出错:", e),
    enabled: true,
  });

  // 修改返回值，只在真正加载数据时才显示加载状态
  return {
    gameTables: gameTables as GameTable[] | undefined,
    isLoading: isLoadingTables,
    refreshData,
  };
}
