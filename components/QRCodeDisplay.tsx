'use client';

import { useEffect, useRef } from 'react';

interface QRCodeDisplayProps {
  uri: string;
  size?: number;
}

// Simple QR code component using qrcode library or API
export function QRCodeDisplay({ uri, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Use QR Server API to generate QR code
    const generateQRCode = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use qr-server.com API to generate QR code
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(uri)}`;
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);
        };
        
        img.onerror = () => {
          // Fallback: draw a simple placeholder
          canvas.width = size;
          canvas.height = size;
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, size, size);
          
          // Draw some placeholder squares to look like QR code
          ctx.fillStyle = '#000';
          for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
              if (Math.random() > 0.5) {
                ctx.fillRect(i * (size/10), j * (size/10), size/10, size/10);
              }
            }
          }
          
          // Add text overlay
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(20, size/2 - 20, size - 40, 40);
          ctx.fillStyle = '#000';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code Placeholder', size/2, size/2 + 5);
        };
        
        img.src = qrUrl;
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };

    generateQRCode();
  }, [uri, size]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas 
        ref={canvasRef}
        className="border rounded-lg shadow-sm"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <p className="text-xs text-muted-foreground text-center">
        Scan with Google Authenticator, Authy, or any TOTP app
      </p>
    </div>
  );
}