// deploy/00_deploy_multicall3.js

const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  // 只在本地开发网络上部署
  if (network.name === "localhost" || network.name === "hardhat") {
    log("Deploying Multicall3 to local network...");

    // 部署 Multicall3 合约
    const multicall3 = await deploy("Multicall3", {
      from: deployer,
      args: [],
      log: true,
      // 使用 Solidity 文件而不是预编译的字节码
      contract: "Multicall3",
    });

    log(`Multicall3 deployed at ${multicall3.address}`);
  } else {
    log(`Skipping deployment of Multicall3 on network ${network.name}`);
  }
};

module.exports.tags = ["Multicall3"];
