'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUnifiedTeamMessages, sendUnifiedTeamMessage } from '@/lib/teams-simple';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

interface Message {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  teamId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamChatProps {
  teamId: string;
}

export default function TeamChat({ teamId }: TeamChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!user || !teamId) return;
    
    try {      const userId = user.$id || (user as any).id || (user as any).userId;
      const teamMessages = await getUnifiedTeamMessages(teamId, userId);
      setMessages(teamMessages as Message[]);
      
      // Scroll to bottom after messages load
      setTimeout(scrollToBottom, 100);
      
    } catch (error) {
      console.error('Error loading messages:', error);
      // Don't show error toast for missing collection, just show empty state
      if (!(error instanceof Error && error.message?.includes('Messages collection not found'))) {
        toast({
          title: "Failed to load messages",
          description: "Please try refreshing the page",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || sending) return;
    
    setSending(true);
    try {
      const userId = user.$id || (user as any).id || (user as any).userId;
      
      await sendUnifiedTeamMessage(teamId, userId, newMessage.trim());
      setNewMessage('');
      
      // Reload messages to show the new one
      await loadMessages();
      
      toast({
        title: "Message sent!",
        description: "Your message has been delivered to the team.",
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getUserInitials = (userId: string) => {
    // Extract initials from user ID for now
    // In a real app, you'd fetch actual user names
    return userId.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    loadMessages();
  }, [teamId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please log in to view team chat</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-96">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Team Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">Be the first to start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.userId === (user.$id || (user as any).id || (user as any).userId);
              
              return (
                <div
                  key={message.$id}
                  className={`flex items-start gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(message.userId)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 max-w-xs ${isOwnMessage ? 'text-right' : ''}`}>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>                    <p className="text-xs text-muted-foreground mt-1">
                      {formatMessageTime(message.createdAt || message.$createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
              maxLength={500}
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}