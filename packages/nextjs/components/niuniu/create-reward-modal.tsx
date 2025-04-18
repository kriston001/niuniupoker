"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Coins, DollarSign, Percent, Trophy, X } from "lucide-react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

interface CreateRewardModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreatedReward?: (reward: { name: string; totalPool: number; rewardPerRound: number; winRate: number }) => void;
}

export function CreateRewardModal({ open, onOpenChange, onCreatedReward }: CreateRewardModalProps) {
  const [newReward, setNewReward] = useState({
    name: "",
    totalPool: 0,
    rewardPerRound: 0,
    winRate: 0,
  });

  const handleCreateReward = () => {
    onCreatedReward?.(newReward);
    // Reset form
    setNewReward({
      name: "",
      totalPool: 0,
      rewardPerRound: 0,
      winRate: 0,
    });
    onOpenChange?.(false);
  };

  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] bg-zinc-900 border-zinc-800 p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <SheetHeader className="p-0">
              <SheetTitle className="text-xl font-bold text-white flex items-center">
                <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                Create New Reward
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reward-name" className="text-zinc-300">
                Reward Name
              </Label>
              <div className="relative">
                <Trophy className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                <Input
                  id="reward-name"
                  placeholder="e.g., High Roller Jackpot"
                  className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white pl-12 focus:border-amber-600 transition-colors text-base"
                  value={newReward.name}
                  onChange={e => setNewReward({ ...newReward, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-pool" className="text-zinc-300">
                Total Pool ({symbol})
              </Label>
              <div className="relative">
                <Coins className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                <Input
                  id="total-pool"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="5.0"
                  className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white pl-12 focus:border-amber-600 transition-colors text-base"
                  value={newReward.totalPool || ""}
                  onChange={e => setNewReward({ ...newReward, totalPool: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <p className="text-xs text-zinc-500">The total amount available in the reward pool</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-per-round" className="text-zinc-300">
                Reward per Round ({symbol})
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                <Input
                  id="reward-per-round"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.5"
                  className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white pl-12 focus:border-amber-600 transition-colors text-base"
                  value={newReward.rewardPerRound || ""}
                  onChange={e => setNewReward({ ...newReward, rewardPerRound: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <p className="text-xs text-zinc-500">Amount awarded to lucky guy each round</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="win-rate" className="text-zinc-300">
                Win Rate (%)
              </Label>
              <div className="relative">
                <Percent className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                <Input
                  id="win-rate"
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  placeholder="10"
                  className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white pl-12 focus:border-amber-600 transition-colors text-base"
                  value={newReward.winRate || ""}
                  onChange={e => setNewReward({ ...newReward, winRate: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <p className="text-xs text-zinc-500">Chance of winning the reward each round</p>
            </div>

            {/* Preview Card */}
            <div className="mt-8 mb-4">
              <Label className="text-zinc-300 mb-2 block">Reward Preview</Label>
              <div className="bg-zinc-800/80 border border-zinc-700 rounded-md p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-amber-400">{newReward.name || "New Reward"}</span>
                  <span className="text-xs bg-zinc-900 px-2 py-0.5 rounded text-zinc-300">
                    {newReward.winRate || 0}% Win Rate
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>
                    Pool: {newReward.totalPool || 0} {symbol}
                  </span>
                  <span>
                    Per Round: {newReward.rewardPerRound || 0} {symbol}
                  </span>
                </div>
                {newReward.totalPool > 0 && newReward.rewardPerRound > 0 && (
                  <div className="mt-2 text-xs text-zinc-500">
                    Estimated rounds: {Math.floor(newReward.totalPool / newReward.rewardPerRound)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                className="w-1/2 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-zinc-800 bg-zinc-900 shadow-md transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                className="w-1/2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium border-0 shadow-md hover:shadow-lg transition-all duration-200"
                onClick={handleCreateReward}
                disabled={
                  !newReward.name || newReward.totalPool <= 0 || newReward.rewardPerRound <= 0 || newReward.winRate <= 0
                }
              >
                Create Reward
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
