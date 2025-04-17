"use client"

import { useState } from "react"
import { PlusCircle, Users, Wallet, Trophy, Clock, Search, Filter, ArrowUpDown } from "lucide-react"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~~/components/ui/dropdown-menu"
import { truncateAddress } from "~~/lib/utils"

// Sample data for poker tables
const tablesData = [
  {
    id: 1,
    name: "High Rollers",
    dealerAddress: "0x1234567890abcdef1234567890abcdef12345678",
    betAmount: 0.5,
    currentPlayers: 3,
    maxPlayers: 5,
    status: "active",
    reward: 5,
    createdAt: "2024-04-17T06:30:00.000Z",
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
    createdAt: "2024-04-17T07:15:00.000Z",
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
    createdAt: "2024-04-17T08:00:00.000Z",
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
    createdAt: "2024-04-17T05:45:00.000Z",
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
    createdAt: "2024-04-17T07:30:00.000Z",
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
    createdAt: "2024-04-17T06:15:00.000Z",
  },
  {
    id: 7,
    name: "Blockchain Bluffers",
    dealerAddress: "0x123456789abcdef0123456789abcdef01234567",
    betAmount: 0.25,
    currentPlayers: 2,
    maxPlayers: 6,
    status: "waiting",
    reward: 5,
    createdAt: "2024-04-17T08:30:00.000Z",
  },
  {
    id: 8,
    name: "Crypto Casino",
    dealerAddress: "0xabcdef0123456789abcdef0123456789abcdef01",
    betAmount: 0.15,
    currentPlayers: 4,
    maxPlayers: 8,
    status: "active",
    reward: 3,
    createdAt: "2024-04-17T07:45:00.000Z",
  },
  {
    id: 9,
    name: "NFT Gamblers",
    dealerAddress: "0x23456789abcdef0123456789abcdef0123456789",
    betAmount: 0.4,
    currentPlayers: 3,
    maxPlayers: 4,
    status: "active",
    reward: 6,
    createdAt: "2024-04-17T06:00:00.000Z",
  },
  {
    id: 10,
    name: "Whale Table",
    dealerAddress: "0xdef0123456789abcdef0123456789abcdef012345",
    betAmount: 2.0,
    currentPlayers: 2,
    maxPlayers: 4,
    status: "waiting",
    reward: 10,
    createdAt: "2024-04-17T08:15:00.000Z",
  },
  {
    id: 11,
    name: "Beginner's Luck",
    dealerAddress: "0x56789abcdef0123456789abcdef0123456789abcd",
    betAmount: 0.05,
    currentPlayers: 6,
    maxPlayers: 6,
    status: "full",
    reward: 2,
    createdAt: "2024-04-17T05:30:00.000Z",
  },
  {
    id: 12,
    name: "VIP Lounge",
    dealerAddress: "0x9abcdef0123456789abcdef0123456789abcdef01",
    betAmount: 1.5,
    currentPlayers: 3,
    maxPlayers: 6,
    status: "active",
    reward: 8,
    createdAt: "2024-04-17T07:00:00.000Z",
  },
]

export default function TablesPage() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const filterTables = () => {
    let filtered = [...tablesData]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (table) =>
          table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          truncateAddress(table.dealerAddress).toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((table) => table.status === statusFilter)
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0
        switch (sortBy) {
          case "betAmount":
            comparison = a.betAmount - b.betAmount
            break
          case "players":
            comparison = a.currentPlayers - b.currentPlayers
            break
          case "reward":
            comparison = a.reward - b.reward
            break
          case "createdAt":
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            break
          default:
            return 0
        }
        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDirection("desc")
    }
  }

  const filteredTables = filterTables()

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60)
      return `${diffInHours}h ago`
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Game Tables</h1>
          <p className="text-zinc-400 mt-1">Browse and join active NiuNiu poker tables</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search tables..."
              className="pl-10 bg-zinc-800 border-zinc-700 text-white w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter ? `Status: ${statusFilter}` : "All Statuses"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("waiting")}>Waiting</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("full")}>Full</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      </div>

      {/* Sorting options */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          className={`border-zinc-700 ${
            sortBy === "betAmount" ? "text-amber-400 border-amber-400/50" : "text-zinc-400"
          }`}
          onClick={() => toggleSort("betAmount")}
        >
          Bet Amount
          {sortBy === "betAmount" && (
            <ArrowUpDown className={`ml-2 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`border-zinc-700 ${sortBy === "players" ? "text-amber-400 border-amber-400/50" : "text-zinc-400"}`}
          onClick={() => toggleSort("players")}
        >
          Players
          {sortBy === "players" && (
            <ArrowUpDown className={`ml-2 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`border-zinc-700 ${sortBy === "reward" ? "text-amber-400 border-amber-400/50" : "text-zinc-400"}`}
          onClick={() => toggleSort("reward")}
        >
          Reward
          {sortBy === "reward" && (
            <ArrowUpDown className={`ml-2 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`border-zinc-700 ${
            sortBy === "createdAt" ? "text-amber-400 border-amber-400/50" : "text-zinc-400"
          }`}
          onClick={() => toggleSort("createdAt")}
        >
          Newest
          {sortBy === "createdAt" && (
            <ArrowUpDown className={`ml-2 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map((table) => (
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
                  <span className="text-sm">Reward: </span>
                  <span className="text-sm text-zinc-300 ml-1">{table.reward}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-amber-500" />
                  <span className="text-xs text-zinc-500">{getTimeAgo(table.createdAt)}</span>
                </div>
                <div className="text-lg font-bold text-amber-500">{table.betAmount} ETH</div>
              </div>
            </CardContent>
            <CardFooter className="p-0">
              <Button
                className="w-full rounded-none py-4 bg-zinc-800 hover:bg-zinc-700 text-white border-t border-zinc-700 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-amber-600 group-hover:text-black transition-all duration-300"
                disabled={table.status === "full"}
                onClick={() => (window.location.href = `/table/${table.id}`)}
              >
                {table.status === "full" ? "Table Full" : "Join Table"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-16 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="mx-auto w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-medium text-zinc-300 mb-2">No Tables Found</h3>
          <p className="text-zinc-500 max-w-md mx-auto mb-6">
            No tables match your search criteria. Try adjusting your filters or create a new table.
          </p>
          <Button
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium"
            onClick={() => setOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Table
          </Button>
        </div>
      )}
    </div>
  )
}
