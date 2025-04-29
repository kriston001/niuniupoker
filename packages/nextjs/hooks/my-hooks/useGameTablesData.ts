import { useEffect, useRef } from "react";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { GameTableCreated, getNewestGameTables } from "~~/contracts/abis/BBGameMainABI";
import scaffoldConfig from "~~/scaffold.config";
import { GameTable } from "~~/types/game-types";
import debounce from "lodash.debounce";

export function useGameTablesData({ refreshInterval = 0, limit = 10 }: { refreshInterval?: number; limit?: number }) {
  const refreshIntervalRef = useRef(refreshInterval);

  const {
    data: gameTables,
    isLoading: isLoadingTables,
    refetch: refetchData
  } = useReadContract({
    address: scaffoldConfig.contracts.BBGameMain,
    abi: [getNewestGameTables],
    args: [limit],
    functionName: "getNewestGameTables",
  });


  // refetchGameTables 保存在 ref 中，防止依赖变化引发副作用
  const refetchDataRef = useRef(refetchData);

  // 创建防抖函数的 ref
  const debouncedRefetchRef = useRef(
    debounce(() => {
      refetchDataRef.current?.();
    }, 2000),
  );

  // 更新 refetch 函数的 ref
  useEffect(() => {
    refetchDataRef.current = refetchData;
  }, [refetchData]);

  // 监听地址变化并刷新数据
  useEffect(() => {
    debouncedRefetchRef.current?.();
  }, []);

  // ✅ 定时刷新
  useEffect(() => {
    if (refreshIntervalRef.current <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      refetchDataRef.current();
    }, refreshIntervalRef.current);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshInterval, limit]);

  // ✅ 事件监听（创建）
  useWatchContractEvent({
    address: scaffoldConfig.contracts.BBGameMain,
    abi: [GameTableCreated],
    eventName: "GameTableCreated",
    onLogs: logs => {
      console.log("收到 GameTableCreated 事件:", logs);
      refetchDataRef.current();
    },
    onError: e => console.error("监听 GameTableCreated 出错:", e),
    enabled: true,
  });

  // 修改返回值，只在真正加载数据时才显示加载状态
  return {
    gameTables: gameTables as GameTable[] | undefined,
    isLoading: isLoadingTables,
    refetchData,
  };
}
