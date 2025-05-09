# 🐮 Quanlian Niuniu Game (Fully On-Chain Bull-Bull Poker)

Quanlian Niuniu is a fully on-chain multiplayer Bull-Bull (牛牛) poker game built with [scaffold-eth 2](https://github.com/scaffold-eth/scaffold-eth-2). The game is designed for fairness, transparency, and decentralization—executing all core logic and state management entirely through smart contracts.

> Powered by Solidity smart contracts and a modern Web3 frontend, this GameFi application runs trustlessly on-chain, with no central servers involved.

---

## 🚀 Features

- 💡 **Fully On-Chain**: All gameplay logic, rooms, and settlements are executed on-chain.
- 🧱 **Modular Architecture**: Consists of `BBGameMain`, `BBGameTableFactory`, and upgradable `BBGameTable` contracts.
- 🔁 **Upgradeable Contracts**: Built with UUPS pattern for secure and flexible contract upgrades.
- 👥 **Multiplayer Rooms**: Players can create and join tables to compete in real-time.
- 🌐 **Modern Web3 Stack**: Developed with scaffold-eth 2, wagmi, viem, TailwindCSS, and Next.js.

---

## 🧩 Contract Structure

| Contract              | Description                                                |
|-----------------------|------------------------------------------------------------|
| `BBGameMain`          | Entry point contract, manages core configs and permissions |
| `BBGameTableFactory`  | Responsible for deploying new game tables                  |
| `BBGameTable`         | Logic for individual tables, including dealing and scoring |
| `BBToken` (optional)  | ERC20 or ERC777 in-game token for wagering                 |

All contracts use the UUPS proxy upgrade pattern to allow future updates.

---

## 🛠 Tech Stack

- **Solidity** + **Hardhat** (with `hardhat-deploy`)
- **Next.js** + **wagmi** + **viem** for the frontend
- **TailwindCSS** for styling
- **scaffold-eth 2** for full-stack development and testing

---
