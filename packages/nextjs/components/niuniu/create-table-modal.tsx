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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Coins, DollarSign, Info, Percent, PlusCircle, Sparkles, Trophy, X, XCircle } from "lucide-react";

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
}

export function CreateTableModal({ open, onOpenChange, trigger }: CreateTableModalProps) {
  const [selectedReward, setSelectedReward] = useState<string | undefined>(undefined);
  const [createRewardOpen, setCreateRewardOpen] = useState(false);
  const [newReward, setNewReward] = useState({
    name: "",
    totalPool: 0,
    rewardPerRound: 0,
    winRate: 0,
  });
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

  const handleCreateReward = () => {
    // Here you would handle the actual creation of the reward
    console.log("Creating new reward:", newReward);
    setCreateRewardOpen(false);
    // Reset form
    setNewReward({
      name: "",
      totalPool: 0,
      rewardPerRound: 0,
      winRate: 0,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={newOpen => {
        if (!newOpen) {
          setCreateRewardOpen(false);
        }
        onOpenChange && onOpenChange(newOpen);
      }}
    >
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
                    className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 transition-colors text-base"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bet" className="text-zinc-300">
                    Bet Amount (ETH)
                  </Label>
                  <Input
                    id="bet"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.1"
                    className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 transition-colors text-base"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="players" className="text-zinc-300">
                    Max Players
                  </Label>
                  <Input
                    id="players"
                    type="number"
                    min="2"
                    max="8"
                    placeholder="6"
                    className="h-12 px-4 py-3 bg-zinc-800 border-zinc-700 text-white focus:border-amber-600 transition-colors text-base"
                  />
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

                <div className="grid gap-2">
                  <Label className="text-zinc-300">Dealer's Reward (%)</Label>
                  <RadioGroup defaultValue="3">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="2"
                          id="r2"
                          className="text-amber-500 border-zinc-600 focus:border-amber-500"
                        />
                        <Label htmlFor="r2" className="text-zinc-300 cursor-pointer">
                          2%
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="3"
                          id="r3"
                          className="text-amber-500 border-zinc-600 focus:border-amber-500"
                        />
                        <Label htmlFor="r3" className="text-zinc-300 cursor-pointer">
                          3%
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="5"
                          id="r5"
                          className="text-amber-500 border-zinc-600 focus:border-amber-500"
                        />
                        <Label htmlFor="r5" className="text-zinc-300 cursor-pointer">
                          5%
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="8"
                          id="r8"
                          className="text-amber-500 border-zinc-600 focus:border-amber-500"
                        />
                        <Label htmlFor="r8" className="text-zinc-300 cursor-pointer">
                          8%
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <DialogFooter>
                <Button
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium border-0 shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => onOpenChange && onOpenChange(false)}
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
    </Dialog>
  );
}
