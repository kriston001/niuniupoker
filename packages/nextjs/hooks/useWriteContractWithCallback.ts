import { useEffect, useRef, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface WriteWithCallbackParams {
  address: `0x${string}`;
  abi: any;
  functionName: string;
  args?: any[];
  value?: bigint;
  account?: `0x${string}`;
  onSuccess?: () => Promise<void>;
  onError?: (error: Error) => Promise<void>;
}

export function useWriteContractWithCallback() {
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);

  const callbacksRef = useRef<{
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }>({});

  const writeAsync = async (params: WriteWithCallbackParams) => {
    const { onSuccess, onError, ...contractParams } = params;
    callbacksRef.current = { onSuccess, onError };

    try {
      const hash = await writeContractAsync({
        ...contractParams,
        args: contractParams.args || [],
      });
      setTxHash(hash);
      return hash;
    } catch (err) {
      const error = err as Error;
      setError(error);
      await onError?.(err as Error); // 立即触发错误回调
    }
  };

  const { isSuccess, isError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    const callCallback = async () => {
      if (isSuccess) {
        await callbacksRef.current.onSuccess?.();
        resetState();
      }
      if (isError && error) {
        await callbacksRef.current.onError?.(error as Error);
        resetState();
      }
    };

    callCallback();
  }, [isSuccess, isError, error]);

  const resetState = () => {
    setTxHash(undefined);
    setError(null);
    callbacksRef.current = {};
  };

  return {
    writeContractWithCallback: writeAsync,
    isPending: !!txHash && !isSuccess && !isError,
  };
}
