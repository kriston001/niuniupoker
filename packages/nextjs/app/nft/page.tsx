"use client";

import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";
import { useNFTData } from "../../hooks/my-hooks/useNFTData";
import { formatEther, parseEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { batchBuyRoomCard } from "~~/contracts/abis/BBRoomCardNFTABI";
import { batchBuyRoomLevel } from "~~/contracts/abis/BBRoomLevelNFTABI";
import { useWriteContractWithCallback } from "~~/hooks/useWriteContractWithCallback";
import { useGlobalState } from "~~/services/store/store";
import { RoomCardNftType, RoomLevelNftType } from "~~/types/game-types";

const NFTPage = () => {
  const gameConfig = useGlobalState(state => state.gameConfig);

  const { address: connectedAddress } = useAccount();
  const { data: balance } = useBalance({
    address: connectedAddress,
    query: {
      enabled: connectedAddress !== undefined,
    },
  });

  const { roomCardTypes, roomLevelTypes, myRoomCardNfts, myRoomLevelNfts, refreshData } = useNFTData({
    playerAddress: connectedAddress,
  });

  // 使用自定义的 Hook
  const { writeContractWithCallback } = useWriteContractWithCallback();

  // 处理购买房卡
  const handleMintRoomCard = async (type: RoomCardNftType, amount: number) => {
    if (!connectedAddress) return;

    const totalPrice = Number(formatEther(type.price)) * amount;

    if (!balance?.value || balance.value < parseEther(totalPrice.toString())) {
      alert("余额不足，无法购买房卡");
      return;
    }

    try {
      const parsedPrice = parseEther(totalPrice.toString());

      await writeContractWithCallback({
        address: gameConfig?.roomCardAddress as `0x${string}`,
        abi: [batchBuyRoomCard],
        functionName: "batchBuyRoomCard",
        args: [type.id, amount],
        value: parsedPrice,
        account: connectedAddress as `0x${string}`,
        onSuccess: async () => {
          console.log("✅ 交易成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error) {
      console.error("创建游戏桌失败:", error);
    } finally {
    }
  };

  // 处理购买房间等级
  const handleMintRoomLevel = async (type: RoomLevelNftType, amount: number) => {
    if (!connectedAddress) return;

    // 将type.price从wei转为ETH再参与计算
    const totalPrice = Number(formatEther(type.price)) * amount;
    

    if (!balance?.value || balance.value < parseEther(totalPrice.toString())) {
      alert("余额不足，无法购买房间等级");
      return;
    }

    try {
      const parsedPrice = parseEther(totalPrice.toString());

      await writeContractWithCallback({
        address: gameConfig?.roomLevelAddress as `0x${string}`,
        abi: [batchBuyRoomLevel],
        functionName: "batchBuyRoomLevel",
        args: [type.id, amount],
        value: parsedPrice,
        account: connectedAddress as `0x${string}`,
        onSuccess: async () => {
          console.log("✅ 交易成功");
          await refreshData();
        },
        onError: async err => {
          console.error("❌ 交易失败:", err.message);
        },
      });
    } catch (error) {
      console.error("创建游戏桌失败:", error);
    } finally {
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 房卡类型列表 */}
      <div className="bg-base-200 rounded-box p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Room Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomCardTypes?.map(type => (
            <div key={type.id.toString()} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">{type.name}</h3>
                <div className="space-y-2">
                  <p>Max Bet: {formatEther(type.maxBetAmount)} {balance?.symbol}</p>
                  <p>Max Players: {type.maxPlayers}</p>
                  <p>Price: {type.price !== undefined ? formatEther(type.price) : "--"} {balance?.symbol}</p>
                </div>
                <div className="card-actions justify-end mt-4">
                  <div className="join">
                    <button className="btn btn-primary join-item" onClick={() => handleMintRoomCard(type, 1)}>
                      Mint x1
                    </button>
                    <button className="btn btn-primary join-item" onClick={() => handleMintRoomCard(type, 5)}>
                      Mint x5
                    </button>
                    <button className="btn btn-primary join-item" onClick={() => handleMintRoomCard(type, 10)}>
                      Mint x10
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 房间等级类型列表 */}
      <div className="bg-base-200 rounded-box p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Room Level</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomLevelTypes?.map(type => (
            <div key={type.id.toString()} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">{type.name}</h3>
                <div className="space-y-2">
                  <p>Max Room: {type.maxRooms}</p>
                  <p>Price: {type.price !== undefined ? formatEther(type.price) : "--"} ETH</p>
                </div>
                <div className="card-actions justify-end mt-4">
                  <div className="join">
                    <button className="btn btn-primary join-item" onClick={() => handleMintRoomLevel(type, 1)}>
                      Buy 1 NFT
                    </button>
                    <button className="btn btn-primary join-item" onClick={() => handleMintRoomLevel(type, 5)}>
                      Buy 5 NFT
                    </button>
                    <button className="btn btn-primary join-item" onClick={() => handleMintRoomLevel(type, 10)}>
                      Buy 10 NFT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 我的NFT列表 */}
      <div className="bg-base-200 rounded-box p-6">
        <h2 className="text-2xl font-bold mb-4">My NFTs</h2>

        {/* 我的房卡 */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">My Room Cards</h3>
          {myRoomCardNfts && myRoomCardNfts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRoomCardNfts.map(card => (
                <div key={card.tokenId.toString()} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">
                      #{card.tokenId.toString()} - {card.cardType.name}
                    </h3>
                    <div className="space-y-2">
                      <p>Max Bet: {formatEther(card.cardType.maxBetAmount)} ETH</p>
                      <p>Max Players: {card.cardType.maxPlayers}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-base-100 rounded-box">
              <p>empty</p>
            </div>
          )}
        </div>

        {/* 我的房间等级 */}
        <div>
          <h3 className="text-xl font-bold mb-4">My Room Levels</h3>
          {myRoomLevelNfts && myRoomLevelNfts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRoomLevelNfts.map(level => (
                <div key={level.tokenId.toString()} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title">
                      #{level.tokenId.toString()} - {level.levelType.name}
                    </h3>
                    <div className="space-y-2">
                      <p>Max Room: {level.levelType.maxRooms.toString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-base-100 rounded-box">
              <p>empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTPage;
