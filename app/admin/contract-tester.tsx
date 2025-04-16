"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { Card, Input, Button, Textarea, Select, Divider } from "@/components/ui";

export default function ContractTester() {
  const [contractAddress, setContractAddress] = useState("");
  const [abi, setAbi] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [functionParams, setFunctionParams] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableFunctions, setAvailableFunctions] = useState<string[]>([]);
  const [functionType, setFunctionType] = useState<"read" | "write">("read");

  // 解析ABI并提取函数名
  const parseAbi = (abiString: string) => {
    try {
      const parsedAbi = JSON.parse(abiString);
      const functions = parsedAbi
        .filter((item: any) => item.type === "function")
        .map((item: any) => ({
          name: item.name,
          type: item.stateMutability === "view" || item.stateMutability === "pure" ? "read" : "write",
        }));
      
      setAvailableFunctions(functions.map((f: any) => f.name));
      return true;
    } catch (e) {
      setError("ABI 解析错误，请检查格式");
      return false;
    }
  };

  // 当ABI输入变化时解析
  const handleAbiChange = (value: string) => {
    setAbi(value);
    if (value.trim()) {
      parseAbi(value);
    } else {
      setAvailableFunctions([]);
    }
  };

  // 当选择函数时，自动设置函数类型
  const handleFunctionSelect = (funcName: string) => {
    setFunctionName(funcName);
    try {
      const parsedAbi = JSON.parse(abi);
      const funcInfo = parsedAbi.find((item: any) => 
        item.type === "function" && item.name === funcName
      );
      
      if (funcInfo) {
        setFunctionType(
          funcInfo.stateMutability === "view" || funcInfo.stateMutability === "pure" 
            ? "read" 
            : "write"
        );
      }
    } catch (e) {
      console.error("解析函数类型时出错", e);
    }
  };

  // 解析函数参数
  const parseParams = (paramsString: string) => {
    if (!paramsString.trim()) return [];
    
    try {
      return JSON.parse(paramsString);
    } catch (e) {
      throw new Error("参数格式错误，请使用JSON数组格式，例如: [123, \"0x123...\"]");
    }
  };

  // 调用合约
  const callContract = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!contractAddress) throw new Error("请输入合约地址");
      if (!abi) throw new Error("请输入合约ABI");
      if (!functionName) throw new Error("请选择要调用的函数");

      // 解析参数
      const params = functionParams ? parseParams(functionParams) : [];

      // 创建provider
      const provider = new ethers.providers.JsonRpcProvider();
      
      // 创建合约实例
      let contract;
      let response;

      if (functionType === "read") {
        // 只读调用不需要私钥
        contract = new ethers.Contract(contractAddress, JSON.parse(abi), provider);
        response = await contract[functionName](...params);
      } else {
        // 写入调用需要私钥
        if (!privateKey) throw new Error("写入操作需要提供私钥");
        
        const wallet = new ethers.Wallet(privateKey, provider);
        contract = new ethers.Contract(contractAddress, JSON.parse(abi), wallet);
        
        const tx = await contract[functionName](...params);
        response = await tx.wait();
      }

      setResult(response);
    } catch (err: any) {
      console.error("合约调用错误:", err);
      setError(err.message || "调用合约时发生错误");
    } finally {
      setLoading(false);
    }
  };

  // 格式化结果显示
  const formatResult = (result: any) => {
    if (result === null) return "";
    
    try {
      // 处理BigNumber类型
      const replacer = (key: string, value: any) => {
        if (value && value._isBigNumber) {
          return value.toString();
        }
        return value;
      };
      
      return JSON.stringify(result, replacer, 2);
    } catch (e) {
      return String(result);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">智能合约测试工具</h1>
      
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">合约地址</label>
            <Input
              placeholder="输入合约地址 (0x...)"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">合约 ABI</label>
            <Textarea
              placeholder="粘贴合约ABI (JSON格式)"
              value={abi}
              onChange={(e) => handleAbiChange(e.target.value)}
              className="w-full h-32"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">选择函数</label>
            <Select
              value={functionName}
              onValueChange={handleFunctionSelect}
              disabled={availableFunctions.length === 0}
            >
              <Select.Trigger className="w-full">
                <Select.Value placeholder="选择要调用的函数" />
              </Select.Trigger>
              <Select.Content>
                {availableFunctions.map((func) => (
                  <Select.Item key={func} value={func}>
                    {func}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">函数参数 (JSON数组格式)</label>
            <Textarea
              placeholder='例如: [123, "0x123..."]'
              value={functionParams}
              onChange={(e) => setFunctionParams(e.target.value)}
              className="w-full h-20"
            />
          </div>
          
          {functionType === "write" && (
            <div>
              <label className="block text-sm font-medium mb-2">私钥 (仅写入操作需要)</label>
              <Input
                type="password"
                placeholder="输入私钥 (0x...)"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                注意：私钥仅在本地使用，不会发送到任何服务器
              </p>
            </div>
          )}
          
          <div className="flex items-center">
            <span className="mr-2 text-sm">函数类型:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              functionType === "read" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
            }`}>
              {functionType === "read" ? "只读" : "写入"}
            </span>
          </div>
          
          <Button 
            onClick={callContract} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "调用中..." : "调用合约"}
          </Button>
        </div>
      </Card>
      
      {error && (
        <Card className="p-6 mb-8 border-red-300 bg-red-50">
          <h2 className="text-xl font-semibold text-red-700 mb-2">错误</h2>
          <p className="text-red-600">{error}</p>
        </Card>
      )}
      
      {result !== null && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">调用结果</h2>
          <Divider className="my-4" />
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {formatResult(result)}
          </pre>
        </Card>
      )}
    </div>
  );
}
