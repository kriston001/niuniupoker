import { useEffect, useRef } from "react";
import { Address, Log } from "viem";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { RoomCardPurchased, getActiveCardTypes, getUserRoomCards } from "~~/contracts/abis/BBRoomCardNFTABI";
import { RoomLevelPurchased, getActiveLevelTypes, getUserLevelDetails } from "~~/contracts/abis/BBRoomLevelNFTABI";
import { useGlobalState } from "~~/services/store/store";
import { RoomCardNftType, RoomLevelNftType, RoomCardNftDetail, RoomLevelNftDetail } from "~~/types/game-types";

/**
 * 获取NFT信息的钩子
 *
 * 该钩子用于获取用户拥有的BBRoomCard和BBRoomLevel NFT信息
 * 使用多种策略保持数据的实时性：
 * 1. 事件监听：监听合约事件，当事件触发时刷新数据
 * 2. 手动刷新：提供刷新函数，可以在需要时手动刷新数据
 * 3. 定时刷新：定期刷新数据，作为备份机制
 *
 * @param playerAddress 玩家地址
 * @returns NFT数据和操作函数
 */
export function useNFTData({ playerAddress }: { playerAddress: Address | undefined }) {
  const gameConfig = useGlobalState(state => state.gameConfig);

  const { data: roomCardTypesRaw, refetch: refetchRoomCardTypes } = useReadContract({
    address: gameConfig?.roomCardAddress,
    abi: [getActiveCardTypes],
    functionName: "getActiveCardTypes",
  });
  // 解析合约返回的数组
  const roomCardTypes = Array.isArray(roomCardTypesRaw) ? roomCardTypesRaw[1] as RoomCardNftType[] : undefined;


  const { data: myRoomCardNftsRaw, refetch: refetchMyRoomCardNfts } = useReadContract({
    address: gameConfig?.roomCardAddress,
    abi: [getUserRoomCards],
    functionName: "getUserRoomCards",
    args: playerAddress ? [playerAddress] : undefined, // 如果需要传参
    query: {
      enabled: Boolean(playerAddress),
    },
  });
  // 解析合约返回的数组
  const myRoomCardNfts = Array.isArray(myRoomCardNftsRaw) ? myRoomCardNftsRaw[1] as RoomCardNftDetail[] : undefined;

  const { data: roomLevelTypesRaw, refetch: refetchRoomLevelTypes } = useReadContract({
    address: gameConfig?.roomLevelAddress,
    abi: [getActiveLevelTypes],
    functionName: "getActiveLevelTypes",
  });

  // 解析合约返回的数组
  const roomLevelTypes = Array.isArray(roomLevelTypesRaw) ? roomLevelTypesRaw[1] as RoomLevelNftType[] : undefined;

  const { data: myRoomLevelNftsRaw, refetch: refetchMyRoomLevelNfts } = useReadContract({
    address: gameConfig?.roomLevelAddress,
    abi: [getUserLevelDetails],
    functionName: "getUserLevelDetails",
    args: playerAddress ? [playerAddress] : undefined, // 如果需要传参
    query: {
      enabled: Boolean(playerAddress),
    },
  });
  // 解析合约返回的数组
  const myRoomLevelNfts = Array.isArray(myRoomLevelNftsRaw) ? myRoomLevelNftsRaw[1] as RoomLevelNftDetail[] : undefined;

  // 刷新所有数据
  const refreshData = async () => {
    try {
      console.log("刷新NFT数据");
      await Promise.all([
        refetchRoomCardTypes(),
        refetchRoomLevelTypes(),
        refetchMyRoomCardNfts(),
        refetchMyRoomLevelNfts(),
      ]);
    } catch (err) {
      console.error("刷新NFT数据失败:", err);
    } finally {
    }
  };

  // 将 refreshData 保存到 ref 中
  const refreshDataRef = useRef(refreshData);
  refreshDataRef.current = refreshData;

  // 初始加载时刷新一次
  useEffect(() => {
    refreshDataRef.current();
  }, []);

  // 监听房卡购买事件
  useWatchContractEvent({
    address: gameConfig?.roomCardAddress as Address | undefined,
    abi: [RoomCardPurchased],
    eventName: "RoomCardPurchased",
    onLogs: (logs: Log[]) => {
      console.log("收到 RoomCardPurchased 事件:", logs);
      // @ts-ignore - 忽略类型错误，因为我们知道事件参数的结构
      if (logs.some(log => log.args?.buyer === playerAddress)) {
        refetchMyRoomCardNfts();
      }
    },
    onError: e => console.error("监听 RoomCardPurchased 出错:", e),
    enabled: Boolean(playerAddress),
  });

  // 监听房间等级购买事件
  useWatchContractEvent({
    address: gameConfig?.roomLevelAddress as Address | undefined,
    abi: [RoomLevelPurchased],
    eventName: "RoomLevelPurchased",
    onLogs: (logs: Log[]) => {
      console.log("收到 RoomLevelPurchased 事件:", logs);
      // @ts-ignore - 忽略类型错误，因为我们知道事件参数的结构
      if (logs.some(log => log.args?.buyer === playerAddress)) {
        refetchMyRoomLevelNfts();
      }
    },
    onError: e => console.error("监听 RoomLevelPurchased 出错:", e),
    enabled: Boolean(playerAddress),
  });

  return {
    roomCardTypes: roomCardTypes as RoomCardNftType[] | undefined,
    roomLevelTypes: roomLevelTypes as RoomLevelNftType[] | undefined,
    myRoomCardNfts: myRoomCardNfts as RoomCardNftDetail[] | undefined,
    myRoomLevelNfts: myRoomLevelNfts as RoomLevelNftDetail[] | undefined,
    // 刷新函数
    refreshData,
  };
}
