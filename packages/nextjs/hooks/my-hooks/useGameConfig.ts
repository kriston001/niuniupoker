import { useEffect } from "react";
import { useReadContract } from "wagmi";
import { getGameConfig } from "~~/contracts/abis/BBGameMainABI";
import scaffoldConfig from "~~/scaffold.config";
import { useGlobalState } from "~~/services/store/store";
import { GameConfig } from "~~/types/game-types";

export function useGameConfig() {
  const setGameConfig = useGlobalState(state => state.setGameConfig);

  const { data: gameConfig } = useReadContract({
    address: scaffoldConfig.contracts.BBGameMain,
    abi: [getGameConfig],
    functionName: "getGameConfig",
  });

  useEffect(() => {
    if (gameConfig) {
      setGameConfig(gameConfig as GameConfig);
    }
  }, [gameConfig, setGameConfig]);
}
