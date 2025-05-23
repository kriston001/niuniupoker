import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { formatEther } from "viem";
import { parseEther } from "viem";
import { useAccount, useBalance } from "wagmi";
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
import { batchBuyRoomCard } from "~~/contracts/abis/BBRoomCardNFTABI";
import { batchBuyRoomLevel } from "~~/contracts/abis/BBRoomLevelNFTABI";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { writeContractWithCallback } from "~~/hooks/writeContractWithCallback";
import { getNftDescription, getNftFullName, getNftTokenID } from "~~/lib/utils";
import { getNftImageUrl, getNftSympol } from "~~/lib/utils";
import { useGlobalState } from "~~/services/store/store";
import { RoomCardNftType, RoomLevelNftType } from "~~/types/game-types";

export function NftMintModal({
  selectedNft,
  open,
  onOpenChange,
  onNftMinted,
}: {
  selectedNft: RoomCardNftType | RoomLevelNftType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNftMinted?: () => void;
}) {
  const { targetNetwork } = useTargetNetwork();
  const symbol = targetNetwork.nativeCurrency.symbol;

  const gameConfig = useGlobalState(state => state.gameConfig);

  const [mintQuantity, setMintQuantity] = useState(1);

  const { address: connectedAddress } = useAccount();
  const { data: balance } = useBalance({
    address: connectedAddress,
    query: {
      enabled: connectedAddress !== undefined,
    },
  });

  // 监听 open 状态，当弹窗关闭时重置 mintQuantity
  useEffect(() => {
    if (!open) {
      setMintQuantity(1);
    }
  }, [open]);

  const incrementQuantity = () => {
    if (mintQuantity < selectedNft.maxMint - selectedNft.minted) {
      setMintQuantity(mintQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (mintQuantity > 1) {
      setMintQuantity(mintQuantity - 1);
    }
  };

  async function handleMintClick() {
    if (!connectedAddress) {
      console.log("请先连接钱包");
      return;
    }

    const totalPrice = Number(formatEther(selectedNft.price)) * mintQuantity;

    if (!balance?.value || balance.value < parseEther(totalPrice.toString())) {
      alert("余额不足，无法购买房卡");
      return;
    }

    try {
      const parsedPrice = parseEther(totalPrice.toString());

      const nftSympol = getNftSympol(selectedNft);

      const contractAddress =
        nftSympol == "RC"
          ? (gameConfig?.roomCardAddress as `0x${string}`)
          : (gameConfig?.roomLevelAddress as `0x${string}`);
      const abi = nftSympol == "RC" ? [batchBuyRoomCard] : [batchBuyRoomLevel];

      await writeContractWithCallback({
        address: contractAddress,
        abi: abi,
        functionName: "batchBuy",
        args: [selectedNft.id, mintQuantity],
        value: parsedPrice,
        account: connectedAddress as `0x${string}`,
        onSuccess: async () => {
          toast.success("Nft Mint successfully");
          onOpenChange?.(false);
          onNftMinted && onNftMinted();
        },
        onError: async err => {
          console.error("❌ Mint Nft 失败:", err.message);
        },
      });
    } catch (error) {
      console.error("Mint失败:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Mint NFT</DialogTitle>
          <DialogDescription className="text-zinc-400">{getNftDescription(selectedNft)}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-4 py-4">
          <div className="relative h-24 w-24 rounded-md overflow-hidden border border-zinc-700">
            <Image src={getNftImageUrl(selectedNft)} alt={selectedNft.name} fill className="object-cover" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-white">{getNftFullName(selectedNft)}</h4>
            <p className="text-sm text-zinc-400">Token ID: {getNftTokenID(selectedNft)}</p>
            <p className="text-sm text-zinc-400">
              Available: {selectedNft.maxMint - selectedNft.minted} of {selectedNft.maxMint}
            </p>
            <p className="text-md font-medium text-amber-500 mt-1">
              {formatEther(selectedNft.price)} {symbol}
            </p>
          </div>
        </div>

        <div className="grid gap-4 py-4">
          <Label htmlFor="quantity" className="text-zinc-300">
            Quantity
          </Label>
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-r-none border-zinc-700"
              onClick={decrementQuantity}
              disabled={mintQuantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="quantity"
              type="number"
              value={mintQuantity}
              onChange={e => {
                const value = Number.parseInt(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= selectedNft.maxMint - selectedNft.minted) {
                  setMintQuantity(value);
                }
              }}
              min={1}
              max={Number(selectedNft.maxMint - selectedNft.minted)}
              className="h-10 rounded-none text-center bg-zinc-800 border-zinc-700 text-white"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-l-none border-zinc-700"
              onClick={incrementQuantity}
              disabled={mintQuantity >= selectedNft.maxMint - selectedNft.minted}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-zinc-800 p-4 rounded-md mt-2">
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Price per NFT:</span>
              <span className="text-white">
                {formatEther(selectedNft.price)} {symbol}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Quantity:</span>
              <span className="text-white">{mintQuantity}</span>
            </div>
            <div className="border-t border-zinc-700 my-2 pt-2"></div>
            <div className="flex justify-between font-medium">
              <span className="text-zinc-300">Total:</span>
              <span className="text-amber-500">
                {formatEther(selectedNft.price * BigInt(mintQuantity))} {symbol}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium"
            onClick={async () => await handleMintClick()}
          >
            Confirm Mint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
