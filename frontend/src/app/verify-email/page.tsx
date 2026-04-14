"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link de verificação inválido ou incompleto.");
      return;
    }

    fetch(`${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("success");
          setMessage(data.message ?? "E-mail verificado com sucesso!");
        } else {
          setStatus("error");
          setMessage(data.message ?? "Link de verificação expirado ou inválido.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Erro ao conectar com o servidor. Tente novamente.");
      });
  }, [token]);

  return (
    <div style={{
      minHeight: "100vh", background: "#080d1a", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 52, height: 52, background: "#10b98120", border: "2px solid #10b981",
            borderRadius: 14, marginBottom: 14,
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#10b981" }}>P</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.5 }}>
            PAC Gestão Contábil
          </div>
        </div>

        <div style={{
          background: "#111827", border: "1px solid #1e293b",
          borderRadius: 16, padding: 40,
        }}>
          {status === "loading" && (
            <>
              <Loader2 size={40} color="#10b981" style={{ animation: "spin 1s linear infinite", marginBottom: 16 }} />
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Verificando seu e-mail...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle size={48} color="#10b981" style={{ marginBottom: 16 }} />
              <h2 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                E-mail Verificado!
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                {message}
              </p>
              <button
                onClick={() => router.push("/login?verified=1")}
                style={{
                  background: "#10b981", color: "#fff", border: "none", borderRadius: 8,
                  padding: "11px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}
              >
                Fazer Login
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
              <h2 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                Verificação Falhou
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                {message}
              </p>
              <button
                onClick={() => router.push("/login")}
                style={{
                  background: "#1e293b", color: "#94a3b8", border: "1px solid #334155",
                  borderRadius: 8, padding: "11px 32px", fontSize: 14, fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Voltar ao Login
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
