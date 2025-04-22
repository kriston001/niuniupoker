"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { truncateAddress } from "@/lib/utils";
import {
  ArrowUpDown,
  Clock,
  Coins,
  Filter,
  Gift,
  PlusCircle,
  Search,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { CreateTableModal } from "~~/components/niuniu/create-table-modal";
import { TableCard } from "~~/components/niuniu/table-card";
import { useGameTablesData } from "~~/hooks/my-hooks/useGameTablesData";
import { GameState } from "~~/types/game-types";

// First, update the sample data to include the enhanced reward details
// Update the tablesData array to include totalPool, perWinPayout, and winRate properties

// Update the tablesData array to include new fields
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
    rewardInfo: "High Roller",
    gamesPlayed: 152,
    settlements: 48,
    totalPool: 500,
    perWinPayout: 10,
    winRate: 20,
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
    rewardInfo: null,
    gamesPlayed: 87,
    settlements: 21,
    totalPool: 0,
    perWinPayout: 0,
    winRate: 0,
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
    rewardInfo: "Jackpot",
    gamesPlayed: 0,
    settlements: 0,
    totalPool: 1000,
    perWinPayout: 50,
    winRate: 5,
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
    rewardInfo: "Lucky Streak",
    gamesPlayed: 243,
    settlements: 76,
    totalPool: 250,
    perWinPayout: 5,
    winRate: 10,
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
    rewardInfo: null,
    gamesPlayed: 12,
    settlements: 3,
    totalPool: 750,
    perWinPayout: 15,
    winRate: 2,
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
    rewardInfo: "High Roller",
    gamesPlayed: 98,
    settlements: 32,
    totalPool: 300,
    perWinPayout: 8,
    winRate: 15,
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
    rewardInfo: null,
    gamesPlayed: 45,
    settlements: 15,
    totalPool: 150,
    perWinPayout: 3,
    winRate: 8,
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
    rewardInfo: "Lucky Streak",
    gamesPlayed: 132,
    settlements: 41,
    totalPool: 80,
    perWinPayout: 2,
    winRate: 5,
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
    rewardInfo: "Jackpot",
    gamesPlayed: 67,
    settlements: 22,
    totalPool: 400,
    perWinPayout: 12,
    winRate: 25,
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
    rewardInfo: "High Roller",
    gamesPlayed: 28,
    settlements: 9,
    totalPool: 2000,
    perWinPayout: 100,
    winRate: 10,
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
    rewardInfo: null,
    gamesPlayed: 315,
    settlements: 94,
    totalPool: 50,
    perWinPayout: 1,
    winRate: 3,
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
    rewardInfo: "Jackpot",
    gamesPlayed: 56,
    settlements: 18,
    totalPool: 1500,
    perWinPayout: 75,
    winRate: 18,
  },
];

export default function TablesPage() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { gameTables, refreshData } = useGameTablesData({
    refreshInterval: 0,
    limit: 9,
  });

  const filterTables = () => {
    let filtered = gameTables ? [...gameTables] : [];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        table =>
          table.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          truncateAddress(table.bankerAddr).toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter) {
      if (statusFilter == "active") {
        filtered = filtered.filter(table => table.active == true);
      } else if (statusFilter == "waiting") {
        filtered = filtered.filter(table => table.state == GameState.WAITING);
      } else if (statusFilter == "full") {
        filtered = filtered.filter(table => table.playerCount == table.maxPlayers);
      }
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "betAmount":
            comparison = Number(a.betAmount - b.betAmount);
            break;
          case "players":
            comparison = a.playerCount - b.playerCount;
            break;
          case "bankerFeePercent":
            comparison = a.bankerFeePercent - b.bankerFeePercent;
            break;
          case "gameRound":
            comparison = new Date(Number(a.gameRound)).getTime() - new Date(Number(b.gameRound)).getTime();
            break;
          default:
            return 0;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const filteredTables = filterTables();

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
              onChange={e => setSearchQuery(e.target.value)}
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
          <CreateTableModal
            open={open}
            onOpenChange={setOpen}
            onCreatedTable={() => {
              refreshData();
            }}
            trigger={
              <Button
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium"
                onClick={() => setOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Table
              </Button>
            }
          />
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
          className={`border-zinc-700 ${sortBy === "bankerFeePercent" ? "text-amber-400 border-amber-400/50" : "text-zinc-400"}`}
          onClick={() => toggleSort("bankerFeePercent")}
        >
          Commission
          {sortBy === "bankerFeePercent" && (
            <ArrowUpDown className={`ml-2 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`border-zinc-700 ${
            sortBy === "gameRound" ? "text-amber-400 border-amber-400/50" : "text-zinc-400"
          }`}
          onClick={() => toggleSort("gameRound")}
        >
          Hottest
          {sortBy === "gameRound" && (
            <ArrowUpDown className={`ml-2 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
          )}
        </Button>
      </div>

      {/* Now update the card rendering to include the new fields */}
      {/* Find the section where the table cards are rendered and modify it */}

      {/* Update the card rendering in the grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTables.map(table => (
          <TableCard
            key={table.tableId}
            table={table}
            onJoinTableClick={(tableAddr: `0x${string}`) => (window.location.href = `/table/${tableAddr}`)}
          />
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
  );
}
