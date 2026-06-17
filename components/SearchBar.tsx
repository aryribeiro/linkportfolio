"use client";

import { useState } from "react";

export function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    const container = document.getElementById("links-container");
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>("a[data-title]");
    const normalized = value.toLowerCase().trim();

    cards.forEach((card) => {
      const title = card.dataset.title || "";
      const category = card.dataset.category || "";
      const matches =
        !normalized || title.includes(normalized) || category.includes(normalized);
      card.style.display = matches ? "" : "none";
    });

    const sections = container.querySelectorAll("section");
    sections.forEach((section) => {
      const visibleCards = section.querySelectorAll<HTMLElement>(
        'a[data-title]:not([style*="display: none"])'
      );
      (section as HTMLElement).style.display =
        visibleCards.length > 0 ? "" : "none";
    });
  };

  return (
    <div className="mb-8 flex justify-end">
      <div className="relative w-[70%]">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar links..."
          aria-label="Buscar links"
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]
                     text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     transition-all"
        />
        {query && (
          <button
            onClick={() => handleSearch("")}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
