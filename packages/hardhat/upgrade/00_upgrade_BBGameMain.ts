import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const upgradeContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // 检查是否明确指定了 BBUpgrade 标签
  // 如果当前运行的不是 BBUpgrade 标签，则跳过此脚本
  if (!hre.network.tags["BBUpgrade"] && !process.env.FORCE_UPGRADE) {
    console.log("跳过升级脚本 - 使用 --tags BBUpgrade 来运行升级");
    return;
  }

  // 升级 BBGameHistory 合约
  console.log("----------开始升级 BBGameHistory 合约----------");
  const currentHistoryDeployment = await get("BBGameHistory");
  console.log("当前 BBGameHistory 合约地址:", currentHistoryDeployment.address);

  const upgradedHistory = await deploy("BBGameHistory", {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
    },
    waitConfirmations: 1,
  });
  console.log("BBGameHistory 合约升级完成，地址:", upgradedHistory.address);

  // 升级 BBGameMain 合约
  console.log("----------开始升级 BBGameMain 合约----------");
  const currentMainDeployment = await get("BBGameMain");
  console.log("当前 BBGameMain 合约地址:", currentMainDeployment.address);

  const upgradedMain = await deploy("BBGameMain", {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
    },
    waitConfirmations: 1,
  });
  console.log("BBGameMain 合约升级完成，地址:", upgradedMain.address);

  // 设置BBGameMain合约的BBGameHistory合约地址
  console.log("----------设置BBGameMain合约的BBGameHistory合约地址----------");
  const bbGameMainContract = await ethers.getContractAt("BBGameMain", currentMainDeployment.address);
  await bbGameMainContract.setGameHistoryAddress(currentHistoryDeployment.address);
  // await bbGameMainContract.setParams(minBet, maxPlayers, houseFeePercent, playerTimeout, tableInactiveTimeout);
  console.log("BBGameMain合约的BBGameHistory合约地址已设置为:", currentHistoryDeployment.address);

  // 设置BBGameHistory合约的BBGameMain合约地址
  console.log("----------设置BBGameHistory合约的BBGameMain合约地址----------");
  const bbGameHistoryContract = await ethers.getContractAt("BBGameHistory", currentHistoryDeployment.address);
  await bbGameHistoryContract.setGameMainAddress(currentMainDeployment.address);
  console.log("BBGameHistory合约的BBGameMain合约地址已设置为:", currentMainDeployment.address);

  // 验证升级后的合约
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: upgradedHistory.implementation,
        constructorArguments: [],
      });
      console.log("BBGameHistory 新版本合约验证成功");

      await hre.run("verify:verify", {
        address: upgradedMain.implementation,
        constructorArguments: [],
      });
      console.log("BBGameMain 新版本合约验证成功");
    } catch (error) {
      console.log("验证失败:", error);
    }
  }
};

upgradeContracts.tags = ["BBUpgrade"];

export default upgradeContracts;
