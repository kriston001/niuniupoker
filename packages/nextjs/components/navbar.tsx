"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Droplet, Home, HelpCircle, Layers, LayoutGrid, Menu, User, X } from "lucide-react";
import { useAccount } from "wagmi";
import { CustomNetworkSelector } from "~~/components/CustomNetworkSelector";
import { CustomWalletConnection } from "~~/components/CustomWalletConnection";
import { FaucetButton } from "~~/components/scaffold-eth";
import { Balance } from "~~/components/scaffold-eth/Balance";
import { Button } from "~~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";

// Navbar component
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address: connectedAddress } = useAccount();

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
    {
      name: "How to play",
      href: "/about",
      icon: <HelpCircle className="h-4 w-4 mr-2" />,
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
            <Image
              src="/images/logo2_60x60.png"
              alt="NiuNiu Logo"
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
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
              <CustomNetworkSelector />
            </div>
            {/* Balance Display */}
            {connectedAddress && (
              <div className="hidden sm:block">
                <Balance
                  address={connectedAddress}
                  className="border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/80 text-zinc-300 hover:text-white hover:border-amber-500/50 transition-all duration-200 rounded-md px-3 py-1.5"
                />
              </div>
            )}
            
            <div className="hidden sm:block">
              <CustomWalletConnection />
            </div>
            {/* Faucet Button - Desktop (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="hidden sm:block">
                <FaucetButton />
              </div>
            )}
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
                <CustomNetworkSelector />
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
