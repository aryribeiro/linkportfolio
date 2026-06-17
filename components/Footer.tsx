"use client";

import { useEffect, useState } from "react";

export function Footer() {
  const [dateTime, setDateTime] = useState("");
  const [ip, setIp] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      const day = days[now.getDay()];
      const formatted = now.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setDateTime(`${day}, ${formatted}`);
    };

    update();
    const interval = setInterval(update, 1000);

    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setIp(data.ip))
      .catch(() => setIp("indisponível"));

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="text-center mt-12 mb-20 px-4 text-sm text-[var(--text-secondary)]">
        <hr className="border-[var(--border-color)] mb-4" />
        <p>
          <strong>LinkPortfólio</strong> | Um web app para organizar seu
          portfólio c/ links, contatos, aplicativos e projetos.
          <br />
          Por <strong>Ary Ribeiro</strong>.
        </p>
      </div>

      <footer
        className="fixed bottom-0 left-0 w-full bg-[var(--card-bg)] border-t border-[var(--border-color)]
                   text-center py-2 text-sm text-[var(--text-secondary)] z-50 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]"
      >
        <span>⏰ {dateTime || "Carregando..."} — 💻 {ip || "..."}</span>
      </footer>
    </>
  );
}
