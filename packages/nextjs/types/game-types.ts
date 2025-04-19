// 玩家状态枚举
export enum PlayerState {
  NONE = 0,
  JOINED = 1,
  READY = 2,
  FIRST_FOLDED = 3,
  FIRST_CONTINUED = 4,
  SECOND_FOLDED = 5,
  SECOND_CONTINUED = 6,
}

// 游戏状态枚举
export enum GameState {
  NONE = 0,
  WAITING = 1,
  FIRST_BETTING = 2,
  SECOND_BETTING = 3,
  ENDED = 4,
  LIQUIDATED = 5,
  DISBANDED = 6,
}

// 牌型枚举
export enum CardType {
  NONE = 0,
  NO_BULL = 1,
  BULL_1 = 2,
  BULL_2 = 3,
  BULL_3 = 4,
  BULL_4 = 5,
  BULL_5 = 6,
  BULL_6 = 7,
  BULL_7 = 8,
  BULL_8 = 9,
  BULL_9 = 10,
  BULL_BULL = 11,
  FIVE_BOMB = 12,
  FIVE_SMALL = 13,
  FIVE_FLOWERS = 14,
}

export interface GameConfig {
  minBet: bigint;
  maxPlayers: number;
  maxBankerFeePercent: bigint;
  playerTimeout: bigint;
  tableInactiveTimeout: bigint;
  liquidatorFeePercent: bigint;
  roomCardEnabled: boolean;
  roomLevelEnabled: boolean;
  gameHistoryAddress: string;
  rewardPoolAddress: string;
  randomnessManagerAddress: string;
  roomCardAddress: string;
  roomLevelAddress: string;
  gameTableFactoryAddress: string;
}

// 游戏桌信息类型定义
export interface GameTable {
  tableAddr: string;
  tableName: string;
  bankerAddr: string;
  betAmount: bigint;
  playerCount: number;
  maxPlayers: number;
  creationTimestamp: bigint;
  state: number;
  playerContinuedCount: number;
  playerFoldCount: number;
  playerReadyCount: number;
  playerAddresses: string[];
  currentRoundDeadline: bigint;
};

// 玩家信息类型定义
export interface Player {
  playerAddr: string;
  isBanker: boolean;
  state: PlayerState;
  initialBet: bigint;
  additionalBet1: bigint;
  additionalBet2: bigint;
  cards: number[];
  cardType: CardType;
}

// 玩家卡牌信息定义
export interface PlayerCard {
  playerAddr: string;
  cards: number[];
  cardType: CardType;
}

export interface RoomCardNftType {
  id: bigint;
  name: string;
  maxPlayers: number;
  price: bigint;
  uriSuffix: string;
  active: boolean;
  maxMint: bigint;
  rarity: string;
  minted: bigint;
}

// 房卡详细信息
export interface RoomCardNftDetail {
  tokenId: bigint;
  nftType: RoomCardNftType;
}

export interface RoomLevelNftType {
  id: bigint;
  name: string;
  maxRooms: bigint;
  price: bigint;
  uriSuffix: string;
  active: boolean;
  maxMint: bigint;
  rarity: string;
  minted: bigint;
}

// 房间等级信息
export interface RoomLevelNftDetail {
  tokenId: bigint;
  nftType: RoomLevelNftType;
}

// 获取牌型名称
export const getCardTypeName = (cardType: number) => {
  switch (cardType) {
    case CardType.NONE:
      return "无牌型";
    case CardType.NO_BULL:
      return "没牛";
    case CardType.BULL_1:
      return "牛一";
    case CardType.BULL_2:
      return "牛二";
    case CardType.BULL_3:
      return "牛三";
    case CardType.BULL_4:
      return "牛四";
    case CardType.BULL_5:
      return "牛五";
    case CardType.BULL_6:
      return "牛六";
    case CardType.BULL_7:
      return "牛七";
    case CardType.BULL_8:
      return "牛八";
    case CardType.BULL_9:
      return "牛九";
    case CardType.BULL_BULL:
      return "牛牛";
    case CardType.FIVE_BOMB:
      return "五炸";
    case CardType.FIVE_SMALL:
      return "五小";
    case CardType.FIVE_FLOWERS:
      return "五花";
    default:
      return "未知";
  }
};

// 获取玩家状态名称
export const getPlayerStateName = (state: number) => {
  switch (state) {
    case PlayerState.NONE:
      return "未加入";
    case PlayerState.JOINED:
      return "已加入";
    case PlayerState.READY:
      return "已准备";
    case PlayerState.FIRST_FOLDED:
      return "第一轮弃牌";
    case PlayerState.FIRST_CONTINUED:
      return "第一轮继续";
    case PlayerState.SECOND_FOLDED:
      return "第二轮弃牌";
    case PlayerState.SECOND_CONTINUED:
      return "第二轮继续";
    default:
      return "未知";
  }
};

// 获取游戏状态名称
export const getGameStateName = (state: number) => {
  switch (state) {
    case GameState.NONE:
      return "未初始化";
    case GameState.WAITING:
      return "等待中";
    case GameState.FIRST_BETTING:
      return "第一轮下注";
    case GameState.SECOND_BETTING:
      return "第二轮下注";
    case GameState.ENDED:
      return "已结束";
    case GameState.LIQUIDATED:
      return "已清算";
    case GameState.DISBANDED:
      return "已解散";
    default:
      return "未知";
  }
};
