"use client";

import Link from "next/link";
import Image from "next/image";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { PlayerBalance } from "~~/components/niuniu";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 max-w-4xl w-full">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">欢迎来到</span>
            <span className="block text-4xl font-bold">牛牛游戏</span>
          </h1>
          
          {connectedAddress && (
            <div className="flex justify-center items-center space-x-2 flex-col my-6">
              <p className="font-medium">您的地址:</p>
              <Address address={connectedAddress} />
              <div className="mt-4 w-full max-w-sm">
                <PlayerBalance />
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xl mb-6">牛牛是一种流行的扑克牌游戏，玩家需要通过手中的五张牌组合出最佳牌型来获胜。</p>
            <Link href="/niuniu" passHref>
              <button className="btn btn-primary btn-lg">进入游戏大厅</button>
            </Link>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
