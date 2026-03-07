import { useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, FileDown, Users, AlertCircle, Moon, HeartPulse, Cigarette, Wine, Stethoscope, ChevronRight, Filter, Phone, MapPin, Briefcase, Clock3 } from "lucide-react";
import { supabase } from "../lib/supabase";

type RespostaPreConsulta = {
  id?: number;
  created_at?: string;
  nome_completo: string;
  idade: number | null;
  cidade_estado: string;
  profissao: string;
  telefone_whatsapp: string;
  motivo_consulta: string;
  tempo_queixa: string;
  intensidade: number | null;
  diagnostico_medico: string;
  medicacao_continua: string;
  sono: string;
  atividade_fisica: string;
  consumo_alcool: string;
  tabagismo: string;
  consentimento: boolean;
};

type FiltroRapido = "todos" | "alto_risco" | "sono_ruim" | "fumantes" | "alcool_freq";

const motivoLabels: Record<string, string> = {
  Ansiedade: "Ansiedade",
  "Tristeza ou desânimo": "Tristeza ou desânimo",
  "Estresse ou sobrecarga": "Estresse ou sobrecarga",
  "Problemas de sono": "Problemas de sono",
  "Dificuldade de concentração": "Dificuldade de concentração",
  "Avaliação geral de saúde": "Avaliação geral de saúde",
  Outro: "Outro",
};

function formatarData(data?: string) {
  if (!data) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

function normalizarTexto(valor?: string | null) {
  return (valor ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function calcularPrioridade(item: RespostaPreConsulta) {
  let score = 0;

  if ((item.intensidade ?? 0) >= 8) score += 3;
  if (item.sono === "Ruim" || item.sono === "Insônia frequente") score += 2;
  if (item.tabagismo === "Sim") score += 1;
  if (item.consumo_alcool === "Frequentemente") score += 1;
  if (item.motivo_consulta === "Ansiedade") score += 1;
  if (item.motivo_consulta === "Tristeza ou desânimo") score += 2;

  if (score >= 5) return { label: "Alta", badge: "bg-rose-100 text-rose-700 border-rose-200" };
  if (score >= 3) return { label: "Média", badge: "bg-amber-100 text-amber-700 border-amber-200" };
  return { label: "Baixa", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" };
}

function exportarCSV(dados: RespostaPreConsulta[]) {
  const headers = [
    "Data",
    "Nome",
    "Idade",
    "Cidade/Estado",
    "Profissão",
    "Telefone",
    "Motivo da consulta",
    "Tempo da queixa",
    "Intensidade",
    "Diagnóstico médico",
    "Medicação contínua",
    "Sono",
    "Atividade física",
    "Consumo álcool",
    "Tabagismo",
    "Consentimento",
  ];

  const linhas = dados.map((item) => [
    item.created_at ?? "",
    item.nome_completo,
    item.idade ?? "",
    item.cidade_estado,
    item.profissao,
    item.telefone_whatsapp,
    item.motivo_consulta,
    item.tempo_queixa,
    item.intensidade ?? "",
    item.diagnostico_medico,
    item.medicacao_continua,
    item.sono,
    item.atividade_fisica,
    item.consumo_alcool,
    item.tabagismo,
    item.consentimento ? "Sim" : "Não",
  ]);

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
  link.setAttribute("download", "pacientes-pre-consulta.csv");
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
    <div className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{titulo}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{valor}</h3>
          <p className="mt-2 text-sm text-slate-500">{detalhe}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
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
  const [busca, setBusca] = useState("");
  const [filtroMotivo, setFiltroMotivo] = useState("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todos");
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>("todos");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [selecionado, setSelecionado] = useState<RespostaPreConsulta | null>(null);

  async function buscarRespostas() {
    try {
      setLoading(true);
      setErro("");

      const { data, error } = await supabase
        .from("respostas_pre_consulta")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDados((data as RespostaPreConsulta[]) ?? []);

      if (!selecionado && data && data.length > 0) {
        setSelecionado(data[0] as RespostaPreConsulta);
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

  const dadosFiltrados = useMemo(() => {
    return dados.filter((item) => {
      const prioridade = calcularPrioridade(item).label;
      const termo = normalizarTexto(busca);
      const alvoBusca = normalizarTexto(
        [
          item.nome_completo,
          item.cidade_estado,
          item.profissao,
          item.telefone_whatsapp,
          item.motivo_consulta,
          item.diagnostico_medico,
          item.medicacao_continua,
        ].join(" ")
      );

      const passouBusca = !termo || alvoBusca.includes(termo);
      const passouMotivo = filtroMotivo === "todos" || item.motivo_consulta === filtroMotivo;
      const passouPrioridade = filtroPrioridade === "todos" || prioridade === filtroPrioridade;

      const passouRapido =
        filtroRapido === "todos" ||
        (filtroRapido === "alto_risco" && (item.intensidade ?? 0) >= 8) ||
        (filtroRapido === "sono_ruim" && (item.sono === "Ruim" || item.sono === "Insônia frequente")) ||
        (filtroRapido === "fumantes" && item.tabagismo === "Sim") ||
        (filtroRapido === "alcool_freq" && item.consumo_alcool === "Frequentemente");

      return passouBusca && passouMotivo && passouPrioridade && passouRapido;
    });
  }, [dados, busca, filtroMotivo, filtroPrioridade, filtroRapido]);

  const metricas = useMemo(() => {
    const total = dados.length;
    const altoRisco = dados.filter((item) => calcularPrioridade(item).label === "Alta").length;
    const sonoRuim = dados.filter((item) => item.sono === "Ruim" || item.sono === "Insônia frequente").length;
    const fumantes = dados.filter((item) => item.tabagismo === "Sim").length;
    const mediaIntensidade = total
      ? (dados.reduce((acc, item) => acc + (item.intensidade ?? 0), 0) / total).toFixed(1)
      : "0.0";

    return { total, altoRisco, sonoRuim, fumantes, mediaIntensidade };
  }, [dados]);

  const motivosUnicos = useMemo(() => {
    return Array.from(new Set(dados.map((item) => item.motivo_consulta).filter(Boolean)));
  }, [dados]);

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-800">
      <section className="relative overflow-hidden border-b border-white/60 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_30%),radial-gradient(circle_at_top_right,rgba(226,232,240,0.85),transparent_28%),linear-gradient(135deg,#f8fafc_0%,#eef2f7_45%,#e2e8f0_100%)]">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] bg-[size:38px_38px] opacity-40" />

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
                Um ambiente completo para acompanhar pacientes, priorizar casos, revisar respostas e tomar decisões com mais rapidez, clareza e elegância.
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
                <FileDown className="h-4 w-4" />
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <CardMetrica titulo="Pacientes" valor={metricas.total} detalhe="Total de pré-consultas registradas" icon={Users} />
            <CardMetrica titulo="Prioridade alta" valor={metricas.altoRisco} detalhe="Casos que merecem atenção rápida" icon={AlertCircle} />
            <CardMetrica titulo="Sono alterado" valor={metricas.sonoRuim} detalhe="Ruim ou insônia frequente" icon={Moon} />
            <CardMetrica titulo="Fumantes" valor={metricas.fumantes} detalhe="Pacientes com tabagismo ativo" icon={Cigarette} />
            <CardMetrica titulo="Média intensidade" valor={metricas.mediaIntensidade} detalhe="Escala média de desconforto" icon={HeartPulse} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10 lg:px-12">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl md:p-6">
              <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr_0.7fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome, telefone, profissão, cidade, diagnóstico..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400"
                  />
                </div>

                <select
                  value={filtroMotivo}
                  onChange={(e) => setFiltroMotivo(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  <option value="todos">Todos os motivos</option>
                  {motivosUnicos.map((motivo) => (
                    <option key={motivo} value={motivo}>
                      {motivoLabels[motivo] ?? motivo}
                    </option>
                  ))}
                </select>

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
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {[
                  { id: "todos", label: "Todos", icon: Filter },
                  { id: "alto_risco", label: "Intensidade ≥ 8", icon: AlertCircle },
                  { id: "sono_ruim", label: "Sono ruim", icon: Moon },
                  { id: "fumantes", label: "Fumantes", icon: Cigarette },
                  { id: "alcool_freq", label: "Álcool frequente", icon: Wine },
                ].map((item) => {
                  const Icon = item.icon;
                  const ativo = filtroRapido === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFiltroRapido(item.id as FiltroRapido)}
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
                  <h2 className="text-lg font-semibold text-slate-900">Pacientes</h2>
                  <p className="mt-1 text-sm text-slate-500">{dadosFiltrados.length} resultado(s) encontrado(s)</p>
                </div>
              </div>

              {erro && (
                <div className="px-6 py-5 text-sm text-rose-600">{erro}</div>
              )}

              {loading ? (
                <div className="space-y-3 px-5 py-5 md:px-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              ) : dadosFiltrados.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">Nenhum paciente encontrado</h3>
                  <p className="mt-2 text-sm text-slate-500">Tente ajustar os filtros ou atualizar a busca.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {dadosFiltrados.map((item, index) => {
                    const prioridade = calcularPrioridade(item);
                    const ativo = selecionado?.id === item.id || (!selecionado && index === 0);

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
                            <h3 className="truncate text-base font-semibold text-slate-900">{item.nome_completo}</h3>
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${prioridade.badge}`}>
                              Prioridade {prioridade.label}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-slate-500 md:grid-cols-2 xl:grid-cols-4">
                            <div className="inline-flex items-center gap-2">
                              <Stethoscope className="h-4 w-4" />
                              {item.motivo_consulta || "Sem motivo"}
                            </div>
                            <div className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4" />
                              {item.tempo_queixa || "Sem tempo informado"}
                            </div>
                            <div className="inline-flex items-center gap-2">
                              <HeartPulse className="h-4 w-4" />
                              Intensidade {item.intensidade ?? "-"}/10
                            </div>
                            <div className="inline-flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {item.telefone_whatsapp || "Sem telefone"}
                            </div>
                          </div>

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
            <div className="rounded-[28px] border border-white/60 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className="border-b border-slate-100 px-5 py-5 md:px-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Ficha clínica detalhada</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {selecionado?.nome_completo ?? "Selecione um paciente"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selecionado ? `Enviado em ${formatarData(selecionado.created_at)}` : "Escolha um registro para visualizar todos os detalhes."}
                </p>
              </div>

              {selecionado ? (
                <div className="space-y-6 px-5 py-5 md:px-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Prioridade clínica</p>
                      <div className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-medium ${calcularPrioridade(selecionado).badge}`}>
                        {calcularPrioridade(selecionado).label}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Escala de intensidade</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{selecionado.intensidade ?? "-"}/10</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Contato</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-800"><Phone className="h-4 w-4" /> {selecionado.telefone_whatsapp || "Não informado"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Localidade</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-800"><MapPin className="h-4 w-4" /> {selecionado.cidade_estado || "Não informada"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Idade</p>
                      <p className="mt-2 text-sm font-medium text-slate-800">{selecionado.idade ?? "Não informada"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Profissão</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-800"><Briefcase className="h-4 w-4" /> {selecionado.profissao || "Não informada"}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Contexto da consulta</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">Motivo principal</p>
                        <p className="mt-1 font-medium text-slate-900">{selecionado.motivo_consulta || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Tempo da queixa</p>
                        <p className="mt-1 font-medium text-slate-900">{selecionado.tempo_queixa || "Não informado"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Histórico de saúde</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">Diagnóstico médico</p>
                        <p className="mt-1 font-medium text-slate-900">{selecionado.diagnostico_medico || "Nenhum informado"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Medicação contínua</p>
                        <p className="mt-1 font-medium text-slate-900">{selecionado.medicacao_continua || "Nenhuma informada"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Estilo de vida</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Sono</p>
                        <p className="mt-1 font-medium text-slate-900">{selecionado.sono || "Não informado"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Atividade física</p>
                        <p className="mt-1 font-medium text-slate-900">{selecionado.atividade_fisica || "Não informado"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Consumo de álcool</p>
                        <p className="mt-1 font-medium text-slate-900">{selecionado.consumo_alcool || "Não informado"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Tabagismo</p>
                        <p className="mt-1 font-medium text-slate-900">{selecionado.tabagismo || "Não informado"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Consentimento</p>
                    <p className="mt-3 text-sm leading-7 text-slate-200">
                      {selecionado.consentimento
                        ? "Paciente autorizou o uso das informações para avaliação clínica e condução da consulta." 
                        : "Paciente ainda não registrou consentimento válido."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                    <Stethoscope className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">Nenhum registro selecionado</h3>
                  <p className="mt-2 text-sm text-slate-500">Ao clicar em um paciente, todos os dados aparecem aqui.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
