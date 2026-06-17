"use client";

import { useEffect, useState } from "react";
import { QRCode } from "../QRCode";

export function AdminQRCode() {
  const [siteUrl, setSiteUrl] = useState("");

  useEffect(() => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    setSiteUrl(envUrl || window.location.origin);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">
        QR Code do Site
      </h2>

      <div className="flex flex-col items-center gap-4 p-8 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl">
        {siteUrl && <QRCode url={siteUrl} size={250} />}
        <p className="text-sm text-[var(--text-secondary)] text-center">
          Compartilhe este QR Code para que as pessoas acessem seu portfólio.
        </p>
        <p className="text-xs text-[var(--text-secondary)] font-mono bg-[var(--bg-secondary)] px-3 py-1 rounded">
          {siteUrl}
        </p>
      </div>
    </div>
  );
}
