"use client";

import { Link } from "@/lib/types";
import { IconRenderer } from "./IconRenderer";
import { motion } from "framer-motion";

interface LinkCardProps {
  link: Link;
  index: number;
}

export function LinkCard({ link, index }: LinkCardProps) {
  const handleClick = () => {
    fetch("/api/links/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: link.id }),
    }).catch(() => {});
  };

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="block p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)]
                 shadow-[var(--card-shadow)] hover:shadow-[var(--card-hover-shadow)]
                 transition-shadow duration-300 no-underline"
      data-title={link.title.toLowerCase()}
      data-category={link.category.toLowerCase()}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <IconRenderer icon={link.icon} size={28} />
        </div>
        <span className="font-medium text-[var(--text-primary)] truncate">
          {link.title}
        </span>
      </div>
    </motion.a>
  );
}
