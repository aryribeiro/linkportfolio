"use client";

import { useState, useRef, useEffect } from "react";
import { Link, CustomIcon } from "@/lib/types";
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

const LOCAL_ICONS = [
  { name: "Aplicativo (geral)", path: "/icones/appicon.png" },
  { name: "Direto Notícias", path: "/icones/dnicon.png" },
  { name: "GitHub", path: "/icones/githubicon.png" },
  { name: "Gmail", path: "/icones/gmailicon.png" },
  { name: "Instagram", path: "/icones/instagramicon.png" },
  { name: "LinkedIn", path: "/icones/linkedinicon.png" },
  { name: "WhatsApp", path: "/icones/whatsicon.png" },
  { name: "YouTube", path: "/icones/youtubeicon.png" },
  { name: "Credly", path: "/icones/credly.png" },
];

const EMOJI_ICONS = [
  { name: "Hiperlink", value: "🔗" },
  { name: "Livro ou E-book", value: "📖" },
  { name: "E-mail", value: "📧" },
  { name: "Globo (Site)", value: "🌐" },
  { name: "Vídeo", value: "🎬" },
  { name: "Código", value: "💻" },
  { name: "Educação", value: "🎓" },
];

const DEFAULT_CATEGORIES = [
  "Aplicativos & Projetos",
  "Redes Sociais e Sites",
  "Contato",
  "Videoaulas e Hands on AWS",
  "Educação",
  "Currículo",
  "Outros",
];

interface AdminLinksProps {
  links: Link[];
  customIcons?: CustomIcon[];
  categories?: string[];
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

export function AdminLinks({ links, customIcons = [], categories = [], onUpdate }: AdminLinksProps) {
  const [localLinks, setLocalLinks] = useState<Link[]>(links);
  const [editing, setEditing] = useState<Link | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLocalLinks(links);
  }, [links]);

  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])];

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
          customIcons={customIcons}
          categories={allCategories}
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
  customIcons,
  categories,
  onSave,
  onCancel,
}: {
  link: Link | null;
  customIcons: CustomIcon[];
  categories: string[];
  onSave: (link: Link) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(link?.title || "");
  const [url, setUrl] = useState(link?.url || "");
  const [icon, setIcon] = useState(link?.icon || "");
  const [category, setCategory] = useState(link?.category || categories[0] || "Outros");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowIconPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectIcon = (value: string) => {
    setIcon(value);
    setShowIconPicker(false);
  };

  const getIconLabel = (): string => {
    if (!icon) return "Selecionar ícone...";
    const emoji = EMOJI_ICONS.find((e) => e.value === icon);
    if (emoji) return emoji.name;
    const local = LOCAL_ICONS.find((i) => i.path === icon);
    if (local) return local.name;
    const custom = customIcons.find((i) => i.url === icon);
    if (custom) return custom.name;
    return icon;
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
      </div>

      {/* Dropdown de Categoria */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Categoria
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Seletor de Ícone */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Ícone
        </label>
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] text-sm text-left hover:border-primary-400 transition-colors"
          >
            <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
              {icon ? (
                <IconRenderer icon={icon} size={24} />
              ) : (
                <span className="text-[var(--text-secondary)]">—</span>
              )}
            </div>
            <span className="flex-1 text-[var(--text-primary)] truncate">
              {getIconLabel()}
            </span>
            <svg
              className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${showIconPicker ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showIconPicker && (
            <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl">
              {/* Emojis */}
              <div className="px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-secondary)]">
                Emojis
              </div>
              {EMOJI_ICONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleSelectIcon(item.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-secondary)] transition-colors text-sm ${
                    icon === item.value ? "bg-primary-50 dark:bg-primary-900/20" : ""
                  }`}
                >
                  <span className="w-7 h-7 flex items-center justify-center text-lg">{item.value}</span>
                  <span className="text-[var(--text-primary)]">{item.name}</span>
                  {icon === item.value && <Check />}
                </button>
              ))}

              {/* Ícones Locais */}
              <div className="px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-secondary)]">
                Ícones do Repositório
              </div>
              {LOCAL_ICONS.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleSelectIcon(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-secondary)] transition-colors text-sm ${
                    icon === item.path ? "bg-primary-50 dark:bg-primary-900/20" : ""
                  }`}
                >
                  <img src={item.path} alt={item.name} className="w-7 h-7 rounded object-contain" />
                  <span className="text-[var(--text-primary)]">{item.name}</span>
                  {icon === item.path && <Check />}
                </button>
              ))}

              {/* Ícones do JSON */}
              {customIcons.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-secondary)]">
                    Meus Ícones (JSON)
                  </div>
                  {customIcons.map((item, idx) => (
                    <button
                      key={`custom-${idx}`}
                      type="button"
                      onClick={() => handleSelectIcon(item.url)}
                      className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--bg-secondary)] transition-colors text-sm ${
                        icon === item.url ? "bg-primary-50 dark:bg-primary-900/20" : ""
                      }`}
                    >
                      <img src={item.url} alt={item.name} className="w-7 h-7 rounded object-contain" />
                      <span className="text-[var(--text-primary)]">{item.name}</span>
                      {icon === item.url && <Check />}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

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

function Check() {
  return (
    <svg className="w-4 h-4 ml-auto text-primary-600" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}
