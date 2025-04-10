import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useBlockNumber } from 'wagmi';
import { Address } from 'viem';
import { type Abi } from 'abitype';

/**
 * 基于区块的动态合约读取钩子
 * 
 * 该钩子会在每个新区块生成时自动刷新数据，确保数据与链上状态同步
 * 
 * @param contractAddress 合约地址
 * @param abi 合约ABI
 * @param functionName 函数名称
 * @param args 函数参数
 * @param queryEnabled 是否启用查询
 * @param blockBasedRefresh 是否启用基于区块的刷新
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns 合约读取结果及状态
 */
export function useDynamicReadContract<TData = any>({
  contractAddress,
  abi,
  functionName,
  args = [],
  onSuccess,
  onError,
  enabled = true,
}: {
  contractAddress: Address | undefined;
  abi: Abi;
  functionName: string;
  args?: unknown[];
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}) {
  // 使用区块号来触发数据刷新 - 根据源码，watch 是一个顶层参数
  const { data: blockNumber } = useBlockNumber({
    watch: true
  });
  
  // 使用 wagmi 的 useReadContract
  const contractReadResult = useReadContract({
    address: contractAddress,
    abi,
    functionName,
    args: args,
    query: {
      enabled: enabled && Boolean(contractAddress),
    },
  });
  
  // 处理成功回调
  useEffect(() => {
    if (onSuccess && contractReadResult.data && contractReadResult.isSuccess) {
      onSuccess(contractReadResult.data as TData);
    }
  }, [contractReadResult.data, contractReadResult.isSuccess, onSuccess]);
  
  // 处理错误回调
  useEffect(() => {
    if (onError && contractReadResult.error && contractReadResult.isError) {
      onError(contractReadResult.error as Error);
    }
  }, [contractReadResult.error, contractReadResult.isError, onError]);
  
  // 记录上一次的区块号，避免重复刷新
  const [lastRefreshedBlock, setLastRefreshedBlock] = useState<bigint | undefined>(undefined);
  
  // 创建稳定的 refetch 方法
  const refetch = useCallback(() => {
    return contractReadResult.refetch();
  }, [contractReadResult.refetch]);
  
  // 当区块更新时手动刷新数据
  useEffect(() => {
    if (
      blockNumber && 
      lastRefreshedBlock !== blockNumber && 
      contractAddress
    ) {
      refetch();
      setLastRefreshedBlock(blockNumber);
    }
  }, [blockNumber, lastRefreshedBlock, refetch, contractAddress]);
  
  return {
    data: contractReadResult.data as TData | undefined,
    isLoading: contractReadResult.isLoading,
    isFetching: contractReadResult.isFetching,
    isSuccess: contractReadResult.isSuccess,
    isError: contractReadResult.isError,
    error: contractReadResult.error,
    refetch,
    status: contractReadResult.status,
    internal: {
      blockNumber,
      lastRefreshedBlock,
    }
  };
}