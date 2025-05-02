import { useAccount, useReadContracts } from "wagmi";
import { useGlobalState } from "~~/services/store/store";
import { getUserGameTables, getUserJoinedTables } from "~~/contracts/abis/BBGameMainABI";
import { getBankerPools } from "~~/contracts/abis/BBRewardPoolABI";
import { GameTableInfoShort, RewardPoolInfo } from "~~/types/game-types";
import debounce from "lodash.debounce";
import { useEffect, useRef } from "react";
import { Address } from "viem";


export function useMyData({ playerAddress }: { playerAddress: Address | undefined }) {
  const gameConfig = useGlobalState(state => state.gameConfig);

  let myTables: GameTableInfoShort[] = [];
  let joinedTables: GameTableInfoShort[] = [];
  let rewardPools: RewardPoolInfo[] = [];
  const contracts = [
    {
      address: gameConfig?.gameMainAddress,
      abi: [getUserGameTables],
      functionName: "getUserGameTables",
      args: [playerAddress]
    },
    {
      address: gameConfig?.gameMainAddress,
      abi: [getUserJoinedTables],
      functionName: "getUserJoinedTables",
      args: [playerAddress]
    },
    {
      address: gameConfig?.rewardPoolAddress,
      abi: [getBankerPools],
      functionName: "getBankerPools",
      args: [playerAddress]
    }
  ] as const;

  
  const { data, refetch: refetchData } = useReadContracts({
    contracts: contracts,
    query: {
      enabled: !!playerAddress
    }
  });

  if (data) {
    console.log("useMyData：", data);
    myTables = data[0].status === "success" ? data[0].result as GameTableInfoShort[] : [];
    joinedTables = data[1].status === "success" ? data[1].result as GameTableInfoShort[] : [];
    rewardPools = data[2].status === "success" ? data[2].result as RewardPoolInfo[] : [];
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

  return {
    myTables,
    joinedTables,
    rewardPools,
    refetchData
  };
}
