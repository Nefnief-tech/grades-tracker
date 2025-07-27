'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  Search, 
  Shield, 
  Lock, 
  UserPlus, 
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile
} from 'lucide-react';
import Link from 'next/link';

export default function PrivateChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for demonstration
  const sampleChats = [
    {
      id: 'chat-1',
      user: {
        name: 'Alice Johnson',
        email: 'alice@university.edu',
        avatar: '',
        status: 'online',
        lastSeen: 'Active now'
      },
      lastMessage: 'Thanks for the help with the assignment!',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      isEncrypted: true
    },
    {
      id: 'chat-2',
      user: {
        name: 'Bob Smith',
        email: 'bob@university.edu',
        avatar: '',
        status: 'away',
        lastSeen: '15 min ago'
      },
      lastMessage: 'Are you joining the study group tomorrow?',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      isEncrypted: true
    },
    {
      id: 'chat-3',
      user: {
        name: 'Carol Davis',
        email: 'carol@university.edu',
        avatar: '',
        status: 'offline',
        lastSeen: '2 hours ago'
      },
      lastMessage: 'Let me know if you need the lecture notes',
      lastMessageTime: '3 hours ago',
      unreadCount: 1,
      isEncrypted: true
    }
  ];

  const sampleMessages = [
    {
      id: 'msg-1',
      content: 'Hey! How are you doing with the physics assignment?',
      senderId: 'alice-id',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isEncrypted: true
    },
    {
      id: 'msg-2',
      content: 'I\'m struggling a bit with the quantum mechanics part. Do you have any good resources?',
      senderId: 'current-user',
      timestamp: new Date(Date.now() - 3300000).toISOString(),
      isEncrypted: true
    },
    {
      id: 'msg-3',
      content: 'Sure! I have some great video lectures. Let me share the links with you.',
      senderId: 'alice-id',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      isEncrypted: true
    },
    {
      id: 'msg-4',
      content: 'Thanks for the help with the assignment! 🙏',
      senderId: 'alice-id',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      isEncrypted: true
    }
  ];

  const loadChats = async () => {
    setLoading(true);
    setTimeout(() => {
      setChats(sampleChats);
      setLoading(false);
    }, 1000);
  };

  const loadMessages = async (chatId: string) => {
    setMessages(sampleMessages);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      content: message,
      senderId: 'current-user',
      timestamp: new Date().toISOString(),
      isEncrypted: true
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    
    toast({
      title: "Message Sent",
      description: "Your encrypted message has been delivered"
    });
  };

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
    loadMessages(chat.id);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Authentication Required</h2>
              <p className="text-muted-foreground">Please log in to access private chat</p>
            </div>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Private Chat</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  End-to-end encrypted
                </p>
              </div>
            </div>
          </div>

          <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Chat</DialogTitle>
                <DialogDescription>
                  Search for users to start an encrypted conversation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userSearch">Search Users</Label>
                  <Input
                    id="userSearch"
                    placeholder="Enter name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Suggested users:</p>
                  <div className="space-y-2">
                    {['David Wilson', 'Emma Brown', 'Frank Miller'].map((name) => (
                      <div key={name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">{name.toLowerCase().replace(' ', '.')}@university.edu</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full">Start Chat</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Chat Interface */}
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Chat List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Messages</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <Separator />
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading chats...</p>
                  </div>
                ) : chats.length > 0 ? (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectChat(chat)}
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {chat.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                          chat.user.status === 'online' ? 'bg-green-500' :
                          chat.user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{chat.user.name}</p>
                          <div className="flex items-center gap-1">
                            {chat.isEncrypted && <Lock className="h-3 w-3 text-green-600" />}
                            {chat.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                        <p className="text-xs text-muted-foreground">{chat.lastMessageTime}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                    <Button variant="link" size="sm" onClick={() => setNewChatOpen(true)}>
                      Start your first chat
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {selectedChat.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedChat.user.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedChat.user.status === 'online' ? 'bg-green-500' :
                            selectedChat.user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                          {selectedChat.user.lastSeen}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <Separator />

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderId === 'current-user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs ${
                              msg.senderId === 'current-user' 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {formatTime(msg.timestamp)}
                            </p>
                            {msg.isEncrypted && (
                              <Lock className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator />

                {/* Message Input */}
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-600" />
                    Messages are end-to-end encrypted
                  </p>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Select a conversation</h3>
                    <p className="text-muted-foreground">Choose a chat from the list to start messaging</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
}