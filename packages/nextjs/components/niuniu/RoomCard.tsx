"use client";

import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import BBContractAbis from "~~/contracts/contractABIs";
import { useWriteContractWithCallback } from "~~/hooks/useWriteContractWithCallback";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface RoomCardProps {
  onRoomCardChange?: () => void;
  onSelectCard?: (cardId: number) => void;
  selectedCardId?: number | null;
  onRoomCardEnabledChange?: (enabled: boolean) => void;
}

const RoomCard = ({ onRoomCardChange, onSelectCard, selectedCardId, onRoomCardEnabledChange }: RoomCardProps) => {
  const { address: connectedAddress } = useAccount();
  const [isBuying, setIsBuying] = useState(false);
  const [buyAmount, setBuyAmount] = useState(1);
  const [roomCardEnabled, setRoomCardEnabled] = useState(false);
  const [roomCardPrice, setRoomCardPrice] = useState<bigint>(BigInt(0));
  // 使用props中的selectedCardId，如果没有则使用内部状态
  const [internalSelectedCardId, setInternalSelectedCardId] = useState<number | null>(null);
  const cc = selectedCardId !== undefined ? selectedCardId : internalSelectedCardId;

  // 获取用户拥有的房卡信息
  const { data: userRoomCards, refetch: refetchUserRoomCards } = useScaffoldReadContract({
    contractName: "BBGameMain",
    functionName: "getUserRoomCards",
    args: [connectedAddress],
    enabled: !!connectedAddress,
  });

  // 获取房卡功能是否启用
  const { data: isRoomCardEnabled } = useScaffoldReadContract({
    contractName: "BBGameMain",
    functionName: "roomCardEnabled",
  });

  // 获取房卡合约地址
  const { data: roomCardAddress } = useScaffoldReadContract({
    contractName: "BBGameMain",
    functionName: "roomCardAddress",
  });

  // 获取房卡价格
  const { data: cardPrice } = useScaffoldReadContract({
    contractName: "BBRoomCard",
    functionName: "roomCardPrice",
    address: roomCardAddress as `0x${string}`,
    enabled: !!roomCardAddress,
  });

  // 使用自定义的 Hook
  const { writeContractWithCallback } = useWriteContractWithCallback();

  useEffect(() => {
    if (isRoomCardEnabled !== undefined) {
      setRoomCardEnabled(isRoomCardEnabled);
      // 通知父组件房卡功能是否启用
      if (onRoomCardEnabledChange) {
        onRoomCardEnabledChange(isRoomCardEnabled);
      }
    }
  }, [isRoomCardEnabled]);

  useEffect(() => {
    if (cardPrice) {
      setRoomCardPrice(cardPrice);
    }
  }, [cardPrice]);

  // 处理购买房卡
  const handleBuyRoomCard = async () => {
    if (!connectedAddress || !roomCardAddress || !roomCardPrice) return;

    try {
      setIsBuying(true);
      const totalPrice = roomCardPrice * BigInt(buyAmount);

      await writeContractWithCallback({
        address: roomCardAddress as `0x${string}`,
        abi: BBContractAbis.BBRoomCard.abi,
        functionName: buyAmount > 1 ? "batchBuyRoomCard" : "buyRoomCard",
        args: buyAmount > 1 ? [buyAmount] : [],
        value: totalPrice,
        account: connectedAddress as `0x${string}`,
        onSuccess: async () => {
          console.log("✅ 购买房卡成功");
          // 重置表单
          setBuyAmount(1);
          // 刷新房卡列表
          await refetchUserRoomCards();
          // 通知父组件房卡变化
          if (onRoomCardChange) onRoomCardChange();
        },
        onError: async err => {
          console.error("❌ 购买房卡失败:", err.message);
        },
      });
    } catch (error) {
      console.error("购买房卡失败:", error);
    } finally {
      setIsBuying(false);
    }
  };

  // 如果房卡功能未启用，不显示组件
  if (!roomCardEnabled) return null;

  return (
    <div className="bg-base-200 rounded-box p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">房卡管理</h2>
      
      {/* 房卡信息 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">您的房卡</h3>
        {userRoomCards && userRoomCards[0] ? (
          <div>
            <p className="mb-2">您拥有 {userRoomCards[1]?.length || 0} 张房卡</p>
            {userRoomCards[1]?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                {userRoomCards[1].map((cardId: bigint, index: number) => (
                  <div 
                    key={index} 
                    className={`p-2 border rounded-lg cursor-pointer ${selectedCardId === Number(cardId) ? 'border-primary bg-primary/10' : 'border-base-300'}`}
                    onClick={() => {
                      const numCardId = Number(cardId);
                      setInternalSelectedCardId(numCardId);
                      if (onSelectCard) {
                        onSelectCard(numCardId);
                      }
                    }}
                  >
                    <div className="flex justify-center items-center h-20 bg-base-100 rounded-md mb-2">
                      <span className="text-2xl">🃏</span>
                    </div>
                    <p className="text-center text-sm">房卡 #{Number(cardId)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p>您还没有房卡，请购买</p>
        )}
      </div>

      {/* 购买房卡 */}
      <div className="border-t pt-4">
        <h3 className="text-xl font-bold mb-4">购买房卡</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="label">
              <span className="label-text font-bold">购买数量</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="input input-bordered w-full"
              value={buyAmount}
              onChange={e => setBuyAmount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="flex-1">
            <label className="label">
              <span className="label-text font-bold">总价</span>
            </label>
            <div className="input input-bordered w-full flex items-center justify-between px-4 py-3">
              <span>{formatEther(roomCardPrice * BigInt(buyAmount))} ETH</span>
            </div>
          </div>
          <div className="flex items-end">
            <button
              className={`btn btn-primary w-full ${isBuying ? "loading" : ""}`}
              onClick={handleBuyRoomCard}
              disabled={!connectedAddress || isBuying || buyAmount < 1 || !roomCardPrice}
            >
              {isBuying ? "购买中..." : "购买房卡"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;