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
  maxRoomCount: number;
  maxPlayers: number;
  maxBankerFeePercent: number;
  playerTimeout: bigint;
  tableInactiveTimeout: bigint;
  liquidatorFeePercent: number;
  rewardPoolAddress: `0x${string}`;
  randomnessManagerAddress: `0x${string}`;
  roomCardAddress: `0x${string}`;
  roomLevelAddress: `0x${string}`;
  gameTableFactoryAddress: `0x${string}`;
}

// 奖励池信息类型定义
export interface RewardPoolInfo {
  name: string; // 奖励池名称
  poolId: bigint; // 奖励池ID
  banker: `0x${string}`; // 创建者（庄家）地址
  totalAmount: bigint; // 总奖池金额
  rewardPerGame: bigint; // 每局游戏奖励金额
  winProbability: bigint; // 中奖概率（以百分之一为单位）
  remainingAmount: bigint; // 剩余奖池金额
}

// 游戏桌信息类型定义
export interface GameTable {
  active: boolean;
  gameRound: bigint; // 游戏场次
  gameLiquidatedCount: bigint; // 被清算的游戏场数
  tableAddr: `0x${string}`; // 游戏桌合约地址
  tableId: bigint;
  tableName: string; // 游戏桌名称
  bankerAddr: `0x${string}`; // 庄家地址
  betAmount: bigint; // 下注金额
  bankerFeePercent: number; // 庄家费用百分比
  totalPrizePool: bigint; // 总奖池金额
  playerCount: number; // 当前玩家数量
  maxPlayers: number; // 最大玩家数量
  creationTimestamp: bigint; // 创建时间戳
  state: number; // 游戏状态
  liquidatorFeePercent: number; // 清算人费用百分比
  playerContinuedCount: number; // 继续游戏的玩家数量
  playerFoldCount: number; // 弃牌的玩家数量
  playerReadyCount: number; // 准备好的玩家数量
  playerAddresses: `0x${string}`[]; // 玩家地址列表
  currentRoundDeadline: bigint; // 当前回合截止时间
  playerTimeout: bigint; // 玩家超时时间
  tableInactiveTimeout: bigint; // 游戏桌不活跃超时时间
  lastActivityTimestamp: bigint; // 最后活动时间戳
  rewardPoolId: bigint; // 奖励池ID
  rewardPoolInfo: RewardPoolInfo; // 奖励池信息
  implementationVersion: bigint; // 实现版本号
}

// 玩家信息类型定义
export interface Player {
  addr: string;
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
export const getCardTypeName = (cardType: CardType) => {
  switch (cardType) {
    case CardType.NONE:
      return "None";
    case CardType.NO_BULL:
      return "No Bull";
    case CardType.BULL_1:
      return "Bull 1";
    case CardType.BULL_2:
      return "Bull 2";
    case CardType.BULL_3:
      return "Bull 3";
    case CardType.BULL_4:
      return "Bull 4";
    case CardType.BULL_5:
      return "Bull 5";
    case CardType.BULL_6:
      return "Bull 6";
    case CardType.BULL_7:
      return "Bull 7";
    case CardType.BULL_8:
      return "Bull 8";
    case CardType.BULL_9:
      return "Bull 9";
    case CardType.BULL_BULL:
      return "Bull Bull";
    case CardType.FIVE_BOMB:
      return "Five Bomb";
    case CardType.FIVE_SMALL:
      return "Five Small";
    case CardType.FIVE_FLOWERS:
      return "Five Flowers";
    default:
      return "Unknown";
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
      return "Waiting";
    case GameState.FIRST_BETTING:
      return "First Betting";
    case GameState.SECOND_BETTING:
      return "Second Betting";
    case GameState.ENDED:
      return "Ended";
    case GameState.LIQUIDATED:
      return "Liquidated";
    default:
      return "Unknown";
  }
};
