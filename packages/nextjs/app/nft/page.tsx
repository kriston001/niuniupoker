"use client";

import NftSection from "~~/components/nft-section";

export default function NFTPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">NFT Marketplace</h1>
          <p className="text-zinc-400 mt-1">Mint and manage your NiuNiu Poker NFTs to enhance your gaming experience</p>
        </div>
      </div>
      <NftSection />
    </div>
  );
}
