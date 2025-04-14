import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

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
  console.log("部署账户:", deployer);
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
  console.log("BBGameHistory合约已部署到地址:", bbGameHistory.address);

  console.log("----------开始部署BBGameMain合约----------");
  console.log("部署账户:", deployer);

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
          ], // 初始化参数
        },
      },
    },
    // 等待确认
    waitConfirmations: 1,
    // gasLimit: 8000000, // Gas limit
  });

  console.log("BBGameMain合约已部署到地址:", bbGameMain.address);

  // 设置BBGameMain合约的BBGameHistory合约地址
  console.log("----------设置BBGameMain合约的BBGameHistory合约地址----------");
  const bbGameMainContract = await ethers.getContractAt("BBGameMain", bbGameMain.address);
  await bbGameMainContract.setGameHistoryAddress(bbGameHistory.address);
  // await bbGameMainContract.setParams(minBet, maxPlayers, houseFeePercent, playerTimeout, tableInactiveTimeout);
  console.log("BBGameMain合约的BBGameHistory合约地址已设置为:", bbGameHistory.address);

  // 设置BBGameHistory合约的BBGameMain合约地址
  console.log("----------设置BBGameHistory合约的BBGameMain合约地址----------");
  const bbGameHistoryContract = await ethers.getContractAt("BBGameHistory", bbGameHistory.address);
  await bbGameHistoryContract.setGameMainAddress(bbGameMain.address);
  console.log("BBGameHistory合约的BBGameMain合约地址已设置为:", bbGameMain.address);

  // 如果不是本地网络，进行合约验证
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("等待验证...");
    try {
      await hre.run("verify:verify", {
        address: bbGameMain.address,
        constructorArguments: [],
      });
      console.log("验证成功!");
    } catch (error) {
      console.log("验证失败:", error);
    }
  }

  // 在部署完成后添加验证代码
  console.log("验证初始化参数:");
  console.log("minBet:", await bbGameMainContract.minBet());
  console.log("maxPlayers:", await bbGameMainContract.maxPlayers());
  console.log("platformFeePercent:", await bbGameMainContract.platformFeePercent());
  console.log("bankerFeePercent:", await bbGameMainContract.bankerFeePercent());
  console.log("liquidatorFeePercent:", await bbGameMainContract.liquidatorFeePercent());
};

deployBBGameMain.tags = ["BBDeploy"];

export default deployBBGameMain;
