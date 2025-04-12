import { useEffect, useRef } from "react";
import { useAccount, usePublicClient } from "wagmi";

export function useNonceManager() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const currentNonce = useRef<bigint | null>(null);
  const pendingCount = useRef(0);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const fetchNonce = async () => {
      if (isFetchingRef.current || !address || !publicClient) return;

      try {
        isFetchingRef.current = true;
        const chainNonce = await publicClient.getTransactionCount({
          address,
          blockTag: "pending",
        });

        currentNonce.current = BigInt(chainNonce);
        pendingCount.current = 0;
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchNonce();
  }, [address, publicClient]);

  const getNonce = async (): Promise<bigint> => {
    if (currentNonce.current === null) {
      throw new Error("Nonce 尚未加载完成");
    }

    const nextNonce = currentNonce.current + BigInt(pendingCount.current);
    pendingCount.current += 1;
    return nextNonce;
  };

  const transactionConfirmed = () => {
    if (currentNonce.current !== null) {
      currentNonce.current += 1n;
    }
    pendingCount.current = Math.max(pendingCount.current - 1, 0);
  };

  const transactionFailed = (_err?: any) => {
    pendingCount.current = Math.max(pendingCount.current - 1, 0);
  };

  return {
    getNonce,
    transactionConfirmed,
    transactionFailed,
  };
}
