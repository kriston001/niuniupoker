"use client"

import { useState } from "react";
import { MyNftCardDetail } from "@/components/niuniu/my-nft-card-detail";
import { NftRoomCard, NftRoomLevel } from "@/components/niuniu/nft-card";
import { CreditCard, Layers, Search, SlidersHorizontal, User } from "lucide-react";
import { useAccount } from "wagmi";
import { MyNftCard } from "~~/components/niuniu/my-nft-card";
import { NftCardDetail } from "~~/components/niuniu/nft-card-detail";
import { NftMintModal } from "~~/components/niuniu/nft-mint-modal";
import { Button } from "~~/components/ui/button";
import { Input } from "~~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs";
import { useNFTData } from "~~/hooks/my-hooks/useNFTData";
import { RoomCardNftType, RoomLevelNftType } from "~~/types/game-types";



export default function NftSection() {
  const { address: connectedAddress } = useAccount();
  const { roomCardTypes, roomLevelTypes, myNfts, refetchData } = useNFTData({
    playerAddress: connectedAddress,
  });

  const [selectedNft, setSelectedNft] = useState<RoomCardNftType | RoomLevelNftType | undefined>(undefined);
  const [mintModalOpen, setMintModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [myDetailModalOpen, setMyDetailModalOpen] = useState(false);

  const [selectedMyNft, setSelectedMyNft] = useState<any | undefined>(undefined);

  const handleMintClick = (nft: RoomCardNftType | RoomLevelNftType): void => {
    setSelectedNft(nft);
    setMintModalOpen(true);
  };

  const handleDetailClick = (nft: RoomCardNftType | RoomLevelNftType) => {
    setSelectedNft(nft);
    setDetailModalOpen(true);
  };

  const handleUseClick = (nft: any) => {
    console.log("Use NFT:", nft);
  };

  const handleMyNftDetailClick = (myNft: any) => {
    setSelectedMyNft(myNft);
    setMyDetailModalOpen(true);
  };

  const onNftMinted = () => {
    refetchData();
  };

  return (
    <>
      <Tabs defaultValue="room-cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-800 rounded-lg p-1 mb-8">
          <TabsTrigger value="room-cards" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            <CreditCard className="h-4 w-4 mr-2" />
            Table Card NFTs
          </TabsTrigger>
          <TabsTrigger value="room-levels" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            <Layers className="h-4 w-4 mr-2" />
            Table Permit NFTs
          </TabsTrigger>
          <TabsTrigger value="my-nfts" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            <User className="h-4 w-4 mr-2" />
            My NFTs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="room-cards" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {roomCardTypes.map(nft => (
              <NftRoomCard
                key={nft.id}
                nft={nft}
                onMintClick={() => handleMintClick(nft)}
                onDetailClick={() => handleDetailClick(nft)}
              />
            ))}
          </div>
          {roomCardTypes.length === 0 && (
            <div className="text-center py-16 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="mx-auto w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-xl font-medium text-zinc-300 mb-2">No NFTs Found</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                No table card NFTs match your search criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="room-levels" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {roomLevelTypes.map(nft => (
              <NftRoomLevel
                key={nft.id}
                nft={nft}
                onMintClick={() => handleMintClick(nft)}
                onDetailClick={() => handleDetailClick(nft)}
                showMintButton={true}
              />
            ))}
          </div>
          {roomLevelTypes.length === 0 && (
            <div className="text-center py-16 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="mx-auto w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-xl font-medium text-zinc-300 mb-2">No NFTs Found</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                No table permit NFTs match your search criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-nfts" className="mt-0">
          {myNfts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {myNfts.map(myNft => (
                <MyNftCard
                  key={`${myNft.type}-${myNft.nftType.id}-${myNft.quantity}`}
                  nft={myNft.nftType}
                  quantity={myNft.quantity}
                  onDetailClick={() => handleMyNftDetailClick(myNft)}
                  onUseClick={() => console.log("Use NFT")}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="mx-auto w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-xl font-medium text-zinc-300 mb-2">No NFTs Found</h3>
              <p className="text-zinc-500 max-w-md mx-auto mb-6">
                You don't own any NFTs yet. Mint some from the Room Card or Room Level tabs.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mint NFT Modal */}
      {selectedNft && (
        <NftMintModal
          selectedNft={selectedNft}
          open={mintModalOpen}
          onOpenChange={setMintModalOpen}
          onNftMinted={onNftMinted}
        />
      )}

      {/* NFT Detail Modal */}
      {selectedNft && (
        <NftCardDetail
          selectedNft={selectedNft}
          open={detailModalOpen}
          onMintClick={handleMintClick}
          onOpenChange={setDetailModalOpen}
        />
      )}

      {/* My NFT Detail Modal */}
      {selectedMyNft && (
        <MyNftCardDetail
          nft={selectedMyNft}
          open={myDetailModalOpen}
          onUseClick={handleUseClick}
          onOpenChange={setMyDetailModalOpen}
        />
      )}
    </>
  )
}
