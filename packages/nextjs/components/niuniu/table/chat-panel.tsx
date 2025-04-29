import React, { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useWalletClient } from "wagmi";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Plus, UserPlus, Loader2 } from "lucide-react";
import { createPushChat, ChatMessage, PushChat } from "~~/lib/push-chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import {GameTable} from "@/types/game-types"
import { writeContractWithCallback } from "~~/hooks/writeContractWithCallback";
import {
  updateChatGroupId
} from "~~/contracts/abis/BBGameTableABI";

interface ChatPanelProps {
  tableInfo: GameTable;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  tableInfo
}) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  // 检查用户是否是庄家
  const isBanker = address && tableInfo.bankerAddr && 
    address.toLowerCase() === tableInfo.bankerAddr.toLowerCase();
  
  // 检查用户是否在游戏桌中（作为庄家或玩家）
  const isInTable = address && (
    isBanker || 
    (tableInfo.playerAddresses && tableInfo.playerAddresses.some(
      playerAddr => playerAddr && playerAddr.toLowerCase() === address?.toLowerCase()
    ))
  );
  
  // 聊天状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushUser, setPushUser] = useState<any>(null);
  const [groupChat, setGroupChat] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // 组件内部状态
  const [hasJoinedChat, setHasJoinedChat] = useState(false);
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [membershipChecked, setMembershipChecked] = useState(false);
  
  // 引用
  const pushChatRef = useRef<PushChat | null>(null);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化聊天
  const initializeChat = async () => {
    if (!pushChatRef.current || !tableInfo.chatGroupId) return;
    
    setIsInitializing(true);
    setError(null);
    
    try {
      // console.log("Initializing chat for group:", tableInfo.chatGroupId);
      
      // 获取Push用户实例
      const userInstance = await pushChatRef.current.getUserInstance();
      setPushUser(userInstance);
      
      // 获取群组信息
      const group = await pushChatRef.current.getGroupInfo(tableInfo.chatGroupId);
      setGroupChat(group);
      
      if (group) {
        console.log("Group found:", group);
        
        // 获取历史消息
        const history = await pushChatRef.current.getChatHistory(tableInfo.chatGroupId);
        setMessages(history);
        
        // 设置消息监听器
        pushChatRef.current.setupChatListener(
          tableInfo.chatGroupId,
          (newMessage: ChatMessage) => {
            // 确保不添加重复消息
            setMessages(prevMessages => {
              if (newMessage.messageId && prevMessages.some(msg => msg.messageId === newMessage.messageId)) {
                return prevMessages;
              }
              return [...prevMessages, newMessage];
            });
          }
        );
        
        setHasJoinedChat(true);
        setIsConnected(true);
      } else {
        console.log("Group not found");
        setError("无法加载聊天群组，请重试");
      }
    } catch (e) {
      console.error("Error initializing chat:", e);
      setError("初始化聊天失败，请重试");
    } finally {
      setIsInitializing(false);
    }
  };

  // 检查用户是否是群组成员
  const checkChatMembership = async () => {
    if (!pushChatRef.current || !tableInfo.chatGroupId) return;
    
    setIsCheckingMembership(true);
    
    try {
      // console.log("Checking if user is a member of group:", tableInfo.chatGroupId);
      const isMember = await pushChatRef.current.isGroupMember(tableInfo.chatGroupId);
      // console.log("Is member:", isMember);
      
      if (isMember) {
        // 如果是成员，初始化聊天
        await initializeChat();
      } else {
        // 不是成员，显示加入按钮
        setHasJoinedChat(false);
      }
      
      // 标记已经检查过成员资格
      setMembershipChecked(true);
    } catch (e) {
      console.error("Error checking chat membership:", e);
      setError("检查群组成员资格失败");
    } finally {
      setIsCheckingMembership(false);
    }
  };

  const handleUpdateGroupId = async(groupId: string) => {
    await writeContractWithCallback({
      address: tableInfo.tableAddr,
      abi: [updateChatGroupId],
      functionName: "updateChatGroupId",
      args: [groupId],
      account: address as `0x${string}`,
      onSuccess: async () => {
        tableInfo.chatGroupId = groupId;
        // console.log("UpdateGroupId success");
      },
      onError: async err => {
        // 用户取消交易不显示错误提示
        if (err.message.includes("User rejected") || err.message.includes("user rejected")) {
          console.log("User rejected UpdateGroupId");
          return;
        }

        console.log("UpdateGroupId failed");
      },
    });
  }

  // 创建聊天群组
  const createChatGroup = async () => {
    if (!pushChatRef.current) return;
    
    setIsCreatingGroup(true);
    setError(null);
    
    try {
      // 创建群组
      const groupName = tableInfo.tableName;
      const groupDescription = `Chat group for game table ${tableInfo.tableName}`;
      
      // console.log("Creating chat group:", groupName);
      const chatGroupId = await pushChatRef.current.createChatGroup(groupName, groupDescription);
      
      if (chatGroupId) {
        // console.log("Created chat group:", chatGroupId);
        
        // TODO: 更新游戏桌信息，保存chatGroupId
        // console.log("TODO: Update table info with chatGroupId:", chatGroupId);
        await handleUpdateGroupId(chatGroupId);

        
        // 初始化聊天
        await initializeChat();
      } else {
        setError("创建群组失败，请稍后再试");
      }
    } catch (e) {
      console.error("Error creating chat group:", e);
      setError("创建群组失败，请稍后再试");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // 加入聊天群组
  const joinChatGroup = async () => {
    if (!pushChatRef.current || !tableInfo.chatGroupId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Joining chat group:", tableInfo.chatGroupId);
      const success = await pushChatRef.current.joinChatGroup(tableInfo.chatGroupId);
      
      if (success) {
        // console.log("Successfully joined chat group");
        await initializeChat();
      } else {
        setError("加入群组失败，请稍后再试");
      }
    } catch (e) {
      console.error("Error joining chat group:", e);
      setError("加入群组失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  // 发送消息的包装函数
  const handleSendMessage = async () => {
    console.log("send message: ", chatMessage);
    if (!pushChatRef.current || !chatMessage.trim() || !tableInfo.chatGroupId) return;
    
    setIsSendingMessage(true);
    
    try {
      const success = await pushChatRef.current.sendMessage(tableInfo.chatGroupId, chatMessage);
      
      if (success) {
        setChatMessage("");
      } else {
        setError("发送消息失败，请重试");
      }
    } catch (e) {
      console.error("Error sending message:", e);
      setError("发送消息失败，请重试");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // 格式化地址的包装函数
  const formatAddress = (addr: string) => {
    if (!pushChatRef.current) return addr;
    
    // 检查是否是庄家地址
    const isSenderBanker = tableInfo.bankerAddr && 
      addr.toLowerCase() === tableInfo.bankerAddr.toLowerCase();
    
    // 检查是否是当前用户
    const isSelf = address && addr.toLowerCase() === address.toLowerCase();
    
    // 使用PushChat的formatAddress方法格式化地址
    const formattedAddr = pushChatRef.current.formatAddress(
      addr,
      tableInfo.playerAddresses,
      tableInfo.bankerAddr
    );
    
    // 如果是庄家且不是自己，添加Owner前缀
    return (isSenderBanker && !isSelf) ? `Owner ${formattedAddr}` : formattedAddr;
  };

  // 滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 初始化 Push Protocol
  useEffect(() => {
    if (!address || !walletClient) return;
    
    // 创建PushChat实例
    const pushChat = createPushChat(
      address,
      walletClient,
      socketRef
    );
    
    // 保存到ref
    pushChatRef.current = pushChat;
    
    // 清理函数
    return () => {
      if (pushChatRef.current) {
        pushChatRef.current.cleanup();
        pushChatRef.current = null;
      }
    };
  }, [walletClient, address]);

  // 检查用户是否已经加入聊天群组
  useEffect(() => {
    if (groupChat) {
      setHasJoinedChat(true);
    }
  }, [groupChat]);

  // 初始化检查 - 当组件首次加载或chatGroupId变化时执行
  useEffect(() => {
    const checkStatus = async () => {
      // 确保所有必要的条件都满足
      if (!pushChatRef.current || !address || !walletClient) return;
      
      // 如果没有chatGroupId，无需检查
      if (!tableInfo.chatGroupId) return;
      
      // 如果用户不在游戏桌中，无需检查
      if (!isInTable) return;
      
      // 如果已经加入聊天或正在检查中，无需再次检查
      if (hasJoinedChat || isCheckingMembership || isInitializing) return;
      
      // 如果已经检查过成员资格，无需再次检查
      if (membershipChecked) return;
      
      console.log("Checking chat membership status...");
      
      if (isBanker) {
        // 庄家直接初始化聊天
        console.log("User is banker, initializing chat directly");
        await initializeChat();
        setHasJoinedChat(true);
      } else {
        // 普通玩家检查是否已经是群组成员
        console.log("User is player, checking membership");
        await checkChatMembership();
      }
    };
    
    // 直接调用检查函数
    checkStatus();
    
  }, [tableInfo.chatGroupId, address, walletClient, isInTable, hasJoinedChat, isCheckingMembership, isBanker, isInitializing, membershipChecked]);

  return (
    <div className="w-full">
      <Card className="bg-zinc-900/80 border border-zinc-800 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-amber-500" />
              Chat Group
            </CardTitle>
            {pushUser && hasJoinedChat && (
              <>
                <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-xs text-zinc-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <div className="text-center text-red-500 py-2 px-4 bg-red-900/20 rounded-md mx-4 mt-2">
              {error}
            </div>
          )}

          <div className="flex flex-col h-[400px]">
            {!tableInfo.chatGroupId ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                {isBanker ? (
                  <>
                    <MessageSquare className="h-12 w-12 text-amber-500 mb-4" />
                    <p className="text-zinc-400 mb-4 text-center px-6">
                      The chat group has not been created yet. As a dealer, you can create a group for players to start chatting.
                    </p>
                    <Button 
                      onClick={createChatGroup} 
                      disabled={isCreatingGroup}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {isCreatingGroup ? (
                        <>Creating a group...</>
                      ) : (
                        <><Plus className="h-4 w-4 mr-2" /> Create chat group</>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-12 w-12 text-zinc-500 mb-4" />
                    <p className="text-zinc-400 text-center px-6">
                      The chat group has not been created yet. Please wait for the owner to create the group before starting the chat.
                    </p>
                  </>
                )}
              </div>
            ) : !isInTable ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <MessageSquare className="h-12 w-12 text-zinc-500 mb-4" />
                <p className="text-zinc-400 text-center px-6">
                  You can only start chatting after joining the game table
                </p>
              </div>
            ) : !hasJoinedChat ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <MessageSquare className="h-12 w-12 text-amber-500 mb-4" />
                <p className="text-zinc-400 mb-4 text-center px-6">
                  You've joined the game table! Join the chat group to start chatting with other players.
                </p>
                <Button 
                  onClick={joinChatGroup} 
                  disabled={isLoading || isCheckingMembership}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isLoading ? (
                    <>Joining chat group...</>
                  ) : isCheckingMembership ? (
                    <>Checking membership...</>
                  ) : (
                    <><UserPlus className="h-4 w-4 mr-2" /> Join Chat Group</>
                  )}
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-3 pt-2 pb-4">
                    {messages.length === 0 && !isLoading && (
                      <div className="text-center text-zinc-500 py-4">
                        No message yet, start chatting!
                      </div>
                    )}
                    
                    {isLoading && (
                      <div className="text-center text-zinc-500 py-4">
                        Loading messages...
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
                <div className="p-2 border-t border-zinc-800">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !isSendingMessage && handleSendMessage()}
                      placeholder="Input messages..."
                      disabled={!pushUser || isLoading || !isConnected || isSendingMessage}
                      className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 disabled:opacity-50"
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSendMessage} 
                      disabled={!pushUser || !chatMessage.trim() || isLoading || !isConnected || isSendingMessage}
                      className="h-9 w-9 ml-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md disabled:opacity-50"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};