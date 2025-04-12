import { PublicClient } from "viem";

export class NonceManager {
  private publicClient: PublicClient;
  private address: `0x${string}`;
  private currentNonce: number | null = null;
  private pendingCount = 0;
  private noncePromise: Promise<number> | null = null;

  constructor(publicClient: PublicClient, address: `0x${string}`) {
    this.publicClient = publicClient;
    this.address = address;
  }

  /**
   * 获取下一个可用的 nonce
   */
  async getNonce(): Promise<number> {
    if (this.noncePromise === null) {
      // 如果没有正在进行的 nonce 请求，创建一个新的
      this.noncePromise = this.publicClient
        .getTransactionCount({
          address: this.address,
          blockTag: "pending",
        })
        .then(nonce => {
          console.log(`[NonceManager] 从链上获取 nonce: ${nonce} 用于地址: ${this.address}`);
          this.currentNonce = nonce;
          return nonce;
        });
    }

    // 等待 nonce 请求完成
    const baseNonce = await this.noncePromise;

    // 计算当前 nonce (基础 nonce + 待处理交易数)
    const nonce = baseNonce + this.pendingCount;

    // 增加待处理交易计数
    this.pendingCount++;

    console.log(`[NonceManager] 使用 nonce: ${nonce} (基础: ${baseNonce}, 待处理: ${this.pendingCount})`);
    return nonce;
  }

  /**
   * 重置 nonce 管理器状态
   */
  async resetNonce(): Promise<number> {
    console.log(`[NonceManager] 重置 nonce 用于地址: ${this.address}`);

    // 从链上获取最新的 nonce
    this.noncePromise = this.publicClient
      .getTransactionCount({
        address: this.address,
        blockTag: "latest",
      })
      .then(nonce => {
        console.log(`[NonceManager] 重置后的 nonce: ${nonce}`);
        this.currentNonce = nonce;
        return nonce;
      });

    // 重置待处理交易计数
    this.pendingCount = 0;

    return await this.noncePromise;
  }

  /**
   * 标记一个交易已确认
   */
  transactionConfirmed(): void {
    if (this.pendingCount > 0) {
      this.pendingCount--;
      console.log(`[NonceManager] 交易已确认，剩余待处理交易: ${this.pendingCount}`);
    }

    // 如果没有待处理的交易，重置 nonce 缓存
    if (this.pendingCount === 0) {
      this.noncePromise = null;
      console.log(`[NonceManager] 所有交易已确认，重置 nonce 缓存`);
    }
  }

  /**
   * 标记一个交易失败
   */
  transactionFailed(error: any): void {
    // 检查是否是 nonce 相关错误
    const errorMessage = error?.message?.toLowerCase() || "";
    const isNonceError =
      errorMessage.includes("nonce") ||
      errorMessage.includes("replacement transaction underpriced") ||
      errorMessage.includes("transaction underpriced");

    if (isNonceError) {
      console.log(`[NonceManager] 检测到 nonce 错误，重置 nonce 管理器`);
      this.resetNonce();
    } else if (this.pendingCount > 0) {
      // 如果不是 nonce 错误但有待处理交易，减少计数
      this.pendingCount--;
      console.log(`[NonceManager] 交易失败，剩余待处理交易: ${this.pendingCount}`);
    }
  }
}
