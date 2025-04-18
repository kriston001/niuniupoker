import Image from "next/image";
import { formatEther } from "viem";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~~/components/ui/dialog";
import { getNftDescription, getNftFullName, getNftImageUrl, getNftTokenID } from "~~/lib/utils";

export function MyNftCardDetail({
  nft,
  open,
  onUseClick,
  onOpenChange,
}: {
  nft: any;
  open: boolean;
  onUseClick: (nft: any) => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">{getNftFullName(nft.nftType)}</DialogTitle>
          <DialogDescription className="text-zinc-400">NFT Details</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative aspect-square rounded-md overflow-hidden border border-zinc-700">
            <Image
              src={getNftImageUrl(nft.nftType) || "/placeholder.svg"}
              alt={getNftFullName(nft.nftType)}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">{getNftFullName(nft.nftType)}</h3>
              <p className="text-sm text-zinc-400">Token ID: {getNftTokenID(nft.nftType)}</p>
              {nft.nftType.rarity && (
                <Badge
                  className={`mt-2 ${
                    nft.nftType.rarity === "Common"
                      ? "bg-zinc-600"
                      : nft.nftType.rarity === "Rare"
                        ? "bg-blue-600"
                        : nft.nftType.rarity === "Epic"
                          ? "bg-purple-600"
                          : nft.nftType.rarity === "Legendary"
                            ? "bg-amber-600"
                            : "bg-red-600"
                  }`}
                >
                  {nft.nftType.rarity}
                </Badge>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-1">Description</h4>
              <p className="text-sm text-zinc-400">{getNftDescription(nft.nftType)}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-zinc-300 mb-1">Owned</h4>
              <p className="text-sm text-zinc-400">x{nft.quantity}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={() => onUseClick(nft)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium"
          >
            Use NFT
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
