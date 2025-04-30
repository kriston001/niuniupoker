"use client";

import { FC } from "react";

// 网络图标映射类型
export type NetworkIconName = 
  | "ethereum" 
  | "polygon" 
  | "bsc" 
  | "arbitrum" 
  | "optimism" 
  | "base"
  | "avalanche"
  | "sepolia"
  | "goerli"
  | "mumbai"
  | "hardhat"
  | "localhost"
  | "monad"
  | string; // 支持其他未知网络

interface NetworkIconProps {
  name: NetworkIconName;
  size?: number;
  className?: string;
}

// 网络图标组件
export const NetworkIcon: FC<NetworkIconProps> = ({ name, size = 16, className = "" }) => {
  // 将网络名称转换为小写，用于匹配
  const networkName = name.toLowerCase();
  
  // 处理网络名称，提取主要部分（去除 "testnet" 等后缀）
  let mainNetworkName = networkName;
  
  // 如果网络名称包含空格，取第一个单词作为主要网络名称
  if (networkName.includes(" ")) {
    mainNetworkName = networkName.split(" ")[0];
  }
  
  // 网络颜色映射（用于生成背景色和阴影）
  const colorMapping: Record<string, string> = {
    ethereum: "#627eea",
    polygon: "#8247e5",
    bsc: "#f3ba2f",
    arbitrum: "#28a0f0",
    optimism: "#ff0420",
    base: "#0052ff",
    avalanche: "#e84142",
    monad: "#8A70FF",
    "monad testnet": "#8A70FF", // 添加 Monad Testnet 的颜色
    sepolia: "#5f4bb6",
    goerli: "#f6c343",
    mumbai: "#92a5f0",
    hardhat: "#fff100",
    localhost: "#00ff8c",
  };
  
  // 获取网络颜色，如果没有匹配则使用默认颜色
  const color = colorMapping[networkName] || colorMapping[mainNetworkName] || "#cccccc";
  
  // SVG 图标映射
  const renderNetworkIcon = () => {
    // 使用主要网络名称来选择图标
    switch (mainNetworkName) {
      case "ethereum":
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#627EEA"/>
            <path d="M16.498 4V12.87L23.995 16.22L16.498 4Z" fill="white" fillOpacity="0.602"/>
            <path d="M16.498 4L9 16.22L16.498 12.87V4Z" fill="white"/>
            <path d="M16.498 21.968V27.995L24 17.616L16.498 21.968Z" fill="white" fillOpacity="0.602"/>
            <path d="M16.498 27.995V21.967L9 17.616L16.498 27.995Z" fill="white"/>
            <path d="M16.498 20.573L23.995 16.22L16.498 12.872V20.573Z" fill="white" fillOpacity="0.2"/>
            <path d="M9 16.22L16.498 20.573V12.872L9 16.22Z" fill="white" fillOpacity="0.602"/>
          </svg>
        );
      
      case "polygon":
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#8247E5"/>
            <path d="M21.092 13.12C20.651 12.866 20.071 12.866 19.591 13.12L16.711 14.758L14.731 15.904L11.851 17.542C11.411 17.796 10.831 17.796 10.351 17.542C9.91 17.288 9.63 16.819 9.63 16.311V13.073C9.63 12.565 9.87 12.096 10.351 11.842C10.791 11.588 11.371 11.588 11.851 11.842L14.731 13.481L15.771 12.873L12.891 11.235C11.971 10.727 10.831 10.727 9.91 11.235C8.99 11.742 8.43 12.719 8.43 13.735V16.973C8.43 17.988 8.99 18.965 9.91 19.473C10.831 19.981 11.971 19.981 12.891 19.473L15.771 17.835L17.751 16.689L20.631 15.05C21.071 14.796 21.651 14.796 22.131 15.05C22.571 15.304 22.851 15.773 22.851 16.281V19.519C22.851 20.027 22.611 20.496 22.131 20.75C21.691 21.004 21.111 21.004 20.631 20.75L17.751 19.112L16.711 19.719L19.591 21.358C20.511 21.866 21.651 21.866 22.571 21.358C23.491 20.85 24.051 19.873 24.051 18.857V15.619C24.051 14.604 23.491 13.627 22.571 13.12C22.091 12.866 21.531 12.866 21.092 13.12Z" fill="white"/>
          </svg>
        );
        
      case "bsc":
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#F3BA2F"/>
            <path d="M12.116 14.404L16 10.52L19.886 14.406L22.146 12.146L16 6L9.856 12.144L12.116 14.404Z" fill="white"/>
            <path d="M10.518 16.002L8.258 13.742L6 16.002L8.26 18.262L10.518 16.002Z" fill="white"/>
            <path d="M12.116 17.6L16 21.484L19.886 17.598L22.146 19.854L16 26L9.856 19.856L12.116 17.6Z" fill="white"/>
            <path d="M21.484 16.002L23.744 13.742L26.002 16.002L23.742 18.262L21.484 16.002Z" fill="white"/>
            <path d="M16.002 14.404L18.262 16.664L16.002 18.924L13.742 16.664L16.002 14.404Z" fill="white"/>
          </svg>
        );
        
      case "arbitrum":
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#28A0F0"/>
            <path d="M21.294 22.754H18.957L15.756 17.492L13.374 22.754H11.204L14.635 15.648L11.374 9.246H13.711L16.912 14.508L19.294 9.246H21.464L18.033 16.352L21.294 22.754Z" fill="white"/>
          </svg>
        );
        
      case "optimism":
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#FF0420"/>
            <path d="M10.88 9.76H14.08C16.3734 9.76 18.24 11.6266 18.24 13.92V22.24H15.04V13.92C15.04 13.3918 14.6082 12.96 14.08 12.96H10.88V9.76Z" fill="white"/>
            <path d="M21.12 22.24H17.92C15.6266 22.24 13.76 20.3734 13.76 18.08V9.76H16.96V18.08C16.96 18.6082 17.3918 19.04 17.92 19.04H21.12V22.24Z" fill="white"/>
          </svg>
        );
        
      case "base":
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#0052FF"/>
            <path d="M16 6C10.48 6 6 10.48 6 16C6 21.52 10.48 26 16 26C21.52 26 26 21.52 26 16C26 10.48 21.52 6 16 6ZM16 22.4C12.464 22.4 9.6 19.536 9.6 16C9.6 12.464 12.464 9.6 16 9.6C19.536 9.6 22.4 12.464 22.4 16C22.4 19.536 19.536 22.4 16 22.4Z" fill="white"/>
          </svg>
        );
        
      case "avalanche":
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#E84142"/>
            <path d="M20.5 22.375H23.5L16 9.625L8.5 22.375H11.5L16 14.375L20.5 22.375Z" fill="white"/>
            <path d="M14.5 17.375L12.5 20.875H18.5L16.5 17.375H14.5Z" fill="white"/>
          </svg>
        );
        
      case "monad":
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#8A70FF"/>
            <path d="M16 4C23.732 4 30 10.268 30 18C30 25.732 23.732 32 16 32C8.268 32 2 25.732 2 18C2 10.268 8.268 4 16 4Z" fill="#8A70FF"/>
            <path d="M22 16C22 19.314 19.314 22 16 22C12.686 22 10 19.314 10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16Z" fill="white"/>
            <path d="M16 22C12.686 22 10 19.314 10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16C22 19.314 19.314 22 16 22ZM16 12C13.794 12 12 13.794 12 16C12 18.206 13.794 20 16 20C18.206 20 20 18.206 20 16C20 13.794 18.206 12 16 12Z" fill="white"/>
          </svg>
        );
        
      case "hardhat":
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#FFF100"/>
            <path d="M7 18.5L16 6L25 18.5H7Z" fill="#FFCC00"/>
            <path d="M16 21C17.6569 21 19 19.6569 19 18C19 16.3431 17.6569 15 16 15C14.3431 15 13 16.3431 13 18C13 19.6569 14.3431 21 16 21Z" fill="#FFCC00"/>
            <path d="M7 18.5H25V20.5C25 22.7091 23.2091 24.5 21 24.5H11C8.79086 24.5 7 22.7091 7 20.5V18.5Z" fill="#FFC800"/>
          </svg>
        );
        
      case "localhost":
        return (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#00FF8C"/>
            <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8ZM16 22C12.6863 22 10 19.3137 10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22Z" fill="white"/>
            <path d="M16 12C13.7909 12 12 13.7909 12 16C12 18.2091 13.7909 20 16 20C18.2091 20 20 18.2091 20 16C20 13.7909 18.2091 12 16 12ZM16 18C14.8954 18 14 17.1046 14 16C14 14.8954 14.8954 14 16 14C17.1046 14 18 14.8954 18 16C18 17.1046 17.1046 18 16 18Z" fill="white"/>
          </svg>
        );
        
      default:
        // 对于未知网络，显示带有网络首字母的彩色圆圈
        const initial = name.charAt(0).toUpperCase();
        return (
          <div 
            className="flex items-center justify-center w-full h-full"
            style={{ fontSize: size * 0.6, fontWeight: "bold", color: "#fff" }}
          >
            {initial}
          </div>
        );
    }
  };
  
  return (
    <div 
      className={`rounded-full overflow-hidden ${className}`}
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}`,
      }}
    >
      {renderNetworkIcon()}
    </div>
  );
};
