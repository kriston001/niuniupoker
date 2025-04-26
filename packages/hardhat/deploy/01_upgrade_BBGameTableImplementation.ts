import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

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
 * 读取已部署的地址
 */
const readDeployedAddresses = (hre: HardhatRuntimeEnvironment): Record<string, string> => {
  // 检查是否是本地网络（hardhat 或 localhost）
  const isLocalNetwork = hre.network.name === "hardhat" || hre.network.name === "localhost";
  // 如果是本地网络，统一使用 localhost
  const networkName = isLocalNetwork ? "localhost" : hre.network.name;

  const deployAddressPath = path.join(__dirname, `../deployments/${networkName}/addresses.json`);
  const beaconDeployPath = path.join(__dirname, `../deployments/${networkName}/BBGameTableBeacon.json`);

  try {
    // 首先尝试从 addresses.json 读取
    if (fs.existsSync(deployAddressPath)) {
      const fileContent = fs.readFileSync(deployAddressPath, "utf8");
      return JSON.parse(fileContent);
    }

    // 如果 addresses.json 不存在，尝试从 BBGameTableBeacon.json 读取
    if (fs.existsSync(beaconDeployPath)) {
      const beaconDeploy = JSON.parse(fs.readFileSync(beaconDeployPath, "utf8"));
      return { BBGameTableBeacon: beaconDeploy.address };
    }
  } catch (error) {
    console.error(`读取部署地址文件失败: ${error}`);
  }

  return {};
};

/**
 * 升级 BBGameTableImplementation 合约
 */
const upgradeTableImplementation: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // 如果是自动部署（比如 hardhat node），则跳过这个脚本
  if (process.env.AUTO_DEPLOY === "true") {
    console.log("Skipping BBGameTableImplementation upgrade in auto deploy mode");
    return;
  }

  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  let beaconAddress;

  try {
    // 首先尝试从部署文件直接获取
    const beaconDeployment = await get("BBGameTableBeacon");
    beaconAddress = beaconDeployment.address;
  } catch {
    // 如果直接获取失败，尝试从地址文件读取
    const deployedAddresses = readDeployedAddresses(hre);
    beaconAddress = deployedAddresses["BBGameTableBeacon"];
  }

  if (!beaconAddress) {
    colorLog("BBGameTableBeacon 地址未找到，需要先部署完整合约套件", "", "red");
    colorLog("请先运行: yarn hardhat deploy", "", "red");
    throw new Error("BBGameTableBeacon address not found!");
  }

  // 部署新的 BBGameTableImplementation
  console.log("----------开始部署新的 BBGameTableImplementation 合约----------");
  const bbGameTableImplementation = await deploy("BBGameTableImplementation", {
    from: deployer,
    log: true,
  });

  colorLog("新的 BBGameTableImplementation 合约已部署到地址:", bbGameTableImplementation.address);

  // 获取 BBGameTableBeacon 合约实例
  const bbGameTableBeacon = await ethers.getContractAt("BBGameTableBeacon", beaconAddress);

  // 更新 Beacon 指向新的 implementation
  console.log("----------开始更新 BBGameTableBeacon----------");
  const tx = await bbGameTableBeacon.upgradeTo(bbGameTableImplementation.address);
  await tx.wait();
  colorLog("BBGameTableBeacon 已更新到新的 implementation 地址:", bbGameTableImplementation.address);

  // 如果不是本地网络，进行合约验证
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("等待验证...");
    try {
      await hre.run("verify:verify", {
        address: bbGameTableImplementation.address,
        constructorArguments: [],
      });
      console.log("BBGameTableImplementation 验证成功!");
    } catch (error) {
      console.error("验证失败:", error);
    }
  }

  // 验证更新是否成功
  const currentImpl = await bbGameTableBeacon.implementation();
  const isUpdateSuccessful = currentImpl.toLowerCase() === bbGameTableImplementation.address.toLowerCase();
  console.log("\n验证 Beacon 更新结果:");
  console.log(`BBGameTableBeacon.implementation: ${currentImpl} ${isUpdateSuccessful ? "✅" : "❌"}`);
};

// 设置标签和依赖
upgradeTableImplementation.tags = ["UpgradeTableImplementation"];
// 设置为可选部署
upgradeTableImplementation.runAtTheEnd = true;
// 设置为手动部署
upgradeTableImplementation.skip = async (hre: HardhatRuntimeEnvironment) =>
  process.env.AUTO_DEPLOY === "true" || hre.network.name === "hardhat";

export default upgradeTableImplementation;
