"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle, ArrowRight, Menu, X, Star, Zap, Shield, TrendingUp,
  FileText, CheckSquare, Users, FolderOpen, Calendar, MessageSquare,
  BarChart2, Bell, Clock, AlertTriangle, ChevronDown, Play,
  Building2, DollarSign, RefreshCw, Mail, Phone, Globe, ExternalLink
} from "lucide-react";

const FEATURES = [
  { icon: FileText, title: "Obrigações Fiscais", desc: "Controle SPED, eSocial, EFD-REINF, RAIS, DAS e todas as obrigações do escritório. Alertas automáticos antes do vencimento. Nunca mais perca um prazo.", cor: "#10b981" },
  { icon: CheckSquare, title: "Kanban de Tarefas", desc: "Distribua tarefas entre a equipe e acompanhe em tempo real. Do backlog à conclusão, tudo visível num só lugar.", cor: "#3b82f6" },
  { icon: Users, title: "Gestão de Clientes", desc: "Cadastro completo com regime tributário, obrigações vinculadas e histórico. Acesse tudo em segundos.", cor: "#a855f7" },
  { icon: Calendar, title: "Calendário Fiscal", desc: "Visão mensal de todos os vencimentos. Planeje o mês antes que ele comece e elimine as surpresas.", cor: "#f59e0b" },
  { icon: FolderOpen, title: "Documentos", desc: "Envie, organize e compartilhe documentos com os clientes. PDF, XML, SPED — tudo em nuvem, com segurança.", cor: "#06b6d4" },
  { icon: MessageSquare, title: "Chat Interno", desc: "Comunicação da equipe dentro do sistema. Sem WhatsApp misturado com assuntos pessoais.", cor: "#ef4444" },
  { icon: BarChart2, title: "Relatórios", desc: "Veja a performance do escritório: taxa de conclusão, obrigações por colaborador, evolução mensal.", cor: "#10b981" },
  { icon: Shield, title: "Multi-usuário + Roles", desc: "Defina quem acessa o quê. OWNER, Contador, Fiscal, DP, Auxiliar — cada um vê apenas o que precisa.", cor: "#3b82f6" },
];

const PAINS = [
  { emoji: "📋", title: "Planilha que só você entende", desc: "Quando alguém falta, o escritório trava. A informação fica presa na cabeça de uma pessoa só." },
  { emoji: "⏰", title: "Multas por prazo perdido", desc: "Uma aba de Excel esquecida, um e-mail não visto. O cliente paga a multa — e você perde a confiança dele." },
  { emoji: "🔥", title: "Abril e novembro são um pesadelo", desc: "Todo fim de mês a equipe entra em modo de sobrevivência. Horas extras todo mês, para sempre." },
  { emoji: "❓", title: "\"Onde está o documento X?\"", desc: "Pastas no computador, e-mail, WhatsApp, Dropbox. Ninguém sabe onde está nada." },
];

const TESTIMONIALS = [
  { nome: "Marcela Ferreira", cargo: "Sócia-diretora", escritorio: "MF Contabilidade", av: "MF", cor: "#10b981", stars: 5, texto: "Antes eu passava domingo à noite atualizando planilha. Hoje abro o PAC em 30 segundos e já sei exatamente o que a semana vai cobrar de mim." },
  { nome: "Roberto Alves", cargo: "Contador", escritorio: "Alves & Associados", av: "RA", cor: "#3b82f6", stars: 5, texto: "A minha equipe de 4 pessoas passou a funcionar como uma de 8. A distribuição de tarefas no kanban mudou completamente a nossa operação." },
  { nome: "Priscila Nunes", cargo: "Proprietária", escritorio: "Nunes Assessoria Contábil", av: "PN", cor: "#a855f7", stars: 5, texto: "Zero multas por atraso desde que implantamos. Só isso já pagou o sistema por muitos meses. Indico sem hesitar." },
];

const FAQ = [
  { q: "Preciso instalar alguma coisa?", a: "Não. O PAC Gestão Contábil é 100% na nuvem. Funciona em qualquer navegador, no computador ou no celular. Basta criar sua conta e começar." },
  { q: "Quantos usuários e clientes posso cadastrar?", a: "No plano Professional (R$ 97,90/mês) você cadastra até 10 colaboradores com perfis de acesso individuais e até 50 clientes. Ideal para escritórios de pequeno porte em crescimento." },
  { q: "Meus dados ficam seguros?", a: "Sim. Usamos banco de dados com criptografia, autenticação JWT com refresh token e backups automáticos diários. Sua informação não vai a lugar nenhum." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem multa e sem burocracia. O cancelamento é feito em um clique pelo painel de configurações." },
  { q: "Como funciona o período de avaliação?", a: "São 14 dias grátis, sem cartão de crédito. Você usa tudo do plano Professional sem restrições e só paga se quiser continuar." },
  { q: "E se eu precisar de ajuda para começar?", a: "Nosso suporte via chat e e-mail responde em até 2 horas úteis. Também temos vídeos de onboarding para cada módulo do sistema." },
];

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function CounterSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const c1 = useCountUp(340, 1800, visible);
  const c2 = useCountUp(14, 1400, visible);
  const c3 = useCountUp(97, 1600, visible);
  const c4 = useCountUp(4700, 2000, visible);

  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "#1e293b" }}>
      {[
        { val: c1, suffix: "+", label: "Escritórios ativos" },
        { val: c2, suffix: " dias", label: "Para sentir a diferença" },
        { val: c3, suffix: "%", label: "Taxa de renovação" },
        { val: c4, suffix: "+", label: "Obrigações controladas/mês" },
      ].map(s => (
        <div key={s.label} style={{ background: "#0f172a", padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: "#10b981", lineHeight: 1 }}>{s.val}{s.suffix}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 8, fontWeight: 500 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const C = {
    green: "#10b981",
    dark: "#080d1a",
    card: "#111827",
    border: "#1e293b",
    text: "#e2e8f0",
    muted: "#64748b",
  };

  return (
    <div style={{ background: C.dark, color: C.text, fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? "#080d1aee" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid #1e293b" : "none", transition: "all 0.3s", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "#10b98120", border: "2px solid #10b981", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: C.green }}>P</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: -0.5, lineHeight: 1 }}>PAC Gestão</div>
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: 2, textTransform: "uppercase" }}>Contábil</div>
          </div>
        </div>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Funcionalidades", "Por que PAC?", "Preço", "FAQ"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/[^a-z]/g, "").replace("porquepac", "porque")}`}
              style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none", fontWeight: 500, cursor: "pointer" }}
              onClick={e => {
                e.preventDefault();
                const id = item === "Por que PAC?" ? "porque" : item.toLowerCase().replace(/[^a-z]/g, "");
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
              }}>
              {item}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #334155", color: "#94a3b8", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Entrar</Link>
          <Link href="/register" style={{ padding: "8px 18px", borderRadius: 8, background: C.green, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>Teste grátis →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, background: "radial-gradient(circle, #10b98112 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "10%", left: "10%", width: 300, height: 300, background: "radial-gradient(circle, #3b82f608 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "15%", right: "10%", width: 250, height: 250, background: "radial-gradient(circle, #a855f708 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 780, position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#10b98115", border: "1px solid #10b98130", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 28, letterSpacing: 0.5 }}>
            <Zap size={12} /> NOVO · Sistema completo para escritórios contábeis
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: -2, marginBottom: 24, color: "#fff" }}>
            Chega de planilha.<br />
            <span style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Seu escritório merece
            </span>
            <br />um sistema de verdade.
          </h1>

          <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: "0 auto 40px" }}>
            Controle obrigações fiscais, distribua tarefas, gerencie clientes e nunca mais perca um prazo. Tudo em um sistema feito para escritórios contábeis que querem crescer.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.green, color: "#fff", padding: "15px 32px", borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: "none", boxShadow: "0 0 32px #10b98140" }}>
              Começar grátis por 14 dias <ArrowRight size={16} />
            </Link>
            <a href="#demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#94a3b8", padding: "15px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none", border: "1px solid #334155", cursor: "pointer" }}
              onClick={e => { e.preventDefault(); document.getElementById("funcionalidades")?.scrollIntoView({ behavior: "smooth" }); }}>
              <Play size={14} /> Ver como funciona
            </a>
          </div>

          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
            {["Sem cartão de crédito", "14 dias grátis", "Cancele quando quiser"].map(b => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#475569" }}>
                <CheckCircle size={14} color={C.green} /> {b}
              </div>
            ))}
          </div>

          {/* Mini preview do app */}
          <div style={{ marginTop: 60, background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: "16px 20px", maxWidth: 640, margin: "60px auto 0", boxShadow: "0 40px 80px #000a" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {["#ef4444", "#f59e0b", "#10b981"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { label: "Clientes Ativos", val: "5", cor: "#10b981" },
                { label: "Ob. Pendentes", val: "4", cor: "#f59e0b" },
                { label: "Concluídas", val: "3", cor: "#3b82f6" },
                { label: "Tarefas", val: "6", cor: "#a855f7" },
              ].map(s => (
                <div key={s.label} style={{ background: "#0f172a", borderRadius: 8, padding: "12px 10px", border: `1px solid ${s.cor}25` }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.cor }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1, background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #1e293b" }}>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 6 }}>⏰ Próximos vencimentos</div>
                {[["EFD-REINF", "15/04", "#f59e0b"], ["eSocial", "07/04", "#ef4444"], ["SPED Fiscal", "20/04", "#3b82f6"]].map(([n, d, c]) => (
                  <div key={n as string} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #1e293b20" }}>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{n}</span>
                    <span style={{ fontSize: 11, color: c as string, fontWeight: 700 }}>{d}</span>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #1e293b" }}>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 6 }}>📋 Tarefas urgentes</div>
                {[["Balancete Horizonte", "alta", "#f59e0b"], ["IRPJ LogMove", "crítica", "#ef4444"], ["Conciliação TechSol.", "alta", "#f59e0b"]].map(([n, p, c]) => (
                  <div key={n as string} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #1e293b20" }}>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{n}</span>
                    <span style={{ fontSize: 10, color: c as string, fontWeight: 700 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTADORES ── */}
      <CounterSection />

      {/* ── DOR → SOLUÇÃO ── */}
      <section id="porque" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 12, color: C.green, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>A realidade de quem usa planilha</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1.15 }}>
            Você reconhece algum<br />desses problemas?
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {PAINS.map(p => (
            <div key={p.title} style={{ background: "#111827", border: "1px solid #ef444420", borderRadius: 14, padding: 28, display: "flex", gap: 18 }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>{p.emoji}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, background: "linear-gradient(135deg, #10b98115, #3b82f610)", border: "1px solid #10b98130", borderRadius: 16, padding: 36, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 12 }}>
            O PAC resolve todos esses pontos — em um só lugar.
          </div>
          <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 24 }}>
            Feito especificamente para escritórios contábeis de pequeno e médio porte que querem sair do caos e operar com profissionalismo.
          </div>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.green, color: "#fff", padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Quero resolver esses problemas <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section id="funcionalidades" style={{ padding: "100px 24px", background: "#0a0f1e" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, color: C.green, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Tudo que você precisa</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: -1, lineHeight: 1.15 }}>
              8 módulos integrados.<br />Uma plataforma completa.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: "#111827", border: `1px solid ${f.cor}20`, borderRadius: 14, padding: 24, transition: "transform 0.2s", cursor: "default" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                <div style={{ width: 44, height: 44, background: f.cor + "20", border: `1px solid ${f.cor}40`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <f.icon size={20} color={f.cor} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARATIVO ── */}
      <section style={{ padding: "100px 24px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 12, color: C.green, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Antes × Depois</div>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#fff", letterSpacing: -1 }}>
            O que muda quando você migra
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderRadius: 16, overflow: "hidden", border: "1px solid #1e293b" }}>
          <div style={{ background: "#0f172a", padding: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>❌ Planilha</div>
            {["Prazos perdidos e multas", "Equipe trabalha no escuro", "Docs espalhados em pastas e e-mail", "Zero visibilidade do escritório", "Só você sabe o que está acontecendo", "Domingo à noite atualizando aba", "Cresce pouco porque tudo é manual"].map(i => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid #1e293b30", fontSize: 13, color: "#64748b" }}>
                <X size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} /> {i}
              </div>
            ))}
          </div>
          <div style={{ background: "#111827", padding: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 20, letterSpacing: 1, textTransform: "uppercase" }}>✅ PAC Gestão</div>
            {["Alertas antes de todo vencimento", "Kanban visível para toda a equipe", "Documentos em nuvem, por cliente", "Dashboard com KPIs em tempo real", "Delegue e acompanhe com confiança", "Fim de semana livre de trabalho", "Escalável com novos colaboradores"].map(i => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid #1e293b30", fontSize: 13, color: "#e2e8f0" }}>
                <CheckCircle size={14} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} /> {i}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section style={{ padding: "100px 24px", background: "#0a0f1e" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: C.green, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Quem já usa</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#fff", letterSpacing: -1 }}>
              Escritórios que saíram do caos
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.nome} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 28 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {Array(t.stars).fill(0).map((_, i) => <Star key={i} size={14} color="#f59e0b" fill="#f59e0b" />)}
                </div>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{t.texto}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.cor + "25", border: `2px solid ${t.cor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: t.cor }}>{t.av}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{t.nome}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{t.cargo} · {t.escritorio}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREÇO ── */}
      <section id="preco" style={{ padding: "100px 24px", maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: C.green, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Preço simples, sem surpresas</div>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#fff", letterSpacing: -1, marginBottom: 40 }}>
          Um plano. Tudo incluído.
        </h2>

        <div style={{ background: "#111827", border: "2px solid #10b981", borderRadius: 20, padding: 40, position: "relative", boxShadow: "0 0 60px #10b98118" }}>
          <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: C.green, color: "#fff", padding: "4px 18px", borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>MAIS POPULAR</div>

          <div style={{ fontSize: 13, fontWeight: 700, color: C.green, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Professional</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 20, color: "#475569", fontWeight: 500 }}>R$</span>
            <span style={{ fontSize: 64, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: -2 }}>97</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>,90</span>
          </div>
          <div style={{ fontSize: 13, color: "#475569", marginBottom: 32 }}>por mês · cobrado mensalmente</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36, textAlign: "left" }}>
            {[
              "Até 50 clientes cadastrados",
              "Até 10 usuários com perfis distintos",
              "Obrigações fiscais por cliente",
              "Calendário fiscal completo",
              "Kanban de tarefas",
              "Documentos em nuvem",
              "Chat interno da equipe",
              "Relatórios e analytics",
              "Suporte via chat e e-mail",
              "Atualizações incluídas",
            ].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#e2e8f0" }}>
                <CheckCircle size={16} color={C.green} style={{ flexShrink: 0 }} /> {f}
              </div>
            ))}
          </div>

          <Link href="/register" style={{ display: "block", background: C.green, color: "#fff", padding: "15px 0", borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: "none", boxShadow: "0 0 24px #10b98150" }}>
            Começar grátis por 14 dias →
          </Link>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 12 }}>Sem cartão de crédito · Cancele quando quiser</div>
        </div>

        <div style={{ marginTop: 32, padding: 20, background: "#111827", border: "1px solid #1e293b", borderRadius: 12 }}>
          <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>
            💡 <strong style={{ color: "#e2e8f0" }}>Pense assim:</strong> multas por atraso na entrega de obrigações podem chegar a R$ 5.000 por ocorrência. O PAC paga a si mesmo no primeiro prazo que ele te ajudar a não perder.
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "80px 24px 100px", background: "#0a0f1e" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 12, color: C.green, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Dúvidas frequentes</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: "#fff", letterSpacing: -1 }}>Perguntas frequentes</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQ.map((f, i) => (
              <div key={i} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", background: "none", border: "none", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{f.q}</span>
                  <ChevronDown size={16} color="#475569" style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 22px 18px", fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle, #10b98115 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 12, color: C.green, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Está pronto?</div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900, color: "#fff", letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 20 }}>
            Seu escritório pode operar<br />em outro nível a partir de hoje.
          </h2>
          <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, marginBottom: 40 }}>
            Crie sua conta agora. Em menos de 5 minutos você já terá seu escritório configurado e sua equipe dentro do sistema.
          </p>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.green, color: "#fff", padding: "17px 40px", borderRadius: 12, fontWeight: 800, fontSize: 16, textDecoration: "none", boxShadow: "0 0 48px #10b98140" }}>
            Criar minha conta grátis <ArrowRight size={18} />
          </Link>
          <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            {["14 dias grátis", "Sem cartão", "Suporte incluso", "Cancele quando quiser"].map(b => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#475569" }}>
                <CheckCircle size={13} color={C.green} /> {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #1e293b", padding: "48px 24px", background: "#080d1a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, background: "#10b98120", border: "2px solid #10b981", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: C.green }}>P</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>PAC Gestão Contábil</div>
            </div>
            <div style={{ fontSize: 12, color: "#334155" }}>Sistema operacional para escritórios contábeis.</div>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {[["Login", "/login"], ["Criar conta", "/register"], ["Suporte", "mailto:suporte@pacgestao.com.br"]].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 13, color: "#475569", textDecoration: "none" }}>{label}</Link>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#1e293b" }}>© 2026 PAC Gestão Contábil. Todos os direitos reservados.</div>
        </div>
      </footer>

    </div>
  );
}
