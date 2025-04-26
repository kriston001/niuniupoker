import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Gift, MinusCircle, PlayCircle, Shuffle, TrendingUp, X } from "lucide-react";
import { formatEther } from "viem";
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
}

export function PlayerControlsPanel({
  tableInfo,
  playerInfo,
  onJoinGameClick,
  onReadyClick,
  onUnreadyClick,
  onQuitClick,
  onCommitClick,
  onRevealClick,
  onContinueClick,
  onFoldClick,
}: PlayerControlsPanelProps) {
  const { state: gameState } = tableInfo;
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;

  const isRoundOverdue = !!tableInfo.currentRoundDeadline && Date.now() > Number(tableInfo.currentRoundDeadline) * 1000;

  const showJoinButtons = gameState === GameState.WAITING;
  const showCommitButton = gameState === GameState.COMMITTING && playerInfo;
  const showRevealButton = gameState === GameState.REVEALING && playerInfo;
  const showFirstBetting = gameState === GameState.FIRST_BETTING && playerInfo;
  const showSecondBetting =
    gameState === GameState.SECOND_BETTING && playerInfo && playerInfo.state !== PlayerState.FOLDED;
  const showLeaveButtons = gameState === GameState.SETTLED && playerInfo;

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

        {showCommitButton && (
          <Button
            size="lg"
            disabled={playerInfo.state === PlayerState.COMMITTED || isRoundOverdue}
            onClick={onCommitClick}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          >
            <Shuffle className="mr-2 h-5 w-5" />
            {playerInfo.state === PlayerState.COMMITTED ? "Committed" : "Commit Random"}
          </Button>
        )}

        {showRevealButton && (
          <Button
            size="lg"
            disabled={playerInfo.state === PlayerState.REVEALED || isRoundOverdue}
            onClick={onRevealClick}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-white"
          >
            <Gift className="mr-2 h-5 w-5" />
            {playerInfo.state === PlayerState.REVEALED ? "Revealed" : "Reveal Random"}
          </Button>
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
      </div>
    </div>
  );
}
