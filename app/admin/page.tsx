"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppData, Link, Profile } from "@/lib/types";
import { AdminLinks } from "@/components/admin/AdminLinks";
import { AdminProfile } from "@/components/admin/AdminProfile";
import { AdminQRCode } from "@/components/admin/AdminQRCode";

type AdminTab = "profile" | "links" | "qrcode";

export default function AdminPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("links");
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/links");
      if (res.ok) {
        const appData = await res.json();
        setData(appData);
      } else if (res.status === 401) {
        router.push("/admin/login");
      }
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/");
  };

  const handleProfileUpdate = async (profile: Profile) => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (res.ok) {
      await fetchData();
      await fetch("/api/revalidate", { method: "POST" });
    }
    return res.ok;
  };

  const handleLinksUpdate = async (links: Link[]) => {
    const res = await fetch("/api/links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ links }),
    });
    if (res.ok) {
      await fetchData();
      await fetch("/api/revalidate", { method: "POST" });
    }
    return res.ok;
  };

  const handleDownloadJSON = () => {
    if (!data) return;
    const exportData = {
      profile: data.profile,
      links: data.links,
      categories: data.categories || [],
      customIcons: data.customIcons || [],
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "links_data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReloadFromDrive = async () => {
    setReloading(true);
    await fetch("/api/revalidate", { method: "POST" });
    await fetchData();
    setReloading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-500">Erro ao carregar dados.</p>
      </main>
    );
  }

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "links", label: "Links" },
    { key: "profile", label: "Perfil" },
    { key: "qrcode", label: "QR Code" },
  ];

  return (
    <main className="min-h-screen pb-8">
      <header className="bg-[var(--card-bg)] border-b border-[var(--border-color)] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[var(--text-primary)]">
            Painel Admin
          </h1>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={handleReloadFromDrive}
              disabled={reloading}
              title="Recarregar JSON do Google Drive"
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)]
                         text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50"
            >
              {reloading ? "⟳ Recarregando..." : "⟳ Reload Drive"}
            </button>
            <button
              onClick={handleDownloadJSON}
              title="Baixar JSON com todas as configurações"
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)]
                         text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              ⬇ Download JSON
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-color)]
                         text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Ver Site
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {activeTab === "links" && (
          <AdminLinks
            links={data.links}
            customIcons={data.customIcons}
            categories={data.categories}
            onUpdate={handleLinksUpdate}
          />
        )}
        {activeTab === "profile" && (
          <AdminProfile profile={data.profile} onUpdate={handleProfileUpdate} />
        )}
        {activeTab === "qrcode" && <AdminQRCode />}
      </div>
    </main>
  );
}
