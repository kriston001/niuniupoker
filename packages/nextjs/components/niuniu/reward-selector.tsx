"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Edit, Info, PlusCircle, XCircle } from "lucide-react";
import { RewardPoolInfo } from "@/types/game-types"
import { formatEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

interface RewardSelectorProps {
  selectedReward: string | undefined;
  setSelectedReward: (value: string | undefined) => void;
  rewardOptions: RewardPoolInfo[];
  hasRewards: boolean;
  onCreateReward: () => void;
  label?: string;
  className?: string;
}

export function RewardSelector({
  selectedReward,
  setSelectedReward,
  rewardOptions,
  hasRewards,
  onCreateReward,
  label = "Select Reward",
  className,
}: RewardSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);


  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor="reward" className="text-zinc-300">
        {label}
      </Label>
      <div className="relative">
        <Select
          onValueChange={setSelectedReward}
          value={selectedReward}
          onOpenChange={open => {
            setDropdownOpen(open);
          }}
        >
          <SelectTrigger className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white hover:border-zinc-600 focus:border-amber-600 transition-colors text-base">
            <SelectValue placeholder="Select a reward scheme" />
            {selectedReward && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setSelectedReward(undefined);
                }}
                className="absolute right-10 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            <SelectGroup>
              <SelectLabel className="text-zinc-400">Available Rewards</SelectLabel>
              <SelectItem value="0" className="focus:bg-zinc-800 focus:text-white transition-colors">
                — No Reward —
              </SelectItem>
              {hasRewards &&
                rewardOptions.map(reward => (
                  <SelectItem
                    key={reward.poolId}
                    value={String(reward.poolId)}
                    className="focus:bg-zinc-800 focus:text-white transition-colors"
                  >
                    <div className="py-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-amber-400">{reward.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                            {reward.winProbability}% Win Rate
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Pool: {formatEther(reward.totalAmount)} {symbol}</span>
                        <span>Per Round: {formatEther(reward.rewardPerGame)} {symbol}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              {!hasRewards && (
                <div className="py-2 px-2 text-center">
                  <Info className="h-4 w-4 text-zinc-500 mx-auto mb-1" />
                  <p className="text-sm text-zinc-500">No rewards available</p>
                </div>
              )}
              <div className="pt-2 pb-1 px-2 border-t border-zinc-800 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-600/50 bg-zinc-800/80 hover:bg-zinc-700 transition-all duration-200"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Force close the dropdown
                    const selectTrigger = document.activeElement;
                    if (selectTrigger) {
                      (selectTrigger as HTMLElement).blur();
                    }

                    // Open the create reward panel after a small delay to ensure dropdown is closed
                    setTimeout(() => {
                      onCreateReward();
                    }, 50);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Reward
                </Button>
              </div>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
