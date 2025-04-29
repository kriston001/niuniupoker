import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { formatEther } from "viem";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardFooter } from "~~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~~/components/ui/dialog";
import { Input } from "~~/components/ui/input";
import { Label } from "~~/components/ui/label";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { getNftDescription, getNftFullName, getNftImageUrl, getNftSympol } from "~~/lib/utils";
import { RoomCardNftType, RoomLevelNftType } from "~~/types/game-types";

export function NftCardDetail({
  selectedNft,
  open,
  onMintClick,
  onOpenChange,
}: {
  selectedNft: RoomCardNftType | RoomLevelNftType;
  open: boolean;
  onMintClick: (selectedNft: RoomCardNftType | RoomLevelNftType) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">{getNftFullName(selectedNft)}</DialogTitle>
          <DialogDescription className="text-zinc-400">NFT Details</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative aspect-square rounded-md overflow-hidden border border-zinc-700">
            <Image src={getNftImageUrl(selectedNft)} alt={selectedNft.name} fill className="object-cover" />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">{getNftFullName(selectedNft)}</h3>
              <p className="text-sm text-zinc-400">
                Token ID: {getNftSympol(selectedNft)}-{selectedNft.id.toString().padStart(3, "0")}
              </p>
              {selectedNft.rarity && (
                <Badge
                  className={`mt-2 ${
                    selectedNft.rarity === "Common"
                      ? "bg-zinc-600"
                      : selectedNft.rarity === "Rare"
                        ? "bg-blue-600"
                        : selectedNft.rarity === "Epic"
                          ? "bg-purple-600"
                          : selectedNft.rarity === "Legendary"
                            ? "bg-amber-600"
                            : "bg-red-600"
                  }`}
                >
                  {selectedNft.rarity}
                </Badge>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-1">Description</h4>
              <p className="text-sm text-zinc-400">{getNftDescription(selectedNft)}</p>
            </div>

            {
              <div>
                <h4 className="text-sm font-medium text-zinc-300 mb-1">Supply</h4>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full"
                      style={{ width: `${(Number(selectedNft.minted) / Number(selectedNft.maxMint)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-zinc-400 whitespace-nowrap">
                    {selectedNft.minted}/{selectedNft.maxMint}
                  </span>
                </div>
              </div>
            }

            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-1">Price</h4>
              <p className="text-lg font-bold text-amber-500">
                {formatEther(selectedNft.price)} {symbol}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium"
            onClick={() => {
              onMintClick(selectedNft);
            }}
          >
            Mint NFT
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
