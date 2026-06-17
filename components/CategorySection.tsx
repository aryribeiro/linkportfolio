"use client";

import { Link } from "@/lib/types";
import { LinkCard } from "./LinkCard";
import { motion } from "framer-motion";

interface CategorySectionProps {
  category: string;
  links: Link[];
}

export function CategorySection({ category, links }: CategorySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-4">
        {category}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((link, i) => (
          <LinkCard key={link.id} link={link} index={i} />
        ))}
      </div>
    </motion.section>
  );
}
