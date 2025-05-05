import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
// import {colorLog, readDeployedAddresses, deployOrUpgrade} from "./scripts/deploy_utils"

/**
 * 带颜色的控制台日志函数
 */
function colorLog(message: string, data: any = "", color: string = "green") {
  const colors = {
    green: "\x1b[32m",
    cyan: "\x1b[36m",
    red: "\x1b[31m",
    reset: "\x1b[0m",
  };

  const selectedColor = colors[color as keyof typeof colors] || colors.green;
  const dataColor = colors.cyan;
  const reset = colors.reset;

  if (data === "") {
    console.log(`${selectedColor}${message}${reset}`);
  } else {
    console.log(`${selectedColor}${message}${reset}`, `${dataColor}${data}${reset}`);
  }
}

/**
 * 部署合约的通用函数
 *
 * @param hre HardhatRuntimeEnvironment对象
 * @param contractName 合约名称
 * @param deployedAddresses 已部署的合约地址对象
 * @param initArgs 初始化参数
 * @param deployerAddress 部署者地址
 * @returns 部署后的合约对象
 */
async function deployOrUpgrade(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  initArgs: any[] = [],
  deployerAddress: string,
) {
  const { deploy } = hre.deployments;
  console.log(`----------开始部署${contractName}合约----------`);

  // 直接执行部署操作
  const contract = await deploy(contractName, {
    from: deployerAddress,
    args: [], // 构造函数参数为空，因为使用initialize初始化
    log: true,
    proxy: {
      owner: deployerAddress,
      proxyContract: "UUPS",
      execute:
        initArgs.length > 0
          ? {
              init: {
                methodName: "initialize",
                args: initArgs,
              },
            }
          : undefined,
      upgradeIndex: 1 // Increment this for each upgrade
    },
    waitConfirmations: 1,
  });

  colorLog(`${contractName}合约已部署到地址:`, contract.address);
  return contract;
}

/**
 * 升级 BBRewardPool 合约
 */
const upgradeRewardPool: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // 如果是自动部署（比如 hardhat node），则跳过这个脚本
  if (process.env.AUTO_DEPLOY === "true") {
    console.log("Skipping BBRewardPool upgrade in auto deploy mode");
    return;
  }

  const { deployer } = await hre.getNamedAccounts();

  const contract = await deployOrUpgrade(hre, "BBRewardPool", [], deployer);

  colorLog("新的 BBRewardPool 合约已部署到地址:", contract.address);
};

// 设置标签和依赖
upgradeRewardPool.tags = ["UpgradeRewardPool"];
// 设置为可选部署
upgradeRewardPool.runAtTheEnd = true;
// 设置为手动部署
upgradeRewardPool.skip = async (hre: HardhatRuntimeEnvironment) =>
  process.env.AUTO_DEPLOY === "true" || hre.network.name === "hardhat";

export default upgradeRewardPool;
