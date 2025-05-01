"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Plus, RefreshCw, Trash } from "lucide-react";
import { Spinner } from "~~/components/Spinner";
import { useRewardPoolData } from "~~/hooks/my-hooks/useRewardPoolData";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { formatEther } from "viem";
import { RewardPoolInfo } from "~~/types/game-types";

interface RewardListProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreateReward?: () => void;
}

export function RewardList({ open, onOpenChange, onCreateReward }: RewardListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;
  
  const { 
    rewards, 
    isLoading, 
    isDeleting, 
    deleteRewardPool, 
    refreshRewards 
  } = useRewardPoolData();

  // Handle delete confirmation
  const handleConfirmDelete = (poolId: string) => {
    if (confirmDelete === poolId) {
      deleteRewardPool(poolId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(poolId);
    }
  };

  // Format the reward data for display
  const formatReward = (reward: RewardPoolInfo) => {
    return {
      id: reward.poolId.toString(),
      name: reward.name,
      totalPool: parseFloat(formatEther(reward.totalAmount)),
      rewardPerRound: parseFloat(formatEther(reward.rewardPerGame)),
      winRate: Number(reward.winProbability),
      remainingAmount: parseFloat(formatEther(reward.remainingAmount)),
    };
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] bg-zinc-900 border-zinc-800 p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <SheetHeader className="p-0">
              <SheetTitle className="text-xl font-bold text-white">Reward Pools</SheetTitle>
            </SheetHeader>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                onClick={() => refreshRewards()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="h-8 px-2 bg-amber-600 hover:bg-amber-700"
                onClick={onCreateReward}
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner />
            </div>
          ) : rewards && rewards.length > 0 ? (
            <div className="space-y-3">
              {rewards.map((reward) => {
                const formattedReward = formatReward(reward);
                return (
                  <div
                    key={formattedReward.id}
                    className="bg-zinc-800/80 border border-zinc-700 rounded-md p-4 shadow-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-amber-400">{formattedReward.name}</span>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 rounded-full ${
                                  confirmDelete === formattedReward.id
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "hover:bg-zinc-700 text-zinc-400 hover:text-white"
                                }`}
                                onClick={() => handleConfirmDelete(formattedReward.id)}
                                disabled={isDeleting}
                              >
                                {confirmDelete === formattedReward.id ? (
                                  isDeleting ? (
                                    <Spinner className="h-3 w-3" />
                                  ) : (
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                  )
                                ) : (
                                  <Trash className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              {confirmDelete === formattedReward.id
                                ? "Click again to confirm deletion"
                                : "Delete reward pool"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-zinc-400">
                      <span>
                        Pool: {formattedReward.totalPool} {symbol}
                      </span>
                      <span>
                        Per Round: {formattedReward.rewardPerRound} {symbol}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-zinc-500">
                        Remaining: {formattedReward.remainingAmount} {symbol}
                      </span>
                      <span className="text-xs bg-zinc-900 px-2 py-0.5 rounded text-zinc-300">
                        {formattedReward.winRate}% Win Rate
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              <p className="mb-4">No reward pools found</p>
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={onCreateReward}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Reward
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
