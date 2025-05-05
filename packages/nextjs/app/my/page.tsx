"use client"

import { useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { Badge } from "~~/components/ui/badge"
import { Separator } from "~~/components/ui/separator"
import { Switch } from "~~/components/ui/switch"
import { Wallet, History, Settings, Copy, Coins, Gift, TrendingUp, ExternalLink, Shield, LogOut, Check, Trophy, Clock, Trash2, Users, LayoutGrid } from "lucide-react"
import { TableCard } from "~~/components/niuniu/table-card"
import { useMyData } from "~~/hooks/my-hooks/useMyData";
import { useAccount } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { formatEther } from "viem";
import { useRewardPoolData } from "~~/hooks/my-hooks/useRewardPoolData";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~~/components/ui/tooltip"
import { toast } from "react-hot-toast";
import { removeRewardPool } from "~~/contracts/abis/BBRewardPoolABI";
import { writeContractWithCallback } from "~~/hooks/writeContractWithCallback";
import { useGlobalState } from "~~/services/store/store";

export default function MyPage() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;
  const gameConfig = useGlobalState(state => state.gameConfig);
  
  const { myTables, joinedTables, rewardPools, refetchData } = useMyData({ playerAddress: address });
  const [deletingPoolId, setDeletingPoolId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const handleDeletePool = async (poolId: string) => {
    setIsDeleting(true);
    try {      
      await writeContractWithCallback({
        address: gameConfig?.rewardPoolAddress,
        abi: [removeRewardPool],
        functionName: "removeRewardPool",
        args: [BigInt(poolId)],
        onPending: () => {
          setIsDeleting(true);
        },
        onSuccess: async () => {
          toast.success("Reward pool deleted successfully!");
          await refetchData();
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
      setDeletingPoolId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

      <div className="w-full">
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-800 rounded-lg p-1 mb-6">
            <TabsTrigger value="history" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
              <LayoutGrid className="h-4 w-4 mr-2" />
              My Tables
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Joined Tables
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
              <Trophy className="h-4 w-4 mr-2" />
              Reward Pools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-0">
            <Card className="bg-zinc-900/80 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">My Tables</CardTitle>
                <CardDescription className="text-zinc-400">Your created tables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {myTables.map((table) => (
                    <TableCard key={table.tableId} table={table} onJoinTableClick={() => {}} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <Card className="bg-zinc-900/80 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Joined Tables</CardTitle>
                <CardDescription className="text-zinc-400">Tables you have joined</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {joinedTables.map((table) => (
                    <TableCard key={table.tableId} table={table} onJoinTableClick={() => {}} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <Card className="bg-zinc-900/80 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Reward Pools</CardTitle>
                <CardDescription className="text-zinc-400">The reward pool can only be deleted if it is not in use. After deletion, the remaining funds will be returned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rewardPools.map((pool) => (
                    <div key={pool.poolId}>
                      <div className="bg-zinc-800/50 rounded-md p-4 border border-zinc-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                            <span className="text-sm font-medium text-amber-400">{pool.name}</span>
                          </div>
                          {deletingPoolId === pool.poolId.toString() ? (
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-7 px-2 text-xs"
                                disabled={isDeleting}
                                onClick={async () => {
                                  await handleDeletePool(pool.poolId.toString());
                                  setDeletingPoolId(null);
                                }}
                              >
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7 px-2 text-xs"
                                disabled={isDeleting}
                                onClick={() => setDeletingPoolId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0"
                              onClick={() => setDeletingPoolId(pool.poolId.toString())}
                              disabled={pool.inUse}
                            >
                              <Trash2 className={`h-4 w-4 ${pool.inUse ? 'text-zinc-500' : 'text-zinc-400 hover:text-red-500'}`} />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Coins className="h-4 w-4 text-amber-500 mr-2" />
                              <span className="text-xs text-zinc-400">Total Pot:</span>
                            </div>
                            <span className="text-sm font-medium text-white">
                              {formatEther(pool.totalAmount)} {symbol}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Gift className="h-4 w-4 text-amber-500 mr-2" />
                              <span className="text-xs text-zinc-400">Per Win:</span>
                            </div>
                            <span className="text-sm font-medium text-white">
                              {formatEther(pool.rewardPerGame)} {symbol}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 text-amber-500 mr-2" />
                              <span className="text-xs text-zinc-400">Win Rate:</span>
                            </div>
                            <span className="text-sm font-medium text-white">{pool.winProbability}%</span>
                          </div>
        
                          <div className="bg-zinc-800/50 rounded-md p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-zinc-400">Current Pot:</span>
                              <span className="text-lg font-bold text-amber-500">
                                {formatEther(pool.remainingAmount)} {symbol}
                              </span>
                            </div>
                            <div className="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full"
                                style={{
                                  width: `${Number(pool.remainingAmount) * 100 / Number(pool.totalAmount)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
