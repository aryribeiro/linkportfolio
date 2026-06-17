"use client";

import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  url: string;
  size?: number;
}

export function QRCode({ url, size = 200 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: "#1e293b",
          light: "#ffffff",
        },
      });
    }
  }, [url, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} />
      <p className="text-xs text-[var(--text-secondary)]">
        Escaneie para acessar
      </p>
    </div>
  );
}
