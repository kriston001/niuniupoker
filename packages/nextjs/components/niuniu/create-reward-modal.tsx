"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Coins, DollarSign, Percent, Trophy, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { z } from "zod";
import { createRewardPool } from "~~/contracts/abis/BBRewardPoolABI";
import { useRewardPoolData } from "~~/hooks/my-hooks/useRewardPoolData";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { writeContractWithCallback } from "~~/hooks/writeContractWithCallback";
import { useGlobalState } from "~~/services/store/store";

interface CreateRewardModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreatedReward?: () => void;
}

export function CreateRewardModal({ open, onOpenChange, onCreatedReward }: CreateRewardModalProps) {
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const gameConfig = useGlobalState(state => state.gameConfig);
  const { address: connectedAddress } = useAccount();

  const formSchema = z
    .object({
      name: z.string().min(1, "Name is required").max(20, "Name must be less than 20 characters"),
      totalPool: z.string().min(1, "Total pool is required"),
      rewardPerRound: z.string().min(1, "Reward per round is required"),
      winRate: z.coerce
        .number()
        .int("Win rate must be an integer")
        .min(1, "Win rate must be at least 1")
        .max(100, "Win rate must be at most 100"),
    })
    .refine(
      data => {
        const totalPoolNum = parseFloat(data.totalPool);
        const rewardPerRoundNum = parseFloat(data.rewardPerRound);
        return !isNaN(totalPoolNum) && !isNaN(rewardPerRoundNum) && rewardPerRoundNum <= totalPoolNum;
      },
      {
        message: "Reward per round cannot be greater than total pool",
        path: ["rewardPerRound"],
      },
    );

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      totalPool: "",
      rewardPerRound: "",
      winRate: 6,
    },
  });

  // Handle form submission
  const handleCreateReward = async (data: FormData) => {
    // Here you would handle the actual creation of the reward
    if (!connectedAddress) {
      console.log("请先连接钱包");
      return;
    }
    debugger;

    if (!isValid) {
      toast.error("Please fix form errors before submitting");
      return;
    }

    try {
      setIsSubmitting(true);

      // Call the contract function to create a new reward pool
      await writeContractWithCallback({
        address: gameConfig?.rewardPoolAddress,
        abi: [createRewardPool],
        functionName: "createRewardPool",
        args: [data.name, parseEther(data.totalPool), parseEther(data.rewardPerRound), data.winRate],
        value: parseEther(data.totalPool),
        onPending: hash => {
          // toast.loading(`Creating reward pool... (${hash.slice(0, 8)}...)`);
        },
        onSuccess: async () => {
          toast.success("Reward pool created successfully!");
          onOpenChange?.(false);
          onCreatedReward?.();
          reset();
        },
        onError: async error => {
          console.error("Error creating reward pool:", error);
          // 用户取消交易不显示错误提示
          if (error.message.includes("User rejected") || error.message.includes("user rejected")) {
            return;
          }
          toast.error(`Failed to create table: ${error.message}`);
        },
      });
    } catch (error) {
      console.error("create Reward pool fail:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Watch form values for preview
  const nameValue = watch("name");
  const totalPoolValue = watch("totalPool");
  const rewardPerRoundValue = watch("rewardPerRound");
  const winRateValue = watch("winRate");

  // Calculate estimated rounds
  const estimatedRounds = () => {
    const total = parseFloat(totalPoolValue);
    const perRound = parseFloat(rewardPerRoundValue);
    if (!isNaN(total) && !isNaN(perRound) && perRound > 0) {
      return Math.floor(total / perRound);
    }
    return 0;
  };

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

          <form
            onSubmit={e => {
              e.stopPropagation(); // 阻止事件冒泡
              handleSubmit(handleCreateReward)(e);
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">
                Reward Name
              </Label>
              <div className="relative">
                <Trophy className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                <Input
                  id="name"
                  placeholder="e.g., High Roller Jackpot"
                  className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white pl-12 focus:border-amber-600 transition-colors text-base"
                  {...register("name")}
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPool" className="text-zinc-300">
                Total Pool ({symbol})
              </Label>
              <div className="relative">
                <Coins className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                <Input
                  id="totalPool"
                  placeholder="5.0"
                  className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white pl-12 focus:border-amber-600 transition-colors text-base"
                  {...register("totalPool")}
                />
              </div>
              <p className="text-xs text-zinc-500">The total amount available in the reward pool</p>
              {errors.totalPool && <p className="text-red-500 text-sm mt-1">{errors.totalPool.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardPerRound" className="text-zinc-300">
                Reward per Round ({symbol})
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                <Input
                  id="rewardPerRound"
                  placeholder="0.5"
                  className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white pl-12 focus:border-amber-600 transition-colors text-base"
                  {...register("rewardPerRound")}
                />
              </div>
              <p className="text-xs text-zinc-500">Amount awarded to lucky guy each round</p>
              {errors.rewardPerRound && <p className="text-red-500 text-sm mt-1">{errors.rewardPerRound.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="winRate" className="text-zinc-300">
                Win Rate (%)
              </Label>
              <div className="relative">
                <Percent className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                <Input
                  id="winRate"
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  placeholder="10"
                  className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white pl-12 focus:border-amber-600 transition-colors text-base"
                  {...register("winRate")}
                />
              </div>
              <p className="text-xs text-zinc-500">Chance of winning the reward each round</p>
              {errors.winRate && <p className="text-red-500 text-sm mt-1">{errors.winRate.message}</p>}
            </div>

            {/* Preview Card */}
            <div className="mt-8 mb-4">
              <Label className="text-zinc-300 mb-2 block">Reward Preview</Label>
              <div className="bg-zinc-800/80 border border-zinc-700 rounded-md p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-amber-400">{nameValue || "New Reward"}</span>
                  <span className="text-xs bg-zinc-900 px-2 py-0.5 rounded text-zinc-300">
                    {winRateValue || 0}% Win Rate
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>
                    Pool: {totalPoolValue || 0} {symbol}
                  </span>
                  <span>
                    Per Round: {rewardPerRoundValue || 0} {symbol}
                  </span>
                </div>
                {parseFloat(totalPoolValue) > 0 && parseFloat(rewardPerRoundValue) > 0 && (
                  <div className="mt-2 text-xs text-zinc-500">Estimated rounds: {estimatedRounds()}</div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                className="w-1/2 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-zinc-800 bg-zinc-900 shadow-md transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Reward"
                )}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
