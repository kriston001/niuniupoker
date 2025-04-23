import { useEffect, useMemo, useRef } from "react";
import { Address } from "viem";
import { useReadContracts, useWatchContractEvent } from "wagmi";
import { GameTableChanged, getAllPlayerData, getPlayerData, getTableInfo } from "~~/contracts/abis/BBGameTableABI";
import { getUserRoomCards } from "~~/contracts/abis/BBRoomCardNFTABI";
import { convertToMyRoomCardNft } from "~~/lib/utils";
import { useGlobalState } from "~~/services/store/store";
import { GameTable, Player, RoomCardNftDetail } from "~~/types/game-types";

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
  const gameConfig = useGlobalState(state => state.gameConfig);

  let playerData = undefined;
  let allPlayersData = undefined;
  let tableInfo = undefined;
  const myRoomCardNfts: any[] = [];

  // 所有 ref 的初始化
  const refreshIntervalRef = useRef(refreshInterval);

  const contracts = [
    {
      address: tableAddress,
      abi: [getPlayerData],
      functionName: "getPlayerData",
      args: [playerAddress],
    },
    {
      address: tableAddress,
      abi: [getAllPlayerData],
      functionName: "getAllPlayerData",
    },
    {
      address: tableAddress,
      abi: [getTableInfo],
      functionName: "getTableInfo",
    },
    {
      address: gameConfig?.roomCardAddress,
      abi: [getUserRoomCards],
      functionName: "getUserNfts",
      args: [playerAddress],
    },
  ] as const;

  const { data, refetch: refetchData } = useReadContracts({
    contracts: contracts,
    query: {
      enabled: Boolean(tableAddress && tableAddress !== ""),
    },
  });

  if (data) {
    console.log("useGameTableData：", data);
    playerData = data[0].status === "success" ? data[0].result : undefined;
    allPlayersData = data[1].status === "success" ? data[1].result : undefined;
    tableInfo = data[2].status === "success" ? data[2].result : undefined;

    if (data[3].status === "success") {
      const myRoomCardNfts = Array.isArray(data[3].result) ? (data[3].result[1] as RoomCardNftDetail[]) : [];
      myRoomCardNfts.push(...convertToMyRoomCardNft(myRoomCardNfts));
    }
  }

  const refetchDataRef = useRef(refetchData);

  // 更新 refetch 函数的 ref
  useEffect(() => {
    refetchDataRef.current = refetchData;
  }, [refetchData]);

  // 监听地址变化并刷新数据
  useEffect(() => {
    if (!tableAddress || tableAddress === "") return;
    refetchDataRef.current?.();
  }, [tableAddress, playerAddress]); // 只在地址变化时刷新

  // 定时刷新
  useEffect(() => {
    if (refreshIntervalRef.current <= 0) return;

    const intervalId = setInterval(() => {
      refetchDataRef.current?.();
    }, refreshIntervalRef.current);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // 事件监听
  useWatchContractEvent({
    address: tableAddress,
    abi: [GameTableChanged],
    eventName: "GameTableChanged",
    onLogs: () => {
      refetchDataRef.current?.();
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
      myRoomCardNfts: myRoomCardNfts as any[],
      refreshData: refetchData,
    }),
    [validPlayerData, allPlayersData, tableInfo, refetchData],
  );
}
