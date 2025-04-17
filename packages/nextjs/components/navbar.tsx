"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Droplet, Home, Layers, LayoutGrid, Menu, User, X } from "lucide-react";
import { CustomWalletConnection } from "~~/components/CustomWalletConnection";
import { FaucetButton } from "~~/components/scaffold-eth";
import { Button } from "~~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";

// Network Selector component
function NetworkSelector() {
  const networks = [
    { id: "ethereum", name: "Ethereum", color: "#627eea" },
    { id: "polygon", name: "Polygon", color: "#8247e5" },
    { id: "bnb", name: "BNB Chain", color: "#f3ba2f" },
    { id: "arbitrum", name: "Arbitrum", color: "#28a0f0" },
  ];

  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:text-white hover:border-amber-500/50 hover:bg-zinc-800/80 transition-all duration-200 flex items-center gap-2 h-9 pr-3 pl-2"
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: `${selectedNetwork.color}`,
              boxShadow: `0 0 8px ${selectedNetwork.color}`,
            }}
          />
          <span className="text-sm font-medium">{selectedNetwork.name}</span>
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/80 p-1 shadow-lg shadow-black/40"
      >
        {networks.map(network => (
          <DropdownMenuItem
            key={network.id}
            className={`flex items-center justify-between px-2 py-1.5 text-sm rounded-sm cursor-pointer transition-colors ${
              selectedNetwork.id === network.id
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/70"
            }`}
            onClick={() => {
              setSelectedNetwork(network);
              setOpen(false);
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: network.color,
                  boxShadow: `0 0 6px ${network.color}`,
                }}
              />
              <span>{network.name}</span>
            </div>
            {selectedNetwork.id === network.id && <Check className="h-4 w-4 text-amber-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Navbar component
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      name: "Tables",
      href: "/tables",
      icon: <LayoutGrid className="h-4 w-4 mr-2" />,
    },
    {
      name: "NFT",
      href: "/nft",
      icon: <Layers className="h-4 w-4 mr-2" />,
    },
    {
      name: "My",
      href: "/my",
      icon: <User className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-zinc-800 py-3"
          : "bg-gradient-to-b from-black/90 to-black/0 py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600"></div>
            <h1 className="text-xl font-bold text-white hidden sm:block">NiuNiu Poker</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
                    group flex items-center
                    ${
                      isActive
                        ? "text-amber-400 bg-zinc-800/50"
                        : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/30"
                    }
                  `}
                >
                  {item.icon}
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600"></span>
                  )}
                  <span className="absolute inset-0 rounded-md bg-amber-400/0 group-hover:bg-amber-400/5 transition-all duration-300"></span>
                  <span className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md bg-amber-400/10 group-hover:bg-amber-400/10"></span>
                </Link>
              );
            })}
          </div>

          {/* Connect Wallet Button and Network Selector */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <NetworkSelector />
            </div>
            <div className="hidden sm:block">
              <CustomWalletConnection />
            </div>
            {/* Faucet Button - Desktop */}
            <div className="hidden sm:block">
              <FaucetButton />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col space-y-2">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      px-4 py-3 rounded-md text-sm font-medium flex items-center
                      ${
                        isActive
                          ? "text-amber-400 bg-zinc-800/50"
                          : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/30"
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-2 pb-1">
                <NetworkSelector />
              </div>
              <div className="pt-1 pb-1">
                <CustomWalletConnection className="w-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
