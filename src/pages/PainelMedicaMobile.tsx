import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cigarette,
  Clock3,
  Download,
  Filter,
  HeartHandshake,
  HeartPulse,
  Home,
  Loader2,
  Mail,
  MapPin,
  Moon,
  Phone,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  Wine,
  LayoutGrid,
  FileText,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type RespostaPreConsulta = {
  id?: number;
  created_at?: string;

  nome_completo: string;
  data_nascimento?: string | null;
  idade: number | null;
  telefone_whatsapp: string;
  email?: string | null;
  cidade_estado: string;
  profissao: string;
  estado_civil?: string | null;
  com_quem_mora?: string | null;

  motivo_consulta: string;
  tempo_queixa: string;

  diagnostico_medico: string;
  medicacao_continua: string;

  saude_emocional?: string | null;

  sono: string;
  atividade_fisica: string;
  consumo_alcool: string;
  tabagismo: string;

  historico_familiar?: string | null;
  historico_familiar_outros?: string | null;

  preocupacao_recente?: string | null;
  ajuda_momento_dificil?: string | null;

  origem_paciente?: string | null;
  origem_paciente_outros?: string | null;

  consentimento: boolean;
};

type FiltroRapido =
  | "todos"
  | "prioridade_alta"
  | "emocional"
  | "sono_ruim"
  | "fumantes"
  | "alcool_frequente"
  | "com_diagnostico"
  | "com_medicacao";

type PrioridadeInfo = {
  label: "Alta" | "Média" | "Baixa";
  score: number;
  badge: string;
  glow: string;
};

type AbaPainel = "visao" | "pacientes" | "filtros" | "config";

const filtrosRapidos: {
  id: FiltroRapido;
  label: string;
}[] = [
  { id: "todos", label: "Todos" },
  { id: "prioridade_alta", label: "Prioridade alta" },
  { id: "emocional", label: "Sinais emocionais" },
  { id: "sono_ruim", label: "Sono ruim" },
  { id: "fumantes", label: "Fumantes" },
  { id: "alcool_frequente", label: "Álcool frequente" },
  { id: "com_diagnostico", label: "Com diagnóstico" },
  { id: "com_medicacao", label: "Com medicação" },
];

function formatarData(data?: string | null) {
  if (!data) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

function formatarDataNascimento(data?: string | null) {
  if (!data) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(new Date(`${data}T00:00:00`));
}

function normalizarTexto(valor?: string | null) {
  return (valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function transformarListaTexto(valor?: string | null) {
  if (!valor?.trim()) return [];
  return valor
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function temDiagnostico(item: RespostaPreConsulta) {
  return Boolean(item.diagnostico_medico?.trim());
}

function usaMedicacao(item: RespostaPreConsulta) {
  return Boolean(item.medicacao_continua?.trim());
}

function possuiSinaisEmocionais(item: RespostaPreConsulta) {
  const lista = transformarListaTexto(item.saude_emocional);
  return lista.some((registro) => registro !== "Nenhum desses");
}

function sonoAlterado(item: RespostaPreConsulta) {
  return item.sono === "Ruim" || item.sono === "Regular";
}

function calcularPrioridade(item: RespostaPreConsulta): PrioridadeInfo {
  let score = 0;

  if (possuiSinaisEmocionais(item)) score += 2;

  const sinais = transformarListaTexto(item.saude_emocional);

  if (
    sinais.includes("Tristeza") ||
    sinais.includes("Desânimo") ||
    sinais.includes("Oscilações de humor")
  ) {
    score += 2;
  }

  if (
    sinais.includes("Ansiedade") ||
    sinais.includes("Dificuldade para dormir") ||
    sinais.includes("Cansaço constante") ||
    sinais.includes("Dificuldade de concentração")
  ) {
    score += 1;
  }

  if (item.sono === "Ruim") score += 2;
  if (item.sono === "Regular") score += 1;
  if (item.tabagismo === "Sim") score += 1;
  if (item.consumo_alcool === "Frequente") score += 1;
  if (temDiagnostico(item)) score += 1;
  if (usaMedicacao(item)) score += 1;

  if (
    normalizarTexto(item.historico_familiar).includes("vícios") ||
    normalizarTexto(item.historico_familiar).includes("vicios")
  ) {
    score += 1;
  }

  if (score >= 6) {
    return {
      label: "Alta",
      score,
      badge: "border-rose-400/30 bg-rose-500/15 text-rose-200",
      glow: "shadow-[0_0_0_1px_rgba(244,63,94,0.12),0_18px_40px_rgba(244,63,94,0.15)]",
    };
  }

  if (score >= 3) {
    return {
      label: "Média",
      score,
      badge: "border-amber-400/30 bg-amber-500/15 text-amber-200",
      glow: "shadow-[0_0_0_1px_rgba(245,158,11,0.12),0_18px_40px_rgba(245,158,11,0.12)]",
    };
  }

  return {
    label: "Baixa",
    score,
    badge: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
    glow: "shadow-[0_0_0_1px_rgba(16,185,129,0.10),0_18px_40px_rgba(16,185,129,0.10)]",
  };
}

function exportarCSV(dados: RespostaPreConsulta[]) {
  const headers = [
    "Data de envio",
    "Nome completo",
    "Data de nascimento",
    "Idade",
    "Telefone / WhatsApp",
    "E-mail",
    "Cidade / Estado",
    "Profissão",
    "Estado civil",
    "Com quem mora",
    "Motivo da consulta",
    "Tempo da queixa",
    "Diagnóstico médico",
    "Medicação contínua",
    "Saúde emocional",
    "Sono",
    "Atividade física",
    "Consumo de álcool",
    "Tabagismo",
    "Histórico familiar",
    "Outros histórico familiar",
    "Preocupação recente",
    "Ajuda em momento difícil",
    "Origem do paciente",
    "Origem do paciente - outros",
    "Consentimento",
    "Prioridade",
    "Score de prioridade",
  ];

  const linhas = dados.map((item) => {
    const prioridade = calcularPrioridade(item);

    return [
      item.created_at ?? "",
      item.nome_completo ?? "",
      item.data_nascimento ?? "",
      item.idade ?? "",
      item.telefone_whatsapp ?? "",
      item.email ?? "",
      item.cidade_estado ?? "",
      item.profissao ?? "",
      item.estado_civil ?? "",
      item.com_quem_mora ?? "",
      item.motivo_consulta ?? "",
      item.tempo_queixa ?? "",
      item.diagnostico_medico ?? "",
      item.medicacao_continua ?? "",
      item.saude_emocional ?? "",
      item.sono ?? "",
      item.atividade_fisica ?? "",
      item.consumo_alcool ?? "",
      item.tabagismo ?? "",
      item.historico_familiar ?? "",
      item.historico_familiar_outros ?? "",
      item.preocupacao_recente ?? "",
      item.ajuda_momento_dificil ?? "",
      item.origem_paciente ?? "",
      item.origem_paciente_outros ?? "",
      item.consentimento ? "Sim" : "Não",
      prioridade.label,
      prioridade.score,
    ];
  });

  const csv = [headers, ...linhas]
    .map((linha) =>
      linha
        .map((coluna) => `"${String(coluna ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "painel-pre-consulta-medica-mobile.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function MobileSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,35,0.96)_0%,rgba(11,17,30,0.98)_100%)] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/60">
          {title}
        </p>
        {subtitle && (
          <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <div className="min-w-[220px] rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(17,24,39,0.95)_100%)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {value}
          </h3>
          <p className="mt-2 text-xs leading-6 text-slate-400">{detail}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon?: typeof Phone;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-100">
        {Icon ? (
          <span className="inline-flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-cyan-200" />
            <span>{value}</span>
          </span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function TagsLista({
  itens,
  fallback = "Não informado",
}: {
  itens: string[];
  fallback?: string;
}) {
  if (itens.length === 0) {
    return <p className="text-sm text-slate-400">{fallback}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {itens.map((item) => (
        <span
          key={item}
          className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-200"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function BottomNavItem({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: typeof LayoutGrid;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-2xl px-2 py-3 transition ${
        active
          ? "bg-[linear-gradient(135deg,rgba(34,211,238,0.18)_0%,rgba(168,85,247,0.18)_100%)] text-white shadow-[0_10px_30px_rgba(34,211,238,0.10)]"
          : "text-slate-400"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
          active
            ? "border-cyan-300/20 bg-white/10"
            : "border-white/5 bg-white/[0.03]"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
        {label}
      </span>
    </button>
  );
}

export default function PainelMedicaMobile() {
  const autorizado = sessionStorage.getItem("painel_autorizado");

  if (!autorizado) {
    window.location.href = "/acesso-painel";
    return null;
  }

  const [dados, setDados] = useState<RespostaPreConsulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todos");
  const [filtroOrigem, setFiltroOrigem] = useState("todos");
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>("todos");

  const [selecionado, setSelecionado] = useState<RespostaPreConsulta | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaPainel>("visao");

  async function buscarRespostas() {
    try {
      setLoading(true);
      setErro("");

      const { data, error } = await supabase
        .from("respostas_pre_consulta")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const lista = (data as RespostaPreConsulta[]) ?? [];
      setDados(lista);

      if (lista.length === 0) {
        setSelecionado(null);
      } else if (selecionado) {
        const aindaExiste = lista.find((item) => item.id === selecionado.id);
        setSelecionado(aindaExiste ?? null);
      }
    } catch (err) {
      console.error(err);
      setErro("Não foi possível carregar os dados do painel agora.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarRespostas();
  }, []);

  const origensUnicas = useMemo(() => {
    return Array.from(
      new Set(dados.map((item) => item.origem_paciente).filter(Boolean))
    ) as string[];
  }, [dados]);

  const dadosFiltrados = useMemo(() => {
    return dados.filter((item) => {
      const prioridade = calcularPrioridade(item);
      const termo = normalizarTexto(busca);

      const alvoBusca = normalizarTexto(
        [
          item.nome_completo,
          item.telefone_whatsapp,
          item.email,
          item.cidade_estado,
          item.profissao,
          item.estado_civil,
          item.com_quem_mora,
          item.motivo_consulta,
          item.tempo_queixa,
          item.diagnostico_medico,
          item.medicacao_continua,
          item.saude_emocional,
          item.historico_familiar,
          item.historico_familiar_outros,
          item.preocupacao_recente,
          item.ajuda_momento_dificil,
          item.origem_paciente,
          item.origem_paciente_outros,
        ].join(" ")
      );

      const passouBusca = !termo || alvoBusca.includes(termo);
      const passouPrioridade =
        filtroPrioridade === "todos" || prioridade.label === filtroPrioridade;
      const passouOrigem =
        filtroOrigem === "todos" || item.origem_paciente === filtroOrigem;

      const passouRapido =
        filtroRapido === "todos" ||
        (filtroRapido === "prioridade_alta" && prioridade.label === "Alta") ||
        (filtroRapido === "emocional" && possuiSinaisEmocionais(item)) ||
        (filtroRapido === "sono_ruim" && sonoAlterado(item)) ||
        (filtroRapido === "fumantes" && item.tabagismo === "Sim") ||
        (filtroRapido === "alcool_frequente" &&
          item.consumo_alcool === "Frequente") ||
        (filtroRapido === "com_diagnostico" && temDiagnostico(item)) ||
        (filtroRapido === "com_medicacao" && usaMedicacao(item));

      return passouBusca && passouPrioridade && passouOrigem && passouRapido;
    });
  }, [dados, busca, filtroPrioridade, filtroOrigem, filtroRapido]);

  const metricas = useMemo(() => {
    const total = dados.length;
    const prioridadeAlta = dados.filter(
      (item) => calcularPrioridade(item).label === "Alta"
    ).length;
    const comSinaisEmocionais = dados.filter((item) =>
      possuiSinaisEmocionais(item)
    ).length;
    const sonoRuim = dados.filter((item) => sonoAlterado(item)).length;
    const fumantes = dados.filter((item) => item.tabagismo === "Sim").length;
    const comMedicacao = dados.filter((item) => usaMedicacao(item)).length;

    return {
      total,
      prioridadeAlta,
      comSinaisEmocionais,
      sonoRuim,
      fumantes,
      comMedicacao,
    };
  }, [dados]);

  const prioridadeSelecionado = selecionado
    ? calcularPrioridade(selecionado)
    : null;

  const saudeEmocionalSelecionado = transformarListaTexto(
    selecionado?.saude_emocional
  );
  const historicoFamiliarSelecionado = transformarListaTexto(
    selecionado?.historico_familiar
  );

  const topPrioritarios = useMemo(() => {
    return [...dados]
      .sort((a, b) => calcularPrioridade(b).score - calcularPrioridade(a).score)
      .slice(0, 3);
  }, [dados]);

  const recentes = useMemo(() => {
    return dadosFiltrados.slice(0, 4);
  }, [dadosFiltrados]);

  const nomeAba = {
    visao: "Visão geral",
    pacientes: "Pacientes",
    filtros: "Filtros",
    config: "Configurações",
  }[abaAtiva];

  if (selecionado) {
    return (
      <main className="min-h-screen bg-[#070b16] text-white">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_24%),linear-gradient(180deg,#060913_0%,#0a1020_55%,#090d18_100%)]" />
        <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30" />

        <section className="relative z-10 px-4 pb-28 pt-4">
          <div className="sticky top-4 z-20 mb-4 flex items-center gap-3 rounded-[24px] border border-white/10 bg-black/20 p-3 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setSelecionado(null)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/60">
                Ficha clínica
              </p>
              <h1 className="truncate text-lg font-semibold text-white">
                {selecionado.nome_completo}
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <MobileSection
              title="Paciente selecionado"
              subtitle={`Enviado em ${formatarData(selecionado.created_at)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    {selecionado.nome_completo}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {selecionado.profissao || "Profissão não informada"}
                  </p>
                </div>

                <div
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${prioridadeSelecionado?.badge}`}
                >
                  {prioridadeSelecionado?.label}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    Score clínico
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {prioridadeSelecionado?.score ?? 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    Origem do paciente
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {selecionado.origem_paciente || "Não informado"}
                  </p>
                  {selecionado.origem_paciente === "Outros" &&
                    selecionado.origem_paciente_outros && (
                      <p className="mt-2 text-sm leading-7 text-slate-400">
                        {selecionado.origem_paciente_outros}
                      </p>
                    )}
                </div>
              </div>
            </MobileSection>

            <MobileSection title="Dados básicos">
              <div className="grid grid-cols-1 gap-3">
                <InfoCard
                  title="Contato"
                  value={selecionado.telefone_whatsapp || "Não informado"}
                  icon={Phone}
                />
                <InfoCard
                  title="E-mail"
                  value={selecionado.email || "Não informado"}
                  icon={Mail}
                />
                <InfoCard
                  title="Localidade"
                  value={selecionado.cidade_estado || "Não informada"}
                  icon={MapPin}
                />
                <InfoCard
                  title="Profissão"
                  value={selecionado.profissao || "Não informada"}
                  icon={Briefcase}
                />
                <InfoCard
                  title="Data de nascimento"
                  value={formatarDataNascimento(selecionado.data_nascimento)}
                  icon={CalendarDays}
                />
                <InfoCard
                  title="Idade"
                  value={
                    selecionado.idade
                      ? `${selecionado.idade} anos`
                      : "Não informada"
                  }
                  icon={UserRound}
                />
                <InfoCard
                  title="Estado civil"
                  value={selecionado.estado_civil || "Não informado"}
                />
                <InfoCard
                  title="Com quem mora"
                  value={selecionado.com_quem_mora || "Não informado"}
                  icon={Home}
                />
              </div>
            </MobileSection>

            <MobileSection title="Motivo da consulta">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Motivo principal</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 font-medium text-white">
                    {selecionado.motivo_consulta || "Não informado"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Tempo da queixa</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {selecionado.tempo_queixa || "Não informado"}
                  </p>
                </div>
              </div>
            </MobileSection>

            <MobileSection title="Histórico de saúde">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Diagnóstico médico</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 font-medium text-white">
                    {selecionado.diagnostico_medico || "Nenhum informado"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Medicação contínua</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 font-medium text-white">
                    {selecionado.medicacao_continua || "Nenhuma informada"}
                  </p>
                </div>
              </div>
            </MobileSection>

            <MobileSection title="Saúde emocional">
              <TagsLista
                itens={saudeEmocionalSelecionado}
                fallback="Nenhum sintoma emocional informado"
              />
            </MobileSection>

            <MobileSection title="Estilo de vida">
              <div className="grid grid-cols-1 gap-3">
                <InfoCard title="Sono" value={selecionado.sono || "Não informado"} />
                <InfoCard
                  title="Atividade física"
                  value={selecionado.atividade_fisica || "Não informado"}
                />
                <InfoCard
                  title="Consumo de álcool"
                  value={selecionado.consumo_alcool || "Não informado"}
                />
                <InfoCard
                  title="Tabagismo"
                  value={selecionado.tabagismo || "Não informado"}
                />
              </div>
            </MobileSection>

            <MobileSection title="Histórico familiar">
              <TagsLista
                itens={historicoFamiliarSelecionado}
                fallback="Não informado"
              />

              {selecionado.historico_familiar_outros && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Outros</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 font-medium text-white">
                    {selecionado.historico_familiar_outros}
                  </p>
                </div>
              )}
            </MobileSection>

            <MobileSection title="Um pouco mais sobre o paciente">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">
                    O que mais tem preocupado recentemente
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 font-medium text-white">
                    {selecionado.preocupacao_recente || "Não informado"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">
                    O que ajuda em momentos difíceis
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 font-medium text-white">
                    {selecionado.ajuda_momento_dificil || "Não informado"}
                  </p>
                </div>
              </div>
            </MobileSection>

            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.95)_0%,rgba(9,14,28,0.98)_100%)] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Consentimento
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                {selecionado.consentimento
                  ? "Paciente autorizou o uso das informações para avaliação clínica e condução da consulta."
                  : "Paciente ainda não registrou consentimento válido."}
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b16] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_24%),linear-gradient(180deg,#060913_0%,#0a1020_55%,#090d18_100%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30" />

      <section className="relative z-10 px-4 pb-28 pt-4">
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-100">
                <Stethoscope className="h-4 w-4" />
                Painel da médica
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {nomeAba}
              </h1>

              <p className="mt-2 max-w-sm text-sm leading-7 text-slate-400">
                Um painel mobile moderno, organizado e simples de navegar.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={buscarRespostas}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-100"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => exportarCSV(dadosFiltrados)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#22d3ee_0%,#a855f7_100%)] text-white shadow-[0_14px_30px_rgba(34,211,238,0.22)]"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {abaAtiva === "visao" && (
          <div className="mt-4 space-y-4">
            <div className="-mx-4 overflow-x-auto px-4 pb-1">
              <div className="flex gap-3">
                <MetricCard
                  title="Pacientes"
                  value={metricas.total}
                  detail="Total de pré-consultas registradas"
                  icon={Users}
                />
                <MetricCard
                  title="Prioridade alta"
                  value={metricas.prioridadeAlta}
                  detail="Casos que pedem atenção rápida"
                  icon={AlertCircle}
                />
                <MetricCard
                  title="Sinais emocionais"
                  value={metricas.comSinaisEmocionais}
                  detail="Com sintomas emocionais relatados"
                  icon={HeartHandshake}
                />
                <MetricCard
                  title="Sono alterado"
                  value={metricas.sonoRuim}
                  detail="Regular ou ruim"
                  icon={Moon}
                />
                <MetricCard
                  title="Fumantes"
                  value={metricas.fumantes}
                  detail="Tabagismo ativo"
                  icon={Cigarette}
                />
                <MetricCard
                  title="Com medicação"
                  value={metricas.comMedicacao}
                  detail="Uso atual de medicação"
                  icon={HeartPulse}
                />
              </div>
            </div>

            <MobileSection
              title="Radar clínico"
              subtitle="Visão rápida dos pacientes com maior prioridade neste momento."
            >
              <div className="space-y-3">
                {topPrioritarios.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum registro ainda.</p>
                ) : (
                  topPrioritarios.map((item) => {
                    const prioridade = calcularPrioridade(item);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelecionado(item)}
                        className={`w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition ${prioridade.glow}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-white">
                              {item.nome_completo}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                              {item.profissao || "Profissão não informada"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${prioridade.badge}`}
                          >
                            {prioridade.label}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-300">
                          {item.motivo_consulta || "Sem motivo informado"}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </MobileSection>

            <MobileSection
              title="Mais recentes"
              subtitle="Últimos envios recebidos no questionário."
            >
              <div className="space-y-3">
                {recentes.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum envio recente.</p>
                ) : (
                  recentes.map((item) => {
                    const prioridade = calcularPrioridade(item);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelecionado(item)}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left"
                      >
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-white">
                            {item.nome_completo}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatarData(item.created_at)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium ${prioridade.badge}`}
                        >
                          {prioridade.label}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </MobileSection>
          </div>
        )}

        {abaAtiva === "pacientes" && (
          <div className="mt-4 space-y-4">
            <MobileSection
              title="Busca de pacientes"
              subtitle={`${dadosFiltrados.length} resultado(s) encontrados`}
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome, telefone, email, cidade..."
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/20"
                />
              </div>
            </MobileSection>

            {erro && (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {erro}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-36 animate-pulse rounded-[28px] bg-white/[0.04]"
                  />
                ))}
              </div>
            ) : dadosFiltrados.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,35,0.96)_0%,rgba(11,17,30,0.98)_100%)] px-5 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-400">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  Nenhum paciente encontrado
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  Tente ajustar a busca ou os filtros.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dadosFiltrados.map((item, index) => {
                  const prioridade = calcularPrioridade(item);
                  const sinaisEmocionais = transformarListaTexto(
                    item.saude_emocional
                  ).filter((registro) => registro !== "Nenhum desses");

                  return (
                    <button
                      key={`${item.id ?? item.nome_completo}-${index}`}
                      type="button"
                      onClick={() => setSelecionado(item)}
                      className={`w-full rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,35,0.96)_0%,rgba(11,17,30,0.98)_100%)] p-5 text-left transition ${prioridade.glow}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold text-white">
                            {item.nome_completo}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {item.profissao || "Sem profissão"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${prioridade.badge}`}
                        >
                          {prioridade.label}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-400">
                        <div className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4 text-cyan-200" />
                          {item.telefone_whatsapp || "Sem telefone"}
                        </div>

                        <div className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-cyan-200" />
                          {item.cidade_estado || "Sem cidade"}
                        </div>

                        <div className="inline-flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-cyan-200" />
                          {item.tempo_queixa || "Sem tempo informado"}
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-300">
                        {item.motivo_consulta || "Sem motivo informado"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {temDiagnostico(item) && (
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-200">
                            Diagnóstico
                          </span>
                        )}

                        {usaMedicacao(item) && (
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-200">
                            Medicação
                          </span>
                        )}

                        {sinaisEmocionais.slice(0, 2).map((sinal) => (
                          <span
                            key={sinal}
                            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300"
                          >
                            {sinal}
                          </span>
                        ))}

                        {sinaisEmocionais.length > 2 && (
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                            +{sinaisEmocionais.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          {formatarData(item.created_at)}
                        </p>

                        <span className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
                          Abrir ficha
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {abaAtiva === "filtros" && (
          <div className="mt-4 space-y-4">
            <MobileSection
              title="Filtragem clínica"
              subtitle="Refine rapidamente os resultados do painel."
            >
              <div className="space-y-4">
                <select
                  value={filtroPrioridade}
                  onChange={(e) => setFiltroPrioridade(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="todos" className="text-slate-900">
                    Todas as prioridades
                  </option>
                  <option value="Alta" className="text-slate-900">
                    Prioridade alta
                  </option>
                  <option value="Média" className="text-slate-900">
                    Prioridade média
                  </option>
                  <option value="Baixa" className="text-slate-900">
                    Prioridade baixa
                  </option>
                </select>

                <select
                  value={filtroOrigem}
                  onChange={(e) => setFiltroOrigem(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="todos" className="text-slate-900">
                    Todas as origens
                  </option>
                  {origensUnicas.map((origem) => (
                    <option key={origem} value={origem} className="text-slate-900">
                      {origem}
                    </option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-2">
                  {filtrosRapidos.map((item) => {
                    const ativo = filtroRapido === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFiltroRapido(item.id)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          ativo
                            ? "border-cyan-300/25 bg-cyan-400/10 text-cyan-100"
                            : "border-white/10 bg-white/[0.03] text-slate-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </MobileSection>

            <MobileSection
              title="Resumo atual"
              subtitle="Estado dos filtros aplicados agora."
            >
              <div className="space-y-3">
                <InfoCard title="Prioridade" value={filtroPrioridade} />
                <InfoCard title="Origem" value={filtroOrigem} />
                <InfoCard title="Filtro rápido" value={filtroRapido} />
                <InfoCard
                  title="Resultados encontrados"
                  value={String(dadosFiltrados.length)}
                />
              </div>
            </MobileSection>
          </div>
        )}

        {abaAtiva === "config" && (
          <div className="mt-4 space-y-4">
            <MobileSection
              title="Ações do painel"
              subtitle="Atalhos rápidos para manutenção e uso do painel."
            >
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={buscarRespostas}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left"
                >
                  <span className="inline-flex items-center gap-3 text-sm font-medium text-white">
                    <RefreshCw className="h-4 w-4 text-cyan-200" />
                    Atualizar dados do painel
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                <button
                  type="button"
                  onClick={() => exportarCSV(dadosFiltrados)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left"
                >
                  <span className="inline-flex items-center gap-3 text-sm font-medium text-white">
                    <Download className="h-4 w-4 text-cyan-200" />
                    Exportar pacientes filtrados
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.removeItem("painel_autorizado");
                    window.location.href = "/acesso-painel";
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-rose-400/15 bg-rose-500/10 px-4 py-4 text-left"
                >
                  <span className="inline-flex items-center gap-3 text-sm font-medium text-rose-100">
                    <ShieldCheck className="h-4 w-4" />
                    Sair do painel
                  </span>
                  <ChevronRight className="h-4 w-4 text-rose-200/70" />
                </button>
              </div>
            </MobileSection>

            <MobileSection
              title="Estado atual"
              subtitle="Visão rápida da sessão e uso do sistema."
            >
              <div className="space-y-3">
                <InfoCard title="Registros carregados" value={String(dados.length)} />
                <InfoCard
                  title="Pacientes com prioridade alta"
                  value={String(metricas.prioridadeAlta)}
                />
                <InfoCard
                  title="Pacientes com sinais emocionais"
                  value={String(metricas.comSinaisEmocionais)}
                />
                <InfoCard
                  title="Pacientes em uso de medicação"
                  value={String(metricas.comMedicacao)}
                />
              </div>
            </MobileSection>
          </div>
        )}
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[linear-gradient(180deg,rgba(8,12,24,0.92)_0%,rgba(5,8,18,0.98)_100%)] px-3 pb-3 pt-2 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-md items-center gap-2 rounded-[28px] border border-white/10 bg-white/[0.03] p-2 shadow-[0_-10px_30px_rgba(0,0,0,0.16)]">
          <BottomNavItem
            active={abaAtiva === "visao"}
            label="Visão"
            icon={LayoutGrid}
            onClick={() => setAbaAtiva("visao")}
          />
          <BottomNavItem
            active={abaAtiva === "pacientes"}
            label="Pacientes"
            icon={Users}
            onClick={() => setAbaAtiva("pacientes")}
          />
          <BottomNavItem
            active={abaAtiva === "filtros"}
            label="Filtros"
            icon={SlidersHorizontal}
            onClick={() => setAbaAtiva("filtros")}
          />
          <BottomNavItem
            active={abaAtiva === "config"}
            label="Config"
            icon={Settings2}
            onClick={() => setAbaAtiva("config")}
          />
        </div>
      </nav>
    </main>
  );
}