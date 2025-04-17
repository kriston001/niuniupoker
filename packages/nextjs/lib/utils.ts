import { GameState, GameTable, PlayerCard, getCardTypeName } from "@/types/game-types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RoomCardNftType, RoomLevelNftType } from "~~/types/game-types";
import { formatEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getPlayerCards(playerAddr: string, cardsData: PlayerCard[]): number[] {
  const playerCardData = cardsData.find(
    (card: PlayerCard) => card.playerAddr.toLowerCase() === playerAddr.toLowerCase(),
  );

  if (playerCardData && playerCardData.cards && playerCardData.cards.length > 0) {
    return playerCardData.cards;
  } else {
    return Array(5).fill(0);
  }
}

export function getPlayerCardTypeName(playerAddr: string, cardsData: PlayerCard[]): string {
  const playerCardData = cardsData.find(
    (card: PlayerCard) => card.playerAddr.toLowerCase() === playerAddr.toLowerCase(),
  );

  if (playerCardData) {
    return getCardTypeName(playerCardData.cardType);
  } else {
    return "";
  }
}

export function checkNext(tableInfo: GameTable): { b: boolean; name: string } {
  if (tableInfo.state == GameState.LIQUIDATED) {
    return { b: false, name: "游戏已被清算" };
  }

  if (tableInfo.state == GameState.WAITING) {
    //等待状态，人数大于一人并且都已准备，则可以开始游戏
    if (tableInfo.playerCount >= 2 && tableInfo.playerReadyCount == tableInfo.playerCount) {
      return { b: true, name: "开始游戏" };
    } else {
      return { b: false, name: "等待玩家准备" };
    }
  } else if (tableInfo.state == GameState.FIRST_BETTING || tableInfo.state == GameState.SECOND_BETTING) {
    //第一、二轮下注状态，所有玩家都已行动或者超时，则可以进入下一轮
    if (tableInfo.playerContinuedCount + tableInfo.playerFoldCount == tableInfo.playerCount) {
      return { b: true, name: "进入下一轮" };
    } else if (Number(tableInfo.currentRoundDeadline) * 1000 < Date.now()) {
      return { b: true, name: "进入下一轮" };
    } else {
      return { b: false, name: "等待玩家行动" };
    }
  } else {
    return { b: true, name: "重新开局" };
  }
}

export function getNftSympol(nft: RoomCardNftType | RoomLevelNftType): string {
  if ("maxBetAmount" in nft) {
    return "RC";
  } else {
    return "RL";
  }
}

export function getNftDescription(nft: RoomCardNftType | RoomLevelNftType): string {
  if ("maxBetAmount" in nft) {
    return `Up to ${nft.maxPlayers} people can play together, with a maximum bet amount of ${formatEther(nft.maxBetAmount)}`;
  } else {
    return `${nft.maxRooms} more tables can be created`;
  }
}

export function getNftFullName(nft: RoomCardNftType | RoomLevelNftType): string {
  if ("maxBetAmount" in nft) {
    return nft.name + " Table Card";
  } else {
    return nft.name + " Level";
  }
}

export function getNftTokenID(nft: RoomCardNftType | RoomLevelNftType): string {
  if ("maxBetAmount" in nft) {
    return "RC-" + nft.id.toString().padStart(3, "0");
  } else {
    return "RL-" + nft.id.toString().padStart(3, "0");
  }
}
