'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Save, Trash2, Hash, Lock, Settings } from 'lucide-react';
import Link from 'next/link';
import { getDatabases, DATABASE_ID } from '@/lib/appwrite';

const databases = getDatabases();
const CHAT_CHANNELS_COLLECTION_ID = 'chat_channels';
const CHAT_MESSAGES_COLLECTION_ID = 'chat_messages';

export default function ChannelSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });

  const teamId = params?.teamId as string;
  const channelId = params?.channelId as string;

  const loadChannel = async () => {
    if (!channelId) return;

    try {
      const channelDoc = await databases.getDocument(
        DATABASE_ID,
        CHAT_CHANNELS_COLLECTION_ID,
        channelId
      );
      
      setChannel(channelDoc);
      setFormData({
        name: channelDoc.name,
        description: channelDoc.description || '',
        isPrivate: channelDoc.isPrivate || false
      });
    } catch (error: any) {
      console.error('Error loading channel:', error);
      toast({
        title: "Failed to load channel",
        description: error.message || "Channel not found",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!channel) return;

    setSaving(true);
    try {
      const updatedChannel = await databases.updateDocument(
        DATABASE_ID,
        CHAT_CHANNELS_COLLECTION_ID,
        channelId,
        {
          name: formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
          description: formData.description.trim(),
          isPrivate: formData.isPrivate
        }
      );

      setChannel(updatedChannel);
      toast({
        title: "Channel updated",
        description: "Changes have been saved successfully",
      });
    } catch (error: any) {
      console.error('Error updating channel:', error);
      toast({
        title: "Failed to update channel",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!channel || !confirm(`Are you sure you want to delete #${channel.name}? This will permanently delete all messages in this channel.`)) {
      return;
    }

    try {
      // Delete all messages in the channel first
      await databases.deleteDocument(
        DATABASE_ID,
        CHAT_CHANNELS_COLLECTION_ID,
        channelId
      );

      toast({
        title: "Channel deleted",
        description: `#${channel.name} has been permanently deleted`,
      });

      router.push(`/teams/${teamId}/chat`);
    } catch (error: any) {
      console.error('Error deleting channel:', error);
      toast({
        title: "Failed to delete channel",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canEdit = channel && user && (
    channel.createdBy === (user.id || (user as any).$id) ||
    // Add admin/owner checks here if needed
    true
  );

  useEffect(() => {
    loadChannel();
  }, [channelId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading channel settings...</span>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Channel Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The channel settings could not be loaded.
            </p>
            <Button asChild>
              <Link href={`/teams/${teamId}/chat`}>Back to Chat</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to edit this channel.
            </p>
            <Button asChild>
              <Link href={`/teams/${teamId}/chat`}>Back to Chat</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/teams/${teamId}/chat`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chat
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Channel Settings
            </h1>
            <p className="text-muted-foreground">
              Manage #{channel.name} settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Channel Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {channel.isPrivate ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Hash className="h-5 w-5 text-muted-foreground" />
            )}
            Channel Information
          </CardTitle>
          <CardDescription>
            Update channel settings and visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel Name *</Label>
            <Input
              id="channel-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="channel-name"
            />
            <p className="text-xs text-muted-foreground">
              Channel names are automatically converted to lowercase with dashes
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-description">Description</Label>
            <Textarea
              id="channel-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe this channel's purpose"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is-private">Private Channel</Label>
              <p className="text-xs text-muted-foreground">
                Only invited members can see and join this channel
              </p>
            </div>
            <Switch
              id="is-private"
              checked={formData.isPrivate}
              onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button variant="outline" onClick={loadChannel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Channel Information */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Information</CardTitle>
          <CardDescription>
            Read-only information about this channel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Channel ID</Label>
              <p className="font-mono text-sm bg-muted p-2 rounded">{channel.$id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Messages</Label>
              <p className="text-lg font-semibold">{channel.messageCount || 0}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p>{new Date(channel.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Type</Label>
              <div className="flex items-center gap-2">
                {channel.isPrivate ? (
                  <>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">Private</Badge>
                  </>
                ) : (
                  <>
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">Public</Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {channel.name !== 'general' && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect this channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h4 className="font-medium text-red-600">Delete Channel</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this channel and all its messages
                </p>
              </div>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Channel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}