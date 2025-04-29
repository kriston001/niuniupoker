import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as fs from "fs";
import * as path from "path";

/**
 * 带颜色的控制台日志函数
 */
export function colorLog(message: string, data: any = "", color: string = "green") {
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
export const readDeployedAddresses = (hre: HardhatRuntimeEnvironment): Record<string, string> => {
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
 * 部署合约的通用函数
 *
 * @param hre HardhatRuntimeEnvironment对象
 * @param contractName 合约名称
 * @param deployedAddresses 已部署的合约地址对象
 * @param initArgs 初始化参数
 * @param deployerAddress 部署者地址
 * @returns 部署后的合约对象
 */
export async function deployOrUpgrade(
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
    },
    waitConfirmations: 1,
  });

  colorLog(`${contractName}合约已部署到地址:`, contract.address);
  return contract;
}
