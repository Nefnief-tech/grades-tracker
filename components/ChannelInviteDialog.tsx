'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserPlus, Mail } from 'lucide-react';
import { createChannelInvite } from '@/lib/invite-service';

interface ChannelInviteDialogProps {
  channelId: string;
  channelName: string;
  teamId: string;
  children: React.ReactNode;
}

export default function ChannelInviteDialog({ 
  channelId, 
  channelName, 
  teamId, 
  children 
}: ChannelInviteDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !user) return;

    setSending(true);
    try {
      const userId = user.id || (user as any).$id;
      
      await createChannelInvite({
        channelId,
        channelName,
        teamId,
        inviterUserId: userId,
        inviterName: user.name || user.email || 'Unknown User',
        inviteeEmail: inviteEmail.trim(),
        message: inviteMessage.trim()
      });

      toast({
        title: "Channel invitation sent!",
        description: `${inviteEmail} has been invited to join #${channelName}`,
      });

      setInviteEmail('');
      setInviteMessage('');
      setOpen(false);

    } catch (error: any) {
      console.error('❌ Error sending channel invite:', error);
      toast({
        title: "Failed to send invitation",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to #{channelName}</DialogTitle>
          <DialogDescription>
            Send an invitation to join this channel
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Personal Message (Optional)</label>
            <Textarea
              placeholder="Add a personal message to the invitation..."
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSendInvite} 
              disabled={!inviteEmail.trim() || sending}
              className="flex-1"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}