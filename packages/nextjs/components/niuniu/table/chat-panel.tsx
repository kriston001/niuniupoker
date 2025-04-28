import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";
import { useAccount, useWalletClient } from "wagmi";
import { GameTable } from "~~/types/game-types";
import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";
import { createSocketConnection, EVENTS } from "@pushprotocol/socket";

// 消息类型定义
interface ChatMessage {
  messageContent: string;
  senderAddress: string;
  timestamp: Date;
  messageType?: string;
  messageId?: string;
}

export function ChatPanel({ tableInfo }: { tableInfo: GameTable }) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [chatId, setChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pushUser, setPushUser] = useState<any>(null);
  const [groupChat, setGroupChat] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // 初始化 Push Protocol
  useEffect(() => {
    let mounted = true;

    async function initPushChat() {
      if (!walletClient || !address || !tableInfo.tableAddr) return;

      try {
        setIsLoading(true);

        // 使用 tableAddr 作为自定义群组标识符
        const customChatId = `niuniu-table-${tableInfo.tableAddr}`;
        setChatId(customChatId);

        // 创建一个签名者适配器
        const signer = {
          getAddress: async () => address,
          signMessage: async (message: string | Uint8Array) => {
            const signature = await walletClient.signMessage({
              message: typeof message === 'string' ? message : new TextDecoder().decode(message)
            });
            return signature;
          }
        };

        // 初始化 Push User - 使用新的 SDK 方式
        const userInstance = await PushAPI.initialize(signer, { env: CONSTANTS.ENV.PROD });
        setPushUser(userInstance);

        // 直接使用 customChatId 检查群组是否存在
        let group;
        try {
          // 使用新的 API 直接通过 customChatId 获取群组信息
          group = await userInstance.chat.group.info(customChatId);
          console.log("Found existing group:", group);
        } catch (e) {
          console.log("Group not found, will create a new one");
        }

        // 如果群组不存在，创建新群组
        if (!group) {
          try {
            // 准备群组数据
            const groupName = tableInfo.tableName || `牛牛游戏桌 ${tableInfo.tableAddr.slice(0, 6)}`;
            const groupDescription = `聊天室 - ${tableInfo.tableAddr}`;
            const groupImage = "https://raw.githubusercontent.com/ethereum/ethereum-org-website/dev/src/assets/ethereum-logo-wireframe.png";
            
            // 创建群组 - 使用新的 API 并指定自定义 chatId
            group = await userInstance.chat.group.create(
              groupName,
              {
                description: groupDescription,
                image: groupImage,
                members: [], // 初始成员为空，用户加入时会自动添加
                admins: [], // 创建者自动成为管理员
                private: false, // 公开群组
                rules: {
                  entry: {
                    conditions: []  // 无入场条件
                  },
                  chat: {
                    conditions: []  // 无聊天条件
                  }
                },
              }
            );
            console.log("Created new group with custom chatId:", group);
            
            // 验证创建的群组是否使用了自定义 chatId
            if (group && group.chatId !== customChatId) {
              console.warn("Warning: Created group doesn't have the custom chatId");
            }
          } catch (e) {
            console.error("Error creating group:", e);
            setError("创建群组失败，请稍后再试");
          }
        }

        if (group) {
          setGroupChat(group);

          // 加载历史消息 - 使用新的 API
          try {
            // 使用群组chatId获取历史消息
            const history = await userInstance.chat.history(group.chatId);
            console.log("Loaded history:", history);

            if (history && Array.isArray(history)) {
              setMessages(history.map(msg => ({
                messageContent: msg.messageContent || '',
                senderAddress: msg.fromDID?.substring(7) || '', // 移除 'eip155:' 前缀
                timestamp: new Date(msg.timestamp || Date.now()),
                messageType: msg.messageType,
                messageId: msg.messageId
              })));
            }
          } catch (e) {
            console.error("Error loading chat history:", e);
          }

          // 设置消息监听
          setupMessageListener(userInstance, group.chatId);
        }
      } catch (error) {
        console.error("Failed to initialize Push Protocol:", error);
        setError("无法连接到 Push Protocol，请确保您的钱包已连接");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initPushChat();

    return () => {
      mounted = false;
      // 清理 Socket 连接
      if (socketRef.current) {
        socketRef.current.disconnect();
        setIsConnected(false);
      }
    };
  }, [walletClient, address, tableInfo.tableAddr, tableInfo.bankerAddr, tableInfo.tableName]);

  // 设置消息监听器
  const setupMessageListener = (userInstance: any, groupChatId: string) => {
    try {
      // 建立socket连接
      const pushSocket = createSocketConnection({
        user: address,
        env: CONSTANTS.ENV.PROD,
        socketType: 'chat',
        socketOptions: { autoConnect: true, reconnectionAttempts: 5 }
      });

      if (pushSocket) {
        // 连接成功事件
        pushSocket.on('connect', () => {
          console.log('Socket连接成功');
          setIsConnected(true);
        });

        // 断开连接事件
        pushSocket.on('disconnect', () => {
          console.log('Socket连接断开');
          setIsConnected(false);
        });

        // 错误事件
        pushSocket.on('error', (error: any) => {
          console.error('Socket错误:', error);
        });

        // 重新连接事件
        pushSocket.on('reconnect', (attempt: number) => {
          console.log(`Socket重新连接 (尝试 ${attempt})`);
          setIsConnected(true);
        });

        // 接收消息事件
        pushSocket.on(EVENTS.CHAT_RECEIVED_MESSAGE, (messageData: any) => {
          console.log('收到新消息:', messageData);
          
          // 验证消息是否来自当前群组
          if (messageData.chatId === groupChatId) {
            // 解析消息并更新状态
            const newMessage: ChatMessage = {
              messageContent: messageData.messageContent || '',
              senderAddress: messageData.fromDID?.substring(7) || '',
              timestamp: new Date(messageData.timestamp || Date.now()),
              messageType: messageData.messageType,
              messageId: messageData.messageId
            };

            // 防止重复消息，检查是否已有相同ID的消息
            setMessages(prevMessages => {
              // 如果已存在相同ID的消息，不添加
              if (messageData.messageId && prevMessages.some(msg => msg.messageId === messageData.messageId)) {
                return prevMessages;
              }
              return [...prevMessages, newMessage];
            });
          }
        });

        // 保存socket引用以便后续清理
        socketRef.current = pushSocket;

        // 尝试建立通知流 - 监听新消息
        startMessageStream(userInstance);
      }
    } catch (e) {
      console.error("Error setting up message listener:", e);
    }
  };

  // 启动消息流监听
  const startMessageStream = async (userInstance: any) => {
    try {
      // 使用stream API监听新消息
      const stream = await userInstance.chat.stream();
      
      // 监听消息事件
      stream.on(CONSTANTS.STREAM.CHAT, (message: any) => {
        console.log('Stream message received:', message);
        // 如果消息来自当前群组，添加到消息列表
        if (message && groupChat && message.chatId === groupChat.chatId) {
          const newMessage: ChatMessage = {
            messageContent: message.messageContent || '',
            senderAddress: message.fromDID?.substring(7) || '',
            timestamp: new Date(message.timestamp || Date.now()),
            messageType: message.messageType,
            messageId: message.messageId
          };

          // 检查是否已有相同ID的消息，避免重复
          setMessages(prevMessages => {
            if (message.messageId && prevMessages.some(msg => msg.messageId === message.messageId)) {
              return prevMessages;
            }
            return [...prevMessages, newMessage];
          });
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
      
      return () => {
        // 清理流
        stream.disconnect();
      };
    } catch (e) {
      console.error("Error starting message stream:", e);
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 发送消息到群组
  async function handleSendMessage() {
    if (!chatMessage.trim() || !pushUser || !groupChat) return;

    try {
      // 发送消息 - 使用新的 API
      await pushUser.chat.send(groupChat.chatId, {
        content: chatMessage,
        type: 'Text'
      });
      
      // 清空输入框
      setChatMessage("");
      
      // 注意: 不需要手动添加消息到消息列表，因为通过socket/stream我们会收到确认
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("发送消息失败，请重试");
    }
  }

  // 格式化地址显示
  const formatAddress = (addr: string) => {
    if (!addr) return "Unknown";
    if (addr.toLowerCase() === address?.toLowerCase()) return "你";
    
    // 检查是否是玩家地址，如果是则显示玩家位置
    const playerIndex = tableInfo.playerAddresses?.findIndex(
      playerAddr => playerAddr?.toLowerCase() === addr.toLowerCase()
    );
    
    if (playerIndex !== undefined && playerIndex >= 0) {
      return `玩家 ${playerIndex + 1} (${addr.slice(0,6)}...${addr.slice(-4)})`;
    }
    
    // 检查是否是庄家
    if (tableInfo.bankerAddr?.toLowerCase() === addr.toLowerCase()) {
      return `庄家 (${addr.slice(0,6)}...${addr.slice(-4)})`;
    }
    
    return `${addr.slice(0,6)}...${addr.slice(-4)}`;
  };

  return (
    <div>
      <Card className="bg-zinc-900/80 border-zinc-800">
        <CardHeader className="pb-2 flex items-center justify-between">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" /> 
            {tableInfo.tableName ? `${tableInfo.tableName} 聊天室` : "游戏聊天室"}
          </CardTitle>
          <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-xs text-zinc-400">
              {isConnected ? '已连接' : '未连接'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="text-center text-red-500 py-2 px-4 bg-red-900/20 rounded-md mx-4 mt-2">
              {error}
            </div>
          )}
          <div className="flex flex-col h-[400px]">
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3 pt-2 pb-4">
                {messages.length === 0 && !isLoading && (
                  <div className="text-center text-zinc-500 py-4">
                    暂无消息，开始聊天吧！
                  </div>
                )}
                
                {isLoading && (
                  <div className="text-center text-zinc-500 py-4">
                    加载聊天中...
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  <div 
                    key={msg.messageId || `${msg.senderAddress}-${msg.timestamp.getTime()}-${idx}`} 
                    className="flex flex-col animate-fadeIn"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-sm font-medium text-amber-500">
                        {formatAddress(msg.senderAddress)}
                      </span>
                    </div>
                    <div className="bg-zinc-800/70 backdrop-blur-sm rounded-lg rounded-tl-none p-2 mt-1 text-sm text-zinc-300 break-words">
                      {msg.messageContent}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入消息..."
                  disabled={!pushUser || isLoading || !isConnected}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 disabled:opacity-50"
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage} 
                  disabled={!pushUser || !chatMessage.trim() || isLoading || !isConnected}
                  className="h-9 w-9 bg-amber-600 hover:bg-amber-700 text-white rounded-md disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}