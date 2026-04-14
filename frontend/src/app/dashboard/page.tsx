"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, CheckSquare, Users, MessageSquare,
  FolderOpen, Calendar, Bell, Settings, Plus, Search, X, Send,
  Download, Trash2, ChevronLeft, ChevronRight, AlertTriangle,
  CheckCircle, Clock, Building2, Briefcase, Flag,
  Paperclip, TrendingUp, Eye, Upload, Mail,
  AlertCircle, BarChart2, Edit, Phone, LogOut,
  Shield, RefreshCw, ChevronDown, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { clientsApi, tasksApi, obligationsApi, usersApi, officeApi } from "@/lib/api";

// ── UI Types ───────────────────────────────────────────────────────────────────
interface ClientUI {
  id: string; name: string; cnpj: string; regime: string; seg: string;
  contact: string; email: string; phone: string; status: "ativo" | "inativo"; cor: string;
}
interface ObrigacaoUI {
  id: string; nome: string; cliente: string; cid: string | null;
  tipo: string; vence: string; status: string; prioridade: string; comp: string;
}
interface TarefaUI {
  id: string; titulo: string; cliente: string; cid: string | null;
  status: string; prioridade: string; vence: string; resp: string;
}
interface UsuarioUI {
  id: string; name: string; email: string; role: string;
  isActive: boolean; cor: string; av: string; createdAt: string;
}
interface EscritorioUI {
  name: string; cnpj: string; slug: string; email: string;
  phone: string; endereco: string; status: string; plano: string; createdAt: string;
}

// ── Mappers ────────────────────────────────────────────────────────────────────
const CLIENT_COLORS = ["#10b981","#3b82f6","#f59e0b","#a855f7","#ef4444","#06b6d4","#ec4899","#8b5cf6"];
const getClientColor = (id: string) => {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CLIENT_COLORS[sum % CLIENT_COLORS.length];
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: "#a855f7", ADMIN: "#3b82f6", CONTABIL: "#10b981",
  FISCAL: "#f59e0b", DP: "#06b6d4", AUXILIAR: "#6b7280",
};

const mapObStatus = (s: string) => {
  if (s === "COMPLETED") return "concluida";
  if (s === "OVERDUE") return "atrasada";
  if (s === "IN_PROGRESS") return "em_andamento";
  return "pendente";
};

const mapCategory = (cat: string) => {
  if (cat === "TRABALHISTA" || cat === "PREVIDENCIARIA") return "Trabalhista";
  if (cat === "MUNICIPAL") return "Municipal";
  if (cat === "CONTABIL") return "Contábil";
  return "Federal";
};
const mapCategoryReverse = (t: string) => {
  if (t === "TRABALHISTA") return "TRABALHISTA";
  if (t === "MUNICIPAL") return "MUNICIPAL";
  if (t === "CONTABIL") return "CONTABIL";
  return "FISCAL";
};

const mapPriority = (p: string) => {
  if (p === "URGENT") return "critica";
  if (p === "HIGH") return "alta";
  if (p === "MEDIUM") return "media";
  return "baixa";
};

const mapTaskStatus = (s: string) => {
  if (s === "DOING") return "doing";
  if (s === "DONE") return "done";
  return "todo";
};
const mapTaskStatusReverse = (s: string) => {
  if (s === "doing") return "DOING";
  if (s === "done") return "DONE";
  return "TODO";
};

const mapClient = (c: any): ClientUI => ({
  id: c.id,
  name: c.name,
  cnpj: c.document ?? "—",
  regime: c.type === "PF" ? "Pessoa Física" : "Pessoa Jurídica",
  seg: "—",
  contact: "—",
  email: c.email ?? "—",
  phone: c.phone ?? "—",
  status: c.isActive ? "ativo" : "inativo",
  cor: getClientColor(c.id),
});

const mapClientObligation = (o: any): ObrigacaoUI => ({
  id: o.id,
  nome: o.obligation?.name ?? "—",
  cliente: o.client?.name ?? "—",
  cid: o.clientId ?? null,
  tipo: mapCategory(o.obligation?.category ?? "FISCAL"),
  vence: o.nextDue ? o.nextDue.slice(0, 10) : "—",
  status: mapObStatus(o.status),
  prioridade: "media",
  comp: "",
});

const mapTask = (t: any): TarefaUI => ({
  id: t.id,
  titulo: t.title,
  cliente: t.client?.name ?? "Sem cliente",
  cid: t.clientId ?? null,
  status: mapTaskStatus(t.status),
  prioridade: mapPriority(t.priority),
  vence: t.dueDate ? t.dueDate.slice(0, 10) : "—",
  resp: t.assignedTo?.name ?? "—",
});

const mapUser = (u: any): UsuarioUI => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  isActive: u.isActive,
  cor: ROLE_COLORS[u.role] ?? "#6b7280",
  av: u.name.split(" ").map((w: string) => w[0] ?? "").join("").slice(0, 2).toUpperCase(),
  createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "—",
});

const mapOffice = (o: any): EscritorioUI => ({
  name: o.name ?? "",
  cnpj: o.cnpj ?? "—",
  slug: o.slug ?? "",
  email: "—",
  phone: "—",
  endereco: "—",
  status: o.status ?? "TRIAL",
  plano: "Professional",
  createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString("pt-BR") : "—",
});

// ── Static constants ───────────────────────────────────────────────────────────
const ROLES_INFO = [
  { role: "OWNER", label: "Proprietário", cor: "#a855f7", desc: "Acesso total ao sistema. Gerencia escritório, usuários, plano e configurações.", permissoes: ["Tudo"] },
  { role: "ADMIN", label: "Administrador", cor: "#3b82f6", desc: "Acesso total exceto configurações do escritório e plano.", permissoes: ["Clientes", "Obrigações", "Tarefas", "Documentos", "Relatórios", "Usuários"] },
  { role: "CONTABIL", label: "Contador(a)", cor: "#10b981", desc: "Acesso às áreas contábeis e fiscais.", permissoes: ["Clientes", "Obrigações", "Tarefas", "Documentos", "Relatórios"] },
  { role: "FISCAL", label: "Fiscal", cor: "#f59e0b", desc: "Foco em obrigações fiscais e documentos.", permissoes: ["Obrigações", "Documentos", "Tarefas"] },
  { role: "DP", label: "Depto. Pessoal", cor: "#06b6d4", desc: "Acesso ao departamento pessoal e folha de pagamento.", permissoes: ["Tarefas (DP)", "Documentos", "Folha"] },
  { role: "AUXILIAR", label: "Auxiliar", cor: "#6b7280", desc: "Acesso limitado: visualização e tarefas simples.", permissoes: ["Tarefas (próprias)", "Documentos (leitura)"] },
];

const CHAT_INIT = [
  { id: 1, sender: "Equipe", av: "EQ", cor: "#10b981", msg: "Bem-vindo ao PAC Gestão Contábil! Use este canal para comunicação interna.", time: "09:00", me: false },
];

const AGENDA_EVENTS = [
  { dia: 7, label: "eSocial Mensal", cor: "#10b981" },
  { dia: 15, label: "EFD-REINF / DCTF-Web", cor: "#f59e0b" },
  { dia: 20, label: "SPED / DAS / Contribuições", cor: "#a855f7" },
  { dia: 25, label: "Reuniões de fechamento", cor: "#06b6d4" },
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ABRIL_INICIO = 3;
const ABRIL_DIAS = 30;

// ── UI Components ─────────────────────────────────────────────────────────────
const Avatar = ({ initials, cor, size = 32 }: { initials: string; cor: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: cor + "33", border: `2px solid ${cor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: cor, flexShrink: 0 }}>
    {initials}
  </div>
);

const Badge = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span style={{ background: bg, color: color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
);

const statusOb = (s: string) => {
  if (s === "concluida") return { label: "Concluída", color: "#10b981", bg: "#10b98122" };
  if (s === "em_andamento") return { label: "Em Andamento", color: "#3b82f6", bg: "#3b82f622" };
  if (s === "atrasada") return { label: "Atrasada", color: "#ef4444", bg: "#ef444422" };
  return { label: "Pendente", color: "#f59e0b", bg: "#f59e0b22" };
};

const prioColor = (p: string) => {
  if (p === "critica") return "#ef4444";
  if (p === "alta") return "#f59e0b";
  if (p === "media") return "#3b82f6";
  return "#6b7280";
};

const notifIcon = (t: string) => {
  if (t === "error") return <AlertCircle size={15} color="#ef4444" />;
  if (t === "warning") return <AlertTriangle size={15} color="#f59e0b" />;
  if (t === "success") return <CheckCircle size={15} color="#10b981" />;
  return <Bell size={15} color="#3b82f6" />;
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ContabilidadeApp() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // ── Data state ───────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<ClientUI[]>([]);
  const [obrigacoes, setObrigacoes] = useState<ObrigacaoUI[]>([]);
  const [tarefas, setTarefas] = useState<TarefaUI[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioUI[]>([]);
  const [escritorio, setEscritorio] = useState<EscritorioUI>({
    name: "", cnpj: "—", slug: "", email: "—", phone: "—",
    endereco: "—", status: "TRIAL", plano: "Professional", createdAt: "—",
  });

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("dashboard");
  const [configTab, setConfigTab] = useState<"escritorio" | "usuarios" | "roles">("escritorio");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "AUXILIAR", password: "" });
  const [editEscritorio, setEditEscritorio] = useState(false);
  const [chat, setChat] = useState(CHAT_INIT);
  const [notifs, setNotifs] = useState([
    { id: 1, tipo: "info", msg: "Sistema conectado. Dados carregados com sucesso.", time: "Agora", lida: false },
  ]);
  const [showNotif, setShowNotif] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [obFilter, setObFilter] = useState("todos");
  const [searchQ, setSearchQ] = useState("");
  const [clienteDetalhe, setClienteDetalhe] = useState<ClientUI | null>(null);
  const [showAddOb, setShowAddOb] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newOb, setNewOb] = useState({ nome: "", clienteId: "", tipo: "FISCAL", dueDay: "20" });
  const [newTask, setNewTask] = useState({ titulo: "", clienteId: "", vence: "", prioridade: "MEDIUM", assignedToId: "" });
  const [newClient, setNewClient] = useState({ name: "", document: "", type: "PJ", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // ── Load all data ─────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsRes, tasksRes, obligationsRes, usersRes, officeRes] = await Promise.allSettled([
        clientsApi.list(),
        tasksApi.list(),
        obligationsApi.listClientObligations(),
        usersApi.list(),
        officeApi.get(),
      ]);
      if (clientsRes.status === "fulfilled") setClientes(clientsRes.value.map(mapClient));
      if (tasksRes.status === "fulfilled") setTarefas(tasksRes.value.map(mapTask));
      if (obligationsRes.status === "fulfilled") setObrigacoes(obligationsRes.value.map(mapClientObligation));
      if (usersRes.status === "fulfilled") setUsuarios(usersRes.value.map(mapUser));
      if (officeRes.status === "fulfilled") setEscritorio(mapOffice(officeRes.value));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Auth guard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  // ── Computed ──────────────────────────────────────────────────────────────────
  const unread = notifs.filter(n => !n.lida).length;
  const atrasadas = obrigacoes.filter(o => o.status === "atrasada").length;
  const pendentes = obrigacoes.filter(o => o.status === "pendente").length;
  const concluidas = obrigacoes.filter(o => o.status === "concluida").length;
  const clientesAtivos = clientes.filter(c => c.status === "ativo").length;

  const userAv = user?.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() ?? "VC";
  const userRole = (user as any)?.role ?? "OWNER";

  // ── Actions ───────────────────────────────────────────────────────────────────
  const sendMsg = () => {
    if (!msgInput.trim()) return;
    setChat(prev => [...prev, {
      id: Date.now(), sender: user?.name ?? "Você", av: userAv, cor: "#a855f7",
      msg: msgInput.trim(), time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), me: true
    }]);
    setMsgInput("");
  };

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, lida: true })));

  const toggleOb = async (id: string) => {
    const ob = obrigacoes.find(o => o.id === id);
    if (!ob) return;
    const newStatus = ob.status === "concluida" ? "PENDING" : "COMPLETED";
    setObrigacoes(prev => prev.map(o => o.id === id ? { ...o, status: mapObStatus(newStatus) } : o));
    try {
      await obligationsApi.updateStatus(id, newStatus);
    } catch {
      setObrigacoes(prev => prev.map(o => o.id === id ? { ...o, status: ob.status } : o));
    }
  };

  const addOb = async () => {
    if (!newOb.nome || !newOb.clienteId || !newOb.dueDay) return;
    setSaving(true);
    try {
      const template = await obligationsApi.create({
        name: newOb.nome,
        category: mapCategoryReverse(newOb.tipo),
        frequency: "MONTHLY",
        dueDay: parseInt(newOb.dueDay),
      });
      await obligationsApi.assignToClient({ clientId: newOb.clienteId, obligationId: template.id });
      await loadAll();
      setNewOb({ nome: "", clienteId: "", tipo: "FISCAL", dueDay: "20" });
      setShowAddOb(false);
    } catch (err: any) {
      alert(err?.message ?? "Erro ao criar obrigação");
    } finally {
      setSaving(false);
    }
  };

  const addTask = async () => {
    if (!newTask.titulo || !newTask.vence) return;
    setSaving(true);
    try {
      await tasksApi.create({
        title: newTask.titulo,
        priority: newTask.prioridade,
        dueDate: newTask.vence,
        ...(newTask.clienteId && { clientId: newTask.clienteId }),
        ...(newTask.assignedToId && { assignedToId: newTask.assignedToId }),
      });
      await loadAll();
      setNewTask({ titulo: "", clienteId: "", vence: "", prioridade: "MEDIUM", assignedToId: "" });
      setShowAddTask(false);
    } catch (err: any) {
      alert(err?.message ?? "Erro ao criar tarefa");
    } finally {
      setSaving(false);
    }
  };

  const moveTask = async (id: string, newStatus: string) => {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await tasksApi.updateStatus(id, mapTaskStatusReverse(newStatus));
    } catch {
      await loadAll();
    }
  };
  const saveClient = async () => {
    if (!newClient.name || !newClient.document) {
      alert("Nome e Documento são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      await clientsApi.create({
        name: newClient.name,
        document: newClient.document,
        type: newClient.type,
        ...(newClient.email && { email: newClient.email }),
        ...(newClient.phone && { phone: newClient.phone })
      });
      await loadAll();
      setNewClient({ name: "", document: "", type: "PJ", email: "", phone: "" });
      setShowAddClient(false);
    } catch (err: any) {
      alert(err?.message ?? "Erro ao cadastrar cliente");
    } finally {
      setSaving(false);
    }
  };

  const saveUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    setSaving(true);
    try {
      await usersApi.create(newUser);
      await loadAll();
      setNewUser({ name: "", email: "", role: "AUXILIAR", password: "" });
      setShowAddUser(false);
    } catch (err: any) {
      alert(err?.message ?? "Erro ao convidar usuário");
    } finally {
      setSaving(false);
    }
  };

  const toggleUser = async (id: string) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    try {
      await usersApi.toggleActive(id);
    } catch {
      await loadAll();
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Remover este usuário?")) return;
    try {
      await usersApi.remove(id);
      setUsuarios(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err?.message ?? "Erro ao remover usuário");
    }
  };

  const saveOffice = async () => {
    setSaving(true);
    try {
      await officeApi.update({ name: escritorio.name, cnpj: escritorio.cnpj });
      setEditEscritorio(false);
    } catch (err: any) {
      alert(err?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  // ── Nav ───────────────────────────────────────────────────────────────────────
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "obrigacoes", icon: FileText, label: "Obrigações" },
    { id: "tarefas", icon: CheckSquare, label: "Tarefas" },
    { id: "clientes", icon: Users, label: "Clientes" },
    { id: "documentos", icon: FolderOpen, label: "Documentos" },
    { id: "chat", icon: MessageSquare, label: "Chat Interno" },
    { id: "calendario", icon: Calendar, label: "Calendário" },
    { id: "relatorios", icon: BarChart2, label: "Relatórios" },
  ];

  // ── Styles ────────────────────────────────────────────────────────────────────
  const S: Record<string, any> = {
    app: { display: "flex", height: "100vh", background: "#080d1a", fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0", overflow: "hidden" },
    sidebar: { width: 220, background: "#0a0f1e", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", flexShrink: 0 },
    logo: { padding: "20px 20px 16px", borderBottom: "1px solid #1e293b" },
    logoTitle: { fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -0.5 },
    logoSub: { fontSize: 10, color: "#475569", marginTop: 2, letterSpacing: 1, textTransform: "uppercase" },
    nav: { flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 },
    navItem: (active: boolean) => ({ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, background: active ? "#10b98118" : "transparent", color: active ? "#10b981" : "#94a3b8", border: active ? "1px solid #10b98130" : "1px solid transparent", transition: "all 0.15s" }),
    topbar: { height: 56, background: "#0a0f1e", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    content: { flex: 1, overflowY: "auto", padding: 24 },
    card: { background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 20 },
    statCard: (cor: string) => ({ background: "#111827", border: `1px solid ${cor}30`, borderRadius: 12, padding: 20, position: "relative", overflow: "hidden" }),
    h1: { fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
    row: { display: "flex", alignItems: "center", gap: 10 },
    btn: (cor = "#10b981") => ({ background: cor, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }),
    btnOutline: { background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
    input: { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#e2e8f0", outline: "none", width: "100%" },
    label: { fontSize: 12, color: "#64748b", marginBottom: 4, display: "block" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "10px 12px", fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #1e293b" },
    td: { padding: "12px 12px", fontSize: 13, borderBottom: "1px solid #1e293b10", verticalAlign: "middle" },
    tag: (cor: string) => ({ background: cor + "20", color: cor, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }),
    kanCol: { flex: 1, background: "#0d1424", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 },
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#080d1a", flexDirection: "column", gap: 16 }}>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <Loader2 size={36} color="#10b981" style={{ animation: "spin 1s linear infinite" }} />
        <div style={{ color: "#475569", fontSize: 14 }}>Carregando dados do escritório...</div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────────
  const renderDashboard = () => {
    const stats = [
      { label: "Clientes Ativos", val: clientesAtivos, icon: Users, cor: "#10b981", sub: `de ${clientes.length} total` },
      { label: "Obrig. Pendentes", val: pendentes, icon: Clock, cor: "#f59e0b", sub: `${atrasadas} atrasadas` },
      { label: "Concluídas", val: concluidas, icon: CheckCircle, cor: "#3b82f6", sub: new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) },
      { label: "Tarefas Abertas", val: tarefas.filter(t => t.status !== "done").length, icon: CheckSquare, cor: "#a855f7", sub: `${tarefas.filter(t => t.prioridade === "critica" && t.status !== "done").length} críticas` },
    ];
    const proximosVenc = obrigacoes.filter(o => o.status !== "concluida").sort((a, b) => a.vence.localeCompare(b.vence)).slice(0, 5);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={S.h1}>Bom dia, {user?.name?.split(" ")[0] ?? ""}! 👋</div>
          <div style={{ fontSize: 13, color: "#475569" }}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        </div>

        {atrasadas > 0 && (
          <div style={{ background: "#ef444415", border: "1px solid #ef444440", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ fontSize: 13, color: "#fca5a5" }}><strong>{atrasadas} obrigação(ões) atrasada(s)</strong> exigem atenção imediata. <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => setTab("obrigacoes")}>Visualizar →</span></span>
          </div>
        )}

        {clientes.length === 0 && (
          <div style={{ background: "#3b82f615", border: "1px solid #3b82f640", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={18} color="#3b82f6" />
            <span style={{ fontSize: 13, color: "#93c5fd" }}>Nenhum cliente cadastrado ainda. <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => setTab("clientes")}>Cadastrar primeiro cliente →</span></span>
          </div>
        )}

        <div style={S.grid4}>
          {stats.map(s => (
            <div key={s.label} style={S.statCard(s.cor)}>
              <div style={{ position: "absolute", right: 16, top: 16, background: s.cor + "20", borderRadius: 8, padding: 8 }}>
                <s.icon size={18} color={s.cor} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.cor }}>{s.val}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={S.grid2}>
          <div style={S.card}>
            <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>⏰ Próximos Vencimentos</div>
              <button style={S.btnOutline} onClick={() => setTab("obrigacoes")}><Eye size={13} /> Ver tudo</button>
            </div>
            {proximosVenc.length === 0
              ? <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Nenhuma obrigação pendente</div>
              : proximosVenc.map(o => {
                  const st = statusOb(o.status);
                  return (
                    <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #1e293b20" }}>
                      <div style={{ width: 4, height: 36, borderRadius: 2, background: prioColor(o.prioridade), flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.nome}</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>{o.cliente}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{o.vence !== "—" ? o.vence.split("-").reverse().join("/") : "—"}</div>
                        <Badge {...st} />
                      </div>
                    </div>
                  );
                })
            }
          </div>

          <div style={S.card}>
            <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>📋 Tarefas Urgentes</div>
              <button style={S.btnOutline} onClick={() => setTab("tarefas")}><Eye size={13} /> Ver tudo</button>
            </div>
            {tarefas.filter(t => t.status !== "done").length === 0
              ? <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Nenhuma tarefa aberta</div>
              : tarefas.filter(t => t.status !== "done").sort((a, b) => {
                  const prio: Record<string, number> = { critica: 0, alta: 1, media: 2, baixa: 3 };
                  return prio[a.prioridade] - prio[b.prioridade];
                }).slice(0, 5).map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #1e293b20" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: prioColor(t.prioridade), flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.titulo}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>Resp: {t.resp}</div>
                    </div>
                    <div style={S.tag(prioColor(t.prioridade))}>{t.prioridade}</div>
                  </div>
                ))
            }
          </div>
        </div>

        <div style={S.grid3}>
          {[
            { label: "Pessoa Jurídica", val: clientes.filter(c => c.regime === "Pessoa Jurídica").length, cor: "#10b981" },
            { label: "Pessoa Física", val: clientes.filter(c => c.regime === "Pessoa Física").length, cor: "#3b82f6" },
            { label: "Inativos", val: clientes.filter(c => c.status === "inativo").length, cor: "#6b7280" },
          ].map(r => (
            <div key={r.label} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#475569" }}>Clientes</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{r.label}</div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: r.cor }}>{r.val}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── OBRIGAÇÕES ────────────────────────────────────────────────────────────────
  const renderObrigacoes = () => {
    const filtradas = obrigacoes.filter(o => {
      if (obFilter !== "todos" && o.status !== obFilter) return false;
      if (searchQ && !o.nome.toLowerCase().includes(searchQ.toLowerCase()) && !o.cliente.toLowerCase().includes(searchQ.toLowerCase())) return false;
      return true;
    });
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ ...S.row, justifyContent: "space-between" }}>
          <div>
            <div style={S.h1}>Obrigações Fiscais</div>
            <div style={{ fontSize: 13, color: "#475569" }}>{obrigacoes.length} obrigações cadastradas</div>
          </div>
          <div style={S.row}>
            <button style={S.btnOutline} onClick={loadAll}><RefreshCw size={14} /></button>
            <button style={S.btn()} onClick={() => setShowAddOb(true)}><Plus size={15} /> Nova Obrigação</button>
          </div>
        </div>

        <div style={{ ...S.row, gap: 10, flexWrap: "wrap" }}>
          {["todos", "pendente", "em_andamento", "concluida", "atrasada"].map(f => (
            <button key={f} onClick={() => setObFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: obFilter === f ? "1px solid #10b981" : "1px solid #334155", background: obFilter === f ? "#10b98118" : "transparent", color: obFilter === f ? "#10b981" : "#94a3b8" }}>
              {f === "todos" ? "Todos" : f === "em_andamento" ? "Em Andamento" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative" }}>
            <Search size={14} color="#475569" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar..." style={{ ...S.input, paddingLeft: 30, width: 200 }} />
          </div>
        </div>

        {filtradas.length === 0
          ? <div style={{ ...S.card, textAlign: "center", color: "#475569", padding: "40px 20px" }}>
              {obrigacoes.length === 0 ? "Nenhuma obrigação cadastrada. Crie a primeira!" : "Nenhuma obrigação com estes filtros."}
            </div>
          : <div style={S.card}>
              <table style={S.table}>
                <thead>
                  <tr>{["Obrigação", "Cliente", "Tipo", "Vencimento", "Status", "Ações"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtradas.map(o => {
                    const st = statusOb(o.status);
                    return (
                      <tr key={o.id}>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 3, height: 30, borderRadius: 2, background: prioColor(o.prioridade) }} />
                            <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 13 }}>{o.nome}</div>
                          </div>
                        </td>
                        <td style={{ ...S.td, fontSize: 12, color: "#94a3b8", maxWidth: 140 }}>{o.cliente}</td>
                        <td style={S.td}><span style={{ ...S.tag("#3b82f6"), fontSize: 11 }}>{o.tipo}</span></td>
                        <td style={{ ...S.td, fontWeight: 600, color: o.status === "atrasada" ? "#ef4444" : "#94a3b8", fontSize: 13 }}>
                          {o.vence !== "—" ? o.vence.split("-").reverse().join("/") : "—"}
                        </td>
                        <td style={S.td}><Badge {...st} /></td>
                        <td style={S.td}>
                          <button onClick={() => toggleOb(o.id)} style={{ background: o.status === "concluida" ? "#10b98120" : "#334155", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: o.status === "concluida" ? "#10b981" : "#94a3b8", cursor: "pointer", fontWeight: 600 }}>
                            {o.status === "concluida" ? "✓ Feito" : "Concluir"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        }

        {showAddOb && (
          <div style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 440 }}>
              <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>Nova Obrigação</div>
                <button onClick={() => setShowAddOb(false)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}><X size={18} /></button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Nome da Obrigação</label>
                <input placeholder="Ex: SPED Fiscal" value={newOb.nome} onChange={e => setNewOb(p => ({ ...p, nome: e.target.value }))} style={S.input} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Cliente</label>
                <select value={newOb.clienteId} onChange={e => setNewOb(p => ({ ...p, clienteId: e.target.value }))} style={{ ...S.input }}>
                  <option value="">Selecione um cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Categoria</label>
                <select value={newOb.tipo} onChange={e => setNewOb(p => ({ ...p, tipo: e.target.value }))} style={{ ...S.input }}>
                  {["FISCAL","CONTABIL","TRABALHISTA","PREVIDENCIARIA","MUNICIPAL","OUTROS"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>Dia de vencimento</label>
                <input type="number" min="1" max="31" placeholder="20" value={newOb.dueDay} onChange={e => setNewOb(p => ({ ...p, dueDay: e.target.value }))} style={S.input} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowAddOb(false)} style={{ ...S.btnOutline, flex: 1, justifyContent: "center" }}>Cancelar</button>
                <button onClick={addOb} disabled={saving} style={{ ...S.btn(), flex: 1, justifyContent: "center" }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── TAREFAS ───────────────────────────────────────────────────────────────────
  const renderTarefas = () => {
    const cols = [
      { id: "todo", label: "A Fazer", cor: "#f59e0b", count: tarefas.filter(t => t.status === "todo").length },
      { id: "doing", label: "Em Andamento", cor: "#3b82f6", count: tarefas.filter(t => t.status === "doing").length },
      { id: "done", label: "Concluído", cor: "#10b981", count: tarefas.filter(t => t.status === "done").length },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
        <div style={{ ...S.row, justifyContent: "space-between" }}>
          <div>
            <div style={S.h1}>Gestão de Tarefas</div>
            <div style={{ fontSize: 13, color: "#475569" }}>{tarefas.length} tarefas</div>
          </div>
          <div style={S.row}>
            <button style={S.btnOutline} onClick={loadAll}><RefreshCw size={14} /></button>
            <button style={S.btn()} onClick={() => setShowAddTask(true)}><Plus size={15} /> Nova Tarefa</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, flex: 1, minHeight: 0 }}>
          {cols.map(col => (
            <div key={col.id} style={S.kanCol}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: col.cor }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{col.label}</div>
                <div style={{ background: col.cor + "20", color: col.cor, borderRadius: 10, fontSize: 11, padding: "1px 8px", fontWeight: 700 }}>{col.count}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1 }}>
                {tarefas.filter(t => t.status === col.id).map(t => (
                  <div key={t.id} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4 }}>{t.titulo}</div>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: prioColor(t.prioridade), flexShrink: 0, marginTop: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", marginBottom: 10 }}>{t.cliente}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 11, color: "#64748b" }}>📅 {t.vence !== "—" ? t.vence.split("-").reverse().join("/") : "—"}</div>
                      <div style={{ fontSize: 11, background: "#1e293b", color: "#94a3b8", padding: "2px 8px", borderRadius: 10 }}>{t.resp}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                      {col.id !== "todo" && <button onClick={() => moveTask(t.id, col.id === "doing" ? "todo" : "doing")} style={{ flex: 1, background: "#1e293b", border: "none", borderRadius: 6, padding: "4px 0", fontSize: 11, color: "#94a3b8", cursor: "pointer" }}>← Voltar</button>}
                      {col.id !== "done" && <button onClick={() => moveTask(t.id, col.id === "todo" ? "doing" : "done")} style={{ flex: 1, background: col.cor + "22", border: `1px solid ${col.cor}40`, borderRadius: 6, padding: "4px 0", fontSize: 11, color: col.cor, cursor: "pointer", fontWeight: 600 }}>{col.id === "todo" ? "Iniciar →" : "Concluir ✓"}</button>}
                    </div>
                  </div>
                ))}
                {tarefas.filter(t => t.status === col.id).length === 0 && (
                  <div style={{ textAlign: "center", color: "#334155", fontSize: 12, padding: "20px 0" }}>Vazio</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {showAddTask && (
          <div style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 440 }}>
              <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>Nova Tarefa</div>
                <button onClick={() => setShowAddTask(false)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}><X size={18} /></button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Título</label>
                <input placeholder="Descrição da tarefa" value={newTask.titulo} onChange={e => setNewTask(p => ({ ...p, titulo: e.target.value }))} style={S.input} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Cliente (opcional)</label>
                <select value={newTask.clienteId} onChange={e => setNewTask(p => ({ ...p, clienteId: e.target.value }))} style={{ ...S.input }}>
                  <option value="">Sem cliente específico</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Responsável (opcional)</label>
                <select value={newTask.assignedToId} onChange={e => setNewTask(p => ({ ...p, assignedToId: e.target.value }))} style={{ ...S.input }}>
                  <option value="">Sem responsável</option>
                  {usuarios.filter(u => u.isActive).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Prazo</label>
                <input type="date" value={newTask.vence} onChange={e => setNewTask(p => ({ ...p, vence: e.target.value }))} style={S.input} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>Prioridade</label>
                <select value={newTask.prioridade} onChange={e => setNewTask(p => ({ ...p, prioridade: e.target.value }))} style={{ ...S.input }}>
                  {[["URGENT","Crítica"],["HIGH","Alta"],["MEDIUM","Média"],["LOW","Baixa"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowAddTask(false)} style={{ ...S.btnOutline, flex: 1, justifyContent: "center" }}>Cancelar</button>
                <button onClick={addTask} disabled={saving} style={{ ...S.btn(), flex: 1, justifyContent: "center" }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── CLIENTES ──────────────────────────────────────────────────────────────────
  const renderClientes = () => {
    if (clienteDetalhe) {
      const c = clienteDetalhe;
      const obs = obrigacoes.filter(o => o.cid === c.id);
      const tks = tarefas.filter(t => t.cid === c.id);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={S.row}>
            <button onClick={() => setClienteDetalhe(null)} style={{ ...S.btnOutline, gap: 6 }}><ChevronLeft size={14} /> Voltar</button>
            <div style={{ flex: 1 }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: c.status === "ativo" ? "#10b981" : "#ef4444" }} />
            <span style={{ fontSize: 12, color: "#64748b" }}>{c.status === "ativo" ? "Ativo" : "Inativo"}</span>
          </div>
          <div style={{ ...S.card, display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: c.cor + "22", border: `2px solid ${c.cor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: c.cor }}>
              {c.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>{c.name}</div>
              <div style={{ fontSize: 13, color: "#475569" }}>Doc: {c.cnpj} &nbsp;|&nbsp; {c.regime}</div>
            </div>
          </div>
          <div style={S.grid2}>
            <div style={S.card}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", marginBottom: 14 }}>Informações</div>
              {[
                { icon: Briefcase, label: "Tipo", val: c.regime },
                { icon: Mail, label: "E-mail", val: c.email },
                { icon: Phone, label: "Telefone", val: c.phone },
              ].map(i => (
                <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #1e293b20" }}>
                  <i.icon size={14} color="#475569" />
                  <div style={{ fontSize: 12, color: "#64748b", width: 80, flexShrink: 0 }}>{i.label}</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0" }}>{i.val}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", marginBottom: 14 }}>Obrigações ({obs.length})</div>
              {obs.length === 0
                ? <div style={{ color: "#475569", fontSize: 13 }}>Nenhuma obrigação cadastrada.</div>
                : obs.map(o => {
                    const st = statusOb(o.status);
                    return (
                      <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1e293b20" }}>
                        <div style={{ fontSize: 13, color: "#e2e8f0" }}>{o.nome}</div>
                        <Badge {...st} />
                      </div>
                    );
                  })
              }
            </div>
          </div>
          <div style={S.card}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", marginBottom: 14 }}>Tarefas ({tks.length})</div>
            {tks.length === 0
              ? <div style={{ color: "#475569", fontSize: 13 }}>Sem tarefas abertas.</div>
              : tks.map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #1e293b20" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: prioColor(t.prioridade) }} />
                    <div style={{ flex: 1, fontSize: 13, color: "#e2e8f0" }}>{t.titulo}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{t.resp}</div>
                    <div style={S.tag(t.status === "done" ? "#10b981" : "#f59e0b")}>{t.status === "done" ? "Concluído" : "Aberta"}</div>
                  </div>
                ))
            }
          </div>
        </div>
      );
    }

    const filtered = clientes.filter(c =>
      !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.cnpj.includes(searchQ)
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ ...S.row, justifyContent: "space-between" }}>
          <div>
            <div style={S.h1}>Clientes</div>
            <div style={{ fontSize: 13, color: "#475569" }}>{clientes.length} / 50 clientes — {clientesAtivos} ativos</div>
          </div>
          <div style={S.row}>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#475569" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar..." style={{ ...S.input, paddingLeft: 30, width: 180 }} />
            </div>
            <button style={S.btnOutline} onClick={loadAll}><RefreshCw size={14} /></button>
            <button style={S.btn()} onClick={() => setShowAddClient(true)}><Plus size={15} /> Novo Cliente</button>
          </div>
        </div>

        {filtered.length === 0
          ? <div style={{ ...S.card, textAlign: "center", color: "#475569", padding: "60px 20px" }}>
              {clientes.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado."}
            </div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {filtered.map(c => (
                <div key={c.id} onClick={() => { setClienteDetalhe(c); setSearchQ(""); }} style={{ background: "#111827", border: `1px solid ${c.cor}30`, borderRadius: 12, padding: 18, cursor: "pointer", transition: "all 0.15s", position: "relative" }}>
                  <div style={{ position: "absolute", top: 14, right: 14, width: 8, height: 8, borderRadius: "50%", background: c.status === "ativo" ? "#10b981" : "#ef4444" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: c.cor + "22", border: `2px solid ${c.cor}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: c.cor }}>
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{c.regime}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>{c.cnpj}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={S.tag(c.cor)}>{c.status === "ativo" ? "Ativo" : "Inativo"}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{obrigacoes.filter(o => o.cid === c.id && o.status !== "concluida").length} ob. abertas</div>
                  </div>
                </div>
              ))}
            </div>
        }

        {showAddClient && (
          <div style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
            <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 440 }}>
              <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>Novo Cliente</div>
                <button onClick={() => setShowAddClient(false)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}><X size={18} /></button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Tipo de Cliente</label>
                <select value={newClient.type} onChange={e => setNewClient(p => ({ ...p, type: e.target.value }))} style={{ ...S.input }}>
                  <option value="PJ">Pessoa Jurídica (PJ)</option>
                  <option value="PF">Pessoa Física (PF)</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>Nome ou Razão Social</label>
                <input placeholder="Nome Completo / Empresa" value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} style={S.input} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>{newClient.type === "PJ" ? "CNPJ" : "CPF"}</label>
                <input placeholder={newClient.type === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"} value={newClient.document} onChange={e => setNewClient(p => ({ ...p, document: e.target.value }))} style={S.input} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={S.label}>E-mail (opcional)</label>
                <input type="email" placeholder="contato@cliente.com" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} style={S.input} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>Telefone (opcional)</label>
                <input placeholder="(00) 00000-0000" value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} style={S.input} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowAddClient(false)} style={{ ...S.btnOutline, flex: 1, justifyContent: "center" }}>Cancelar</button>
                <button onClick={saveClient} disabled={saving} style={{ ...S.btn(), flex: 1, justifyContent: "center" }}>
                  {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Cadastrar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── DOCUMENTOS ────────────────────────────────────────────────────────────────
  const renderDocumentos = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...S.row, justifyContent: "space-between" }}>
        <div>
          <div style={S.h1}>Documentos</div>
          <div style={{ fontSize: 13, color: "#475569" }}>Envie e gerencie documentos por cliente</div>
        </div>
        <button style={S.btn()}><Upload size={15} /> Enviar Documento</button>
      </div>
      <div style={{ background: "#10b98108", border: "2px dashed #10b98140", borderRadius: 12, padding: 28, textAlign: "center", cursor: "pointer" }}>
        <Upload size={28} color="#10b98160" style={{ margin: "0 auto 10px" }} />
        <div style={{ fontSize: 14, color: "#64748b" }}>Arraste documentos aqui ou <span style={{ color: "#10b981", fontWeight: 600 }}>clique para enviar</span></div>
        <div style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>PDF, XML, TXT, XLSX — até 50MB</div>
      </div>
      <div style={{ ...S.card, textAlign: "center", color: "#475569", padding: "40px 20px" }}>
        Módulo de documentos em integração. Em breve!
      </div>
    </div>
  );

  // ── CHAT ──────────────────────────────────────────────────────────────────────
  const renderChat = () => (
    <div style={{ display: "flex", gap: 0, height: "calc(100vh - 120px)", borderRadius: 12, overflow: "hidden", border: "1px solid #1e293b" }}>
      <div style={{ width: 200, background: "#0a0f1e", padding: 16, display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Canais</div>
        {[{ nome: "#geral", ativo: true }, { nome: "#obrigacoes", ativo: false }, { nome: "#urgente", ativo: false }].map(c => (
          <div key={c.nome} style={{ padding: "6px 10px", borderRadius: 7, background: c.ativo ? "#10b98115" : "transparent", cursor: "pointer" }}>
            <div style={{ fontSize: 13, color: c.ativo ? "#10b981" : "#64748b", fontWeight: c.ativo ? 600 : 400 }}>{c.nome}</div>
          </div>
        ))}
        <div style={{ marginTop: 8, fontSize: 11, color: "#334155", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Equipe</div>
        {usuarios.filter(u => u.isActive).map(u => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <Avatar initials={u.av} cor={u.cor} size={28} />
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{u.name.split(" ")[0]}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#080d1a" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>#geral</div>
          <div style={{ fontSize: 12, color: "#334155" }}>— Canal geral da equipe</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {chat.map(m => (
            <div key={m.id} style={{ display: "flex", gap: 10, flexDirection: m.me ? "row-reverse" : "row" }}>
              <Avatar initials={m.av} cor={m.cor} size={34} />
              <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: m.me ? "flex-end" : "flex-start" }}>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 3, display: "flex", gap: 6 }}>
                  <span style={{ color: m.cor, fontWeight: 600 }}>{m.sender}</span>
                  <span>{m.time}</span>
                </div>
                <div style={{ background: m.me ? "#a855f720" : "#1e293b", border: `1px solid ${m.me ? "#a855f740" : "#334155"}`, borderRadius: m.me ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "9px 14px", fontSize: 13, color: "#e2e8f0", lineHeight: 1.5 }}>
                  {m.msg}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div style={{ padding: "14px 20px", borderTop: "1px solid #1e293b", display: "flex", gap: 10 }}>
          <button style={{ background: "none", border: "1px solid #334155", borderRadius: 8, padding: "8px 10px", cursor: "pointer", color: "#475569" }}><Paperclip size={15} /></button>
          <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Escreva uma mensagem..." style={{ ...S.input, flex: 1 }} />
          <button onClick={sendMsg} style={{ ...S.btn(), padding: "8px 16px" }}><Send size={15} /></button>
        </div>
      </div>
    </div>
  );

  // ── CALENDÁRIO ────────────────────────────────────────────────────────────────
  const renderCalendario = () => {
    const hoje = new Date().getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < ABRIL_INICIO; i++) cells.push(null);
    for (let d = 1; d <= ABRIL_DIAS; d++) cells.push(d);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ ...S.row, justifyContent: "space-between" }}>
          <div style={S.h1}>Calendário Fiscal</div>
          <div style={S.row}>
            <button style={S.btnOutline}><ChevronLeft size={15} /></button>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", minWidth: 140, textAlign: "center" }}>Abril 2026</div>
            <button style={S.btnOutline}><ChevronRight size={15} /></button>
          </div>
        </div>
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
              {DIAS_SEMANA.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#475569", fontWeight: 700, padding: "4px 0" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {cells.map((dia, idx) => {
                const evento = dia ? AGENDA_EVENTS.find(e => e.dia === dia) : null;
                const isHoje = dia === hoje;
                const hasOb = dia ? obrigacoes.some(o => o.vence !== "—" && parseInt(o.vence.split("-")[2] ?? "0") === dia && o.status !== "concluida") : false;
                return (
                  <div key={idx} style={{ minHeight: 52, borderRadius: 8, padding: "6px", background: isHoje ? "#10b98115" : dia ? "#0f172a" : "transparent", border: isHoje ? "1px solid #10b98140" : "1px solid transparent" }}>
                    {dia && (
                      <>
                        <div style={{ fontSize: 12, fontWeight: isHoje ? 800 : 500, color: isHoje ? "#10b981" : "#94a3b8", marginBottom: 2 }}>{dia}</div>
                        {evento && <div style={{ fontSize: 9, background: evento.cor + "25", color: evento.cor, borderRadius: 3, padding: "2px 4px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{evento.label}</div>}
                        {hasOb && !evento && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", marginTop: 2 }} />}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={S.card}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", marginBottom: 14 }}>Obrigações Pendentes</div>
            {obrigacoes.filter(o => o.status !== "concluida").sort((a, b) => a.vence.localeCompare(b.vence)).slice(0, 10).map(o => {
              const st = statusOb(o.status);
              return (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1e293b20" }}>
                  <div style={{ width: 4, height: 32, borderRadius: 2, background: prioColor(o.prioridade), flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{o.nome}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{o.cliente}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{o.vence !== "—" ? o.vence.split("-").reverse().join("/") : "—"}</div>
                  <Badge {...st} />
                </div>
              );
            })}
            {obrigacoes.filter(o => o.status !== "concluida").length === 0 && (
              <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Tudo em dia!</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── RELATÓRIOS ────────────────────────────────────────────────────────────────
  const renderRelatorios = () => {
    const totalOb = obrigacoes.length;
    const txConclusao = totalOb > 0 ? Math.round((concluidas / totalOb) * 100) : 0;
    const txAtrasadas = totalOb > 0 ? Math.round((atrasadas / totalOb) * 100) : 0;
    const porTipo = ["Federal", "Trabalhista", "Contábil", "Municipal"].map(t => ({
      tipo: t,
      total: obrigacoes.filter(o => o.tipo === t).length,
      concluidas: obrigacoes.filter(o => o.tipo === t && o.status === "concluida").length,
    })).filter(x => x.total > 0);
    const porCliente = clientes.map(c => ({
      nome: c.name.split(" ").slice(0, 2).join(" "),
      cor: c.cor,
      total: obrigacoes.filter(o => o.cid === c.id).length,
      concluidas: obrigacoes.filter(o => o.cid === c.id && o.status === "concluida").length,
      atrasadas: obrigacoes.filter(o => o.cid === c.id && o.status === "atrasada").length,
    })).filter(x => x.total > 0);
    const maxTotal = Math.max(...porCliente.map(c => c.total), 1);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ ...S.row, justifyContent: "space-between" }}>
          <div>
            <div style={S.h1}>Relatórios e Analytics</div>
            <div style={{ fontSize: 13, color: "#475569" }}>Dados reais do escritório</div>
          </div>
          <button style={S.btn()}><Download size={15} /> Exportar PDF</button>
        </div>
        <div style={S.grid4}>
          {[
            { label: "Taxa de Conclusão", val: `${txConclusao}%`, sub: `${concluidas}/${totalOb} obrigações`, cor: "#10b981", icon: TrendingUp },
            { label: "Obrig. em Atraso", val: `${txAtrasadas}%`, sub: `${atrasadas} críticas`, cor: "#ef4444", icon: AlertCircle },
            { label: "Total Clientes", val: clientes.length.toString(), sub: `${clientesAtivos} ativos`, cor: "#3b82f6", icon: Users },
            { label: "Tarefas Concluídas", val: tarefas.filter(t => t.status === "done").length.toString(), sub: `de ${tarefas.length} total`, cor: "#a855f7", icon: CheckSquare },
          ].map(k => (
            <div key={k.label} style={S.statCard(k.cor)}>
              <div style={{ position: "absolute", right: 16, top: 16, background: k.cor + "20", borderRadius: 8, padding: 8 }}>
                <k.icon size={18} color={k.cor} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: k.cor }}>{k.val}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginTop: 2 }}>{k.label}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9", marginBottom: 16 }}>Obrigações por Cliente</div>
            {porCliente.length === 0
              ? <div style={{ color: "#475569", fontSize: 13 }}>Nenhum dado disponível.</div>
              : porCliente.map(c => (
                  <div key={c.nome} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{c.nome}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{c.concluidas}/{c.total}</div>
                    </div>
                    <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(c.total / maxTotal) * 100}%`, background: c.cor + "60", borderRadius: 3, position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${c.total > 0 ? (c.concluidas / c.total) * 100 : 0}%`, background: c.cor, borderRadius: 3 }} />
                      </div>
                    </div>
                    {c.atrasadas > 0 && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 3 }}>{c.atrasadas} atrasada(s)</div>}
                  </div>
                ))
            }
          </div>
          <div style={S.card}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9", marginBottom: 16 }}>Por Tipo</div>
            {porTipo.length === 0
              ? <div style={{ color: "#475569", fontSize: 13 }}>Nenhum dado disponível.</div>
              : porTipo.map((t, i) => {
                  const cores = ["#3b82f6","#f59e0b","#10b981","#a855f7"];
                  const cor = cores[i % cores.length];
                  const pct = t.total > 0 ? Math.round((t.concluidas / t.total) * 100) : 0;
                  return (
                    <div key={t.tipo} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: cor, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{t.tipo}</div>
                          <div style={{ fontSize: 12, color: "#475569" }}>{t.concluidas}/{t.total}</div>
                        </div>
                        <div style={{ height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: cor, borderRadius: 3 }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: cor, minWidth: 36, textAlign: "right" }}>{pct}%</div>
                    </div>
                  );
                })
            }
            <div style={{ marginTop: 8, padding: 14, background: "#0f172a", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Resumo</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {[
                  { label: "Concluídas", val: concluidas, cor: "#10b981" },
                  { label: "Pendentes", val: pendentes, cor: "#f59e0b" },
                  { label: "Atrasadas", val: atrasadas, cor: "#ef4444" },
                  { label: "Em Andamento", val: obrigacoes.filter(o => o.status === "em_andamento").length, cor: "#3b82f6" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.cor }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── CONFIGURAÇÕES ─────────────────────────────────────────────────────────────
  const renderConfiguracoes = () => {
    const cfgTabs = [
      { id: "escritorio" as const, label: "Escritório", icon: Building2 },
      { id: "usuarios" as const, label: "Usuários", icon: Users },
      { id: "roles" as const, label: "Perfis & Permissões", icon: Shield },
    ];
    const roleInfo = (role: string) => ROLES_INFO.find(r => r.role === role) ?? ROLES_INFO[5];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={S.h1}>Configurações do Escritório</div>
          <div style={{ fontSize: 13, color: "#475569" }}>Gerencie escritório, usuários e perfis de acesso</div>
        </div>
        <div style={{ display: "flex", gap: 4, background: "#0a0f1e", borderRadius: 10, padding: 4, width: "fit-content" }}>
          {cfgTabs.map(t => (
            <button key={t.id} onClick={() => setConfigTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: configTab === t.id ? 700 : 400, background: configTab === t.id ? "#10b981" : "transparent", color: configTab === t.id ? "#fff" : "#94a3b8" }}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {configTab === "escritorio" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...S.card, display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: "#10b98120", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#10b981", flexShrink: 0 }}>
                {escritorio.name.charAt(0) || "E"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>{escritorio.name || "—"}</div>
                <div style={{ fontSize: 13, color: "#475569" }}>CNPJ: {escritorio.cnpj} · Slug: {escritorio.slug}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <span style={{ background: "#10b98120", color: "#10b981", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{escritorio.status}</span>
                  <span style={{ background: "#3b82f620", color: "#3b82f6", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{escritorio.plano}</span>
                </div>
              </div>
              <button onClick={() => setEditEscritorio(v => !v)} style={{ ...S.btn("#334155"), gap: 6 }}>
                <Edit size={14} /> {editEscritorio ? "Cancelar" : "Editar"}
              </button>
            </div>
            <div style={S.grid2}>
              <div style={S.card}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", marginBottom: 16 }}>Dados do Escritório</div>
                {editEscritorio ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {([{ label: "Nome", key: "name" }, { label: "CNPJ", key: "cnpj" }] as { label: string; key: keyof EscritorioUI }[]).map(f => (
                      <div key={f.key}>
                        <label style={S.label}>{f.label}</label>
                        <input value={(escritorio as any)[f.key]} onChange={e => setEscritorio(p => ({ ...p, [f.key]: e.target.value }))} style={S.input} />
                      </div>
                    ))}
                    <button onClick={saveOffice} disabled={saving} style={{ ...S.btn(), marginTop: 4, justifyContent: "center" }}>
                      {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Salvar"}
                    </button>
                  </div>
                ) : (
                  <>
                    {[
                      { icon: Building2, label: "Razão Social", val: escritorio.name || "—" },
                      { icon: Briefcase, label: "CNPJ", val: escritorio.cnpj },
                      { icon: Calendar, label: "Cadastro em", val: escritorio.createdAt },
                    ].map(i => (
                      <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #1e293b20" }}>
                        <i.icon size={14} color="#475569" />
                        <div style={{ fontSize: 12, color: "#64748b", width: 110, flexShrink: 0 }}>{i.label}</div>
                        <div style={{ fontSize: 13, color: "#e2e8f0" }}>{i.val}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div style={S.card}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", marginBottom: 14 }}>Plano Atual</div>
                <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, border: "1px solid #3b82f630", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Plano</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#3b82f6" }}>{escritorio.plano}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>Até 10 usuários · Até 50 clientes · 10GB docs</div>
                </div>
                {[
                  { label: "Status", val: escritorio.status, cor: "#10b981" },
                  { label: "Usuários Ativos", val: `${usuarios.filter(u => u.isActive).length} / 10`, cor: "#3b82f6" },
                  { label: "Clientes", val: `${clientes.length} / 50`, cor: "#a855f7" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e293b20" }}>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.cor }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {configTab === "usuarios" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...S.row, justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, color: "#475569" }}>{usuarios.length} usuários — {usuarios.filter(u => u.isActive).length} ativos</div>
              <div style={S.row}>
                <button style={S.btnOutline} onClick={loadAll}><RefreshCw size={14} /></button>
                <button style={S.btn()} onClick={() => setShowAddUser(true)}><Plus size={14} /> Convidar</button>
              </div>
            </div>
            <div style={S.card}>
              <table style={S.table}>
                <thead>
                  <tr>{["Usuário", "E-mail", "Perfil", "Cadastro", "Status", "Ações"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {usuarios.map(u => {
                    const ri = roleInfo(u.role);
                    return (
                      <tr key={u.id}>
                        <td style={S.td}>
                          <div style={S.row}>
                            <Avatar initials={u.av} cor={u.cor} size={32} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{u.name}</div>
                              {u.role === "OWNER" && <div style={{ fontSize: 10, color: "#a855f7", fontWeight: 700 }}>Proprietário</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ ...S.td, fontSize: 12, color: "#64748b" }}>{u.email}</td>
                        <td style={S.td}><span style={{ background: ri.cor + "20", color: ri.cor, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{ri.label}</span></td>
                        <td style={{ ...S.td, fontSize: 12, color: "#64748b" }}>{u.createdAt}</td>
                        <td style={S.td}>
                          <span style={{ background: u.isActive ? "#10b98120" : "#ef444420", color: u.isActive ? "#10b981" : "#ef4444", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {u.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td style={S.td}>
                          {u.role !== "OWNER" && (
                            <div style={S.row}>
                              <button onClick={() => toggleUser(u.id)} style={{ background: "none", border: "1px solid #334155", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#94a3b8", cursor: "pointer" }}>
                                {u.isActive ? "Desativar" : "Ativar"}
                              </button>
                              <button onClick={() => deleteUser(u.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef444460", padding: 4 }}><Trash2 size={14} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {showAddUser && (
              <div style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
                <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: 440 }}>
                  <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>Convidar Usuário</div>
                    <button onClick={() => setShowAddUser(false)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer" }}><X size={18} /></button>
                  </div>
                  {[
                    { label: "Nome Completo", key: "name", placeholder: "Ex: João da Silva" },
                    { label: "E-mail", key: "email", placeholder: "joao@escritorio.com.br" },
                    { label: "Senha Inicial", key: "password", type: "password", placeholder: "Mínimo 8 caracteres" },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 14 }}>
                      <label style={S.label}>{f.label}</label>
                      <input type={f.type || "text"} placeholder={f.placeholder} value={(newUser as any)[f.key]} onChange={e => setNewUser(p => ({ ...p, [f.key]: e.target.value }))} style={S.input} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 20 }}>
                    <label style={S.label}>Perfil de Acesso</label>
                    <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} style={{ ...S.input }}>
                      {ROLES_INFO.filter(r => r.role !== "OWNER").map(r => <option key={r.role} value={r.role}>{r.label} — {r.role}</option>)}
                    </select>
                    <div style={{ marginTop: 8, fontSize: 11, color: "#64748b", background: "#0f172a", borderRadius: 6, padding: "8px 10px" }}>
                      {roleInfo(newUser.role).desc}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setShowAddUser(false)} style={{ ...S.btnOutline, flex: 1, justifyContent: "center" }}>Cancelar</button>
                    <button onClick={saveUser} disabled={saving} style={{ ...S.btn(), flex: 1, justifyContent: "center" }}>
                      {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Convidar"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {configTab === "roles" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 13, color: "#475569" }}>Perfis fixos por função. Cada perfil define o que o usuário pode ver e fazer.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {ROLES_INFO.map(r => (
                <div key={r.role} style={{ background: "#111827", border: `1px solid ${r.cor}30`, borderRadius: 12, padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: r.cor + "20", border: `1px solid ${r.cor}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Shield size={16} color={r.cor} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{r.label}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: r.cor, letterSpacing: 1 }}>{r.role}</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 12, color: "#475569" }}>
                      {usuarios.filter(u => u.role === r.role && u.isActive).length} usuário(s)
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12, lineHeight: 1.5 }}>{r.desc}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {r.permissoes.map(p => (
                      <span key={p} style={{ background: r.cor + "15", color: r.cor, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>✓ {p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (tab) {
      case "dashboard": return renderDashboard();
      case "obrigacoes": return renderObrigacoes();
      case "tarefas": return renderTarefas();
      case "clientes": return renderClientes();
      case "documentos": return renderDocumentos();
      case "chat": return renderChat();
      case "calendario": return renderCalendario();
      case "relatorios": return renderRelatorios();
      case "configuracoes": return renderConfiguracoes();
      default: return renderDashboard();
    }
  };

  return (
    <div style={S.app}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoTitle}>PAC Gestão</div>
          <div style={S.logoSub}>Contábil</div>
        </div>
        <nav style={S.nav}>
          {navItems.map(item => (
            <div key={item.id} style={S.navItem(tab === item.id)} onClick={() => { setTab(item.id); setClienteDetalhe(null); setSearchQ(""); }}>
              <item.icon size={16} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: "12px 10px", borderTop: "1px solid #1e293b" }}>
          <div style={S.navItem(tab === "configuracoes")} onClick={() => { setTab("configuracoes"); setClienteDetalhe(null); }}>
            <Settings size={16} /><span>Configurações</span>
          </div>
          <div style={{ ...S.navItem(false), marginTop: 4 }} onClick={logout}>
            <LogOut size={16} /><span>Sair</span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>
        {/* TOPBAR */}
        <div style={S.topbar}>
          <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
            <Search size={14} color="#475569" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input placeholder="Buscar clientes, obrigações..." style={{ ...S.input, paddingLeft: 32 }} readOnly />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotif(v => !v)} style={{ background: "none", border: "1px solid #1e293b", borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: "#94a3b8", position: "relative" }}>
              <Bell size={16} />
              {unread > 0 && <div style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />}
            </button>
            {showNotif && (
              <div style={{ position: "absolute", right: 0, top: 42, width: 320, background: "#111827", border: "1px solid #1e293b", borderRadius: 12, zIndex: 999, boxShadow: "0 8px 32px #000a" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>Notificações</div>
                  <button onClick={markAllRead} style={{ background: "none", border: "none", fontSize: 11, color: "#10b981", cursor: "pointer" }}>Marcar lidas</button>
                </div>
                {notifs.map(n => (
                  <div key={n.id} style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", background: n.lida ? "transparent" : "#ffffff05" }}>
                    {notifIcon(n.tipo)}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: n.lida ? "#64748b" : "#e2e8f0" }}>{n.msg}</div>
                      <div style={{ fontSize: 10, color: "#334155", marginTop: 3 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: "#111827", border: "1px solid #1e293b", borderRadius: 10, cursor: "pointer" }}>
            <Avatar initials={userAv} cor={ROLE_COLORS[userRole] ?? "#a855f7"} size={28} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{user?.name?.split(" ")[0] ?? "Você"}</div>
              <div style={{ fontSize: 10, color: "#475569" }}>{userRole}</div>
            </div>
            <ChevronDown size={12} color="#475569" />
          </div>
        </div>

        {/* CONTEÚDO */}
        <div style={S.content}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
