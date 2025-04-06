"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface PlayerBalanceProps {
  onBalanceChange?: () => void;
}

const PlayerBalance = ({ onBalanceChange }: PlayerBalanceProps) => {
  const { address: connectedAddress } = useAccount();
  const [withdrawAmount, setWithdrawAmount] = useState("0.01");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // 读取用户余额
  const { data: userBalance, isLoading: isLoadingBalance, refetch: refetchBalance } = useScaffoldReadContract({
    contractName: "BBGameMain",
    functionName: "getUserBalance",
    args: [connectedAddress],
    watch: true,
  });

  // 提取余额合约写入
  const { writeContractAsync: withdrawBalance } = useScaffoldWriteContract({
    contractName: "BBGameMain",
  });

  // 处理提取余额
  const handleWithdraw = async () => {
    if (!connectedAddress || !userBalance) return;
    
    try {
      setIsWithdrawing(true);
      const parsedAmount = parseEther(withdrawAmount);
      
      // 检查提取金额是否超过余额
      if (parsedAmount > userBalance) {
        alert("提取金额不能超过余额");
        setIsWithdrawing(false);
        return;
      }
      
      await withdrawBalance({
        functionName: "withdrawBalance",
        args: [parsedAmount],
      });
      
      // 刷新余额
      await refetchBalance();
      if (onBalanceChange) onBalanceChange();
      
      // 重置表单
      setWithdrawAmount("0.01");
    } catch (error) {
      console.error("提取余额失败:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!connectedAddress) {
    return (
      <div className="bg-base-200 rounded-box p-4">
        <p className="text-center">请先连接钱包</p>
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-box p-4">
      <h2 className="text-xl font-bold mb-4">游戏余额</h2>
      
      {isLoadingBalance ? (
        <div className="animate-pulse h-6 w-24 bg-base-300 rounded mb-4"></div>
      ) : (
        <div className="text-2xl font-bold mb-4">{userBalance ? formatEther(userBalance) : "0"} ETH</div>
      )}
      
      <div className="flex flex-col gap-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text">提取金额 (ETH)</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="输入提取金额"
            className="input input-bordered w-full"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
        </div>
        
        <button
          className={`btn btn-primary w-full ${isWithdrawing ? "loading" : ""}`}
          onClick={handleWithdraw}
          disabled={isWithdrawing || !userBalance || userBalance === BigInt(0) || parseFloat(withdrawAmount) <= 0}
        >
          {isWithdrawing ? "提取中..." : "提取到钱包"}
        </button>
      </div>
    </div>
  );
};

export default PlayerBalance;