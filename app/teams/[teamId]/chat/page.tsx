'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Send, Plus, Hash, Lock, MessageSquare, Settings, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { getDatabases, DATABASE_ID } from '@/lib/appwrite';
import { getTeamChannels, getChannelMessages, sendChatMessage, createChatChannel } from '@/lib/chat-service';
import ChannelInviteDialog from '@/components/ChannelInviteDialog';

const databases = getDatabases();
const TEAMS_COLLECTION_ID = 'teams';

export default function TeamChatPage() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [team, setTeam] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const teamId = params?.teamId as string;

  const loadTeam = async () => {
    if (!teamId) return;

    try {
      const teamDoc = await databases.getDocument(
        DATABASE_ID,
        TEAMS_COLLECTION_ID,
        teamId
      );
      setTeam(teamDoc);
    } catch (error: any) {
      console.error('Error loading team:', error);
      toast({
        title: "Failed to load team",
        description: error.message || "Team not found",
        variant: "destructive"
      });
    }
  };
  const loadChannels = async () => {
    if (!teamId) return;

    try {
      console.log('🔍 Loading channels for team:', teamId);
      const channelDocs = await getTeamChannels(teamId);
      setChannels(channelDocs);
      
      // Select first channel by default
      if (channelDocs.length > 0 && !selectedChannel) {
        setSelectedChannel(channelDocs[0]);
      } else if (channelDocs.length === 0) {
        // No channels exist, create default general channel
        console.log('📝 No channels found, creating default channel...');
        if (user) {
          const userId = user.$id || (user as any).id || (user as any).userId;
          const defaultChannel = await createChatChannel({
            teamId,
            name: 'general',
            description: 'General team discussion',
            type: 'text',
            isPrivate: false,
            createdBy: userId
          });
          setChannels([defaultChannel]);
          setSelectedChannel(defaultChannel);
        }
      }
    } catch (error: any) {
      console.error('❌ Error loading channels:', error);
      toast({
        title: "Failed to load channels",
        description: error.message || "Could not load chat channels",
        variant: "destructive"
      });
      
      // Create a mock general channel for display
      const mockChannel = {
        $id: 'general',
        name: 'general',
        description: 'General discussion',
        type: 'text',
        isPrivate: false,
        teamId: teamId,
        messageCount: 0
      };
      setChannels([mockChannel]);
      setSelectedChannel(mockChannel);
    } finally {
      setLoading(false);
    }
  };
  const loadMessages = async () => {
    if (!selectedChannel) return;

    try {
      console.log('🔍 Loading messages for channel:', selectedChannel.$id);
      const messageDocs = await getChannelMessages(selectedChannel.$id, 50);
      setMessages(messageDocs);
    } catch (error: any) {
      console.error('❌ Error loading messages:', error);
      toast({
        title: "Failed to load messages",
        description: error.message || "Could not load messages",
        variant: "destructive"
      });
      setMessages([]);
    }
  };
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || !user) return;

    setSending(true);
    try {
      const userId = user.$id || (user as any).id || (user as any).userId;
      console.log('📤 Sending message...', {
        channelId: selectedChannel.$id,
        teamId,
        userId,
        content: newMessage.trim()
      });
      
      const message = await sendChatMessage({
        channelId: selectedChannel.$id,
        teamId: teamId,
        userId: userId,
        userName: user.name || user.email || 'Unknown User',
        userAvatar: (user as any).avatar || '',
        content: newMessage.trim()
      });
      
      // Add message to local state immediately
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update channel message count in local state
      setChannels(prev => prev.map(channel => 
        channel.$id === selectedChannel.$id 
          ? { ...channel, messageCount: (channel.messageCount || 0) + 1 }
          : channel
      ));
      
      toast({
        title: "Message sent",
        description: "Your message has been posted to the channel",
      });
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive"
      });    } finally {
      setSending(false);
    }
  };

  const createNewChannel = async () => {
    if (!newChannelName.trim() || !user) return;

    try {
      const userId = user.$id || (user as any).id || (user as any).userId;
      const channel = await createChatChannel({
        teamId: teamId,
        name: newChannelName.trim(),
        description: `${newChannelName.trim()} channel`,
        type: 'text',
        isPrivate: false,
        createdBy: userId
      });

      setChannels(prev => [...prev, channel]);
      setSelectedChannel(channel);
      setNewChannelName('');
      setShowCreateChannel(false);

      toast({
        title: "Channel created",
        description: `#${channel.name} has been created`,
      });
    } catch (error: any) {
      console.error('❌ Error creating channel:', error);
      toast({
        title: "Failed to create channel",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadTeam();
    loadChannels();
  }, [teamId]);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages();
    }
  }, [selectedChannel]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading chat...</span>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Team Not Found</h2>
            <Button asChild>
              <Link href="/teams">Back to Teams</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" asChild>
          <Link href={`/teams/${teamId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{team.name} Chat</h1>
          <p className="text-muted-foreground">
            Team communication and collaboration
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-4 gap-6 h-[600px]">
        {/* Channels Sidebar */}
        <div className="col-span-1">
          <Card className="h-full">            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Channels</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowCreateChannel(!showCreateChannel)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {showCreateChannel && (
                <div className="space-y-2">
                  <Input
                    placeholder="Channel name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        createNewChannel();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={createNewChannel}>
                      Create
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setShowCreateChannel(false);
                        setNewChannelName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {channels.map((channel) => (
                  <button
                    key={channel.$id}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-muted transition-colors ${
                      selectedChannel?.$id === channel.$id ? 'bg-muted' : ''
                    }`}
                  >
                    {channel.isPrivate ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Hash className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{channel.name}</span>
                    {channel.messageCount > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {channel.messageCount}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="col-span-3">
          <Card className="h-full flex flex-col">
            {/* Channel Header */}              {selectedChannel && (
                <CardHeader className="border-b">                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedChannel.isPrivate ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Hash className="h-5 w-5 text-muted-foreground" />
                      )}
                      <CardTitle>{selectedChannel.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <ChannelInviteDialog
                        channelId={selectedChannel.$id}
                        channelName={selectedChannel.name}
                        teamId={teamId}
                      >
                        <Button variant="ghost" size="sm">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </ChannelInviteDialog>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/teams/${teamId}/chat/${selectedChannel.$id}/settings`}>
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  {selectedChannel.description && (
                    <CardDescription>{selectedChannel.description}</CardDescription>
                  )}
                </CardHeader>
              )}

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.$id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.userAvatar} />
                        <AvatarFallback>
                          {message.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                    <p className="text-muted-foreground">
                      Start the conversation in #{selectedChannel?.name}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder={`Message #${selectedChannel?.name || 'channel'}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="resize-none"
                  rows={1}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  size="sm"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}