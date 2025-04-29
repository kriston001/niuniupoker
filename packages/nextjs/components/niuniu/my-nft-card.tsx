import Image from "next/image";
import { formatEther } from "viem";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import { Card, CardContent, CardFooter } from "~~/components/ui/card";
import { getNftDescription, getNftFullName, getNftImageUrl, getNftSympol } from "~~/lib/utils";
import { RoomCardNftType, RoomLevelNftType } from "~~/types/game-types";

export function MyNftCard({
  nft,
  quantity,
  onDetailClick,
  onUseClick,
}: {
  nft: any;
  quantity: number;
  onDetailClick: () => void;
  onUseClick: () => void;
}) {
  return (
    <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden group">
      <div className="relative aspect-square cursor-pointer" onClick={onDetailClick}>
        <Image src={getNftImageUrl(nft)} alt={getNftFullName(nft)} fill className="object-cover" />
        <div className="absolute top-2 right-2">
          <Badge className="bg-amber-500/90 text-black hover:bg-amber-500/90">x{quantity}</Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge
            className={`mt-2 ${
              nft.rarity === "Common"
                ? "bg-zinc-600"
                : nft.rarity === "Rare"
                  ? "bg-blue-600"
                  : nft.rarity === "Epic"
                    ? "bg-purple-600"
                    : nft.rarity === "Legendary"
                      ? "bg-amber-600"
                      : "bg-red-600"
            }`}
          >
            {nft.rarity}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
          <h3 className="text-lg font-bold text-white text-center">{getNftFullName(nft)}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-md font-medium text-white">{getNftFullName(nft)}</h3>
          <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800">
            {getNftSympol(nft)}-{nft.id.toString().padStart(3, "0")}
          </Badge>
        </div>
        {/* <div className="text-sm text-zinc-400">Minted on: {nft.mintedDate}</div> */}
      </CardContent>
      <CardFooter className="p-0 grid grid-cols-2">
        <Button
          onClick={onDetailClick}
          className="rounded-none py-4 bg-zinc-800 hover:bg-zinc-700 text-white border-t border-r border-zinc-700"
        >
          Details
        </Button>
        <Button className="rounded-none py-4 bg-zinc-800 hover:bg-zinc-700 text-white border-t border-zinc-700 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-amber-600 group-hover:text-black transition-all duration-300">
          Use NFT
        </Button>
      </CardFooter>
    </Card>
  );
}
