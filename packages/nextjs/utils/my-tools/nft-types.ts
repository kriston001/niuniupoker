// NFT 类型定义

// 房卡详细信息
export type RoomCardDetails = {
  tokenId: bigint; // 卡片的token ID
  cardTypeId: bigint; // 卡片类型ID
  name: string; // 卡片类型名称
  maxBetAmount: bigint; // 最大下注金额
  maxPlayers: number; // 最大玩家数
  uriSuffix: string; // URI后缀
};

// 房卡类型
export type RoomCardType = {
  id: bigint; // 唯一标识符
  name: string; // 名称 (例如 "SILVER", "GOLD", "DIAMOND")
  maxBetAmount: bigint; // 最大下注金额
  maxPlayers: number; // 最大玩家数
  price: bigint; // 购买价格
  uriSuffix: string; // URI后缀
  active: boolean; // 是否激活
};

// 房间等级详细信息
export type RoomLevelDetails = {
  tokenId: bigint; // 等级token ID
  levelTypeId: bigint; // 等级类型ID
  name: string; // 等级类型名称
  maxRooms: bigint; // 最大房间数
  uriSuffix: string; // URI后缀
};

// 房间等级类型
export type RoomLevelType = {
  id: bigint; // 唯一标识符
  name: string; // 名称 (例如 "BRONZE", "SILVER", "GOLD")
  maxRooms: bigint; // 最大房间数
  price: bigint; // 购买价格
  uriSuffix: string; // URI后缀
  active: boolean; // 是否激活
};

// NFT 数据响应类型
export type NFTData = {
  // 房卡数据
  hasRoomCard: boolean;
  roomCards: RoomCardDetails[];

  // 房间等级数据
  hasRoomLevel: boolean;
  roomLevels: RoomLevelDetails[];
  totalMaxRooms: bigint;

  // 加载状态
  isLoading: boolean;
  isError: boolean;

  // 刷新函数
  refreshData: () => Promise<void>;
  lastRefreshTime: number;
};
