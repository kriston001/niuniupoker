import { truncateAddress } from "@/lib/utils";
import { Clock, Coins, Gift, TrendingUp, Trophy, Users, Wallet } from "lucide-react";
import { formatEther } from "viem";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardFooter } from "~~/components/ui/card";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { getTimeAgo } from "~~/lib/utils";
import { GameState, GameTable } from "~~/types/game-types";

export function TableCard({
  table,
  onJoinTableClick,
}: {
  table: GameTable;
  onJoinTableClick: (tableAddr: `0x${string}`) => void;
}) {
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;

  return (
    <Card key={table.tableId} className="bg-zinc-900/80 border-zinc-800 overflow-hidden group flex flex-col h-full">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-white">{table.tableName}</h3>
          <Badge
            className={`
                    ${
                      !table.active
                        ? "bg-red-500/20 text-red-300 hover:bg-red-500/20"
                        : table.state === GameState.WAITING
                          ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
                          : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                    }
                  `}
          >
            {!table.active ? "Sleeped" : table.state === GameState.WAITING ? "Waiting" : "Gaming"}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-zinc-400">
            <Wallet className="h-4 w-4 mr-2 text-amber-500" />
            <span className="text-sm">Dealer: </span>
            <span className="text-sm text-zinc-300 ml-1">{truncateAddress(table.bankerAddr)}</span>
          </div>

          <div className="flex items-center text-zinc-400">
            <Users className="h-4 w-4 mr-2 text-amber-500" />
            <span className="text-sm">Players: </span>
            <span className="text-sm text-zinc-300 ml-1">
              {table.playerCount}/{table.maxPlayers}
            </span>
          </div>

          <div className="flex items-center text-zinc-400">
            <Trophy className="h-4 w-4 mr-2 text-amber-500" />
            <span className="text-sm">Owner Commission: </span>
            <span className="text-sm text-zinc-300 ml-1">{table.bankerFeePercent}%</span>
          </div>
        </div>

        {/* Add new section for additional table info */}
        <div className="border-t border-zinc-800 pt-3 mt-3">
          <div className="flex justify-center gap-8 px-3 py-2 bg-zinc-800/30 rounded-md border border-zinc-700/30">
            {/* Games Played */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-zinc-500">Rounds</span>
              <span className="text-sm font-bold text-amber-400 mt-1">{table.gameRound}</span>
            </div>

            {/* Settlements */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-zinc-500">Settlements</span>
              <span className="text-sm font-bold text-amber-400 mt-1">{table.gameLiquidatedCount}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Reward Information Block */}
        {table.rewardPoolId != 0n ? (
          <div className="mt-3 bg-zinc-800/50 rounded-md p-3 border border-zinc-700/50">
            <div className="flex items-center mb-2">
              <Trophy className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
              <span className="text-xs font-medium text-amber-400">{table.rewardPoolInfo.name} Reward</span>
            </div>
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center">
                <Coins className="h-3.5 w-3.5 text-amber-500 mr-1" />
                <span className="text-xs text-zinc-300">
                  {table.rewardPoolInfo.remainingAmount}/{table.rewardPoolInfo.totalAmount} {symbol}
                </span>
              </div>
              <div className="flex items-center">
                <Gift className="h-3.5 w-3.5 text-amber-500 mr-1" />
                <span className="text-xs text-zinc-300">
                  {table.rewardPoolInfo.rewardPerGame} {symbol}
                </span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-3.5 w-3.5 text-amber-500 mr-1" />
                <span className="text-xs text-zinc-300">{table.rewardPoolInfo.winProbability}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 bg-zinc-800/30 rounded-md p-3 border border-zinc-700/30">
            <div className="flex items-center justify-center">
              <span className="text-xs text-zinc-500">No reward assigned</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-amber-500" />
            <span className="text-xs text-zinc-500">{getTimeAgo(table.lastActivityTimestamp)}</span>
          </div>
          <div className="text-lg font-bold text-amber-500">
            {formatEther(table.betAmount)} {symbol}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0 mt-auto">
        <Button
          className="w-full rounded-none py-4 bg-zinc-800 hover:bg-zinc-700 text-white border-t border-zinc-700 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-amber-600 group-hover:text-black transition-all duration-300"
          // disabled={!table.active || table.playerCount == table.maxPlayers}
          onClick={() => (window.location.href = `/table/${table.tableAddr}`)}
        >
          {"Join Table"}
        </Button>
      </CardFooter>
    </Card>
  );
}
