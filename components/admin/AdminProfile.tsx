"use client";

import { useState } from "react";
import { Profile } from "@/lib/types";

interface AdminProfileProps {
  profile: Profile;
  onUpdate: (profile: Profile) => Promise<boolean>;
}

export function AdminProfile({ profile, onUpdate }: AdminProfileProps) {
  const [name, setName] = useState(profile.name);
  const [description, setDescription] = useState(profile.description);
  const [image, setImage] = useState<string | null>(profile.image);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 300;
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);
          const base64 = canvas.toDataURL("image/png").split(",")[1];
          setImage(base64);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onUpdate({ name, description, image });
    setMessage(ok ? "Perfil atualizado!" : "Erro ao atualizar.");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const imageUrl = image ? `data:image/png;base64,${image}` : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">
        Editar Perfil
      </h2>

      <div className="flex items-center gap-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Perfil"
            className="w-24 h-24 rounded-full object-cover border-2 border-[var(--border-color)]"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] flex items-center justify-center text-3xl">
            👤
          </div>
        )}
        <div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageUpload}
            className="text-sm text-[var(--text-secondary)] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900/20 dark:file:text-primary-300"
          />
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Recomendado: 300x300px
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Nome
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)]"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] resize-none"
          />
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.includes("atualizado") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Salvar Perfil"}
      </button>
    </form>
  );
}
