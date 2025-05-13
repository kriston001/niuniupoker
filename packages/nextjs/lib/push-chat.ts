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
chatId?: string;  // 添加chatId字段，用于识别消息来源的群组
}

// 监听器类型定义
export type MessageListener = (message: ChatMessage) => void;
export type ConnectionListener = () => void;

// 监听器接口定义
interface MessageListenerEntry {
chatGroupId: string;  // 群组ID
listener: MessageListener;  // 回调函数
}

// 连接监听器类型
export enum ConnectionEvent {
CONNECT = 'connect',
DISCONNECT = 'disconnect'
}

/**
* PushChat 类 - 处理与Push Protocol聊天相关的所有功能
* 使用单例模式确保全局只有一个实例
*/
export class PushChat {
private address: string;
private walletClient: any;
private userInstance: any = null;
private cleanupFunctions: Array<() => void> = [];
private pushSocket: any = null;

// 监听器列表 - 用于存储所有注册的消息监听器
private messageListeners: MessageListenerEntry[] = [];
// 连接监听器
private connectListeners: ConnectionListener[] = [];
private disconnectListeners: ConnectionListener[] = [];

// Socket连接状态
private socketInitialized: boolean = false;
private streamInitialized: boolean = false;

// 单例实例
private static instance: PushChat | null = null;

/**
 * 私有构造函数，防止外部直接实例化
 * @param address 用户地址
 * @param walletClient 钱包客户端
 */
private constructor(
  address: string,
  walletClient: any
) {
  this.address = address;
  this.walletClient = walletClient;
}

/**
 * 获取PushChat实例（单例模式）
 * @param address 用户地址
 * @param walletClient 钱包客户端
 * @returns PushChat实例
 */
public static getInstance(
  address: string,
  walletClient: any
): PushChat {
  // 如果实例不存在或者地址/钱包客户端发生变化，则创建新实例
  if (!PushChat.instance || 
      PushChat.instance.address !== address || 
      PushChat.instance.walletClient !== walletClient) {
    
    // 如果已有实例，先清理资源
    if (PushChat.instance) {
      PushChat.instance.cleanup();
    }
    
    // 创建新实例
    PushChat.instance = new PushChat(address, walletClient);
  }
  
  return PushChat.instance;
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
   * 获取当前Socket连接状态
   * @returns 是否已连接
   */
isSocketConnected(): boolean {
  return this.pushSocket ? this.pushSocket.connected : false;
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

async removeMember(chatGroupId: string, member: string): Promise<boolean> {
  if (!chatGroupId || !member) {
    console.log("Cannot remove member: missing required data");
    return false;
  }

  try {
    // 获取 Push User 实例
    const userInstance = await this.getUserInstance();
  
    // 移除成员
    await userInstance.chat.group.remove(chatGroupId, {
      role: "MEMBER",
      accounts: [member]
    });
    console.log("Successfully removed member:", member);
    
    return true;
  } catch (e) {
    console.error("Error removing member:", e);
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
      return history.reverse().map(msg => ({
        messageContent: msg.messageContent || '',
        senderAddress: msg.fromDID?.substring(7) || '',
        timestamp: new Date(msg.timestamp || Date.now()),
        messageType: msg.messageType,
        messageId: msg.messageId,
        chatId: chatGroupId
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
 * 添加消息监听器
 * @param chatGroupId 群组ID
 * @param listener 消息接收回调函数
 * @returns 移除此监听器的函数
 */
addMessageListener(chatGroupId: string, listener: MessageListener): () => void {
  if (!chatGroupId) {
    console.log("Cannot add message listener: missing required data");
    return () => {};
  }

  // 添加监听器到列表
  this.messageListeners.push({
    chatGroupId,
    listener
  });
  
  console.log(`Added message listener for group ${chatGroupId}, total listeners: ${this.messageListeners.length}`);
  
  // 确保socket连接和消息流已初始化
  this.ensureSocketInitialized();
  
  // 返回移除此监听器的函数
  return () => {
    this.removeMessageListener(chatGroupId, listener);
  };
}

/**
 * 移除特定消息监听器
 * @param chatGroupId 群组ID
 * @param listener 要移除的监听器函数
 */
private removeMessageListener(chatGroupId: string, listener: MessageListener): void {
  const index = this.messageListeners.findIndex(
    entry => entry.chatGroupId === chatGroupId && entry.listener === listener
  );
  
  if (index !== -1) {
    this.messageListeners.splice(index, 1);
    console.log(`Removed message listener for group ${chatGroupId}, remaining listeners: ${this.messageListeners.length}`);
  }
}

/**
 * 移除群组的所有监听器
 * @param chatGroupId 群组ID
 */
removeAllListenersForGroup(chatGroupId: string): void {
  const initialCount = this.messageListeners.length;
  this.messageListeners = this.messageListeners.filter(entry => entry.chatGroupId !== chatGroupId);
  
  const removedCount = initialCount - this.messageListeners.length;
  console.log(`Removed all ${removedCount} listeners for group ${chatGroupId}`);
}

/**
 * 添加连接状态监听器
 * @param event 连接事件类型
 * @param listener 监听器函数
 * @returns 移除此监听器的函数
 */
addConnectionListener(event: ConnectionEvent, listener: ConnectionListener): () => void {
  // 根据事件类型添加到对应的监听器列表
  if (event === ConnectionEvent.CONNECT) {
    this.connectListeners.push(listener);
  } else if (event === ConnectionEvent.DISCONNECT) {
    this.disconnectListeners.push(listener);
  }
  
  // 确保socket连接已初始化
  this.ensureSocketInitialized();
  
  // 返回移除此监听器的函数
  return () => {
    this.removeConnectionListener(event, listener);
  };
}

/**
 * 移除连接状态监听器
 * @param event 连接事件类型
 * @param listener 要移除的监听器函数
 */
private removeConnectionListener(event: ConnectionEvent, listener: ConnectionListener): void {
  if (event === ConnectionEvent.CONNECT) {
    const index = this.connectListeners.indexOf(listener);
    if (index !== -1) {
      this.connectListeners.splice(index, 1);
    }
  } else if (event === ConnectionEvent.DISCONNECT) {
    const index = this.disconnectListeners.indexOf(listener);
    if (index !== -1) {
      this.disconnectListeners.splice(index, 1);
    }
  }
}

/**
 * 确保socket连接和消息流已初始化
 * 这个方法保证无论addMessageListener被调用多少次，socket连接和消息流只会初始化一次
 */
private ensureSocketInitialized(): void {
  // 如果已经初始化，直接返回
  if (this.socketInitialized && this.streamInitialized) {
    return;
  }
  
  this.getUserInstance().then(userInstance => {
    // 初始化socket连接
    if (!this.socketInitialized) {
      this.initializeSocket();
    }
    
    // 初始化消息流
    if (!this.streamInitialized) {
      //this.initializeMessageStream(userInstance);
    }
  });
}

/**
 * 初始化socket连接
 */
private initializeSocket(): void {
  try {
    // 建立socket连接
    this.pushSocket = createSocketConnection({
      user: this.address,
      env: CONSTANTS.ENV.PROD,
      socketType: 'chat',
      socketOptions: { autoConnect: true, reconnectionAttempts: 5 }
    });

    if (this.pushSocket) {
      // 连接成功事件
      this.pushSocket.on('connect', () => {
        console.log('Socket连接成功');
        
        // 通知所有连接监听器
        this.notifyConnectionListeners(ConnectionEvent.CONNECT);
      });

      // 断开连接事件
      this.pushSocket.on('disconnect', () => {
        console.log('Socket断开连接');
        
        // 通知所有断开连接监听器
        this.notifyConnectionListeners(ConnectionEvent.DISCONNECT);
      });

      // 监听消息事件
      this.pushSocket.on(EVENTS.CHAT_RECEIVED_MESSAGE, (message: any) => {
        console.log('Socket收到新消息:', message);
        
        // 创建消息对象
        const newMessage: ChatMessage = {
          messageContent: message.messageContent || '',
          senderAddress: message.fromDID?.substring(7) || '',
          timestamp: new Date(message.timestamp || Date.now()),
          messageType: message.messageType,
          messageId: message.messageId,
          chatId: message.chatId
        };
        
        // 通知所有适用的监听器
        this.notifyMessageListeners(newMessage);
      });
      
      // 添加清理函数
      this.cleanupFunctions.push(() => {
        if (this.pushSocket) {
          this.pushSocket.disconnect();
          this.pushSocket = null;
        }
      });
      
      // 标记socket已初始化
      this.socketInitialized = true;
    }
  } catch (e) {
    console.error("Error initializing socket:", e);
  }
}

/**
 * 初始化消息流
 * @param userInstance Push用户实例
 */
private async initializeMessageStream(userInstance: any): Promise<void> {
  try {
    // 使用stream API监听新消息
    const stream = await userInstance.chat.stream();
    
    // 监听消息事件
    stream.on(CONSTANTS.STREAM.CHAT, (message: any) => {
      console.log('Stream message received:', message);
      
      // 创建消息对象
      const newMessage: ChatMessage = {
        messageContent: message.messageContent || '',
        senderAddress: message.fromDID?.substring(7) || '',
        timestamp: new Date(message.timestamp || Date.now()),
        messageType: message.messageType,
        messageId: message.messageId,
        chatId: message.chatId
      };
      
      // 通知所有适用的监听器
      this.notifyMessageListeners(newMessage);
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
    
    // 标记消息流已初始化
    this.streamInitialized = true;
  } catch (e) {
    console.error("Error initializing message stream:", e);
  }
}

/**
 * 通知所有适用的消息监听器
 * @param message 收到的消息
 */
private notifyMessageListeners(message: ChatMessage): void {
  // 找出所有与消息对应的群组监听器
  const matchingListeners = this.messageListeners.filter(
    entry => entry.chatGroupId === message.chatId
  );
  
  if (matchingListeners.length > 0) {
    console.log(`Notifying ${matchingListeners.length} listeners for group ${message.chatId}`);
    
    // 调用每个监听器
    matchingListeners.forEach(entry => {
      try {
        entry.listener(message);
      } catch (e) {
        console.error("Error in message listener:", e);
      }
    });
  }
}

/**
 * 通知所有连接状态监听器
 * @param event 连接事件类型
 */
private notifyConnectionListeners(event: ConnectionEvent): void {
  const listeners = event === ConnectionEvent.CONNECT 
    ? this.connectListeners 
    : this.disconnectListeners;
  
  console.log(`Notifying ${listeners.length} listeners for ${event} event`);
  
  // 调用每个监听器
  listeners.forEach(listener => {
    try {
      listener();
    } catch (e) {
      console.error(`Error in ${event} listener:`, e);
    }
  });
}

/**
 * 主动连接Socket
 * 在需要时可以调用此方法确保Socket连接已建立
 */
connect(): void {
  this.ensureSocketInitialized();
}

/**
 * 主动断开Socket连接
 * 在不需要接收消息时可以调用此方法节省资源
 */
disconnect(): void {
  if (this.pushSocket) {
    this.pushSocket.disconnect();
    console.log('Socket手动断开连接');
  }
}

/**
 * 格式化地址显示
 * @param addr 地址
 * @param bankerAddr 庄家地址
 * @returns 格式化后的地址
 */
formatAddress(
  addr: string,
  bankerAddr: string | undefined
): string {
  if (!addr) return "Unknown";
  if (addr.toLowerCase() === this.address?.toLowerCase()) return "You";
  
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
  // 清空监听器
  this.messageListeners = [];
  this.connectListeners = [];
  this.disconnectListeners = [];
  
  // 执行所有清理函数
  this.cleanupFunctions.forEach(cleanup => {
    try {
      cleanup();
    } catch (e) {
      console.error("Error during cleanup:", e);
    }
  });
  this.cleanupFunctions = [];
  
  // 清理socket
  if (this.pushSocket) {
    this.pushSocket.disconnect();
    this.pushSocket = null;
  }
  
  // 重置初始化标志
  this.socketInitialized = false;
  this.streamInitialized = false;
  
  // 重置用户实例
  this.userInstance = null;
}
}

/**
* 创建PushChat实例的工厂函数
* 现在使用单例模式，确保全局只有一个实例
*/
export function createPushChat(
address: string,
walletClient: any
): PushChat {
// 在服务器端返回null
// if (typeof window === "undefined") {
//   return null;
// }

return PushChat.getInstance(address, walletClient);
}