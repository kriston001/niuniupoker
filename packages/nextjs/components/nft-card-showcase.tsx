"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "~~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { Badge } from "~~/components/ui/badge"
import { Star, Crown, Shield, Diamond } from "lucide-react"

export default function NFTCardShowcase() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const handleCardClick = (cardId: string) => {
    setSelectedCard(selectedCard === cardId ? null : cardId)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-white text-center mb-8">Exclusive Room Access Cards</h2>
      <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-12">
        Collect these exclusive NFT cards to access special poker rooms with unique benefits and higher stakes.
      </p>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-5 bg-zinc-800 rounded-lg p-1 mb-12">
          <TabsTrigger value="all" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            All
          </TabsTrigger>
          <TabsTrigger value="bronze" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Bronze
          </TabsTrigger>
          <TabsTrigger value="silver" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Silver
          </TabsTrigger>
          <TabsTrigger value="gold" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Gold
          </TabsTrigger>
          <TabsTrigger value="diamond" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Diamond
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <NFTCard
              id="bronze"
              name="Bronze Access"
              level="Bronze"
              icon={<Shield className="h-12 w-12" />}
              color="from-amber-700 to-amber-800"
              glow="amber-700/40"
              badge="bg-amber-700"
              selected={selectedCard === "bronze"}
              onClick={() => handleCardClick("bronze")}
            />
            <NFTCard
              id="silver"
              name="Silver Access"
              level="Silver"
              icon={<Star className="h-12 w-12" />}
              color="from-zinc-400 to-zinc-500"
              glow="zinc-400/40"
              badge="bg-zinc-400"
              selected={selectedCard === "silver"}
              onClick={() => handleCardClick("silver")}
            />
            <NFTCard
              id="gold"
              name="Gold Access"
              level="Gold"
              icon={<Crown className="h-12 w-12" />}
              color="from-amber-400 to-amber-500"
              glow="amber-400/40"
              badge="bg-amber-400"
              selected={selectedCard === "gold"}
              onClick={() => handleCardClick("gold")}
            />
            <NFTCard
              id="diamond"
              name="Diamond Access"
              level="Diamond"
              icon={<Diamond className="h-12 w-12" />}
              color="from-cyan-400 to-blue-500"
              glow="cyan-400/40"
              badge="bg-cyan-400"
              selected={selectedCard === "diamond"}
              onClick={() => handleCardClick("diamond")}
            />
          </div>
        </TabsContent>

        <TabsContent value="bronze" className="mt-0">
          <div className="max-w-md mx-auto">
            <NFTCard
              id="bronze"
              name="Bronze Access"
              level="Bronze"
              icon={<Shield className="h-12 w-12" />}
              color="from-amber-700 to-amber-800"
              glow="amber-700/40"
              badge="bg-amber-700"
              selected={true}
              onClick={() => {}}
              large={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="silver" className="mt-0">
          <div className="max-w-md mx-auto">
            <NFTCard
              id="silver"
              name="Silver Access"
              level="Silver"
              icon={<Star className="h-12 w-12" />}
              color="from-zinc-400 to-zinc-500"
              glow="zinc-400/40"
              badge="bg-zinc-400"
              selected={true}
              onClick={() => {}}
              large={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="gold" className="mt-0">
          <div className="max-w-md mx-auto">
            <NFTCard
              id="gold"
              name="Gold Access"
              level="Gold"
              icon={<Crown className="h-12 w-12" />}
              color="from-amber-400 to-amber-500"
              glow="amber-400/40"
              badge="bg-amber-400"
              selected={true}
              onClick={() => {}}
              large={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="diamond" className="mt-0">
          <div className="max-w-md mx-auto">
            <NFTCard
              id="diamond"
              name="Diamond Access"
              level="Diamond"
              icon={<Diamond className="h-12 w-12" />}
              color="from-cyan-400 to-blue-500"
              glow="cyan-400/40"
              badge="bg-cyan-400"
              selected={true}
              onClick={() => {}}
              large={true}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface NFTCardProps {
  id: string
  name: string
  level: string
  icon: React.ReactNode
  color: string
  glow: string
  badge: string
  selected: boolean
  onClick: () => void
  large?: boolean
}

function NFTCard({ id, name, level, icon, color, glow, badge, selected, onClick, large = false }: NFTCardProps) {
  return (
    <div
      className={`relative cursor-pointer transition-all duration-500 transform ${
        selected ? "scale-105" : "scale-100 hover:scale-102"
      }`}
      onClick={onClick}
    >
      {/* Card glow effect */}
      <div
        className={`absolute inset-0 rounded-2xl blur-md transition-opacity duration-500 ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-70"
        }`}
        style={{ backgroundColor: `var(--${glow})` }}
      ></div>

      {/* Main card */}
      <Card
        className={`relative bg-zinc-900 border-0 overflow-hidden rounded-2xl transition-all duration-300 group ${
          large ? "aspect-[3/4]" : "aspect-[3/4]"
        }`}
      >
        {/* Card background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] bg-opacity-30"></div>
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent"></div>
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/5"
                style={{
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Card border glow */}
        <div
          className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
            selected ? "opacity-100" : "opacity-40 group-hover:opacity-80"
          }`}
          style={{
            borderImage: `linear-gradient(to bottom right, var(--${color.split(" ")[0]}, var(--${
              color.split(" ")[1]
            })) 1`,
          }}
        ></div>

        <CardContent className="p-6 h-full flex flex-col">
          {/* Card header */}
          <div className="flex justify-between items-start mb-4">
            <Badge className={`${badge} text-black font-semibold px-3 py-1`}>{level}</Badge>
            <div className="text-xs text-zinc-500 font-mono">#RC-{id.toUpperCase()}</div>
          </div>

          {/* Card content */}
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br ${color} p-1`}
            >
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-white">
                {icon}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
            <p className="text-sm text-zinc-400">Room Access Card</p>
          </div>

          {/* Card footer */}
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <div className="text-xs text-zinc-500">Rarity</div>
              <div className="flex">
                {[...Array(level === "Bronze" ? 1 : level === "Silver" ? 2 : level === "Gold" ? 3 : 4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full mx-0.5 ${
                      level === "Bronze"
                        ? "bg-amber-700"
                        : level === "Silver"
                          ? "bg-zinc-400"
                          : level === "Gold"
                            ? "bg-amber-400"
                            : "bg-cyan-400"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
