"use client";

import { useState } from "react";
import { Link } from "@/lib/types";
import { IconRenderer } from "../IconRenderer";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface AdminLinksProps {
  links: Link[];
  onUpdate: (links: Link[]) => Promise<boolean>;
}

function SortableItem({ link, onEdit, onRemove }: { link: Link; onEdit: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        aria-label="Arrastar para reordenar"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </button>

      <div className="flex-shrink-0">
        <IconRenderer icon={link.icon} size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--text-primary)] truncate">{link.title}</p>
        <p className="text-xs text-[var(--text-secondary)] truncate">{link.category} — {link.url}</p>
      </div>

      <div className="flex gap-1">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-primary-600 transition-colors"
          aria-label="Editar link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onRemove}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-secondary)] hover:text-red-600 transition-colors"
          aria-label="Remover link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function AdminLinks({ links, onUpdate }: AdminLinksProps) {
  const [localLinks, setLocalLinks] = useState<Link[]>(links);
  const [editing, setEditing] = useState<Link | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localLinks.findIndex((l) => l.id === active.id);
      const newIndex = localLinks.findIndex((l) => l.id === over.id);
      const reordered = arrayMove(localLinks, oldIndex, newIndex);
      setLocalLinks(reordered);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await onUpdate(localLinks);
    setMessage(ok ? "Links salvos com sucesso!" : "Erro ao salvar.");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleRemove = (id: number) => {
    setLocalLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAddOrEdit = (link: Link) => {
    if (editing) {
      setLocalLinks((prev) => prev.map((l) => (l.id === link.id ? link : l)));
      setEditing(null);
    } else {
      setLocalLinks((prev) => [...prev, link]);
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Gerenciar Links ({localLinks.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setAdding(true); setEditing(null); }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Novo Link
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Ordem"}
          </button>
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      {(adding || editing) && (
        <LinkForm
          link={editing}
          onSave={handleAddOrEdit}
          onCancel={() => { setAdding(false); setEditing(null); }}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {localLinks.map((link) => (
              <SortableItem
                key={link.id}
                link={link}
                onEdit={() => { setEditing(link); setAdding(false); }}
                onRemove={() => handleRemove(link.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function LinkForm({
  link,
  onSave,
  onCancel,
}: {
  link: Link | null;
  onSave: (link: Link) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(link?.title || "");
  const [url, setUrl] = useState(link?.url || "");
  const [icon, setIcon] = useState(link?.icon || "");
  const [category, setCategory] = useState(link?.category || "Links Úteis");
  const [iconMode, setIconMode] = useState<"upload" | "fa">(
    link?.icon?.startsWith("fa-") ? "fa" : "upload"
  );

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 64, 64);
          setIcon(canvas.toDataURL("image/png"));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    onSave({
      id: link?.id || Date.now(),
      title,
      url,
      icon,
      category,
      clicks: link?.clicks || 0,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl space-y-3"
    >
      <h3 className="font-semibold text-[var(--text-primary)]">
        {link ? "Editar Link" : "Novo Link"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          required
          className="px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL"
          required
          className="px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Categoria"
          className="px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
        />
        <div className="flex gap-2">
          <select
            value={iconMode}
            onChange={(e) => setIconMode(e.target.value as "upload" | "fa")}
            className="px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
          >
            <option value="upload">Upload Ícone</option>
            <option value="fa">Font Awesome</option>
          </select>
        </div>
      </div>

      {iconMode === "upload" ? (
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleIconUpload}
            className="text-sm text-[var(--text-secondary)] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900/20 dark:file:text-primary-300"
          />
          {icon && icon.startsWith("data:") && (
            <img src={icon} alt="Preview" className="w-8 h-8 rounded" />
          )}
        </div>
      ) : (
        <input
          type="text"
          value={icon.startsWith("fa-") ? icon : ""}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="fa-github, fa-linkedin, fa-youtube..."
          className="w-full px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
        />
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {link ? "Salvar" : "Adicionar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-secondary)] text-sm rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
