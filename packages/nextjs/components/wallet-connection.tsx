"use client"

import { useState } from "react"
import { Button } from "~~/components/ui/button"
import { Wallet, ChevronDown, LogOut, ExternalLink, Copy, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu"
import { truncateAddress } from "~~/lib/utils"

interface WalletConnectionProps {
  className?: string
}

export function WalletConnection({ className }: WalletConnectionProps) {
  // Mock wallet connection state
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Simulate wallet connection
  const connectWallet = () => {
    setIsConnecting(true)

    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true)
      setWalletAddress("0x1234567890abcdef1234567890abcdef12345678")
      setIsConnecting(false)
    }, 1000)
  }

  // Simulate wallet disconnection
  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
  }

  // Copy address to clipboard
  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Simulate viewing on explorer
  const viewOnExplorer = () => {
    window.open(`https://etherscan.io/address/${walletAddress}`, "_blank")
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-medium relative overflow-hidden group ${className}`}
      >
        {isConnecting ? (
          <div className="flex items-center">
            <div className="h-4 w-4 mr-2 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
            Connecting...
          </div>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full"></div>
          </>
        )}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/80 text-zinc-300 hover:text-white hover:border-amber-500/50 transition-all duration-200 flex items-center gap-2 pr-3 pl-2 h-9 group"
        >
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mr-2">
              <Wallet className="h-3 w-3 text-black" />
            </div>
            <span className="text-sm font-medium">{truncateAddress(walletAddress)}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          <div className="absolute inset-0 -z-10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md bg-amber-500/5"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/80 p-1 shadow-lg shadow-black/40"
      >
        <div className="px-2 py-2.5 mb-1">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-zinc-500">Connected Wallet</div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <div className="text-sm font-medium text-white truncate">{walletAddress}</div>
        </div>

        <DropdownMenuSeparator className="bg-zinc-800/80" />

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800/70"
          onClick={copyAddress}
        >
          {copied ? <Check className="mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800/70"
          onClick={viewOnExplorer}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-800/80" />

        <DropdownMenuItem
          className="flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-950/20"
          onClick={disconnectWallet}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
