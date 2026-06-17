"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

function generateCaptcha() {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const ops = ["+", "-", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let answer: number;
  switch (op) {
    case "+": answer = a + b; break;
    case "-": answer = a - b; break;
    case "×": answer = a * b; break;
  }
  return { question: `${a} ${op} ${b} = ?`, answer };
}

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha, setCaptcha] = useState({ question: "", answer: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (parseInt(captchaInput) !== captcha.answer) {
      setError("Resposta do captcha incorreta!");
      refreshCaptcha();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const { token } = await res.json();
        document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Strict`;
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Senha incorreta!");
        refreshCaptcha();
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-6">
            Painel Administrativo
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Verificação
              </label>
              <div className="flex items-center gap-3">
                <span className="text-lg font-mono font-bold text-[var(--text-primary)] select-none">
                  {captcha.question}
                </span>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                  placeholder="?"
                  className="w-20 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]
                             text-[var(--text-primary)] text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  title="Nova conta"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  ⟳
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]
                           text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium
                         rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <button
            onClick={() => router.push("/")}
            className="mt-4 w-full text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Voltar ao site
          </button>
        </div>
      </div>
    </main>
  );
}
