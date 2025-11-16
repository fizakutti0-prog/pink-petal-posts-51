import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { User } from "@/lib/userStore";

interface MessagesProps {
  currentUser: User;
}

export const Messages = ({ currentUser }: MessagesProps) => {
  const location = useLocation();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    
    // Check if a user was passed via navigation state
    if (location.state?.selectedUser) {
      setSelectedUser(location.state.selectedUser);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      const channel = supabase
        .channel("messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            if (
              (payload.new.sender_id === currentUser.id && payload.new.recipient_id === selectedUser.id) ||
              (payload.new.sender_id === selectedUser.id && payload.new.recipient_id === currentUser.id)
            ) {
              setMessages((prev) => [...prev, payload.new]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from("messages")
      .select("sender_id, recipient_id, users!messages_sender_id_fkey(*), users!messages_recipient_id_fkey(*)")
      .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
      .order("created_at", { ascending: false });

    if (data) {
      const uniqueUsers = new Map();
      data.forEach((msg: any) => {
        const otherUser = msg.sender_id === currentUser.id 
          ? msg.users_messages_recipient_id_fkey 
          : msg.users_messages_sender_id_fkey;
        if (otherUser && !uniqueUsers.has(otherUser.id)) {
          uniqueUsers.set(otherUser.id, otherUser);
        }
      });
      setConversations(Array.from(uniqueUsers.values()));
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUser.id},recipient_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},recipient_id.eq.${currentUser.id})`
      )
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    await supabase.from("messages").insert([
      {
        sender_id: currentUser.id,
        recipient_id: selectedUser.id,
        content: newMessage.trim(),
      },
    ]);

    setNewMessage("");
  };

  const filteredConversations = conversations.filter(user =>
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-2rem)] gap-0 md:gap-4">
      <Card className="w-full md:w-80 border-0 md:border rounded-none md:rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-card">
          <h2 className="text-xl font-bold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)]">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </div>
            ) : (
              filteredConversations.map((user) => (
                <Button
                  key={user.id}
                  variant={selectedUser?.id === user.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 p-3 h-auto mb-1"
                  onClick={() => setSelectedUser(user)}
                >
                  <div
                    className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold"
                    style={{ background: user.avatar_color }}
                  >
                    {user.display_name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold truncate">{user.display_name}</div>
                    <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      <Card className="flex-1 flex flex-col border-0 md:border rounded-none md:rounded-lg overflow-hidden">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-border bg-card flex items-center gap-3 shadow-sm">
              <div
                className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold"
                style={{ background: selectedUser.avatar_color }}
              >
                {selectedUser.display_name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{selectedUser.display_name}</div>
                <div className="text-sm text-muted-foreground truncate">@{selectedUser.username}</div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === currentUser.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] md:max-w-[70%] p-3 rounded-2xl ${
                        msg.sender_id === currentUser.id
                          ? "bg-gradient-primary text-white rounded-br-sm shadow-pink"
                          : "bg-secondary text-secondary-foreground rounded-bl-sm"
                      }`}
                    >
                      <p className="break-words text-sm md:text-base">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender_id === currentUser.id ? "text-white/80" : "text-muted-foreground"
                      }`}>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="bg-gradient-primary hover:opacity-90 transition-opacity flex-shrink-0"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                <Send className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <p className="text-xl font-semibold mb-2">Select a conversation</p>
              <p className="text-sm">Choose from your existing messages to start chatting</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
