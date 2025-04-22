import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * 带颜色的控制台日志函数
 * @param message 消息文本
 * @param data 要打印的数据
 * @param color 颜色代码
 */
function colorLog(message: string, data: any = "", color: string = "green") {
  const colors = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
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
 * 读取部署地址文件
 * @param hre HardhatRuntimeEnvironment对象
 * @returns 部署地址对象
 */
// const readDeployedAddresses = (hre: HardhatRuntimeEnvironment): Record<string, string> => {
//   const networkName = hre.network.name;
//   const deployAddressPath = path.join(__dirname, `../deployments/${networkName}/addresses.json`);

//   try {
//     if (fs.existsSync(deployAddressPath)) {
//       const fileContent = fs.readFileSync(deployAddressPath, 'utf8');
//       return JSON.parse(fileContent);
//     }
//   } catch (error) {
//     console.log(`读取部署地址文件失败: ${error}`);
//   }

//   return {};
// };

/**
 * 保存部署地址到文件
 * @param hre HardhatRuntimeEnvironment对象
 * @param addresses 部署地址对象
 */
const saveDeployedAddresses = (hre: HardhatRuntimeEnvironment, addresses: Record<string, string>): void => {
  const networkName = hre.network.name;
  const deployDirPath = path.join(__dirname, `../deployments/${networkName}`);
  const deployAddressPath = path.join(deployDirPath, "addresses.json");

  try {
    // 确保目录存在
    if (!fs.existsSync(deployDirPath)) {
      fs.mkdirSync(deployDirPath, { recursive: true });
    }

    fs.writeFileSync(deployAddressPath, JSON.stringify(addresses, null, 2));
    console.log(`部署地址已保存到: ${deployAddressPath}`);
  } catch (error) {
    console.log(`保存部署地址文件失败: ${error}`);
  }
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
    },
    waitConfirmations: 1,
  });

  colorLog(`${contractName}合约已部署到地址:`, contract.address);
  return contract;
}

/**
 * 部署BBGameMain合约
 *
 * @param hre HardhatRuntimeEnvironment对象
 */
const deployBBGameMain: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  // 设置初始化参数
  const maxPlayers = 6; // 最大玩家数
  const maxRoomCount = 10; // 最大房间数
  const maxBankerFeePercent = 20; // 庄家手续费百分比
  const liquidatorFeePercent = 5; // 清算员手续费百分比
  const playerTimeout = 180; // 玩家超时时间，单位为秒
  const tableInactiveTimeout = 1200; // 桌子空闲超时时间，单位为秒，这里是20分钟

  // 用于存储本次部署的合约地址
  const newDeployedAddresses: Record<string, string> = {};

  // 部署或获取BBGameMain合约
  const bbGameMain = await deployOrUpgrade(
    hre,
    "BBGameMain",
    [
      maxPlayers,
      maxRoomCount,
      maxBankerFeePercent,
      liquidatorFeePercent,
      playerTimeout,
      tableInactiveTimeout,
      ethers.ZeroAddress, // gameTableFactoryAddress
    ],
    deployer,
  );
  newDeployedAddresses["BBGameMain"] = bbGameMain.address;

  const { deploy } = hre.deployments;

  // 部署或获取BBGameTableImplementation合约
  console.log(`----------开始部署BBGameTableImplementation合约----------`);
  const bbGameTableImplementation = await deploy("BBGameTableImplementation", {
    from: deployer,
    log: true,
  });
  newDeployedAddresses["BBGameTableImplementation"] = bbGameTableImplementation.address;

  // ✅ 部署 Beacon（传 implementation 地址）

  const bbGameTableBeacon = await deploy("BBGameTableBeacon", {
    from: deployer,
    log: true,
    args: [bbGameTableImplementation.address, deployer],
  });
  newDeployedAddresses["BBGameTableBeacon"] = bbGameTableBeacon.address;

  // 部署或获取BBGameTableFactory合约
  const bbGameTableFactory = await deployOrUpgrade(hre, "BBGameTableFactory", [bbGameTableBeacon.address], deployer);
  newDeployedAddresses["BBGameTableFactory"] = bbGameTableFactory.address;

  // 部署或获取BBRandomnessManager合约
  const bbRandomnessManager = await deployOrUpgrade(hre, "BBRandomnessManager", [bbGameMain.address], deployer);
  newDeployedAddresses["BBRandomnessManager"] = bbRandomnessManager.address;

  // 部署或获取BBRoomCardNFT合约
  const bbRoomCardNFT = await deployOrUpgrade(
    hre,
    "BBRoomCardNFT",
    [
      "Room Card", // NFT名称
      "NNRC", // NFT符号
      "https://api.niuniu.game/metadata/roomcard/", // 基础URI
    ],
    deployer,
  );
  newDeployedAddresses["BBRoomCardNFT"] = bbRoomCardNFT.address;

  // 部署或获取BBRoomLevelNFT合约
  const bbRoomLevelNFT = await deployOrUpgrade(
    hre,
    "BBRoomLevelNFT",
    [
      "Room Level", // NFT名称
      "NNRL", // NFT符号
      "https://api.niuniu.game/metadata/roomlevel/", // 基础URI
    ],
    deployer,
  );
  newDeployedAddresses["BBRoomLevelNFT"] = bbRoomLevelNFT.address;

  // 部署或获取BBRewardPool合约
  const bbRewardPool = await deployOrUpgrade(hre, "BBRewardPool", [bbGameMain.address], deployer);
  newDeployedAddresses["BBRewardPool"] = bbRewardPool.address;

  const bbGameMainContract = await ethers.getContractAt("BBGameMain", bbGameMain.address);

  // 设置BBGameMain合约的BBGameTableFactory合约地址
  await bbGameMainContract.setGameTableFactoryAddress(bbGameTableFactory.address);

  // 设置BBGameMain合约的BBRandomnessManager合约地址
  await bbGameMainContract.setRandomnessManagerAddress(bbRandomnessManager.address);

  // 设置BBGameMain合约的BBRoomCardNFT合约地址
  await bbGameMainContract.setRoomCardAddress(bbRoomCardNFT.address);

  // 设置BBRoomCardNFT合约的BBGameMain合约地址
  const bbRoomCardNFTContract = await ethers.getContractAt("BBRoomCardNFT", bbRoomCardNFT.address);
  await bbRoomCardNFTContract.setGameMainAddress(bbGameMain.address);

  // 设置BBGameMain合约的BBRoomLevelNFT合约地址
  await bbGameMainContract.setRoomLevelAddress(bbRoomLevelNFT.address);

  // 设置BBRoomLevelNFT合约的BBGameMain合约地址
  const bbRoomLevelNFTContract = await ethers.getContractAt("BBRoomLevelNFT", bbRoomLevelNFT.address);
  await bbRoomLevelNFTContract.setGameMainAddress(bbGameMain.address);

  // 设置BBGameMain合约的BBRewardPool合约地址
  await bbGameMainContract.setRewardPoolAddress(bbRewardPool.address);

  // 设置BBRewardPool合约的BBGameMain合约地址
  const bbRewardPoolContract = await ethers.getContractAt("BBRewardPool", bbRewardPool.address);
  await bbRewardPoolContract.setGameMainAddress(bbGameMain.address);

  // 如果不是本地网络，进行合约验证
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("等待验证...");
    try {
      // 验证 BBGameMain 合约
      await hre.run("verify:verify", {
        address: bbGameMain.address,
        constructorArguments: [],
      });
      console.log("BBGameMain 验证成功!");

      // 验证 BBGameTableImplementation 合约
      await hre.run("verify:verify", {
        address: bbGameTableImplementation.address,
        constructorArguments: [],
      });
      console.log("BBGameTableImplementation 验证成功!");

      // 验证 BBGameTableFactory 合约
      await hre.run("verify:verify", {
        address: bbGameTableFactory.address,
        constructorArguments: [],
      });
      console.log("BBGameTableFactory 验证成功!");

      // 验证 BBRandomnessManager 合约
      await hre.run("verify:verify", {
        address: bbRandomnessManager.address,
        constructorArguments: [],
      });
      console.log("BBRandomnessManager 验证成功!");

      // 验证 BBRoomCardNFT 合约
      await hre.run("verify:verify", {
        address: bbRoomCardNFT.address,
        constructorArguments: [],
      });
      console.log("BBRoomCardNFT 验证成功!");

      // 验证 BBRoomLevelNFT 合约
      await hre.run("verify:verify", {
        address: bbRoomLevelNFT.address,
        constructorArguments: [],
      });
      console.log("BBRoomLevelNFT 验证成功!");

      // 验证 BBRewardPool 合约
      await hre.run("verify:verify", {
        address: bbRewardPool.address,
        constructorArguments: [],
      });
      console.log("BBRewardPool 验证成功!");
    } catch (error) {
      console.log("验证失败:", error);
    }
  }

  const bbGameTableFactoryContract = await ethers.getContractAt("BBGameTableFactory", bbGameTableFactory.address);

  // 验证合约关联
  console.log("\n验证合约关联:");

  // BBGameMain 关联验证
  const factoryAddress = await bbGameMainContract.gameTableFactoryAddress();
  const isFactoryAddressValid = factoryAddress === bbGameTableFactory.address;
  console.log(`BBGameMain.gameTableFactoryAddress: ${factoryAddress} ${isFactoryAddressValid ? "✅" : "❌"}`);

  // BBGameTableFactory 关联验证
  // 检查工厂合约中存储的 beacon 是否正确指向 beacon 的合约
  const factoryStoredProxyAddress = await bbGameTableFactoryContract.beacon();
  const isProxyAddressValid = factoryStoredProxyAddress === bbGameTableBeacon.address; // bbGameTableImplementation.address 是其代理合约地址
  console.log(`BBGameTableFactory.beacon: ${factoryStoredProxyAddress} ${isProxyAddressValid ? "✅" : "❌"}`);

  // 验证 BBGameTableImplementation 版本号
  const bbGameTableImplementationContract = await ethers.getContractAt(
    "BBGameTableImplementation",
    bbGameTableImplementation.address,
  );
  try {
    const implVersion = await bbGameTableImplementationContract.implementationVersion();
    console.log(`BBGameTableImplementation.implementationVersion: ${implVersion}`);
  } catch (error) {
    console.log(`BBGameTableImplementation.implementationVersion: 无法读取 ❌，错误信息: ${error}`);
  }

  // 验证 BBRandomnessManager 关联
  const bbRandomnessManagerContract = await ethers.getContractAt("BBRandomnessManager", bbRandomnessManager.address);
  const randomnessManagerGameMainAddr = await bbRandomnessManagerContract.gameMainAddr();
  const isRandomnessManagerGameMainAddrValid = randomnessManagerGameMainAddr === bbGameMain.address;
  console.log(
    `BBRandomnessManager.gameMainAddr: ${randomnessManagerGameMainAddr} ${isRandomnessManagerGameMainAddrValid ? "✅" : "❌"}`,
  );

  // 验证 BBGameMain 的 randomnessManagerAddress
  const randomnessManagerAddress = await (bbGameMainContract as any).randomnessManagerAddress();
  const isRandomnessManagerAddressValid = randomnessManagerAddress === bbRandomnessManager.address;
  console.log(
    `BBGameMain.randomnessManagerAddress: ${randomnessManagerAddress} ${isRandomnessManagerAddressValid ? "✅" : "❌"}`,
  );

  // 验证 BBRoomCardNFT 关联
  const roomCardGameMainAddr = await bbRoomCardNFTContract.gameMainAddress();
  const isRoomCardGameMainAddrValid = roomCardGameMainAddr === bbGameMain.address;
  console.log(`BBRoomCardNFT.gameMainAddress: ${roomCardGameMainAddr} ${isRoomCardGameMainAddrValid ? "✅" : "❌"}`);

  // 验证 BBGameMain 的 roomCardAddress
  const roomCardAddress = await bbGameMainContract.roomCardAddress();
  const isRoomCardAddressValid = roomCardAddress === bbRoomCardNFT.address;
  console.log(`BBGameMain.roomCardAddress: ${roomCardAddress} ${isRoomCardAddressValid ? "✅" : "❌"}`);

  // 验证 BBRoomLevelNFT 关联
  const roomLevelGameMainAddr = await bbRoomLevelNFTContract.gameMainAddress();
  const isRoomLevelGameMainAddrValid = roomLevelGameMainAddr === bbGameMain.address;
  console.log(`BBRoomLevelNFT.gameMainAddress: ${roomLevelGameMainAddr} ${isRoomLevelGameMainAddrValid ? "✅" : "❌"}`);

  // 验证 BBGameMain 的 roomLevelAddress
  const roomLevelAddress = await bbGameMainContract.roomLevelAddress();
  const isRoomLevelAddressValid = roomLevelAddress === bbRoomLevelNFT.address;
  console.log(`BBGameMain.roomLevelAddress: ${roomLevelAddress} ${isRoomLevelAddressValid ? "✅" : "❌"}`);

  // 验证 BBRewardPool 关联
  const rewardPoolGameMainAddr = await bbRewardPoolContract.gameMainAddr();
  const isRewardPoolGameMainAddrValid = rewardPoolGameMainAddr === bbGameMain.address;
  console.log(`BBRewardPool.gameMainAddress: ${rewardPoolGameMainAddr} ${isRewardPoolGameMainAddrValid ? "✅" : "❌"}`);

  // 验证 BBGameMain 的 rewardPoolAddress
  const rewardPoolAddress = await bbGameMainContract.rewardPoolAddress();
  const isRewardPoolAddressValid = rewardPoolAddress === bbRewardPool.address;
  console.log(`BBGameMain.rewardPoolAddress: ${rewardPoolAddress} ${isRewardPoolAddressValid ? "✅" : "❌"}`);

  console.log("----------部署完成----------");

  // 保存部署地址到文件
  saveDeployedAddresses(hre, newDeployedAddresses);
};

deployBBGameMain.tags = ["BBDeploy"];

export default deployBBGameMain;
