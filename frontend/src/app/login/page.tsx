"use client";

import { useState, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Mail, Lock, AlertCircle, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";

const EMAIL_NOT_VERIFIED_MSG = "Você precisa confirmar seu e-mail antes de acessar.";

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const verified = searchParams.get("verified") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const needsVerification = error.includes("confirmar seu e-mail");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendMsg("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message ?? "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setError("Informe o e-mail acima antes de reenviar."); return; }
    setResendLoading(true);
    setResendMsg("");
    try {
      const data = await authApi.resendVerificationEmail(email);
      setResendMsg(data.message ?? "E-mail reenviado! Verifique sua caixa de entrada e spam.");
      setError("");
    } catch (err: any) {
      setResendMsg(err.message ?? "Erro ao reenviar. Tente novamente.");
    } finally {
      setResendLoading(false);
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
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.5 }}>PAC Gestão Contábil</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Entre na sua conta</div>
        </div>

        {/* Card */}
        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 32 }}>
          {registered && (
            <div style={{ background: "#10b98115", border: "1px solid #10b98140", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 20 }}>
              <CheckCircle size={15} color="#10b981" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#6ee7b7" }}>
                Conta criada! Enviamos um e-mail de confirmação. Verifique sua caixa de entrada (e a pasta de spam) antes de fazer login.
              </span>
            </div>
          )}
          {verified && (
            <div style={{ background: "#10b98115", border: "1px solid #10b98140", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <CheckCircle size={15} color="#10b981" />
              <span style={{ fontSize: 13, color: "#6ee7b7" }}>E-mail verificado! Você já pode fazer login.</span>
            </div>
          )}
          {error && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ background: "#ef444415", border: "1px solid #ef444440", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <AlertCircle size={15} color="#ef4444" style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#fca5a5" }}>{error}</span>
              </div>
              {needsVerification && (
                <button
                  onClick={handleResend} disabled={resendLoading} type="button"
                  style={{ marginTop: 8, width: "100%", background: "transparent", border: "1px solid #334155", borderRadius: 8, padding: "9px 0", fontSize: 13, color: "#94a3b8", cursor: resendLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  {resendLoading
                    ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Reenviando...</>
                    : <><RefreshCw size={14} /> Reenviar e-mail de confirmação</>}
                </button>
              )}
            </div>
          )}
          {resendMsg && (
            <div style={{ background: "#10b98115", border: "1px solid #10b98140", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <CheckCircle size={15} color="#10b981" />
              <span style={{ fontSize: 13, color: "#6ee7b7" }}>{resendMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
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

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>Senha</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} color="#475569" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px 10px 36px", fontSize: 13, color: "#e2e8f0", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{ width: "100%", background: loading ? "#0d9e6a" : "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
            >
              {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Entrando...</> : "Entrar"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#475569" }}>
            Ainda não tem conta?{" "}
            <Link href="/register" style={{ color: "#10b981", fontWeight: 600, textDecoration: "none" }}>
              Criar escritório →
            </Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#334155" }}>
          PAC Gestão Contábil — Sistema Multi-tenant
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
