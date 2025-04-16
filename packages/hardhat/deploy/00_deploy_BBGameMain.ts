import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

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
 * 部署BBGameMain合约
 *
 * @param hre HardhatRuntimeEnvironment对象
 */
const deployBBGameMain: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // 部署 BBGameHistory 合约
  console.log("----------开始部署BBGameHistory合约----------");
  const bbGameHistory = await deploy("BBGameHistory", {
    from: deployer,
    args: [], // 构造函数参数为空，因为使用initialize初始化
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS", //"OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [],
        },
      },
    },
    waitConfirmations: 1,
  });
  colorLog("BBGameHistory合约已部署到地址:", bbGameHistory.address);

  console.log("----------开始部署BBGameMain合约----------");
  // 设置初始化参数
  const minBet = ethers.parseEther("0.1"); // 最小下注金额，0.01 ETH
  const maxPlayers = 10; // 最大玩家数
  const platformFeePercent = 3; // 平台手续费百分比
  const bankerFeePercent = 3; // 庄家手续费百分比
  const liquidatorFeePercent = 5; // 清算员手续费百分比
  const playerTimeout = 180; // 玩家超时时间，单位为秒
  const tableInactiveTimeout = 1200; // 桌子空闲超时时间，单位为秒，这里是20分钟

  // 部署BBGameMain合约
  const bbGameMain = await deploy("BBGameMain", {
    from: deployer,
    args: [], // 构造函数参数为空，因为使用initialize初始化
    log: true,
    // 我们使用代理模式部署，因为合约是可升级的
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize", // 初始化函数
          args: [
            minBet,
            maxPlayers,
            platformFeePercent,
            bankerFeePercent,
            liquidatorFeePercent,
            playerTimeout,
            tableInactiveTimeout,
            ethers.ZeroAddress, // gameTableFactoryAddress
          ], // 初始化参数
        },
      },
    },
    // 等待确认
    waitConfirmations: 1,
    // gasLimit: 8000000, // Gas limit
  });

  colorLog("BBGameMain合约已部署到地址:", bbGameMain.address);

  // 部署 BBGameTableImplementation 合约
  console.log("----------开始部署BBGameTableImplementation合约----------");
  const bbGameTableImplementation = await deploy("BBGameTableImplementation", {
    from: deployer,
    args: [], // 构造函数参数为空，因为使用initialize初始化
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [
            "Demo Table", // tableName
            deployer, // bankerAddr
            ethers.parseEther("0.1"), // betAmount
            5, // maxPlayers
            bbGameMain.address, // gameMainAddr
            playerTimeout, // playerTimeout
            tableInactiveTimeout, // tableInactiveTimeout
            bbGameHistory.address, // gameHistoryAddr
            bankerFeePercent, // bankerFeePercent
            liquidatorFeePercent, // liquidatorFeePercent
            true, // bankerIsPlayer
            ethers.ZeroAddress, // rewardPoolAddr
            ethers.ZeroAddress, // randomnessManagerAddr - 先设置为零地址，后面会更新
            1, // implementationVersion
          ],
        },
      },
    },
    waitConfirmations: 1,
  });
  colorLog("BBGameTableImplementation合约已部署到地址:", bbGameTableImplementation.address);

  // 部署 BBGameTableFactory 合约
  console.log("----------开始部署BBGameTableFactory合约----------");
  const bbGameTableFactory = await deploy("BBGameTableFactory", {
    from: deployer,
    args: [], // 构造函数参数为空，因为使用initialize初始化
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [bbGameTableImplementation.address],
        },
      },
    },
    waitConfirmations: 1,
  });
  colorLog("BBGameTableFactory合约已部署到地址:", bbGameTableFactory.address);

  // 部署 BBRandomnessManager 合约
  console.log("----------开始部署BBRandomnessManager合约----------");
  const bbRandomnessManager = await deploy("BBRandomnessManager", {
    from: deployer,
    args: [], // 构造函数参数为空，因为使用initialize初始化
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [bbGameMain.address],
        },
      },
    },
    waitConfirmations: 1,
  });
  colorLog("BBRandomnessManager合约已部署到地址:", bbRandomnessManager.address);

  // 部署 BBRoomCardNFT 合约
  console.log("----------开始部署BBRoomCardNFT合约----------");
  const bbRoomCardNFT = await deploy("BBRoomCardNFT", {
    from: deployer,
    args: [], // 构造函数参数为空，因为使用initialize初始化
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [
            "Room Card", // NFT名称
            "NNRC", // NFT符号
            "https://api.niuniu.game/metadata/roomcard/", // 基础URI
          ],
        },
      },
    },
    waitConfirmations: 1,
  });
  colorLog("BBRoomCardNFT合约已部署到地址:", bbRoomCardNFT.address);

  // 部署 BBRoomLevelNFT 合约
  console.log("----------开始部署BBRoomLevelNFT合约----------");
  const bbRoomLevelNFT = await deploy("BBRoomLevelNFT", {
    from: deployer,
    args: [], // 构造函数参数为空，因为使用initialize初始化
    log: true,
    proxy: {
      owner: deployer,
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [
            "Room Level", // NFT名称
            "NNRL", // NFT符号
            "https://api.niuniu.game/metadata/roomlevel/", // 基础URI
          ],
        },
      },
    },
    waitConfirmations: 1,
  });
  colorLog("BBRoomLevelNFT合约已部署到地址:", bbRoomLevelNFT.address);

  // 设置BBGameHistory合约的BBGameMain合约地址
  console.log("----------设置BBGameHistory合约的BBGameMain合约地址----------");
  const bbGameHistoryContract = await ethers.getContractAt("BBGameHistory", bbGameHistory.address);
  await bbGameHistoryContract.setGameMainAddress(bbGameMain.address);
  console.log("BBGameHistory合约的BBGameMain合约地址已设置为:", bbGameMain.address);

  // 设置BBGameMain合约的BBGameHistory合约地址
  console.log("----------设置BBGameMain合约的BBGameHistory合约地址----------");
  const bbGameMainContract = await ethers.getContractAt("BBGameMain", bbGameMain.address);
  await bbGameMainContract.setGameHistoryAddress(bbGameHistory.address);
  console.log("BBGameMain合约的BBGameHistory合约地址已设置为:", bbGameHistory.address);

  // 设置BBGameMain合约的BBGameTableFactory合约地址
  console.log("----------设置BBGameMain合约的BBGameTableFactory合约地址----------");
  await bbGameMainContract.setGameTableFactoryAddress(bbGameTableFactory.address);
  console.log("BBGameMain合约的BBGameTableFactory合约地址已设置为:", bbGameTableFactory.address);

  // 设置BBGameMain合约的BBRandomnessManager合约地址
  console.log("----------设置BBGameMain合约的BBRandomnessManager合约地址----------");
  await bbGameMainContract.setRandomnessManagerAddress(bbRandomnessManager.address);
  console.log("BBGameMain合约的BBRandomnessManager合约地址已设置为:", bbRandomnessManager.address);

  // 设置BBGameMain合约的BBRoomCardNFT合约地址
  console.log("----------设置BBGameMain合约的BBRoomCardNFT合约地址----------");
  await bbGameMainContract.setRoomCardAddress(bbRoomCardNFT.address);
  console.log("BBGameMain合约的BBRoomCardNFT合约地址已设置为:", bbRoomCardNFT.address);

  // 设置BBRoomCardNFT合约的BBGameMain合约地址
  console.log("----------设置BBRoomCardNFT合约的BBGameMain合约地址----------");
  const bbRoomCardNFTContract = await ethers.getContractAt("BBRoomCardNFT", bbRoomCardNFT.address);
  await bbRoomCardNFTContract.setGameMainAddress(bbGameMain.address);
  console.log("BBRoomCardNFT合约的BBGameMain合约地址已设置为:", bbGameMain.address);

  // 设置BBGameMain合约的BBRoomLevelNFT合约地址
  console.log("----------设置BBGameMain合约的BBRoomLevelNFT合约地址----------");
  await bbGameMainContract.setRoomLevelAddress(bbRoomLevelNFT.address);
  console.log("BBGameMain合约的BBRoomLevelNFT合约地址已设置为:", bbRoomLevelNFT.address);

  // 设置BBRoomLevelNFT合约的BBGameMain合约地址
  console.log("----------设置BBRoomLevelNFT合约的BBGameMain合约地址----------");
  const bbRoomLevelNFTContract = await ethers.getContractAt("BBRoomLevelNFT", bbRoomLevelNFT.address);
  await bbRoomLevelNFTContract.setGameMainAddress(bbGameMain.address);
  console.log("BBRoomLevelNFT合约的BBGameMain合约地址已设置为:", bbGameMain.address);

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

      // 验证 BBGameHistory 合约
      await hre.run("verify:verify", {
        address: bbGameHistory.address,
        constructorArguments: [],
      });
      console.log("BBGameHistory 验证成功!");

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
    } catch (error) {
      console.log("验证失败:", error);
    }
  }

  // 在部署完成后添加验证代码
  console.log("验证初始化参数:");
  console.log("BBGameMain 参数:");
  console.log("minBet:", await bbGameMainContract.minBet());
  console.log("maxPlayers:", await bbGameMainContract.maxPlayers());
  console.log("liquidatorFeePercent:", await bbGameMainContract.liquidatorFeePercent());

  // 验证 BBGameTableFactory 参数
  console.log("BBGameTableFactory 参数:");
  const bbGameTableFactoryContract = await ethers.getContractAt("BBGameTableFactory", bbGameTableFactory.address);
  console.log("proxyAddress:", await bbGameTableFactoryContract.proxyAddress());
  console.log("version:", await bbGameTableFactoryContract.version());

  // 验证合约关联
  console.log("\n验证合约关联:");

  // BBGameMain 关联验证
  const factoryAddress = await bbGameMainContract.gameTableFactoryAddress();
  const isFactoryAddressValid = factoryAddress === bbGameTableFactory.address;
  console.log(`BBGameMain.gameTableFactoryAddress: ${factoryAddress} ${isFactoryAddressValid ? "✅" : "❌"}`);

  const historyAddress = await bbGameMainContract.gameHistoryAddress();
  const isHistoryAddressValid = historyAddress === bbGameHistory.address;
  console.log(`BBGameMain.gameHistoryAddress: ${historyAddress} ${isHistoryAddressValid ? "✅" : "❌"}`);

  // BBGameHistory 关联验证
  const mainAddress = await bbGameHistoryContract.gameMainAddr();
  const isMainAddressValid = mainAddress === bbGameMain.address;
  console.log(`BBGameHistory.gameMainAddr: ${mainAddress} ${isMainAddressValid ? "✅" : "❌"}`);

  // BBGameTableFactory 关联验证
  // 检查工厂合约中存储的 proxyAddress 是否正确指向 BBGameTableImplementation 的代理合约
  const factoryStoredProxyAddress = await bbGameTableFactoryContract.proxyAddress();
  const isProxyAddressValid = factoryStoredProxyAddress === bbGameTableImplementation.address; // bbGameTableImplementation.address 是其代理合约地址
  console.log(`BBGameTableFactory.proxyAddress: ${factoryStoredProxyAddress} ${isProxyAddressValid ? "✅" : "❌"}`);

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

  console.log("----------部署完成----------");
};

deployBBGameMain.tags = ["BBDeploy"];

export default deployBBGameMain;
