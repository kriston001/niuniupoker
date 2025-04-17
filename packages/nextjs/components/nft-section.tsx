"use client"

import { useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardFooter } from "~~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~~/components/ui/dialog"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { Badge } from "~~/components/ui/badge"
import { CreditCard, Layers, User, Plus, Minus } from "lucide-react"

// Sample NFT data
const roomCardNfts = [
  {
    id: "RC-001",
    name: "Gold Room Card",
    image: "/placeholder.svg?height=300&width=300",
    tokenId: "RC-001",
    mintedCount: 28,
    totalSupply: 100,
    price: 0.15,
  },
  {
    id: "RC-002",
    name: "Diamond Room Card",
    image: "/placeholder.svg?height=300&width=300",
    tokenId: "RC-002",
    mintedCount: 12,
    totalSupply: 50,
    price: 0.25,
  },
  {
    id: "RC-003",
    name: "Platinum Room Card",
    image: "/placeholder.svg?height=300&width=300",
    tokenId: "RC-003",
    mintedCount: 5,
    totalSupply: 25,
    price: 0.4,
  },
  {
    id: "RC-004",
    name: "VIP Room Card",
    image: "/placeholder.svg?height=300&width=300",
    tokenId: "RC-004",
    mintedCount: 3,
    totalSupply: 10,
    price: 0.8,
  },
]

const roomLevelNfts = [
  {
    id: "RL-001",
    name: "Bronze Level",
    image: "/placeholder.svg?height=300&width=300",
    tokenId: "RL-001",
    mintedCount: 45,
    totalSupply: 200,
    price: 0.1,
  },
  {
    id: "RL-002",
    name: "Silver Level",
    image: "/placeholder.svg?height=300&width=300",
    tokenId: "RL-002",
    mintedCount: 32,
    totalSupply: 100,
    price: 0.2,
  },
  {
    id: "RL-003",
    name: "Gold Level",
    image: "/placeholder.svg?height=300&width=300",
    tokenId: "RL-003",
    mintedCount: 18,
    totalSupply: 50,
    price: 0.35,
  },
  {
    id: "RL-004",
    name: "Diamond Level",
    image: "/placeholder.svg?height=300&width=300",
    tokenId: "RL-004",
    mintedCount: 7,
    totalSupply: 20,
    price: 0.6,
  },
]

const myNfts = [
  {
    id: "RC-001",
    name: "Gold Room Card",
    image: "/placeholder.svg?height=300&width=300",
    tokenId: "RC-001",
    mintedDate: "2024-04-10",
    quantity: 2,
  },
  {
    id: "RL-002",
    name: "Silver Level",
    image: "/placeholder.svg?height=300&width=300",
    tokenId: "RL-002",
    mintedDate: "2024-04-05",
    quantity: 1,
  },
]

export default function NftSection() {
  const [selectedNft, setSelectedNft] = useState<any>(null)
  const [mintModalOpen, setMintModalOpen] = useState(false)
  const [mintQuantity, setMintQuantity] = useState(1)

  const handleMintClick = (nft: any) => {
    setSelectedNft(nft)
    setMintModalOpen(true)
    setMintQuantity(1)
  }

  const incrementQuantity = () => {
    if (selectedNft && mintQuantity < selectedNft.totalSupply - selectedNft.mintedCount) {
      setMintQuantity(mintQuantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (mintQuantity > 1) {
      setMintQuantity(mintQuantity - 1)
    }
  }

  const handleMintConfirm = () => {
    // Here you would handle the actual minting process
    console.log(`Minting ${mintQuantity} of ${selectedNft.name}`)
    setMintModalOpen(false)
  }

  return (
    <>
      <Tabs defaultValue="room-cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-800 rounded-lg p-1 mb-8">
          <TabsTrigger value="room-cards" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            <CreditCard className="h-4 w-4 mr-2" />
            Room Card NFTs
          </TabsTrigger>
          <TabsTrigger value="room-levels" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            <Layers className="h-4 w-4 mr-2" />
            Room Level NFTs
          </TabsTrigger>
          <TabsTrigger value="my-nfts" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            <User className="h-4 w-4 mr-2" />
            My NFTs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="room-cards" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roomCardNfts.map((nft) => (
              <NftCard key={nft.id} nft={nft} onMintClick={() => handleMintClick(nft)} showMintButton={true} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="room-levels" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roomLevelNfts.map((nft) => (
              <NftCard key={nft.id} nft={nft} onMintClick={() => handleMintClick(nft)} showMintButton={true} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-nfts" className="mt-0">
          {myNfts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {myNfts.map((nft) => (
                <MyNftCard key={nft.id} nft={nft} />
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
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                onClick={() => document.querySelector('[data-state="inactive"][value="room-cards"]')?.click()}
              >
                Browse NFTs
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mint NFT Modal */}
      {selectedNft && (
        <Dialog open={mintModalOpen} onOpenChange={setMintModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">Mint NFT</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Mint your {selectedNft.name} NFT to use in the NiuNiu Poker platform.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center space-x-4 py-4">
              <div className="relative h-24 w-24 rounded-md overflow-hidden border border-zinc-700">
                <Image
                  src={selectedNft.image || "/placeholder.svg"}
                  alt={selectedNft.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">{selectedNft.name}</h4>
                <p className="text-sm text-zinc-400">Token ID: {selectedNft.tokenId}</p>
                <p className="text-sm text-zinc-400">
                  Available: {selectedNft.totalSupply - selectedNft.mintedCount} of {selectedNft.totalSupply}
                </p>
                <p className="text-md font-medium text-amber-500 mt-1">{selectedNft.price} ETH each</p>
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
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    if (!isNaN(value) && value >= 1 && value <= selectedNft.totalSupply - selectedNft.mintedCount) {
                      setMintQuantity(value)
                    }
                  }}
                  min={1}
                  max={selectedNft.totalSupply - selectedNft.mintedCount}
                  className="h-10 rounded-none text-center bg-zinc-800 border-zinc-700 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-l-none border-zinc-700"
                  onClick={incrementQuantity}
                  disabled={mintQuantity >= selectedNft.totalSupply - selectedNft.mintedCount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-zinc-800 p-4 rounded-md mt-2">
                <div className="flex justify-between mb-2">
                  <span className="text-zinc-400">Price per NFT:</span>
                  <span className="text-white">{selectedNft.price} ETH</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-zinc-400">Quantity:</span>
                  <span className="text-white">{mintQuantity}</span>
                </div>
                <div className="border-t border-zinc-700 my-2 pt-2"></div>
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-300">Total:</span>
                  <span className="text-amber-500">{(selectedNft.price * mintQuantity).toFixed(3)} ETH</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                onClick={() => setMintModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium"
                onClick={handleMintConfirm}
              >
                Confirm Mint
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

// NFT Card Component for marketplace
function NftCard({ nft, onMintClick, showMintButton }: { nft: any; onMintClick: () => void; showMintButton: boolean }) {
  return (
    <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden group">
      <div className="relative aspect-square">
        <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
          <h3 className="text-lg font-bold text-white text-center">{nft.name}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-md font-medium text-white">{nft.name}</h3>
          <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800">{nft.tokenId}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-zinc-400">
            Minted: {nft.mintedCount}/{nft.totalSupply}
          </div>
          <div className="text-md font-bold text-amber-500">{nft.price} ETH</div>
        </div>
      </CardContent>
      <CardFooter className="p-0">
        {showMintButton && (
          <Button
            onClick={onMintClick}
            className="w-full rounded-none py-4 bg-zinc-800 hover:bg-zinc-700 text-white border-t border-zinc-700 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-amber-600 group-hover:text-black transition-all duration-300"
          >
            Mint NFT
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// My NFT Card Component
function MyNftCard({ nft }: { nft: any }) {
  return (
    <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden group">
      <div className="relative aspect-square">
        <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
        <div className="absolute top-2 right-2">
          <Badge className="bg-amber-500/90 text-black hover:bg-amber-500/90">x{nft.quantity}</Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-md font-medium text-white">{nft.name}</h3>
          <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800">{nft.tokenId}</Badge>
        </div>
        <div className="text-sm text-zinc-400">Minted on: {nft.mintedDate}</div>
      </CardContent>
      <CardFooter className="p-0">
        <Button className="w-full rounded-none py-4 bg-zinc-800 hover:bg-zinc-700 text-white border-t border-zinc-700 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-amber-600 group-hover:text-black transition-all duration-300">
          Use NFT
        </Button>
      </CardFooter>
    </Card>
  )
}
