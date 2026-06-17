"use client";

import { useState, useRef, useEffect } from "react";
import { Profile } from "@/lib/types";

const PROFILE_PHOTOS = [
  { name: "Foto Principal", path: "/foto/foto_perfil.jpg" },
];

interface AdminProfileProps {
  profile: Profile;
  photos?: string[];
  onUpdate: (profile: Profile) => Promise<boolean>;
}

export function AdminProfile({ profile, photos = [], onUpdate }: AdminProfileProps) {
  const [name, setName] = useState(profile.name);
  const [description, setDescription] = useState(profile.description);
  const [photo, setPhoto] = useState(profile.photo);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  const allPhotos = [
    ...PROFILE_PHOTOS,
    ...photos.filter((p) => !PROFILE_PHOTOS.some((pp) => pp.path === p)).map((p) => ({
      name: p.split("/").pop()?.replace(/\.[^.]+$/, "") || p,
      path: p,
    })),
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPhotoPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onUpdate({ name, description, photo });
    setMessage(ok ? "Perfil atualizado!" : "Erro ao atualizar.");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">
        Editar Perfil
      </h2>

      {/* Seletor de Foto */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Foto de Perfil
        </label>
        <div className="flex items-center gap-4">
          <img
            src={photo}
            alt="Perfil"
            className="w-24 h-24 rounded-full object-cover border-2 border-[var(--border-color)]"
          />
          <div className="relative flex-1" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setShowPhotoPicker(!showPhotoPicker)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-sm hover:border-primary-400 transition-colors"
            >
              <span className="flex-1 text-[var(--text-primary)] text-left truncate">
                {allPhotos.find((p) => p.path === photo)?.name || photo.split("/").pop()}
              </span>
              <svg
                className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${showPhotoPicker ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showPhotoPicker && (
              <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
                <div className="px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-secondary)]">
                  Fotos disponíveis (/public/foto/)
                </div>
                {allPhotos.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => { setPhoto(item.path); setShowPhotoPicker(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-secondary)] transition-colors text-sm ${
                      photo === item.path ? "bg-primary-50 dark:bg-primary-900/20" : ""
                    }`}
                  >
                    <img src={item.path} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                    <span className="text-[var(--text-primary)]">{item.name}</span>
                    {photo === item.path && (
                      <svg className="w-4 h-4 ml-auto text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
                <p className="px-3 py-2 text-xs text-[var(--text-secondary)]">
                  Para adicionar mais fotos, coloque-as na pasta <code>public/foto/</code> do repositório.
                </p>
              </div>
            )}
          </div>
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
