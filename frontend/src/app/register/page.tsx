"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Mail, Lock, User, Building2, AlertCircle, Loader2, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", officeName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { setError("Senha deve ter no mínimo 6 caracteres"); return; }
    setError(""); setLoading(true);
    try {
      await register(form);
    } catch (err: any) {
      setError(err.message ?? "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name" as const, label: "Seu Nome Completo", placeholder: "João da Silva", icon: User, type: "text" },
    { key: "officeName" as const, label: "Nome do Escritório", placeholder: "Escritório Contábil Silva", icon: Building2, type: "text" },
    { key: "email" as const, label: "E-mail Profissional", placeholder: "joao@escritorio.com.br", icon: Mail, type: "email" },
    { key: "password" as const, label: "Senha", placeholder: "Mínimo 6 caracteres", icon: Lock, type: "password" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, background: "#10b98120", border: "2px solid #10b981", borderRadius: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#10b981" }}>P</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>Criar Escritório</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Comece seu período de avaliação gratuita</div>
        </div>

        {/* Benefícios */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
          {["14 dias grátis", "Sem cartão de crédito", "Cancele quando quiser"].map(b => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#10b981" }}>
              <CheckCircle size={13} /> {b}
            </div>
          ))}
        </div>

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 32 }}>
          {error && (
            <div style={{ background: "#ef444415", border: "1px solid #ef444440", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <AlertCircle size={15} color="#ef4444" />
              <span style={{ fontSize: 13, color: "#fca5a5" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {fields.map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, fontWeight: 600 }}>{f.label}</label>
                <div style={{ position: "relative" }}>
                  <f.icon size={14} color="#475569" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type={f.type} value={form[f.key]} onChange={set(f.key)}
                    placeholder={f.placeholder} required
                    style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 12px 10px 36px", fontSize: 13, color: "#e2e8f0", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              style={{ width: "100%", background: loading ? "#0d9e6a" : "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}
            >
              {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Criando...</> : "Criar Escritório Grátis"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#475569" }}>
            Já tem conta?{" "}
            <Link href="/login" style={{ color: "#10b981", fontWeight: 600, textDecoration: "none" }}>
              Entrar →
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
