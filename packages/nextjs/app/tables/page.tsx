"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { truncateAddress } from "@/lib/utils";
import {
  ArrowUpDown,
  Filter,
  PlusCircle,
  Search,
} from "lucide-react";
import { CreateTableModal } from "~~/components/niuniu/create-table-modal";
import { TableCard } from "~~/components/niuniu/table-card";
import { useGameTablesData } from "~~/hooks/my-hooks/useGameTablesData";
import { GameState } from "~~/types/game-types";

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
