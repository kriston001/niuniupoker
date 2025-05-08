"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import NftSection from "~~/components/nft-section";
import { TableCard } from "~~/components/niuniu/table-card";
import { useGameTablesData } from "~~/hooks/my-hooks/useGameTablesData";

export default function Home() {
  const { gameTables, refetchData: refetchTablesData } = useGameTablesData({
    refreshInterval: 0,
    limit: 9,
  });

  const tables = gameTables ? [...gameTables] : [];

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Game Tables</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map(table => (
            <TableCard
              key={table.tableId}
              table={table}
              onJoinTableClick={(tableAddr: `0x${string}`) => (window.location.href = `/table/${tableAddr}`)}
            />
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
              {/* <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600"></div> */}
              <span className="text-zinc-400">NiuNiu Poker © {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-6">
              <a href="https://t.me/niuniu_poker" target="_blank" className="text-zinc-400 hover:text-amber-500 transition-colors">
                Telegram
              </a>
              <a href="https://discord.gg/wkYs5crPQs" target="_blank" className="text-zinc-400 hover:text-amber-500 transition-colors">
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
