import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Gift,
  Info,
  MessageSquare,
  MinusCircle,
  PhoneCall,
  PlayCircle,
  RefreshCw,
  Send,
  Shuffle,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { GameState, GameTable, Player, PlayerState } from "~~/types/game-types";

interface PlayerControlsPanelProps {
  tableInfo: GameTable;
  playerInfo?: Player;
  onJoinGameClick?: () => void;
  onReadyClick?: () => void;
  onUnreadyClick?: () => void;
  onLeaveClick?: () => void;
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
  onLeaveClick,
  onCommitClick,
  onRevealClick,
  onContinueClick,
  onFoldClick,
}: PlayerControlsPanelProps) {
  const { state: gameState } = tableInfo;

  const isRoundOverdue = !!tableInfo.currentRoundDeadline && Date.now() > Number(tableInfo.currentRoundDeadline) * 1000;

  const showJoinButtons = gameState === GameState.WAITING;
  const showCommitButton = gameState === GameState.COMMITTING && playerInfo;
  const showRevealButton = gameState === GameState.REVEALING && playerInfo;
  const showFirstBetting = gameState === GameState.FIRST_BETTING && playerInfo;
  const showSecondBetting =
    gameState === GameState.SECOND_BETTING && playerInfo && playerInfo.state !== PlayerState.FOLDED;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-zinc-400">Actions</h4>
      <div className="flex flex-col gap-3">
        {showJoinButtons && (
          <>
            {!playerInfo && (
              <Button size="lg" onClick={onJoinGameClick} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Join Game
              </Button>
            )}

            {playerInfo && (
              <>
                {playerInfo.state === PlayerState.JOINED && (
                  <Button size="lg" onClick={onReadyClick} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Ready
                  </Button>
                )}

                {playerInfo.state === PlayerState.READY && (
                  <Button
                    size="lg"
                    onClick={onUnreadyClick}
                    className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
                  >
                    <X className="mr-2 h-5 w-5" />
                    Unready
                  </Button>
                )}

                <Button size="lg" onClick={onLeaveClick} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Leave
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
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
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
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
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
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Raise
            </Button>
            <Button
              size="lg"
              disabled={playerInfo.hasActedThisRound || isRoundOverdue}
              onClick={onFoldClick}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
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
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Call
            </Button>
            <Button
              size="lg"
              disabled={playerInfo.hasActedThisRound || isRoundOverdue}
              onClick={onFoldClick}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              <MinusCircle className="mr-2 h-5 w-5" />
              Fold
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
