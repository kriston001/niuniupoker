import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Gift, MinusCircle, PlayCircle, Shuffle, TrendingUp, X, Clock, AlertTriangle } from "lucide-react";
import { formatEther } from "viem";
import { useEffect, useState } from "react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { GameState, GameTable, Player, PlayerState } from "~~/types/game-types";

interface PlayerControlsPanelProps {
  tableInfo: GameTable;
  playerInfo?: Player;
  onJoinGameClick?: () => void;
  onReadyClick?: () => void;
  onUnreadyClick?: () => void;
  onQuitClick?: () => void;
  onCommitClick?: () => void;
  onRevealClick?: () => void;
  onContinueClick?: () => void;
  onFoldClick?: () => void;
  onLiquidateClick?: () => void;
}

export function PlayerControlsPanel({
  tableInfo,
  playerInfo,
  onJoinGameClick,
  onReadyClick,
  onUnreadyClick,
  onQuitClick,
  onContinueClick,
  onFoldClick,
  onLiquidateClick,
}: PlayerControlsPanelProps) {
  const { state: gameState } = tableInfo;
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [canLiquidate, setCanLiquidate] = useState(false);

  const isRoundOverdue = !!tableInfo.currentRoundDeadline && Date.now() > Number(tableInfo.currentRoundDeadline) * 1000;

  const showJoinButtons = gameState === GameState.WAITING;
  const showFirstBetting = gameState === GameState.FIRST_BETTING && playerInfo;
  const showSecondBetting =
    gameState === GameState.SECOND_BETTING && playerInfo && playerInfo.state !== PlayerState.FOLDED;
  const showLeaveButtons = (gameState === GameState.SETTLED || gameState == GameState.LIQUIDATED) && playerInfo;
  const showLiquidationInfo = [GameState.FIRST_BETTING, GameState.SECOND_BETTING, GameState.ENDED].includes(gameState);

  // Calculate remaining time for liquidation
  useEffect(() => {
    if (!showLiquidationInfo) return;
    
    // 添加调试信息
    console.log("Liquidate deadline:", tableInfo.liquidateDeadline);
    
    // 检查liquidateDeadline是否存在且有效
    if (!tableInfo.liquidateDeadline || tableInfo.liquidateDeadline === 0n) {
      setRemainingTime(null);
      setCanLiquidate(false);
      return;
    }

    const updateRemainingTime = () => {
      const now = Date.now();
      const deadline = Number(tableInfo.liquidateDeadline) * 1000;
      const timeLeft = Math.max(0, deadline - now);
      
      setRemainingTime(Math.floor(timeLeft / 1000));
      setCanLiquidate(timeLeft <= 0);
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);
    
    return () => clearInterval(interval);
  }, [tableInfo, showLiquidationInfo]);

  // Format the remaining time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-zinc-400">Actions</h4>
      <div className="flex flex-col gap-3">
        {showJoinButtons && (
          <>
            {!playerInfo && (
              <Button size="lg" onClick={onJoinGameClick} className="w-full bg-green-600 hover:bg-green-500 text-white">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Join Game
              </Button>
            )}

            {playerInfo && (
              <>
                {playerInfo.state === PlayerState.JOINED && (
                  <Button
                    size="lg"
                    onClick={onReadyClick}
                    className="w-full bg-green-600 hover:bg-green-500 text-white"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Ready – Deposit {formatEther(tableInfo.betAmount)} {symbol}
                  </Button>
                )}

                {playerInfo.state === PlayerState.READY && (
                  <Button size="lg" onClick={onUnreadyClick} className="w-full bg-red-600 hover:bg-red-500 text-white">
                    <X className="mr-2 h-5 w-5" />
                    Cancel Ready - Refund {formatEther(tableInfo.betAmount)} {symbol}
                  </Button>
                )}

                <Button size="lg" onClick={onQuitClick} className="w-full bg-red-600 hover:bg-red-500 text-white">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Leave
                  {playerInfo.state === PlayerState.READY
                    ? ` - Refund ${formatEther(tableInfo.betAmount)} ${symbol}`
                    : ""}
                </Button>
              </>
            )}
          </>
        )}

        {showFirstBetting && (
          <>
            <Button
              size="lg"
              disabled={playerInfo.hasActedThisRound || isRoundOverdue}
              onClick={onContinueClick}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Raise – Deposit {formatEther(tableInfo.betAmount * BigInt(tableInfo.firstBetX))} {symbol}
            </Button>
            <Button
              size="lg"
              disabled={playerInfo.hasActedThisRound || isRoundOverdue}
              onClick={onFoldClick}
              className="w-full bg-red-600 hover:bg-red-500 text-white"
            >
              <MinusCircle className="mr-2 h-5 w-5" />
              Fold
            </Button>
          </>
        )}

        {showSecondBetting && (
          <>
            <Button
              size="lg"
              disabled={playerInfo.hasActedThisRound || isRoundOverdue}
              onClick={onContinueClick}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Raise – Deposit {formatEther(tableInfo.betAmount * BigInt(tableInfo.secondBetX))} {symbol}
            </Button>
            <Button
              size="lg"
              disabled={playerInfo.hasActedThisRound || isRoundOverdue}
              onClick={onFoldClick}
              className="w-full bg-red-600 hover:bg-red-500 text-white"
            >
              <MinusCircle className="mr-2 h-5 w-5" />
              Fold
            </Button>
          </>
        )}

        {showLeaveButtons && (
          <Button size="lg" onClick={onQuitClick} className="w-full bg-red-600 hover:bg-red-500 text-white">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Leave
          </Button>
        )}

        {/* Liquidation Countdown and Button */}
        {showLiquidationInfo && (
          <div className="mt-2">
            {remainingTime !== null && remainingTime > 0 ? (
              <div className="flex flex-col p-3 bg-zinc-800/50 rounded-md border border-zinc-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">Liquidation in:</span>
                  </div>
                  <span className="text-sm font-mono text-white">{formatTime(remainingTime)}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 w-full">
                  If owner does not act, this game can be liquidated after the timer ends.
                </p>
              </div>
            ) : canLiquidate && playerInfo?.addr != tableInfo.bankerAddr ? (
              <Button 
                size="lg" 
                className="w-full bg-amber-600 hover:bg-amber-500 text-white"
                onClick={() => {
                  onLiquidateClick?.();
                }}
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                Liquidate Game
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
