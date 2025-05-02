"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { CreateRewardModal } from "./create-reward-modal";
import { RewardList } from "./reward-list";
import { RewardSelector } from "./reward-selector";
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
import { editGameTable } from "~~/contracts/abis/BBGameTableABI";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { writeContractWithCallback } from "~~/hooks/writeContractWithCallback";
import { useGlobalState } from "~~/services/store/store";
import { useRewardPoolData } from "~~/hooks/my-hooks/useRewardPoolData";

interface CreateTableModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onCreatedTable?: () => void;
  tableData?: {
    address: string;
    name: string;
    betAmount: string;
    maxPlayers: number;
    bankerFeePercent: number;
    firstRaise: number;
    secondRaise: number;
    rewardPoolId: string;
  };
}

export function CreateTableModal({ open, onOpenChange, trigger, onCreatedTable, tableData }: CreateTableModalProps) {
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gameConfig = useGlobalState(state => state.gameConfig);
  const isEditMode = !!tableData;

  const formSchema = z.object({
    name: z.string().min(1, "Name is required").max(20, "Name must be less than 20 characters"),
    betAmount: z.string().min(1, "Bet amount is required"),
    firstRaise: z.number().min(1).max(4, "First Raise must be between 1 and 4"),
    secondRaise: z.number().min(1).max(4, "Second Raise must be between 1 and 4"),
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
    rewardPoolId: z.string()
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankerFeePercent: tableData?.bankerFeePercent || 3,
      firstRaise: tableData?.firstRaise || 1,
      secondRaise: tableData?.secondRaise || 1,
      name: tableData?.name || "",
      betAmount: tableData?.betAmount || "",
      maxPlayers: tableData?.maxPlayers || 6,
      rewardPoolId: tableData?.rewardPoolId || "",
    },
  });

  const { address: connectedAddress } = useAccount();
  const [createRewardOpen, setCreateRewardOpen] = useState(false);
  const [rewardListOpen, setRewardListOpen] = useState(false);


  const { rewards: rewardOptions, refreshRewards } = useRewardPoolData();

  useEffect(() => {
    if (tableData) {
      setValue("name", tableData.name);
      setValue("betAmount", tableData.betAmount);
      setValue("maxPlayers", tableData.maxPlayers);
      setValue("bankerFeePercent", tableData.bankerFeePercent);
      setValue("firstRaise", tableData.firstRaise);
      setValue("secondRaise", tableData.secondRaise);
      setValue("rewardPoolId", tableData.rewardPoolId);
    }
  }, [tableData, setValue]);

  const handleCreateTable = async (data: FormData) => {
    // Here you would handle the actual creation of the reward
    if (!connectedAddress) {
      console.log("请先连接钱包");
      return;
    }

    try {
      const parsedBetAmount = parseEther(data.betAmount);
      setIsSubmitting(true);

      if (isEditMode && tableData) {
        // 编辑现有表
        await writeContractWithCallback({
          address: tableData.address as `0x${string}`,
          abi: [editGameTable],
          functionName: "editGameTable",
          args: [data.name, parsedBetAmount, data.maxPlayers, data.bankerFeePercent, data.firstRaise, data.secondRaise, BigInt(data.rewardPoolId)],
          account: connectedAddress as `0x${string}`,
          onSuccess: async () => {
            toast.success("Table updated successfully");
            reset();
            onOpenChange?.(false);
            onCreatedTable && onCreatedTable();
          },
          onError: async err => {
            // 用户取消交易不显示错误提示
            if (err.message.includes("User rejected") || err.message.includes("user rejected")) {
              return;
            }
            toast.error(`Failed to update table: ${err.message}`);
          },
        });
      } else {
        // 创建新表
        await writeContractWithCallback({
          address: gameConfig.gameMainAddress,
          abi: [createGameTable],
          functionName: "createGameTable",
          args: [data.name, parsedBetAmount, data.maxPlayers, data.bankerFeePercent, data.firstRaise, data.secondRaise, BigInt(data.rewardPoolId)],
          account: connectedAddress as `0x${string}`,
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
      }
    } catch (error) {
      console.error(isEditMode ? "update table fail:" : "create table fail:", error);
    } finally {
      setIsSubmitting(false);
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
                    {isEditMode ? "Edit Table" : "Create New Table"}
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    {isEditMode
                      ? "Update your poker table parameters below."
                      : "Set up your poker table parameters below."}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
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
                      Base Bet ({symbol})
                    </Label>
                    <Input
                      id="bet"
                      {...register("betAmount")}
                      placeholder="Enter the Base Bet"
                      className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 transition-colors text-base"
                    />
                    {errors.betAmount && <span className="text-red-500 text-sm">{errors.betAmount.message}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="firstRaise" className="text-zinc-300">
                      First Raise
                    </Label>
                    <div className="flex gap-3 mt-1">
                      {[1, 2, 3, 4].map(value => (
                        <label
                          key={`first-raise-${value}`}
                          className={`flex items-center justify-center h-8 flex-1 rounded-md border ${
                            watch("firstRaise") === value
                              ? "bg-amber-600/20 border-amber-600 text-white"
                              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                          } cursor-pointer transition-all duration-200`}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            name="firstRaise"
                            value={value}
                            checked={watch("firstRaise") === value}
                            onChange={() => {
                              setValue("firstRaise", value);
                            }}
                          />
                          <span>x{value}</span>
                        </label>
                      ))}
                    </div>
                    {errors.firstRaise && <span className="text-red-500 text-sm">{errors.firstRaise.message}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="secondRaise" className="text-zinc-300">
                      Second Raise
                    </Label>
                    <div className="flex gap-3 mt-1">
                      {[1, 2, 3, 4].map(value => (
                        <label
                          key={`second-raise-${value}`}
                          className={`flex items-center justify-center h-8 flex-1 rounded-md border ${
                            watch("secondRaise") === value
                              ? "bg-amber-600/20 border-amber-600 text-white"
                              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                          } cursor-pointer transition-all duration-200`}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            name="secondRaise"
                            value={value}
                            checked={watch("secondRaise") === value}
                            onChange={() => {
                              setValue("secondRaise", value);
                            }}
                          />
                          <span>x{value}</span>
                        </label>
                      ))}
                    </div>
                    {errors.secondRaise && <span className="text-red-500 text-sm">{errors.secondRaise.message}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="players" className="text-zinc-300">
                      Max Players
                    </Label>
                    <Input
                      id="players"
                      {...register("maxPlayers", { valueAsNumber: true })}
                      type="number"
                      min={2}
                      max={gameConfig.maxPlayers}
                      placeholder={`Enter the maximum number of players (max: ${gameConfig.maxPlayers})`}
                      className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 transition-colors text-base"
                    />
                    {errors.maxPlayers && <span className="text-red-500 text-sm">{errors.maxPlayers.message}</span>}
                  </div>

                  <div className="grid gap-4 mt-6">
                    <h3 className="text-lg font-medium text-white">Reward Settings</h3>
                    <RewardSelector
                      selectedReward={watch("rewardPoolId")}
                      setSelectedReward={(selectId) => {
                        setValue("rewardPoolId", selectId || "");
                      }}
                      rewardOptions={rewardOptions}
                      hasRewards={!!rewardOptions.length}
                      onCreateReward={() => setCreateRewardOpen(true)}
                      label="Select Reward"
                      className="mb-2"
                    />
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
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium border-0 shadow-md hover:shadow-lg transition-all duration-200"
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
                        {isEditMode ? "Updating Table" : "Creating Table"}
                      </span>
                    ) : (
                      isEditMode ? "Update Table" : "Create Table"
                    )}
                    
                  </Button>
                </DialogFooter>
              </div>
            </div>

            {/* Reward List Side Panel */}
            {/* {rewardListOpen && (
              <RewardList
                open={rewardListOpen}
                onOpenChange={setRewardListOpen}
                onCreateReward={() => {
                  setCreateRewardOpen(true);
                }}
              />
            )} */}

            {/* Create Reward Side Panel */}
            {createRewardOpen && (
              <CreateRewardModal
                open={createRewardOpen}
                onOpenChange={open => {
                  setCreateRewardOpen(open);
                }}
                onCreatedReward={() => {
                  refreshRewards();
                }}
              />
            )}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
