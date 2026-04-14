"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      setSuccessMsg(res.message || "E-mail de redefinição enviado com sucesso.");
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao solicitar redefinição. Tente novamente.");
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
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.5 }}>Esqueceu a senha?</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Informe seu e-mail para recuperar o acesso</div>
        </div>

        {/* Card */}
        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 32 }}>
          {successMsg && (
            <div style={{ background: "#10b98115", border: "1px solid #10b98140", borderRadius: 8, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
              <CheckCircle size={16} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: "#6ee7b7", lineHeight: 1.5 }}>
                {successMsg}
              </div>
            </div>
          )}
          {errorMsg && (
            <div style={{ background: "#ef444415", border: "1px solid #ef444440", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <AlertCircle size={15} color="#ef4444" />
              <span style={{ fontSize: 13, color: "#fca5a5" }}>{errorMsg}</span>
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>E-mail</label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} color="#475569" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@escritorio.com.br" required
                    style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px 10px 36px", fontSize: 13, color: "#e2e8f0", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                style={{ width: "100%", background: loading ? "#0d9e6a" : "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
              >
                {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Solicitando...</> : "Solicitar Redefinição"}
              </button>
            </form>
          )}

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e293b", textAlign: "center" }}>
            <Link href="/login" style={{ fontSize: 13, color: "#64748b", fontWeight: 600, textDecoration: "none" }}>
              ← Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
