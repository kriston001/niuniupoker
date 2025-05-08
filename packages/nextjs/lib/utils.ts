import { GameState, GameTable, PlayerState, getCardTypeName } from "@/types/game-types";
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

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export function getPlayerGameStateName(tableInfo: GameTable, player: Player) {
  if (player.state == PlayerState.FOLDED) {
    return "FOLDED";
  }
  switch (tableInfo.state) {
    case GameState.WAITING:
      return player.state == PlayerState.READY ? "READY" : "";
    case GameState.FIRST_BETTING:
      return player.hasActedThisRound ? "RAISED" : "";
    case GameState.SECOND_BETTING:
      return player.hasActedThisRound ? "RAISED" : "";
    default:
      return "";
  }
}

export function getGameDescription(tableInfo: GameTable, player: Player | null): string {
  if(tableInfo.state == GameState.WAITING){
    if(player?.state === PlayerState.JOINED) {
      return "Click \"Ready\" to join the game and stake your entry deposit";
    }else if(player?.state === PlayerState.READY) {
      if(tableInfo.playerReadyCount == tableInfo.playerCount){
        return "Waiting for owner to start the game";
      }else{
        return "Waiting for other players to be ready";
      }
    }
  }else if (tableInfo.state === GameState.FIRST_BETTING || tableInfo.state === GameState.SECOND_BETTING) {
    //如果超时
    if(Date.now() > tableInfo.currentRoundDeadline * 1000n){
      return "Player timeout, waiting for owner to next the game";
    }
    
    if(player?.hasActedThisRound){
      return "Waiting for other players to be acted";
    }else{
      return "Choose to Raise or Fold";
    }
  }
  return "";
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
    return nft.name + " Table Level";
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
  // 获取当前域名，如果是开发环境则使用 localhost:3000
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // console.log(`${baseUrl}/images/nfts/rc_${nft.uriSuffix}.png`);
  if ("maxPlayers" in nft) {
    return `${baseUrl}/images/nfts/rc_${nft.uriSuffix}.png`;
  } else {
    return `${baseUrl}/images/nfts/rl_${nft.uriSuffix}.png`;
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
