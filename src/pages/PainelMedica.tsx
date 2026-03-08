import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  Cigarette,
  Clock3,
  Download,
  Filter,
  HeartHandshake,
  HeartPulse,
  Loader2,
  Mail,
  MapPin,
  Moon,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Wine,
  ChevronRight,
  UserRound,
  Home,
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
};

const filtrosRapidos: {
  id: FiltroRapido;
  label: string;
  icon: typeof Filter;
}[] = [
  { id: "todos", label: "Todos", icon: Filter },
  { id: "prioridade_alta", label: "Prioridade alta", icon: AlertCircle },
  { id: "emocional", label: "Sinais emocionais", icon: HeartHandshake },
  { id: "sono_ruim", label: "Sono ruim", icon: Moon },
  { id: "fumantes", label: "Fumantes", icon: Cigarette },
  { id: "alcool_frequente", label: "Álcool frequente", icon: Wine },
  { id: "com_diagnostico", label: "Com diagnóstico", icon: ShieldCheck },
  { id: "com_medicacao", label: "Com medicação", icon: HeartPulse },
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
      badge: "border-rose-200 bg-rose-100 text-rose-700",
    };
  }

  if (score >= 3) {
    return {
      label: "Média",
      score,
      badge: "border-amber-200 bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "Baixa",
    score,
    badge: "border-emerald-200 bg-emerald-100 text-emerald-700",
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
  link.setAttribute("download", "painel-pre-consulta-medica.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function CardMetrica({
  titulo,
  valor,
  detalhe,
  icon: Icon,
}: {
  titulo: string;
  valor: string | number;
  detalhe: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {titulo}
          </p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {valor}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{detalhe}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function BlocoInfo({
  titulo,
  valor,
  icon: Icon,
}: {
  titulo: string;
  valor: string;
  icon?: typeof Phone;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {titulo}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-800">
        {Icon ? (
          <span className="inline-flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {valor}
          </span>
        ) : (
          valor
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
    return <p className="text-sm text-slate-500">{fallback}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {itens.map((item) => (
        <span
          key={item}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function PainelMedica() {
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

  const [selecionado, setSelecionado] =
    useState<RespostaPreConsulta | null>(null);

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
      } else if (!selecionado) {
        setSelecionado(lista[0]);
      } else {
        const aindaExiste = lista.find((item) => item.id === selecionado.id);
        setSelecionado(aindaExiste ?? lista[0]);
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

      return (
        passouBusca && passouPrioridade && passouOrigem && passouRapido
      );
    });
  }, [dados, busca, filtroPrioridade, filtroOrigem, filtroRapido]);

  useEffect(() => {
    if (!dadosFiltrados.length) {
      setSelecionado(null);
      return;
    }

    if (!selecionado) {
      setSelecionado(dadosFiltrados[0]);
      return;
    }

    const itemAindaExiste = dadosFiltrados.find(
      (item) => item.id === selecionado.id
    );

    if (!itemAindaExiste) {
      setSelecionado(dadosFiltrados[0]);
    }
  }, [dadosFiltrados, selecionado]);

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

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-800">
      <section className="relative overflow-hidden border-b border-white/60 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_30%),radial-gradient(circle_at_top_right,rgba(226,232,240,0.85),transparent_28%),linear-gradient(135deg,#f8fafc_0%,#eef2f7_45%,#e2e8f0_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] bg-[size:38px_38px] opacity-40" />

        <div className="relative mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-12">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur-xl">
                <Stethoscope className="h-4 w-4" />
                Painel clínico inteligente
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
                Painel da médica
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Um ambiente completo para revisar pré-consultas, identificar
                prioridades, acompanhar histórico clínico inicial e conduzir o
                atendimento com mais clareza, organização e cuidado.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={buscarRespostas}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </button>

              <button
                type="button"
                onClick={() => exportarCSV(dadosFiltrados)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <CardMetrica
              titulo="Pacientes"
              valor={metricas.total}
              detalhe="Total de pré-consultas registradas"
              icon={Users}
            />
            <CardMetrica
              titulo="Prioridade alta"
              valor={metricas.prioridadeAlta}
              detalhe="Pacientes que pedem atenção rápida"
              icon={AlertCircle}
            />
            <CardMetrica
              titulo="Sinais emocionais"
              valor={metricas.comSinaisEmocionais}
              detalhe="Com sintomas emocionais relatados"
              icon={HeartHandshake}
            />
            <CardMetrica
              titulo="Sono alterado"
              valor={metricas.sonoRuim}
              detalhe="Regular ou ruim"
              icon={Moon}
            />
            <CardMetrica
              titulo="Fumantes"
              valor={metricas.fumantes}
              detalhe="Tabagismo ativo"
              icon={Cigarette}
            />
            <CardMetrica
              titulo="Com medicação"
              valor={metricas.comMedicacao}
              detalhe="Uso atual de medicação"
              icon={HeartPulse}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10 lg:px-12">
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl md:p-6">
              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome, telefone, email, cidade, profissão, motivo..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400"
                  />
                </div>

                <select
                  value={filtroPrioridade}
                  onChange={(e) => setFiltroPrioridade(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="todos">Todas as prioridades</option>
                  <option value="Alta">Prioridade alta</option>
                  <option value="Média">Prioridade média</option>
                  <option value="Baixa">Prioridade baixa</option>
                </select>

                <select
                  value={filtroOrigem}
                  onChange={(e) => setFiltroOrigem(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="todos">Todas as origens</option>
                  {origensUnicas.map((origem) => (
                    <option key={origem} value={origem}>
                      {origem}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {filtrosRapidos.map((item) => {
                  const Icon = item.icon;
                  const ativo = filtroRapido === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFiltroRapido(item.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                        ativo
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Pacientes
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {dadosFiltrados.length} resultado(s) encontrado(s)
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  Ordenados por envio mais recente
                </div>
              </div>

              {erro && (
                <div className="px-6 py-5 text-sm text-rose-600">{erro}</div>
              )}

              {loading ? (
                <div className="space-y-3 px-5 py-5 md:px-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-28 animate-pulse rounded-2xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : dadosFiltrados.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    Nenhum paciente encontrado
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Tente ajustar os filtros ou atualizar os dados.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {dadosFiltrados.map((item, index) => {
                    const prioridade = calcularPrioridade(item);
                    const ativo =
                      selecionado?.id === item.id ||
                      (!selecionado && index === 0);

                    const sinaisEmocionais = transformarListaTexto(
                      item.saude_emocional
                    ).filter((registro) => registro !== "Nenhum desses");

                    return (
                      <button
                        key={`${item.id ?? item.nome_completo}-${index}`}
                        type="button"
                        onClick={() => setSelecionado(item)}
                        className={`flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition md:px-6 ${
                          ativo ? "bg-slate-50/80" : "hover:bg-slate-50/60"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="truncate text-base font-semibold text-slate-900">
                              {item.nome_completo}
                            </h3>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${prioridade.badge}`}
                            >
                              Prioridade {prioridade.label}
                            </span>

                            {temDiagnostico(item) && (
                              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                Diagnóstico
                              </span>
                            )}

                            {usaMedicacao(item) && (
                              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                Medicação
                              </span>
                            )}
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-slate-500 md:grid-cols-2 xl:grid-cols-4">
                            <div className="inline-flex items-center gap-2">
                              <Stethoscope className="h-4 w-4" />
                              {item.profissao || "Sem profissão"}
                            </div>
                            <div className="inline-flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {item.telefone_whatsapp || "Sem telefone"}
                            </div>
                            <div className="inline-flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {item.cidade_estado || "Sem cidade"}
                            </div>
                            <div className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4" />
                              {item.tempo_queixa || "Sem tempo informado"}
                            </div>
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">
                            {item.motivo_consulta || "Sem motivo informado"}
                          </p>

                          {sinaisEmocionais.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {sinaisEmocionais.slice(0, 3).map((sinal) => (
                                <span
                                  key={sinal}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                                >
                                  {sinal}
                                </span>
                              ))}
                              {sinaisEmocionais.length > 3 && (
                                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                                  +{sinaisEmocionais.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                            Recebido em {formatarData(item.created_at)}
                          </p>
                        </div>

                        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="xl:sticky xl:top-6 xl:self-start">
            <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="border-b border-slate-100 px-5 py-5 md:px-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Ficha clínica detalhada
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {selecionado?.nome_completo ?? "Selecione um paciente"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {selecionado
                    ? `Enviado em ${formatarData(selecionado.created_at)}`
                    : "Escolha um registro para visualizar todos os detalhes."}
                </p>
              </div>

              {selecionado ? (
                <div className="space-y-6 px-5 py-5 md:px-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Prioridade clínica
                      </p>
                      <div
                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-medium ${prioridadeSelecionado?.badge}`}
                      >
                        {prioridadeSelecionado?.label}
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Score {prioridadeSelecionado?.score ?? 0}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Origem do paciente
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {selecionado.origem_paciente || "Não informado"}
                      </p>
                      {selecionado.origem_paciente === "Outros" &&
                        selecionado.origem_paciente_outros && (
                          <p className="mt-2 text-xs text-slate-500">
                            {selecionado.origem_paciente_outros}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <BlocoInfo
                      titulo="Contato"
                      valor={selecionado.telefone_whatsapp || "Não informado"}
                      icon={Phone}
                    />
                    <BlocoInfo
                      titulo="E-mail"
                      valor={selecionado.email || "Não informado"}
                      icon={Mail}
                    />
                    <BlocoInfo
                      titulo="Localidade"
                      valor={selecionado.cidade_estado || "Não informada"}
                      icon={MapPin}
                    />
                    <BlocoInfo
                      titulo="Profissão"
                      valor={selecionado.profissao || "Não informada"}
                      icon={Briefcase}
                    />
                    <BlocoInfo
                      titulo="Data de nascimento"
                      valor={formatarDataNascimento(
                        selecionado.data_nascimento
                      )}
                      icon={CalendarDays}
                    />
                    <BlocoInfo
                      titulo="Idade"
                      valor={
                        selecionado.idade
                          ? `${selecionado.idade} anos`
                          : "Não informada"
                      }
                      icon={UserRound}
                    />
                    <BlocoInfo
                      titulo="Estado civil"
                      valor={selecionado.estado_civil || "Não informado"}
                    />
                    <BlocoInfo
                      titulo="Com quem mora"
                      valor={selecionado.com_quem_mora || "Não informado"}
                      icon={Home}
                    />
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      O que trouxe o paciente até aqui
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <p className="text-sm text-slate-500">
                          Motivo principal
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-7 font-medium text-slate-900">
                          {selecionado.motivo_consulta || "Não informado"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Tempo da queixa
                        </p>
                        <p className="mt-1 font-medium text-slate-900">
                          {selecionado.tempo_queixa || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Histórico de saúde
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">
                          Diagnóstico médico
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-7 font-medium text-slate-900">
                          {selecionado.diagnostico_medico || "Nenhum informado"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Medicação contínua
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-7 font-medium text-slate-900">
                          {selecionado.medicacao_continua ||
                            "Nenhuma informada"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Saúde emocional
                    </p>

                    <div className="mt-4">
                      <TagsLista
                        itens={saudeEmocionalSelecionado}
                        fallback="Nenhum sintoma emocional informado"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Estilo de vida
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Sono</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {selecionado.sono || "Não informado"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">
                          Atividade física
                        </p>
                        <p className="mt-1 font-medium text-slate-900">
                          {selecionado.atividade_fisica || "Não informado"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">
                          Consumo de álcool
                        </p>
                        <p className="mt-1 font-medium text-slate-900">
                          {selecionado.consumo_alcool || "Não informado"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Tabagismo</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {selecionado.tabagismo || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Histórico familiar
                    </p>

                    <div className="mt-4">
                      <TagsLista
                        itens={historicoFamiliarSelecionado}
                        fallback="Não informado"
                      />
                    </div>

                    {selecionado.historico_familiar_outros && (
                      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Outros</p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-7 font-medium text-slate-900">
                          {selecionado.historico_familiar_outros}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Um pouco mais sobre o paciente
                    </p>

                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">
                          O que mais tem preocupado recentemente
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-7 font-medium text-slate-900">
                          {selecionado.preocupacao_recente ||
                            "Não informado"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">
                          O que ajuda em momentos difíceis
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-7 font-medium text-slate-900">
                          {selecionado.ajuda_momento_dificil ||
                            "Não informado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-950 bg-slate-950 p-5 text-white">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      Consentimento
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-200">
                      {selecionado.consentimento
                        ? "Paciente autorizou o uso das informações para avaliação clínica e condução da consulta."
                        : "Paciente ainda não registrou consentimento válido."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  {loading ? (
                    <>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                        <Loader2 className="h-7 w-7 animate-spin" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        Carregando registros
                      </h3>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                        <Stethoscope className="h-7 w-7" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        Nenhum registro selecionado
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Ao clicar em um paciente, todos os dados aparecem aqui.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}