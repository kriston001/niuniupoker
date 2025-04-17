"use client"

import { useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~~/components/ui/tabs"
import { Button } from "~~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~~/components/ui/card"
import { Input } from "~~/components/ui/input"
import { Label } from "~~/components/ui/label"
import { Badge } from "~~/components/ui/badge"
import { Separator } from "~~/components/ui/separator"
import { Switch } from "~~/components/ui/switch"
import { Wallet, History, Settings, Copy, ExternalLink, Shield, LogOut, Check, Trophy, Clock } from "lucide-react"

export default function MyPage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Sample user data
  const userData = {
    name: "Crypto Player",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    balance: 2.45,
    joinedDate: "April 2024",
    avatar: "/placeholder.svg?height=200&width=200",
    nftCount: 3,
    gamesPlayed: 28,
    winRate: 64,
  }

  // Sample game history
  const gameHistory = [
    {
      id: 1,
      tableName: "High Rollers",
      date: "2024-04-17T08:30:00.000Z",
      result: "win",
      amount: 0.35,
    },
    {
      id: 2,
      tableName: "Diamond Hands",
      date: "2024-04-16T19:15:00.000Z",
      result: "loss",
      amount: -0.2,
    },
    {
      id: 3,
      tableName: "Lucky Dragons",
      date: "2024-04-16T14:45:00.000Z",
      result: "win",
      amount: 0.15,
    },
    {
      id: 4,
      tableName: "Crypto Kings",
      date: "2024-04-15T20:30:00.000Z",
      result: "win",
      amount: 0.5,
    },
    {
      id: 5,
      tableName: "Royal Flush",
      date: "2024-04-15T16:00:00.000Z",
      result: "loss",
      amount: -0.1,
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Profile card */}
        <div className="lg:col-span-1">
          <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-amber-500/20 to-amber-600/20"></div>
            <CardContent className="pt-0 relative">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-900">
                  <Image src={userData.avatar || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
                </div>
              </div>
              <div className="mt-16 text-center">
                <h2 className="text-xl font-bold text-white">{userData.name}</h2>
                <div className="flex items-center justify-center mt-2 text-zinc-400 text-sm">
                  <span className="truncate max-w-[180px]">{userData.walletAddress}</span>
                  <button
                    className="ml-2 text-zinc-500 hover:text-zinc-300"
                    onClick={() => copyToClipboard(userData.walletAddress)}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-4 flex justify-center">
                  <Badge className="bg-amber-500/90 text-black hover:bg-amber-500/90 text-sm px-3 py-1">
                    {userData.balance} ETH
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <div>
                  <div className="text-zinc-400 text-xs mb-1">Joined</div>
                  <div className="text-white font-medium">{userData.joinedDate}</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs mb-1">NFTs</div>
                  <div className="text-white font-medium">{userData.nftCount}</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs mb-1">Win Rate</div>
                  <div className="text-white font-medium">{userData.winRate}%</div>
                </div>
              </div>

              <Separator className="my-6 bg-zinc-800" />

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 justify-start"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Deposit Funds
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 justify-start"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Withdraw Funds
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-800 rounded-lg p-1 mb-6">
              <TabsTrigger value="history" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
                <History className="h-4 w-4 mr-2" />
                Game History
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-0">
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Recent Games</CardTitle>
                  <CardDescription className="text-zinc-400">Your recent NiuNiu poker game history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gameHistory.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-3 rounded-md bg-zinc-800/50 border border-zinc-800"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              game.result === "win"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {game.result === "win" ? <Trophy className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                          </div>
                          <div className="ml-3">
                            <div className="text-white font-medium">{game.tableName}</div>
                            <div className="text-zinc-400 text-sm">{formatDate(game.date)}</div>
                          </div>
                        </div>
                        <div
                          className={`text-lg font-bold ${game.result === "win" ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {game.result === "win" ? "+" : ""}
                          {game.amount} ETH
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                  >
                    View All History
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Profile Settings</CardTitle>
                  <CardDescription className="text-zinc-400">Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-zinc-300">
                      Display Name
                    </Label>
                    <Input
                      id="username"
                      defaultValue={userData.name}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar" className="text-zinc-300">
                      Profile Picture
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-zinc-700">
                        <Image
                          src={userData.avatar || "/placeholder.svg"}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                        Change Avatar
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications" className="text-zinc-300">
                          Email Notifications
                        </Label>
                        <p className="text-zinc-500 text-sm">Receive email updates about your account</p>
                      </div>
                      <Switch id="notifications" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium">
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Security Settings</CardTitle>
                  <CardDescription className="text-zinc-400">Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="2fa" className="text-zinc-300">
                          Two-Factor Authentication
                        </Label>
                        <p className="text-zinc-500 text-sm">Add an extra layer of security to your account</p>
                      </div>
                      <Switch id="2fa" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="activity" className="text-zinc-300">
                          Login Activity Notifications
                        </Label>
                        <p className="text-zinc-500 text-sm">Get notified of new login attempts</p>
                      </div>
                      <Switch id="activity" defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Connected Wallet</Label>
                    <div className="flex items-center justify-between p-3 rounded-md bg-zinc-800/50 border border-zinc-700">
                      <div className="flex items-center">
                        <Wallet className="h-5 w-5 text-amber-500 mr-2" />
                        <span className="text-zinc-300 text-sm truncate max-w-[200px]">{userData.walletAddress}</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300">Connected</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4">
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Change Security Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-900/30 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect Wallet
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
