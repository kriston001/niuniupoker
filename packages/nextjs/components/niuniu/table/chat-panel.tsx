import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, MinusCircle, Send } from "lucide-react";

export function ChatPanel() {
  const chatMessages = [
    { id: 1, player: "Player 1", message: "Good luck everyone!", timestamp: "08:28:20" },
    { id: 2, player: "Player 3", message: "Thanks, you too!", timestamp: "08:28:35" },
    { id: 3, player: "Player 2", message: "I'm feeling lucky today 🍀", timestamp: "08:29:10" },
    { id: 4, player: "Player 5", message: "This is my first time playing Niu Niu", timestamp: "08:29:45" },
    { id: 5, player: "Player 1", message: "Welcome! It's pretty easy to learn", timestamp: "08:30:05" },
    { id: 6, player: "Player 4", message: "Anyone want to play another round after this?", timestamp: "08:30:30" },
    { id: 7, player: "Player 2", message: "I'm in!", timestamp: "08:30:45" },
    { id: 8, player: "Player 3", message: "Me too", timestamp: "08:31:00" },
    { id: 9, player: "Player 5", message: "I need to go soon, but this has been fun", timestamp: "08:31:15" },
    { id: 10, player: "Player 1", message: "We'll miss you Player 5!", timestamp: "08:31:30" },
  ];

  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState(chatMessages);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle sending a chat message
  const handleSendMessage = () => {
    if (chatMessage.trim() === "") return;

    const newMessage = {
      id: messages.length + 1,
      player: "1254",
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    setMessages([...messages, newMessage]);
    setChatMessage("");
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      <Card className="bg-zinc-900/80 border-zinc-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-white flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-amber-500" />
            Chat
          </CardTitle>
          {/* <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-white"
            onClick={() => setIsChatMinimized(!isChatMinimized)}
          >
            <MinusCircle className="h-5 w-5" />
          </Button> */}
        </CardHeader>
        <CardContent className={`p-0 transition-all duration-300`}>
          <div className="flex flex-col h-[400px]">
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3 pt-2 pb-4">
                {messages.map(msg => (
                  <div key={msg.id} className="flex flex-col animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">{msg.timestamp}</span>
                      <span className="text-sm font-medium text-amber-500">{msg.player}</span>
                    </div>
                    <div className="bg-zinc-800/70 backdrop-blur-sm rounded-lg rounded-tl-none p-2 mt-1 text-sm text-zinc-300 break-words">
                      {msg.message}
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
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 transition-all"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  className="h-9 w-9 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
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
