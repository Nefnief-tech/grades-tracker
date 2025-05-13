'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Copy, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RecoveryCodesDisplayProps {
  recoveryCodes: string[];
  onClose: () => void;
  onDownload?: () => void;
}

export function RecoveryCodesDisplay({ 
  recoveryCodes, 
  onClose,
  onDownload 
}: RecoveryCodesDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      const text = recoveryCodes.join('\n');
      navigator.clipboard.writeText(text).then(
        () => {
          setCopied(true);
          toast({
            title: 'Copied to clipboard',
            description: 'Recovery codes have been copied to your clipboard',
          });
          
          // Reset after 3 seconds
          setTimeout(() => {
            setCopied(false);
          }, 3000);
        },
        (err) => {
          console.error('Could not copy text: ', err);
          toast({
            title: 'Error',
            description: 'Failed to copy recovery codes. Please try again.',
            variant: 'destructive',
          });
        }
      );
    }
  };
  
  const handleDownload = () => {
    if (typeof window !== 'undefined') {
      const text = `RECOVERY CODES - KEEP THESE SAFE\n\n${recoveryCodes.join('\n')}\n\nDate: ${new Date().toLocaleDateString()}\nThese codes can be used to recover your account if you lose access to your email.`;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gradetracker-recovery-codes.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Downloaded',
        description: 'Recovery codes have been downloaded',
      });
      
      if (onDownload) {
        onDownload();
      }
    }
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Recovery Codes
        </CardTitle>
        <CardDescription>
          Save these codes in a safe place. You can use them to access your account if you lose access to your email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-900/30 mb-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Important:</strong> Each code can only be used once. Store these somewhere safe!
            </p>
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-md font-mono text-sm">
          <ul className="space-y-1">
            {recoveryCodes.map((code, index) => (
              <li key={index} className="flex justify-between">
                <span>{code}</span>
                <span className="text-muted-foreground">{index + 1}/{recoveryCodes.length}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleCopy}
          >
            {copied ? <CheckCircle className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleDownload}
          >
            <Save className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onClose}>
          I've saved my recovery codes
        </Button>
      </CardFooter>
    </Card>
  );
}