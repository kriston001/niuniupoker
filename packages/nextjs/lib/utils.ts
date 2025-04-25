import { GameState, GameTable, PlayerCard, PlayerState, getCardTypeName } from "@/types/game-types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { Player, RoomCardNftDetail, RoomCardNftType, RoomLevelNftDetail, RoomLevelNftType } from "~~/types/game-types";

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

export function getPlayerGameStateName(tableInfo: GameTable, player: Player) {
  if (player.state == PlayerState.FIRST_FOLDED || player.state == PlayerState.SECOND_FOLDED) {
    return "Folded";
  }
  switch (tableInfo.state) {
    case GameState.WAITING:
      return player.state == PlayerState.READY ? "Ready" : "";
    case GameState.COMMITTING:
      return player.state == PlayerState.COMMITTED ? "Committed" : "";
    case GameState.REVEALING:
      return player.state == PlayerState.REVEALED ? "Revealed" : "";
    case GameState.FIRST_BETTING:
      return player.state == PlayerState.FIRST_CONTINUED ? "Raised" : "";
    case GameState.SECOND_BETTING:
      return player.state == PlayerState.SECOND_CONTINUED ? "Raised" : "";
    default:
      return "";
  }
}

export function checkNext(tableInfo: GameTable): { b: boolean; name: string; desc: string } {
  if (tableInfo.state == GameState.LIQUIDATED) {
    return { b: false, name: "Game has been liquidated", desc: "" };
  }

  if (
    tableInfo.state == GameState.COMMITTING &&
    (tableInfo.committedCount == tableInfo.playerCount || Number(tableInfo.currentRoundDeadline) * 1000 < Date.now())
  ) {
    return { b: true, name: "Enter Reveal", desc: "" };
  }

  if (tableInfo.state == GameState.REVEALING) {
    if (
      tableInfo.revealedCount == tableInfo.playerCount ||
      Number(tableInfo.currentRoundDeadline) * 1000 < Date.now()
    ) {
      return { b: true, name: "Enter First Betting", desc: "" };
    } else {
      return { b: false, name: "Enter First Betting", desc: "Wait for all players to reveal" };
    }
  }

  if (tableInfo.state == GameState.FIRST_BETTING || tableInfo.state == GameState.SECOND_BETTING) {
    if (tableInfo.playerFoldCount >= tableInfo.playerCount - 1) {
      // 去结算，只有一个玩家继续或者全部弃牌
      return { b: true, name: "Settle Game", desc: "" };
    }
    if (Number(tableInfo.currentRoundDeadline) * 1000 < Date.now() && tableInfo.playerContinuedCount == 0) {
      // 超时，并且没有玩家继续
      return { b: true, name: "Settle Game", desc: "" };
    }

    //第一、二轮下注状态，所有玩家都已行动或者超时，则可以进入下一轮
    if (tableInfo.playerContinuedCount + tableInfo.playerFoldCount == tableInfo.playerCount) {
      return { b: true, name: "Next Round", desc: "" };
    } else if (Number(tableInfo.currentRoundDeadline) * 1000 < Date.now()) {
      return { b: true, name: "Next Round", desc: "" };
    } else {
      return { b: false, name: "Waiting for players to act", desc: "" };
    }
  } else {
    return { b: true, name: "Play Again", desc: "" };
  }
}

export function getNftSympol(nft: RoomCardNftType | RoomLevelNftType): string {
  if ("maxPlayers" in nft) {
    return "RC";
  } else {
    return "RL";
  }
}

export function getNftDescription(nft: RoomCardNftType | RoomLevelNftType): string {
  if ("maxPlayers" in nft) {
    return `Up to ${nft.maxPlayers} people can play together`;
  } else {
    return `${nft.maxRooms} more tables can be created`;
  }
}

export function getNftFullName(nft: RoomCardNftType | RoomLevelNftType): string {
  if ("maxPlayers" in nft) {
    return nft.name + " Table Card";
  } else {
    return nft.name + " Level";
  }
}

export function getNftTokenID(nft: RoomCardNftType | RoomLevelNftType): string {
  if ("maxPlayers" in nft) {
    return "RC-" + nft.id.toString().padStart(3, "0");
  } else {
    return "RL-" + nft.id.toString().padStart(3, "0");
  }
}

export function getNftImageUrl(nft: RoomCardNftType | RoomLevelNftType): string {
  if ("maxPlayers" in nft) {
    return nft.uriSuffix + "/card/" + nft.id.toString();
  } else {
    return nft.uriSuffix + "/level/" + nft.id.toString();
  }
}

export function getTimeAgo(timestamp: bigint | number | string) {
  const date = typeof timestamp === "string" ? new Date(timestamp) : new Date(Number(timestamp) * 1000); // 转换时间戳为毫秒

  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    if (diffInMinutes <= 1) {
      return `1m ago`;
    } else {
      return `${diffInMinutes}m ago`;
    }
  } else {
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h ago`;
  }
}

export function convertCardNumber(cardNumber: number) {
  // 计算点数（1-13）
  const value = ((cardNumber - 1) % 13) + 1;
  // 计算花色（0-3: spades, hearts, diamonds, clubs）
  const suitIndex = Math.floor((cardNumber - 1) / 13);

  // 转换点数显示
  let displayValue;
  if (value === 1) displayValue = "A";
  else if (value === 11) displayValue = "J";
  else if (value === 12) displayValue = "Q";
  else if (value === 13) displayValue = "K";
  else displayValue = value.toString();

  // 转换花色
  const suits = ["spades", "hearts", "diamonds", "clubs"];

  return {
    value: displayValue,
    suit: suits[suitIndex],
  };
}

export function convertToMyRoomCardNft(nfts: RoomCardNftDetail[]) {
  const myNfts: any[] = [];
  for (const nft of nfts) {
    const exist = myNfts.find(mynft => mynft.type == "room-card" && mynft.nftType.id === nft.nftType.id);
    if (exist) {
      exist.quantity += 1;
      exist.tokenIds.push(nft.tokenId);
    } else {
      myNfts.push({
        type: "room-card",
        nftType: nft.nftType,
        tokenIds: [nft.tokenId],
        quantity: 1,
      });
    }
  }
  return myNfts;
}

export function convertToMyRoomLevelNft(nfts: RoomLevelNftDetail[]) {
  const myNfts: any[] = [];
  for (const nft of nfts) {
    const exist = myNfts.find(mynft => mynft.type == "room-level" && mynft.nftType.id === nft.nftType.id);
    if (exist) {
      exist.quantity += 1;
      exist.tokenIds.push(nft.tokenId);
    } else {
      myNfts.push({
        type: "room-level",
        nftType: nft.nftType,
        tokenIds: [nft.tokenId],
        quantity: 1,
      });
    }
  }
  return myNfts;
}
