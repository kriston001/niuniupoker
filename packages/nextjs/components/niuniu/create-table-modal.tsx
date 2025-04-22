"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { CreateRewardModal } from "./create-reward-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, PlusCircle, Sparkles, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { z } from "zod";
import { createGameTable } from "~~/contracts/abis/BBGameMainABI";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useWriteContractWithCallback } from "~~/hooks/useWriteContractWithCallback";
import scaffoldConfig from "~~/scaffold.config";
import { useGlobalState } from "~~/services/store/store";

// Sample reward data
const rewardOptions = [
  {
    id: "reward-1",
    name: "High Roller",
    totalPool: 5.0,
    rewardPerRound: 0.5,
    winRate: 10,
  },
  {
    id: "reward-2",
    name: "Lucky Streak",
    totalPool: 3.0,
    rewardPerRound: 0.3,
    winRate: 15,
  },
  {
    id: "reward-3",
    name: "Jackpot",
    totalPool: 10.0,
    rewardPerRound: 1.0,
    winRate: 5,
  },
];

interface CreateTableModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onCreatedTable?: () => void;
}

export function CreateTableModal({ open, onOpenChange, trigger, onCreatedTable }: CreateTableModalProps) {
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;

  const gameConfig = useGlobalState(state => state.gameConfig);

  const formSchema = z.object({
    name: z.string().min(1, "Name is required").max(20, "Name must be less than 20 characters"),
    betAmount: z.string().min(1, "Bet amount is required"),
    maxPlayers: z
      .number()
      .min(2, "Max players must be at least 2")
      .max(gameConfig.maxPlayers, `Max players cannot exceed ${Number(gameConfig.maxPlayers)}`),
    bankerFeePercent: z
      .number()
      .max(
        Number(gameConfig.maxBankerFeePercent),
        `Banker fee percent cannot exceed ${Number(gameConfig.maxBankerFeePercent)}%`,
      ),
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankerFeePercent: 3,
    },
  });

  const { address: connectedAddress } = useAccount();
  const [selectedReward, setSelectedReward] = useState<string | undefined>(undefined);
  const [createRewardOpen, setCreateRewardOpen] = useState(false);
  const [hasRewards] = useState(true); // Always show rewards for this implementation
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (createRewardOpen && dropdownOpen) {
      setDropdownOpen(false);
      const selectTrigger = document.activeElement;
      if (selectTrigger) {
        (selectTrigger as HTMLElement).blur();
      }
    }
  }, [createRewardOpen, dropdownOpen]);

  const { writeContractWithCallback } = useWriteContractWithCallback();

  const handleCreateTable = async (data: FormData) => {
    // Here you would handle the actual creation of the reward
    if (!connectedAddress) {
      console.log("请先连接钱包");
      return;
    }

    try {
      const parsedBetAmount = parseEther(data.betAmount);

      await writeContractWithCallback({
        address: scaffoldConfig.contracts.BBGameMain,
        abi: [createGameTable],
        functionName: "createGameTable",
        args: [data.name, parsedBetAmount, data.maxPlayers, data.bankerFeePercent],
        account: connectedAddress as `0x${string}`,
        // gas: 1000000n,
        onSuccess: async () => {
          toast.success("Table created successfully");
          reset();
          onOpenChange?.(false);
          onCreatedTable && onCreatedTable();
        },
        onError: async err => {
          // 用户取消交易不显示错误提示
          if (err.message.includes("User rejected") || err.message.includes("user rejected")) {
            return;
          }
          toast.error(`Failed to create table: ${err.message}`);
        },
      });
    } catch (error) {
      console.error("create table fail:", error);
    } finally {
    }

    setCreateRewardOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={newOpen => {
        if (!newOpen) {
          setCreateRewardOpen(false);
        }
        reset();
        onOpenChange && onOpenChange(newOpen);
      }}
    >
      <form onSubmit={handleSubmit(handleCreateTable)}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            open ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => onOpenChange && onOpenChange(false)}
          />

          <div className="relative flex items-start gap-6">
            {/* Main Create Table Modal */}
            <div
              className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-[420px] max-h-[90vh] overflow-auto transition-all duration-300"
              style={{
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl text-white flex items-center">
                    <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
                    Create New Table
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Set up your poker table parameters below.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-zinc-300">
                      Table Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter a unique table name"
                      {...register("name")}
                      className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 transition-colors text-base"
                    />
                    {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bet" className="text-zinc-300">
                      Bet Amount ({symbol})
                    </Label>
                    <Input
                      id="bet"
                      {...register("betAmount")}
                      placeholder="Enter the Bet Amount"
                      className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 transition-colors text-base"
                    />
                    {errors.betAmount && <span className="text-red-500 text-sm">{errors.betAmount.message}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="players" className="text-zinc-300">
                      Max Players
                    </Label>
                    <Input
                      id="players"
                      {...register("maxPlayers", { valueAsNumber: true })}
                      type="number"
                      placeholder="Enter the maximum number of players"
                      className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 transition-colors text-base"
                    />
                    {errors.maxPlayers && <span className="text-red-500 text-sm">{errors.maxPlayers.message}</span>}
                  </div>

                  {/* Select Reward Dropdown */}
                  <div className="grid gap-2">
                    <Label htmlFor="reward" className="text-zinc-300">
                      Select Reward
                    </Label>
                    <div className="relative">
                      <Select
                        onValueChange={setSelectedReward}
                        value={selectedReward}
                        onOpenChange={open => {
                          setDropdownOpen(open);
                          // If the dropdown is being opened while the create reward panel is open,
                          // close the create reward panel
                          if (open && createRewardOpen) {
                            setCreateRewardOpen(false);
                          }
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
                            <SelectItem value="none" className="focus:bg-zinc-800 focus:text-white transition-colors">
                              — No Reward —
                            </SelectItem>
                            {hasRewards &&
                              rewardOptions.map(reward => (
                                <SelectItem
                                  key={reward.id}
                                  value={reward.id}
                                  className="focus:bg-zinc-800 focus:text-white transition-colors"
                                >
                                  <div className="py-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-amber-400">{reward.name}</span>
                                      <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                                        {reward.winRate}% Win Rate
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-zinc-400">
                                      <span>Pool: {reward.totalPool} ETH</span>
                                      <span>Per Round: {reward.rewardPerRound} ETH</span>
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
                                    setCreateRewardOpen(true);
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

                  <div className="grid gap-3">
                    <Label className="text-zinc-300">Owner Commission ({watch("bankerFeePercent")}%)</Label>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Slider
                          {...register("bankerFeePercent", { valueAsNumber: true })}
                          defaultValue={[3]}
                          min={0}
                          max={Number(gameConfig.maxBankerFeePercent)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-5">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium border-0 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Create Table
                  </Button>
                </DialogFooter>
              </div>
            </div>

            {/* Create Reward Side Panel - with slide-in animation */}
            {createRewardOpen && (
              <CreateRewardModal
                open={createRewardOpen}
                onOpenChange={setCreateRewardOpen}
                onCreatedReward={reward => {
                  console.log("Created reward:", reward);
                  // 处理创建的奖励
                }}
              />
            )}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
