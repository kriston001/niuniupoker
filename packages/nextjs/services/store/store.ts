import { create } from "zustand";
import scaffoldConfig from "~~/scaffold.config";
import { GameConfig } from "~~/types/game-types";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type GlobalState = {
  nativeCurrency: {
    price: number;
    isFetching: boolean;
  };
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  setIsNativeCurrencyFetching: (newIsNativeCurrencyFetching: boolean) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;

  // 新增的游戏配置状态
  gameConfig: GameConfig;
  setGameConfig: (config: GameConfig) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  nativeCurrency: {
    price: 0,
    isFetching: true,
  },
  setNativeCurrencyPrice: (newValue: number): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, price: newValue } })),
  setIsNativeCurrencyFetching: (newValue: boolean): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, isFetching: newValue } })),
  targetNetwork: scaffoldConfig.targetNetworks[0],
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),

  // 新增的游戏配置状态
  gameConfig: {
    maxRoomCount: 1,
    maxPlayers: 6,
    maxBankerFeePercent: 20,
    playerTimeout: 120n,
    tableInactiveTimeout: 1200n,
    liquidatorFeePercent: 20,
    rewardPoolAddress: "0x0000000000000000000000000000000000000000",
    roomCardAddress: "0x0000000000000000000000000000000000000000",
    roomLevelAddress: "0x0000000000000000000000000000000000000000",
    gameTableFactoryAddress: "0x0000000000000000000000000000000000000000",
  },
  setGameConfig: (config: GameConfig) => set({ gameConfig: config }),
}));
