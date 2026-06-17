"use client";

import { Profile } from "@/lib/types";
import { motion } from "framer-motion";

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row items-center gap-5 mb-10"
    >
      <div className="flex-shrink-0">
        <img
          src={profile.photo}
          alt={`Foto de ${profile.name}`}
          className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-[var(--border-color)] shadow-lg"
        />
      </div>
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {profile.name}
        </h1>
        <p className="text-[var(--text-secondary)] mt-2 max-w-md leading-relaxed text-sm sm:text-base">
          {profile.description}
        </p>
      </div>
    </motion.div>
  );
}
