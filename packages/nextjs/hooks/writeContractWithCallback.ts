// hooks/useWriteContractWithCallback.ts
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

interface WriteWithCallbackParams {
  address: `0x${string}`;
  abi: any;
  functionName: string;
  args?: any[];
  value?: bigint;
  account?: `0x${string}`;
  gas?: bigint;
  onPending?: (hash: `0x${string}`) => void;
  onSuccess?: (hash: `0x${string}`) => Promise<void>;
  onError?: (error: Error) => Promise<void>;
}

/**
 * 直接调用，不依赖任何 React 生命周期，不触发任何重新渲染
 */
export async function writeContractWithCallback(params: WriteWithCallbackParams) {
  const { onPending, onSuccess, onError, ...contractParams } = params;

  try {
    // 1. 发交易
    const hash = await writeContract(wagmiConfig, {
      ...contractParams,
      args: contractParams.args || [],
    });

    // 2. 发出去就可以触发 pending 回调
    onPending?.(hash);

    // 3. 等待链上确认
    await waitForTransactionReceipt(wagmiConfig, {
      hash,
    });

    // 4. 成功确认后调用成功回调
    await onSuccess?.(hash);

    return hash;
  } catch (err) {
    // 5. 出错（发交易或者确认时出错）调用错误回调
    await onError?.(err as Error);
  }
}
