import { useEffect, useRef } from "react";
import { Address, Log } from "viem";
import { useWatchContractEvent, useReadContracts } from "wagmi";
import { RoomCardPurchased, getActiveCardTypes, getUserRoomCards } from "~~/contracts/abis/BBRoomCardNFTABI";
import { RoomLevelPurchased, getActiveLevelTypes, getUserLevelDetails } from "~~/contracts/abis/BBRoomLevelNFTABI";
import { useGlobalState } from "~~/services/store/store";
import { RoomCardNftDetail, RoomCardNftType, RoomLevelNftDetail, RoomLevelNftType } from "~~/types/game-types";
import { convertToMyRoomCardNft, convertToMyRoomLevelNft } from "~~/lib/utils";
import debounce from "lodash.debounce";

/**
 * 获取NFT信息的钩子
 *
 * 该钩子用于获取用户拥有的BBRoomCard和BBRoomLevel NFT信息
 * 使用多种策略保持数据的实时性：
 * 1. 事件监听：监听合约事件，当事件触发时刷新数据
 * 2. 手动刷新：提供刷新函数，可以在需要时手动刷新数据
 *
 * @param playerAddress 玩家地址
 * @returns NFT数据和操作函数
 */
export function useNFTData({ playerAddress }: { playerAddress: Address | undefined }) {
  const gameConfig = useGlobalState(state => state.gameConfig);

  let roomCardTypes: any[] = [];
  let roomLevelTypes: any[] = [];
  const myNfts: any[] = [];
  const contracts = [
    {
      address: gameConfig?.roomCardAddress,
      abi: [getActiveCardTypes],
      functionName: "getActiveTypes",
    },
    {
      address: gameConfig?.roomCardAddress,
      abi: [getUserRoomCards],
      functionName: "getUserNfts",
      args: playerAddress ? [playerAddress] : undefined, // 如果需要传参
    },
    {
      address: gameConfig?.roomLevelAddress,
      abi: [getActiveLevelTypes],
      functionName: "getActiveTypes",
    },
    {
      address: gameConfig?.roomLevelAddress,
      abi: [getUserLevelDetails],
      functionName: "getUserNfts",
      args: playerAddress ? [playerAddress] : undefined, // 如果需要传参
    },
  ] as const;

  const { data, refetch: refetchData } = useReadContracts({
    contracts: contracts
  });

  if (data) {
    console.log("useNFTData：", data);
    const roomCardTypesRaw = data[0].status === "success" ? data[0].result : undefined;
    roomCardTypes = Array.isArray(roomCardTypesRaw) ? (roomCardTypesRaw[1] as RoomCardNftType[]) : [];

    const myRoomCardNftsRaw = data[1].status === "success" ? data[1].result : undefined;
    const myRoomCardNfts = Array.isArray(myRoomCardNftsRaw) ? (myRoomCardNftsRaw[1] as RoomCardNftDetail[]) : [];
    myNfts.push(...convertToMyRoomCardNft(myRoomCardNfts));


    const roomLevelTypesRaw = data[2].status === "success" ? data[2].result : undefined;
    roomLevelTypes = Array.isArray(roomLevelTypesRaw) ? (roomLevelTypesRaw[1] as RoomLevelNftType[]) : [];

    const myRoomLevelNftsRaw = data[3].status === "success" ? data[3].result : undefined;
    const myRoomLevelNfts = Array.isArray(myRoomLevelNftsRaw) ? (myRoomLevelNftsRaw[1] as RoomLevelNftDetail[]) : [];
    myNfts.push(...convertToMyRoomLevelNft(myRoomLevelNfts));
  }

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
  }, [playerAddress]); // 只在地址变化时刷新

  // 监听房卡购买事件
  useWatchContractEvent({
    address: gameConfig?.roomCardAddress as Address | undefined,
    abi: [RoomCardPurchased],
    eventName: "RoomCardPurchased",
    onLogs: (logs: Log[]) => {
      console.log("收到 RoomCardPurchased 事件:", logs);
      refetchDataRef.current?.();
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
      refetchDataRef.current?.();
    },
    onError: e => console.error("监听 RoomLevelPurchased 出错:", e),
    enabled: Boolean(playerAddress),
  });

  return {
    roomCardTypes: roomCardTypes as RoomCardNftType[] | [],
    roomLevelTypes: roomLevelTypes as RoomLevelNftType[] | [],
    myNfts: myNfts as any[] | [],
    // 刷新函数
    refetchData,
  };
}
