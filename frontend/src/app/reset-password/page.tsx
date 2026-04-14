"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) {
      setErrorMsg("Token de redefinição não encontrado. Solicite novamente.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao redefinir a senha. O link pode ter expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, background: "#10b98120", border: "2px solid #10b981", borderRadius: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#10b981" }}>P</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.5 }}>Redefinir Senha</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Crie uma nova senha segura</div>
        </div>

        {/* Card */}
        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 32 }}>
          {success ? (
            <div style={{ textAlign: "center" }}>
              <CheckCircle size={48} color="#10b981" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ color: "#f1f5f9", fontSize: 18, marginBottom: 8, fontWeight: 600 }}>Senha Atualizada!</h3>
              <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 32 }}>
                Sua senha foi redefinida com sucesso. Você já pode acessar sua conta.
              </p>
              <Link href="/login" style={{ display: "block", width: "100%", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "12px 0", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                Fazer Login
              </Link>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div style={{ background: "#ef444415", border: "1px solid #ef444440", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <AlertCircle size={15} color="#ef4444" />
                  <span style={{ fontSize: 13, color: "#fca5a5" }}>{errorMsg}</span>
                </div>
              )}

              {!token && !errorMsg && (
                <div style={{ background: "#f59e0b15", border: "1px solid #f59e0b40", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <AlertCircle size={15} color="#f59e0b" />
                  <span style={{ fontSize: 13, color: "#fcd34d" }}>O token de verificação está ausente na URL.</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>Nova Senha</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={14} color="#475569" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required disabled={!token} minLength={6}
                      style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px 10px 36px", fontSize: 13, color: "#e2e8f0", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>Confirme a Nova Senha</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={14} color="#475569" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" required disabled={!token} minLength={6}
                      style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px 10px 36px", fontSize: 13, color: "#e2e8f0", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading || !token}
                  style={{ width: "100%", background: (loading || !token) ? "#0d9e6a" : "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: (loading || !token) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
                >
                  {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Salvando...</> : "Definir Nova Senha"}
                </button>
              </form>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e293b", textAlign: "center" }}>
                <Link href="/login" style={{ fontSize: 13, color: "#64748b", fontWeight: 600, textDecoration: "none" }}>
                  ← Cancelar e Voltar para o Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
