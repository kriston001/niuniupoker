"use client"

import { useState } from "react"
import { PlusCircle, Users, Wallet, Trophy, Clock } from "lucide-react"
import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardFooter } from "~~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/ui/dialog"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~~/components/ui/radio-group"
import { Badge } from "~~/components/ui/badge"
import { truncateAddress } from "~~/lib/utils"
import NftSection from "~~/components/nft-section"

export default function Home() {
  const [open, setOpen] = useState(false)

  // Sample data for poker tables
  const tables = [
    {
      id: 1,
      name: "High Rollers",
      dealerAddress: "0x1234567890abcdef1234567890abcdef12345678",
      betAmount: 0.5,
      currentPlayers: 3,
      maxPlayers: 5,
      status: "active",
      reward: 5,
    },
    {
      id: 2,
      name: "Lucky Dragons",
      dealerAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
      betAmount: 0.2,
      currentPlayers: 4,
      maxPlayers: 6,
      status: "active",
      reward: 3,
    },
    {
      id: 3,
      name: "Golden Fortune",
      dealerAddress: "0x7890abcdef1234567890abcdef1234567890abcd",
      betAmount: 1.0,
      currentPlayers: 2,
      maxPlayers: 4,
      status: "waiting",
      reward: 8,
    },
    {
      id: 4,
      name: "Royal Flush",
      dealerAddress: "0xdef1234567890abcdef1234567890abcdef12345",
      betAmount: 0.1,
      currentPlayers: 5,
      maxPlayers: 5,
      status: "full",
      reward: 2,
    },
    {
      id: 5,
      name: "Crypto Kings",
      dealerAddress: "0x567890abcdef1234567890abcdef1234567890ab",
      betAmount: 0.8,
      currentPlayers: 1,
      maxPlayers: 6,
      status: "waiting",
      reward: 7,
    },
    {
      id: 6,
      name: "Diamond Hands",
      dealerAddress: "0x90abcdef1234567890abcdef1234567890abcdef",
      betAmount: 0.3,
      currentPlayers: 3,
      maxPlayers: 4,
      status: "active",
      reward: 4,
    },
  ]

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Game Lobby</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Table
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Create New Table</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Set up your poker table parameters below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-zinc-300">
                    Table Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter a unique table name"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bet" className="text-zinc-300">
                    Bet Amount (ETH)
                  </Label>
                  <Input
                    id="bet"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.1"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="players" className="text-zinc-300">
                    Max Players
                  </Label>
                  <Input
                    id="players"
                    type="number"
                    min="2"
                    max="8"
                    placeholder="6"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-zinc-300">Dealer's Reward (%)</Label>
                  <RadioGroup defaultValue="3">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="r2" className="text-amber-500" />
                        <Label htmlFor="r2" className="text-zinc-300">
                          2%
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="r3" className="text-amber-500" />
                        <Label htmlFor="r3" className="text-zinc-300">
                          3%
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5" id="r5" className="text-amber-500" />
                        <Label htmlFor="r5" className="text-zinc-300">
                          5%
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="8" id="r8" className="text-amber-500" />
                        <Label htmlFor="r8" className="text-zinc-300">
                          8%
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium w-full"
                  onClick={() => setOpen(false)}
                >
                  Create Table
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <Card key={table.id} className="bg-zinc-900/80 border-zinc-800 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white">{table.name}</h3>
                  <Badge
                    className={`
                      ${
                        table.status === "active"
                          ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
                          : table.status === "waiting"
                            ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                            : "bg-red-500/20 text-red-300 hover:bg-red-500/20"
                      }
                    `}
                  >
                    {table.status === "active" ? "Active" : table.status === "waiting" ? "Waiting" : "Full"}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-zinc-400">
                    <Wallet className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Dealer: </span>
                    <span className="text-sm text-zinc-300 ml-1">{truncateAddress(table.dealerAddress)}</span>
                  </div>

                  <div className="flex items-center text-zinc-400">
                    <Users className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Players: </span>
                    <span className="text-sm text-zinc-300 ml-1">
                      {table.currentPlayers}/{table.maxPlayers}
                    </span>
                  </div>

                  <div className="flex items-center text-zinc-400">
                    <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Rake: </span>
                    <span className="text-sm text-zinc-300 ml-1">{table.reward}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-amber-500" />
                    <span className="text-xs text-zinc-500">Created 2h ago</span>
                  </div>
                  <div className="text-lg font-bold text-amber-500">{table.betAmount} ETH</div>
                </div>
              </CardContent>
              <CardFooter className="p-0">
                <Button
                  className="w-full rounded-none py-4 bg-zinc-800 hover:bg-zinc-700 text-white border-t border-zinc-700 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-amber-600 group-hover:text-black transition-all duration-300"
                  disabled={table.status === "full"}
                >
                  {table.status === "full" ? "Table Full" : "Join Table"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* NFT Marketplace Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8">NFT Marketplace</h2>
          <NftSection />
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600"></div>
              <span className="text-zinc-400">NiuNiu Poker © 2024</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                Terms
              </a>
              <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                Support
              </a>
              <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
