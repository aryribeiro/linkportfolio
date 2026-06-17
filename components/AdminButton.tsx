"use client";

import { useRouter } from "next/navigation";

export function AdminButton() {
  const router = useRouter();

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={() => router.push("/admin/login")}
        className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                   transition-colors underline-offset-2 hover:underline"
      >
        Admin
      </button>
    </div>
  );
}
