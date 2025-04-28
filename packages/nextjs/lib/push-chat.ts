import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";
import { createSocketConnection, EVENTS } from "@pushprotocol/socket";
import debug from "debug";

// 消息类型定义
export interface ChatMessage {
  messageContent: string;
  senderAddress: string;
  timestamp: Date;
  messageType?: string;
  messageId?: string;
}

/**
 * PushChat 类 - 处理与Push Protocol聊天相关的所有功能
 */
export class PushChat {
  private address: string;
  private walletClient: any;
  private socketRef: React.MutableRefObject<any> | null = null;
  private userInstance: any = null;
  private cleanupFunctions: Array<() => void> = [];

  /**
   * 构造函数
   * @param address 用户地址
   * @param walletClient 钱包客户端
   * @param socketRef Socket引用（可选）
   */
  constructor(
    address: string,
    walletClient: any,
    socketRef?: React.MutableRefObject<any>
  ) {
    this.address = address;
    this.walletClient = walletClient;
    this.socketRef = socketRef || null;
  }

  /**
   * 创建签名者适配器
   * @private
   */
  private createSigner() {
    return {
      getAddress: async () => this.address,
      signMessage: async (message: string | Uint8Array) => {
        const signature = await this.walletClient.signMessage({
          message: typeof message === 'string' ? message : new TextDecoder().decode(message)
        });
        return signature;
      },
      signTypedData: async () => {
        throw new Error("signTypedData not implemented");
      }
    };
  }

  /**
   * 获取或初始化 Push User 实例
   * @returns Push User 实例
   */
  async getUserInstance() {
    if (this.userInstance) {
      return this.userInstance;
    }
    
    // 创建签名者适配器
    const signer = this.createSigner();
    
    // 初始化 Push User
    this.userInstance = await PushAPI.initialize(signer, { env: CONSTANTS.ENV.PROD });
    return this.userInstance;
  }

  /**
   * 创建聊天群组
   * @param groupName 群组名称
   * @param groupDescription 群组描述
   * @returns 返回创建的群组ID
   */
  async createChatGroup(groupName: string, groupDescription: string): Promise<string | null> {
    if (!groupName) return null;
    
    try {
      console.log("Creating chat group:", groupName);
      
      // 获取 Push User 实例
      const userInstance = await this.getUserInstance();
      
      // 准备群组数据
      const groupImage = "https://raw.githubusercontent.com/ethereum/ethereum-org-website/dev/src/assets/eth-diamond-black-white.png";
      
      // 创建群组
      const group = await userInstance.chat.group.create(
        groupName,
        {
          description: groupDescription,
          image: groupImage,
          members: [],
          admins: [],
          private: false,
          // rules: {
          //   entry: {
          //     conditions: 'open' // 任何人都可以加入
          //   }
          // }
        }
      );
      
      console.log("Created group:", group);
      
      if (group && group.chatId) {
        return group.chatId;
      }
      
      return null;
    } catch (e) {
      console.error("Error creating chat group:", e);
      return null;
    }
  }

  /**
   * 检查用户是否是群组成员
   * @param chatGroupId 群组ID
   * @returns 是否是成员
   */
  async isGroupMember(chatGroupId: string): Promise<boolean> {
    if (!this.walletClient || !this.address || !chatGroupId) {
      console.log("Cannot check group membership: missing required data");
      return false;
    }

    try {
      // 获取 Push User 实例 - 这一步会触发钱包签名
      console.log("Getting user instance for membership check");
      const userInstance = await this.getUserInstance();
      console.log("User instance obtained");
      
      try {
        // 使用最新的 Push Protocol API 检查用户是否是群组成员
        console.log("Checking if user is a member of group:", chatGroupId);
        
        // 首先尝试获取群组信息 - 这个操作不需要用户是成员
        const group = await userInstance.chat.group.info(chatGroupId);
        console.log("Group info retrieved:", group);
        
        if (!group) {
          console.log("Group not found");
          return false;
        }
        
        // 然后检查用户是否是成员
        try {
          const participantStatus = await userInstance.chat.group.participants.status(
            chatGroupId,
            this.address
          );
          
          console.log("Participant status:", participantStatus);
          
          // 如果 participant 为 true，则用户是群组成员
          const isMember = participantStatus && participantStatus.participant === true;
          
          console.log("Is member:", isMember);
          
          return isMember;
        } catch (statusError) {
          console.log("Error checking participant status, assuming not a member:", statusError);
          return false;
        }
      } catch (error) {
        console.error("Error checking group info:", error);
        return false;
      }
    } catch (error) {
      console.error("Error checking group membership:", error);
      return false;
    }
  }

  /**
   * 加入聊天群组
   * @param chatGroupId 群组ID
   * @returns 是否加入成功
   */
  async joinChatGroup(chatGroupId: string): Promise<boolean> {
    if (!this.walletClient || !this.address || !chatGroupId) {
      console.log("Cannot join chat group: missing required data");
      return false;
    }

    try {
      // 获取 Push User 实例
      const userInstance = await this.getUserInstance();
      
      // 检查群组是否存在并加入
      try {
        const group = await userInstance.chat.group.info(chatGroupId);
        console.log("Found chat group, attempting to join:", group);
        
        // 加入群组 - API会处理用户是否已经是成员的情况
        await userInstance.chat.group.join(chatGroupId);
        console.log("Successfully joined chat group:", chatGroupId);
        
        return true;
      } catch (e) {
        console.error("Error joining chat group:", e);
        return false;
      }
    } catch (error) {
      console.error("Failed to initialize Push Protocol:", error);
      return false;
    }
  }

  /**
   * 离开聊天群组
   * @param chatGroupId 群组ID
   * @returns 是否离开成功
   */
  async leaveChatGroup(chatGroupId: string): Promise<boolean> {
    if (!chatGroupId) {
      console.log("Cannot leave chat group: missing required data");
      return false;
    }

    try {
      // 获取 Push User 实例
      const userInstance = await this.getUserInstance();
      
      // 离开群组
      await userInstance.chat.group.leave(chatGroupId);
      console.log("Successfully left chat group:", chatGroupId);
      
      return true;
    } catch (e) {
      console.error("Error leaving chat group:", e);
      return false;
    }
  }

  /**
   * 发送消息到群组
   * @param chatGroupId 聊天群组ID
   * @param chatMessage 消息内容
   * @returns 是否发送成功
   */
  async sendMessage(chatGroupId: string, chatMessage: string): Promise<boolean> {
    if (!chatMessage.trim() || !chatGroupId) return false;

    try {
      // 获取 Push User 实例
      const userInstance = await this.getUserInstance();
      
      // 发送消息
      await userInstance.chat.send(chatGroupId, {
        content: chatMessage,
        type: 'Text'
      });
      
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      return false;
    }
  }

  /**
   * 获取群组历史消息
   * @param chatGroupId 群组ID
   * @returns 消息列表
   */
  async getChatHistory(chatGroupId: string): Promise<ChatMessage[]> {
    if (!chatGroupId) {
      console.log("Cannot get chat history: missing required data");
      return [];
    }

    try {
      // 获取 Push User 实例
      const userInstance = await this.getUserInstance();
      
      // 获取历史消息
      const history = await userInstance.chat.history(chatGroupId);
      console.log("Loaded history:", history);
      
      if (history && Array.isArray(history)) {
        return history.map(msg => ({
          messageContent: msg.messageContent || '',
          senderAddress: msg.fromDID?.substring(7) || '',
          timestamp: new Date(msg.timestamp || Date.now()),
          messageType: msg.messageType,
          messageId: msg.messageId
        }));
      }
      
      return [];
    } catch (e) {
      console.error("Error loading chat history:", e);
      return [];
    }
  }

  /**
   * 获取群组信息
   * @param chatGroupId 群组ID
   * @returns 群组信息
   */
  async getGroupInfo(chatGroupId: string): Promise<any> {
    if (!chatGroupId) {
      console.log("Cannot get group info: missing required data");
      return null;
    }

    try {
      // 获取 Push User 实例
      const userInstance = await this.getUserInstance();
      
      // 获取群组信息
      const group = await userInstance.chat.group.info(chatGroupId);
      return group;
    } catch (e) {
      console.error("Error getting group info:", e);
      return null;
    }
  }

  /**
   * 设置消息监听器
   * @param chatGroupId 群组ID
   * @param onMessageReceived 消息接收回调
   */
  setupChatListener(chatGroupId: string, onMessageReceived: (message: ChatMessage) => void) {
    if (!chatGroupId) {
      console.log("Cannot setup chat listener: missing required data");
      return;
    }

    this.getUserInstance().then(userInstance => {
      try {
        // 建立socket连接
        const pushSocket = createSocketConnection({
          user: this.address,
          env: CONSTANTS.ENV.PROD,
          socketType: 'chat',
          socketOptions: { autoConnect: true, reconnectionAttempts: 5 }
        });
  
        if (pushSocket) {
          // 连接成功事件
          pushSocket.on('connect', () => {
            console.log('Socket连接成功');
          });
  
          // 断开连接事件
          pushSocket.on('disconnect', () => {
            console.log('Socket断开连接');
          });
  
          // 监听消息事件
          pushSocket.on(EVENTS.CHAT_RECEIVED_MESSAGE, (message: any) => {
            console.log('收到新消息:', message);
            
            // 如果消息来自当前群组，通知外部
            if (message && message.chatId === chatGroupId) {
              const newMessage: ChatMessage = {
                messageContent: message.messageContent || '',
                senderAddress: message.fromDID?.substring(7) || '',
                timestamp: new Date(message.timestamp || Date.now()),
                messageType: message.messageType,
                messageId: message.messageId
              };
              
              onMessageReceived(newMessage);
            }
          });
  
          // 保存socket引用以便后续清理
          if (this.socketRef) {
            this.socketRef.current = pushSocket;
          }
          
          // 添加清理函数
          this.cleanupFunctions.push(() => {
            pushSocket.disconnect();
          });
        }
      } catch (e) {
        console.error("Error setting up message listener:", e);
      }
      
      // 启动消息流监听
      this.startMessageStream(userInstance, chatGroupId, onMessageReceived);
    });
  }

  /**
   * 启动消息流监听
   * @param userInstance Push用户实例
   * @param chatGroupId 群组ID
   * @param onMessageReceived 消息接收回调
   */
  async startMessageStream(
    userInstance: any, 
    chatGroupId: string, 
    onMessageReceived: (message: ChatMessage) => void
  ) {
    try {
      // 使用stream API监听新消息
      const stream = await userInstance.chat.stream();
      
      // 监听消息事件
      stream.on(CONSTANTS.STREAM.CHAT, (message: any) => {
        console.log('Stream message received:', message);
        
        // 如果消息来自当前群组，添加到消息列表
        if (message && message.chatId === chatGroupId) {
          const newMessage: ChatMessage = {
            messageContent: message.messageContent || '',
            senderAddress: message.fromDID?.substring(7) || '',
            timestamp: new Date(message.timestamp || Date.now()),
            messageType: message.messageType,
            messageId: message.messageId
          };
          
          onMessageReceived(newMessage);
        }
      });

      // 监听连接事件
      stream.on(CONSTANTS.STREAM.CONNECT, () => {
        console.log('Stream connected');
      });

      // 监听断开事件
      stream.on(CONSTANTS.STREAM.DISCONNECT, () => {
        console.log('Stream disconnected');
      });
      
      // 添加清理函数
      this.cleanupFunctions.push(() => {
        stream.disconnect();
      });
    } catch (e) {
      console.error("Error starting message stream:", e);
    }
  }

  /**
   * 格式化地址显示
   * @param addr 地址
   * @param playerAddresses 玩家地址列表
   * @param bankerAddr 庄家地址
   * @returns 格式化后的地址
   */
  formatAddress(
    addr: string,
    playerAddresses: string[] | undefined,
    bankerAddr: string | undefined
  ): string {
    if (!addr) return "Unknown";
    if (addr.toLowerCase() === this.address?.toLowerCase()) return "You";
    
    // 检查是否是玩家地址，如果是则显示玩家位置
    const playerIndex = playerAddresses?.findIndex(
      playerAddr => playerAddr?.toLowerCase() === addr.toLowerCase()
    );
    
    if (playerIndex !== undefined && playerIndex >= 0) {
      return `(${addr.slice(0,6)}...${addr.slice(-4)})`;
    }
    
    // 检查是否是庄家
    if (bankerAddr?.toLowerCase() === addr.toLowerCase()) {
      return `Owner (${addr.slice(0,6)}...${addr.slice(-4)})`;
    }
    
    return `${addr.slice(0,6)}...${addr.slice(-4)}`;
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 执行所有清理函数
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    
    // 清理socket
    if (this.socketRef && this.socketRef.current) {
      this.socketRef.current.disconnect();
      this.socketRef.current = null;
    }
  }
}

/**
 * 创建PushChat实例的工厂函数
 */
export function createPushChat(
  address: string,
  walletClient: any,
  socketRef?: React.MutableRefObject<any>
): PushChat {
  return new PushChat(address, walletClient, socketRef);
}
