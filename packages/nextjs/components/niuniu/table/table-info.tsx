import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { truncateAddress } from "@/lib/utils";
import { Clock, Coins, Gift, Info, Link, TrendingUp, Trophy, Users, Wallet, Copy, Check } from "lucide-react";
import { formatEther, parseEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { GameTable } from "~~/types/game-types";
import { useState, useEffect } from "react";

export function TableInfo({ tableInfo }: { tableInfo: GameTable }) {
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 在客户端渲染时获取当前URL
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const copyToClipboard = () => {
    if (navigator.clipboard && currentUrl) {
      navigator.clipboard.writeText(currentUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  return (
    <div>
      <Card className="bg-zinc-900/80 border-zinc-800 mb-6">
        <CardHeader className="pb-2">
          {/* <CardTitle className="text-xl text-white">{tableInfo.tableName}</CardTitle> */}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* <div>
            <h3 className="text-lg font-bold text-white">{tableInfo.tableName}</h3>
          </div> */}

          <div className="space-y-3">
            <div className="flex items-center text-zinc-400">
              <Wallet className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-sm">Owner: </span>
              <span className="text-sm text-zinc-300 ml-1">{truncateAddress(tableInfo.bankerAddr)}</span>
            </div>

            <div className="flex items-center text-zinc-400">
              <Users className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-sm">Players: </span>
              <span className="text-sm text-zinc-300 ml-1">
                {tableInfo.playerCount}/{tableInfo.maxPlayers}
              </span>
            </div>

            <div className="flex items-center text-zinc-400">
              <Trophy className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-sm">Owner Commission: </span>
              <span className="text-sm text-zinc-300 ml-1">{tableInfo.bankerFeePercent}%</span>
            </div>

            <div className="flex items-center text-zinc-400">
              <Coins className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-sm">Base Bet: </span>
              <span className="text-sm text-zinc-300 ml-1">
                {formatEther(tableInfo.betAmount)} {symbol}
              </span>
            </div>

            <div className="flex items-center text-zinc-400">
              <TrendingUp className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-sm">First Raise: </span>
              <span className="text-sm text-zinc-300 ml-1">
                {formatEther(tableInfo.betAmount * BigInt(tableInfo.firstBetX))} {symbol}
              </span>
            </div>

            <div className="flex items-center text-zinc-400">
              <TrendingUp className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-sm">Second Raise: </span>
              <span className="text-sm text-zinc-300 ml-1">
                {formatEther(tableInfo.betAmount * BigInt(tableInfo.secondBetX))} {symbol}
              </span>
            </div>

            {/* Add Banker Stake Amount here */}
            <div className="flex items-center text-zinc-400">
              <Coins className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-sm">Owner Staked: </span>
              <span className="text-sm text-zinc-300 ml-1">
                {formatEther(tableInfo.bankerStakeAmount)} {symbol}
              </span>
            </div>

            {/* 显示当前网址和复制按钮 */}
            <div className="flex items-center text-zinc-400">
              <Link className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-sm">Invite: </span>
              <div className="flex-1 flex items-center justify-between ml-1">
                <span className="text-sm text-zinc-300 truncate max-w-[180px]">{currentUrl}</span>
                <button 
                  onClick={copyToClipboard}
                  className="ml-2 p-1 rounded-md hover:bg-zinc-700 transition-colors"
                  title="Copy URL"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-zinc-300" />
                  )}
                </button>
              </div>
            </div>
            
          </div>

          {/* Enhanced Reward Information Block */}
          {tableInfo.rewardPoolId != 0n && (
            <div>
              <div className="bg-zinc-800/50 rounded-md p-4 border border-zinc-700/50">
                <div className="flex items-center mb-3">
                  <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="text-sm font-medium text-amber-400">{tableInfo.rewardPoolInfo.name} Reward</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Coins className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-xs text-zinc-400">Total Pool:</span>
                    </div>
                    <span className="text-sm font-medium text-white">{tableInfo.rewardPoolInfo.totalAmount} USDT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Gift className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-xs text-zinc-400">Per Win:</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {tableInfo.rewardPoolInfo.rewardPerGame} USDT
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-xs text-zinc-400">Win Rate:</span>
                    </div>
                    <span className="text-sm font-medium text-white">{tableInfo.rewardPoolInfo.winProbability}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-md p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-zinc-400">Current Pot:</span>
                  <span className="text-lg font-bold text-amber-500">
                    {tableInfo.totalPrizePool} {symbol}
                  </span>
                </div>
                <div className="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full"
                    style={{ width: `${(tableInfo.playerCount / tableInfo.maxPlayers) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
