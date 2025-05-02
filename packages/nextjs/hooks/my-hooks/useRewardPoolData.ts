import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { toast } from "react-hot-toast";
import { getBankerPools, removeRewardPool, createRewardPool } from "~~/contracts/abis/BBRewardPoolABI";
import { writeContractWithCallback } from "~~/hooks/writeContractWithCallback";
import { RewardPoolInfo } from "~~/types/game-types";
import { useGlobalState } from "~~/services/store/store";


export function useRewardPoolData() {
  const gameConfig = useGlobalState(state => state.gameConfig);

  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get the reward pool contract address from the target network
  const rewardPoolAddress = gameConfig?.rewardPoolAddress;

  // Read the banker's reward pools
  const { data: rewardPools, refetch } = useReadContract({
    address: rewardPoolAddress,
    abi: [getBankerPools],
    functionName: "getBankerPools",
    args: [address],
    query: {
      enabled: !!address && !!rewardPoolAddress,
    },
  });

  // Create a new reward pool
  const newRewardPool = useCallback(async (
    name: string, 
    totalPool: bigint, 
    rewardPerRound: bigint, 
    winRate: number
  ) => {
    if (!address || !rewardPoolAddress) {
      toast.error("Wallet not connected or contract not available");
      return;
    }

    try {
      setIsCreating(true);
      
      const totalReward = parseEther(totalPool.toString());
      const rewardPerGame = parseEther(rewardPerRound.toString());
      
      await writeContractWithCallback({
        address: rewardPoolAddress,
        abi: [createRewardPool],
        functionName: "createRewardPool",
        args: [name, totalReward, rewardPerGame, BigInt(winRate)],
        value: totalReward,
        onPending: (hash) => {
          //toast.loading(`Creating reward pool... (${hash.slice(0, 8)}...)`);
        },
        onSuccess: async () => {
          toast.success("Reward pool created successfully!");
          await refetch();
        },
        onError: async (error) => {
          console.error("Error creating reward pool:", error);
          // 用户取消交易不显示错误提示
          if (error.message.includes("User rejected") || error.message.includes("user rejected")) {
            return;
          }
          toast.error(`Failed to create table: ${error.message}`);
        },
      });
    } catch (error) {
      console.error("Error creating reward pool:", error);
      toast.error(`Failed to create reward pool: ${(error as Error).message}`);
    } finally {
      setIsCreating(false);
    }
  }, [address, rewardPoolAddress, refetch]);

  // Delete a reward pool
  const deleteRewardPool = useCallback(async (poolId: string) => {
    if (!address || !rewardPoolAddress) {
      toast.error("Wallet not connected or contract not available");
      return;
    }

    try {
      setIsDeleting(true);
      
      await writeContractWithCallback({
        address: rewardPoolAddress,
        abi: [removeRewardPool],
        functionName: "removeRewardPool",
        args: [BigInt(poolId)],
        onPending: (hash) => {
          //toast.loading(`Deleting reward pool... (${hash.slice(0, 8)}...)`);
        },
        onSuccess: async () => {
          toast.success("Reward pool deleted successfully!");
          await refetch();
        },
        onError: async (error) => {
          // 用户取消交易不显示错误提示
          if (error.message.includes("User rejected") || error.message.includes("user rejected")) {
            return;
          }
          console.error("Error deleting reward pool:", error);
        },
      });
    } catch (error) {
      console.error("Error deleting reward pool:", error);
      toast.error(`Failed to delete reward pool: ${(error as Error).message}`);
    } finally {
      setIsDeleting(false);
    }
  }, [address, rewardPoolAddress, refetch]);

  

  // Manually refresh the rewards data
  const refreshRewards = useCallback(async () => {
    setIsLoading(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing rewards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [refetch]);

  return {
    rewards: rewardPools as RewardPoolInfo[] || [],
    isLoading,
    isCreating,
    isDeleting,
    newRewardPool,
    deleteRewardPool,
    refreshRewards,
  };
}
