import { useEffect } from "react";
import { useReadContract, useAccount } from "wagmi";
import { getGameConfig } from "~~/contracts/abis/BBGameMainABI";
import { useGlobalState } from "~~/services/store/store";
import { GameConfig } from "~~/types/game-types";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export function useGameConfig() {
  const setGameConfig = useGlobalState(state => state.setGameConfig);
  const { targetNetwork } = useTargetNetwork();

  const { data: gameConfig } = useReadContract({
    address: targetNetwork.contracts?.BBGameMain && 'address' in targetNetwork.contracts.BBGameMain 
      ? targetNetwork.contracts.BBGameMain.address as `0x${string}` 
      : undefined,
    abi: [getGameConfig],
    functionName: "getGameConfig",
  });

  useEffect(() => {
    if (gameConfig) {
      setGameConfig(gameConfig as GameConfig);
    }
  }, [gameConfig, setGameConfig]);
}
