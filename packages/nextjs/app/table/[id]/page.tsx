"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Badge } from "~~/components/ui/badge"
import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~~/components/ui/card"
import { ScrollArea } from "~~/components/ui/scroll-area"
import { Separator } from "~~/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { Input } from "~~/components/ui/input"
import { truncateAddress } from "~~/lib/utils"
import {
  Clock,
  Users,
  Trophy,
  Wallet,
  ArrowLeft,
  Info,
  ChevronRight,
  Ban,
  RefreshCw,
  CheckCircle2,
  Shuffle,
  Send,
  PhoneCall,
  X,
} from "lucide-react"

// Sample table data
const tableData = {
  id: "table-123",
  name: "High Rollers VIP",
  dealerAddress: "0x1234567890abcdef1234567890abcdef12345678",
  betAmount: 0.5,
  currentPlayers: 5,
  maxPlayers: 6,
  status: "active",
  reward: 5,
  createdAt: "2024-04-17T08:27:59.000Z",
  round: 3,
  pot: 2.5,
}

// Sample players data
const playersData = [
  {
    id: 1,
    name: "Player 1",
    address: "0x1234...5678",
    avatar: "/placeholder.svg?height=100&width=100",
    chips: 2.8,
    status: "ready",
    position: 0, // dealer
    cards: [7, 8, 9, 10, 11], // card values
    score: "Niu 9",
    isDealer: true,
  },
  {
    id: 2,
    name: "Player 2",
    address: "0xabcd...ef12",
    avatar: "/placeholder.svg?height=100&width=100",
    chips: 1.5,
    status: "ready",
    position: 1,
    cards: [2, 3, 4, 5, 6],
    score: "Niu 5",
    isDealer: false,
  },
  {
    id: 3,
    name: "Player 3",
    address: "0x7890...abcd",
    avatar: "/placeholder.svg?height=100&width=100",
    chips: 3.2,
    status: "ready",
    position: 2,
    cards: null, // cards not revealed yet
    score: null,
    isDealer: false,
  },
  {
    id: 4,
    name: "Player 4",
    address: "0xdef1...2345",
    avatar: "/placeholder.svg?height=100&width=100",
    chips: 0.8,
    status: "thinking",
    position: 3,
    cards: null,
    score: null,
    isDealer: false,
  },
  {
    id: 5,
    name: "Player 5",
    address: "0x5678...90ab",
    avatar: "/placeholder.svg?height=100&width=100",
    chips: 1.2,
    status: "folded",
    position: 4,
    cards: null,
    score: null,
    isDealer: false,
  },
]

// Sample action log
const actionLog = [
  { id: 1, player: "Player 1", action: "started the game", timestamp: "08:28:15" },
  { id: 2, player: "Player 2", action: "joined the table", timestamp: "08:28:30" },
  { id: 3, player: "Player 3", action: "joined the table", timestamp: "08:28:45" },
  { id: 4, player: "Player 4", action: "joined the table", timestamp: "08:29:00" },
  { id: 5, player: "Player 5", action: "joined the table", timestamp: "08:29:15" },
  { id: 6, player: "Player 1", action: "dealt the cards", timestamp: "08:30:00" },
  { id: 7, player: "Player 2", action: "is ready", timestamp: "08:30:15" },
  { id: 8, player: "Player 3", action: "is ready", timestamp: "08:30:30" },
  { id: 9, player: "Player 5", action: "folded", timestamp: "08:30:45" },
  { id: 10, player: "Player 1", action: "revealed Niu 9", timestamp: "08:31:00" },
  { id: 11, player: "Player 2", action: "revealed Niu 5", timestamp: "08:31:15" },
]

export default function TableDetail() {
  const params = useParams()
  const [isDealer, setIsDealer] = useState(true) // For demo purposes
  const [currentPlayer, setCurrentPlayer] = useState(playersData[0])
  const [gamePhase, setGamePhase] = useState("betting") // betting, dealing, revealing, settling

  // Get current user (for demo, we'll assume player 1)
  useEffect(() => {
    const player = playersData.find((p) => p.id === 1)
    if (player) {
      setCurrentPlayer(player)
      setIsDealer(player.isDealer)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="p-0 h-8 w-8" asChild>
            <a href="/">
              <ArrowLeft className="h-5 w-5 text-zinc-400" />
            </a>
          </Button>
          <h1 className="text-xl font-bold text-white ml-2">Table: {tableData.name}</h1>
          <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 ml-3">Active</Badge>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar - Table info and action log */}
          <div className="w-full lg:w-1/4">
            <Card className="bg-zinc-900/80 border-zinc-800 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-white">Table Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{tableData.name}</h3>
                  <p className="text-sm text-zinc-400">ID: {tableData.id}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-zinc-400">
                    <Wallet className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Dealer: </span>
                    <span className="text-sm text-zinc-300 ml-1">{truncateAddress(tableData.dealerAddress)}</span>
                  </div>

                  <div className="flex items-center text-zinc-400">
                    <Users className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Players: </span>
                    <span className="text-sm text-zinc-300 ml-1">
                      {tableData.currentPlayers}/{tableData.maxPlayers}
                    </span>
                  </div>

                  <div className="flex items-center text-zinc-400">
                    <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Reward: </span>
                    <span className="text-sm text-zinc-300 ml-1">{tableData.reward}%</span>
                  </div>

                  <div className="flex items-center text-zinc-400">
                    <Info className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Bet Amount: </span>
                    <span className="text-sm text-zinc-300 ml-1">{tableData.betAmount} ETH</span>
                  </div>

                  <div className="flex items-center text-zinc-400">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Round: </span>
                    <span className="text-sm text-zinc-300 ml-1">{tableData.round}</span>
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-zinc-400">Current Pot:</span>
                    <span className="text-lg font-bold text-amber-500">{tableData.pot} ETH</span>
                  </div>
                  <div className="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full"
                      style={{ width: `${(tableData.currentPlayers / tableData.maxPlayers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/80 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-white">Action Log</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] px-4">
                  <div className="space-y-2 pt-2 pb-4">
                    {actionLog.map((log, index) => (
                      <div key={log.id} className="flex items-start gap-2 py-2">
                        <div className="w-16 text-xs text-zinc-500">{log.timestamp}</div>
                        <div>
                          <span className="text-sm font-medium text-amber-500">{log.player}</span>
                          <span className="text-sm text-zinc-300"> {log.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Middle and right - Poker table and players */}
          <div className="w-full lg:w-3/4">
            <div className="relative bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden h-[600px]">
              {/* Table background */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 z-0"></div>

              {/* Poker table */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[70%] bg-gradient-to-br from-emerald-900/80 to-emerald-800/80 rounded-[50%] border-8 border-zinc-700 shadow-lg z-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[85%] rounded-[50%] border-2 border-emerald-600/30"></div>

                {/* Table center info */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20">
                  <div className="text-white font-bold text-xl mb-1">{tableData.name}</div>
                  <div className="text-amber-500 font-bold text-2xl">{tableData.pot} ETH</div>
                  <div className="text-zinc-400 text-sm mt-1">Round {tableData.round}</div>
                </div>
              </div>

              {/* Players around the table */}
              {playersData.map((player) => {
                // Calculate position around the table
                const angle = (player.position * (360 / tableData.maxPlayers) - 90) * (Math.PI / 180)
                const radius = 38 // % of container
                const left = 50 + radius * Math.cos(angle)
                const top = 50 + radius * Math.sin(angle)

                return (
                  <div
                    key={player.id}
                    className="absolute w-[140px] z-20 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                    }}
                  >
                    <div
                      className={`
                      rounded-lg p-2 text-center
                      ${player.status === "folded" ? "opacity-50" : ""}
                      ${player.id === currentPlayer.id ? "bg-zinc-800/80 border border-amber-500/50" : "bg-zinc-800/50"}
                    `}
                    >
                      <div className="relative">
                        <div className="relative mx-auto w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-700 mb-1">
                          <Image
                            src={player.avatar || "/placeholder.svg"}
                            alt={player.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Player status indicator */}
                        <div
                          className={`
                          absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-800
                          ${
                            player.status === "ready"
                              ? "bg-emerald-500"
                              : player.status === "thinking"
                                ? "bg-amber-500"
                                : "bg-zinc-500"
                          }
                        `}
                        ></div>

                        {/* Dealer chip */}
                        {player.isDealer && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center border-2 border-zinc-800">
                            D
                          </div>
                        )}
                      </div>

                      <div className="text-sm font-medium text-white truncate">{player.name}</div>
                      <div className="text-xs text-zinc-400 truncate">{player.address}</div>
                      <div className="text-sm font-bold text-amber-500 mt-1">{player.chips} ETH</div>

                      {/* Player cards */}
                      {player.cards && (
                        <div className="mt-2">
                          <div className="flex justify-center gap-1 mb-1">
                            {player.cards.map((card, index) => (
                              <div
                                key={index}
                                className="w-5 h-7 bg-white rounded-sm text-xs flex items-center justify-center text-black font-bold border border-zinc-300"
                              >
                                {card}
                              </div>
                            ))}
                          </div>
                          <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20">
                            {player.score}
                          </Badge>
                        </div>
                      )}

                      {/* Folded indicator */}
                      {player.status === "folded" && (
                        <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/20 mt-2">Folded</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Game controls */}
            <div className="mt-6 bg-zinc-900/80 border border-zinc-800 rounded-lg p-4">
              <Tabs defaultValue="actions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-zinc-800 rounded-lg p-1 mb-4">
                  <TabsTrigger
                    value="actions"
                    className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
                  >
                    Player Actions
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
                    Table Chat
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="actions" className="mt-0">
                  <div className="flex flex-wrap gap-3">
                    {/* Player actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Ready
                      </Button>
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Shuffle className="mr-2 h-4 w-4" />
                        Random
                      </Button>
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Send className="mr-2 h-4 w-4" />
                        Submit Random
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <PhoneCall className="mr-2 h-4 w-4" />
                        Call
                      </Button>
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        <X className="mr-2 h-4 w-4" />
                        Fold
                      </Button>
                    </div>

                    <Separator orientation="vertical" className="h-10 bg-zinc-700 mx-2" />

                    {/* Dealer actions */}
                    {isDealer && (
                      <div className="flex flex-wrap gap-3">
                        <Button className="bg-zinc-700 hover:bg-zinc-600 text-white">
                          <ChevronRight className="mr-2 h-4 w-4" />
                          Next Step
                        </Button>
                        <Button className="bg-zinc-700 hover:bg-zinc-600 text-white">
                          <Ban className="mr-2 h-4 w-4" />
                          Kick Player
                        </Button>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                          <Trophy className="mr-2 h-4 w-4" />
                          Settle Game
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Play Again
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Game status */}
                  <div className="mt-4 bg-zinc-800/50 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-zinc-400">Game Phase: </span>
                        <span className="text-sm font-medium text-amber-500">Betting</span>
                      </div>
                      <div>
                        <span className="text-sm text-zinc-400">Your Turn: </span>
                        <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20">Yes</Badge>
                      </div>
                      <div>
                        <span className="text-sm text-zinc-400">Your Bet: </span>
                        <span className="text-sm font-medium text-amber-500">0.5 ETH</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="mt-0">
                  <ScrollArea className="h-[120px] mb-4 border border-zinc-800 rounded-md p-2">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <span className="text-amber-500 text-sm font-medium">Player 1:</span>
                        <span className="text-zinc-300 text-sm">Good luck everyone!</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-amber-500 text-sm font-medium">Player 3:</span>
                        <span className="text-zinc-300 text-sm">Thanks, you too!</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-amber-500 text-sm font-medium">Player 2:</span>
                        <span className="text-zinc-300 text-sm">Let's play!</span>
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Input placeholder="Type your message..." className="bg-zinc-800 border-zinc-700 text-white" />
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white">Send</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
