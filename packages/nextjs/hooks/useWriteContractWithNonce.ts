import { useEffect, useState } from "react";
import { useNonceManager } from "./useNonceManager";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { WriteContractParameters, WriteContractReturnType } from "wagmi/actions";

export function useWriteContractWithNonce() {
  const nonceManager = useNonceManager();
  const [customError, setCustomError] = useState<Error | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const { data: hash, isPending, writeContractAsync, error: writeError, reset: resetWrite } = useWriteContract();

  const { isLoading: isConfirming, error: confirmError, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && nonceManager) {
      nonceManager.transactionConfirmed();
    }
  }, [isSuccess, nonceManager]);

  const writeContractWithNonce = async <T extends WriteContractParameters>(
    params: T,
  ): Promise<WriteContractReturnType> => {
    if (!nonceManager) {
      throw new Error("Nonce 管理器未初始化，请确保钱包已连接");
    }

    if (isLocked) {
      throw new Error("已有交易正在处理中，请稍后再试");
    }

    setIsLocked(true);
    try {
      setCustomError(null);
      resetWrite();

      const nonce = await nonceManager.getNonce();
      console.log(`[useWriteContractWithNonce] 使用 nonce: ${nonce} 发送交易`);
      debugger;

      const txHash = await writeContractAsync({
        ...params,
        // nonce: Number(nonce),
      });

      console.log(`[useWriteContractWithNonce] 交易已发送，哈希: ${txHash}`);
      return txHash;
    } catch (err: any) {
      console.error("[useWriteContractWithNonce] 交易失败:", err);

      const hasHash = err?.transactionHash || err?.data?.hash;
      if (!hasHash && nonceManager) {
        nonceManager.transactionFailed(err);
      }

      setCustomError(err);
      throw err;
    } finally {
      setIsLocked(false);
    }
  };

  return {
    writeContractWithNonce,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    customError,
    writeError,
    confirmError,
    reset: () => {
      setCustomError(null);
      resetWrite();
    },
  };
}

