import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  ChevronRight,
  Cigarette,
  Clock3,
  Download,
  Filter,
  HeartHandshake,
  HeartPulse,
  MapPin,
  Moon,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wine,
  X,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import FichaPaciente from "./FichaPaciente";

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
      badge: "border-rose-500/25 bg-rose-500/10 text-rose-300",
    };
  }

  if (score >= 3) {
    return {
      label: "Média",
      score,
      badge: "border-[#c8a96a]/30 bg-[#c8a96a]/12 text-[#e6c27a]",
    };
  }

  return {
    label: "Baixa",
    score,
    badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
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

function FiltroChip({
  ativo,
  label,
  icon: Icon,
  onClick,
}: {
  ativo: boolean;
  label: string;
  icon: typeof Filter;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[40px] items-center gap-2 border px-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
        ativo
          ? "border-[#c8a96a]/30 bg-[#c8a96a]/12 text-[#e6c27a]"
          : "border-white/10 bg-[#16221b] text-[#d6d1c7] hover:bg-[#1b2a21]"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function BlocoPainel({
  titulo,
  subtitulo,
  children,
  direita,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  direita?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f978f]">
            {titulo}
          </p>
          {subtitulo && (
            <p className="mt-2 text-base text-[#f6f1e8]">{subtitulo}</p>
          )}
        </div>
        {direita}
      </div>
      <div>{children}</div>
    </section>
  );
}

export default function Pacientes() {
  const [dados, setDados] = useState<RespostaPreConsulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todos");
  const [filtroOrigem, setFiltroOrigem] = useState("todos");
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>("todos");

  const [selecionado, setSelecionado] =
    useState<RespostaPreConsulta | null>(null);

  const [modalAberto, setModalAberto] = useState(false);

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
      setErro("Não foi possível carregar os pacientes agora.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarRespostas();
  }, []);

  useEffect(() => {
    if (!modalAberto) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [modalAberto]);

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

  const prioridadeSelecionado = selecionado
    ? calcularPrioridade(selecionado)
    : null;

  function abrirPaciente(item: RespostaPreConsulta) {
    setSelecionado(item);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  return (
    <div className="min-h-full bg-[#0f1612] text-[#f6f1e8]">
      <div className="border-b border-white/10 px-6 py-5 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c8a96a]">
              Pacientes
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={buscarRespostas}
              className="inline-flex items-center gap-2 border border-white/10 bg-[#16221b] px-4 py-3 text-sm font-medium text-[#d6d1c7] transition hover:bg-[#1b2a21]"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar dados
            </button>

            <button
              type="button"
              onClick={() => exportarCSV(dadosFiltrados)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a96a] via-[#d4b26e] to-[#e6c27a] px-4 py-3 text-sm font-semibold text-[#16221b] transition hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-[1180px] space-y-6">
          <BlocoPainel
            titulo="Filtros e busca"
            subtitulo="Refine a visualização dos pacientes"
          >
            <div className="grid gap-4 border-b border-white/10 px-5 py-5 xl:grid-cols-[1.15fr_0.9fr_0.9fr]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f877f]" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome, telefone, cidade, profissão, motivo..."
                  className="w-full border border-white/10 bg-[#16221b] px-10 py-3 text-sm text-[#f6f1e8] outline-none placeholder:text-[#7f877f] focus:border-[#c8a96a]/40"
                />
              </div>

              <select
                value={filtroPrioridade}
                onChange={(e) => setFiltroPrioridade(e.target.value)}
                className="border border-white/10 bg-[#16221b] px-4 py-3 text-sm text-[#f6f1e8] outline-none focus:border-[#c8a96a]/40"
              >
                <option value="todos">Todas as prioridades</option>
                <option value="Alta">Prioridade alta</option>
                <option value="Média">Prioridade média</option>
                <option value="Baixa">Prioridade baixa</option>
              </select>

              <select
                value={filtroOrigem}
                onChange={(e) => setFiltroOrigem(e.target.value)}
                className="border border-white/10 bg-[#16221b] px-4 py-3 text-sm text-[#f6f1e8] outline-none focus:border-[#c8a96a]/40"
              >
                <option value="todos">Todas as origens</option>
                {origensUnicas.map((origem) => (
                  <option key={origem} value={origem}>
                    {origem}
                  </option>
                ))}
              </select>
            </div>

            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-2.5">
                {filtrosRapidos.map((item) => (
                  <FiltroChip
                    key={item.id}
                    ativo={filtroRapido === item.id}
                    label={item.label}
                    icon={item.icon}
                    onClick={() => setFiltroRapido(item.id)}
                  />
                ))}
              </div>
            </div>
          </BlocoPainel>

          <BlocoPainel
            titulo="Lista de pacientes"
            subtitulo={`${dadosFiltrados.length} resultado(s) encontrado(s)`}
            direita={
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9ea69d]">
                <Sparkles className="h-3.5 w-3.5 text-[#e6c27a]" />
                Mais recentes primeiro
              </div>
            }
          >
            {erro && (
              <div className="border-b border-white/10 px-5 py-4 text-sm text-rose-300">
                {erro}
              </div>
            )}

            {loading ? (
              <div className="space-y-4 px-5 py-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse border border-white/8 bg-white/[0.03]"
                  />
                ))}
              </div>
            ) : dadosFiltrados.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center border border-white/10 bg-white/[0.03] text-[#c8a96a]">
                  <Users className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#f6f1e8]">
                  Nenhum paciente encontrado
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#a8b0a7]">
                  Ajuste a busca ou os filtros para visualizar os registros.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/8">
                {dadosFiltrados.map((item, index) => {
                  const prioridade = calcularPrioridade(item);

                  const sinaisEmocionais = transformarListaTexto(
                    item.saude_emocional
                  ).filter((registro) => registro !== "Nenhum desses");

                  return (
                    <div
                      key={`${item.id ?? item.nome_completo}-${index}`}
                      className="px-5 py-5 transition hover:bg-white/[0.03]"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="truncate text-lg font-semibold tracking-[-0.03em] text-[#f6f1e8]">
                              {item.nome_completo}
                            </h3>

                            <span
                              className={`inline-flex items-center border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${prioridade.badge}`}
                            >
                              Prioridade {prioridade.label}
                            </span>

                            {temDiagnostico(item) && (
                              <span className="inline-flex items-center border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d6d1c7]">
                                Diagnóstico
                              </span>
                            )}

                            {usaMedicacao(item) && (
                              <span className="inline-flex items-center border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d6d1c7]">
                                Medicação
                              </span>
                            )}
                          </div>

                          <div className="mt-4 grid gap-2 text-sm text-[#a8b0a7] md:grid-cols-2 xl:grid-cols-4">
                            <div className="inline-flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-[#7f877f]" />
                              {item.profissao || "Sem profissão"}
                            </div>

                            <div className="inline-flex items-center gap-2">
                              <Phone className="h-4 w-4 text-[#7f877f]" />
                              {item.telefone_whatsapp || "Sem telefone"}
                            </div>

                            <div className="inline-flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#7f877f]" />
                              {item.cidade_estado || "Sem cidade"}
                            </div>

                            <div className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4 text-[#7f877f]" />
                              {item.tempo_queixa || "Sem tempo informado"}
                            </div>
                          </div>

                          <p className="mt-4 line-clamp-2 text-sm leading-7 text-[#d6d1c7]">
                            {item.motivo_consulta || "Sem motivo informado"}
                          </p>

                          {sinaisEmocionais.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {sinaisEmocionais.slice(0, 3).map((sinal) => (
                                <span
                                  key={sinal}
                                  className="inline-flex items-center border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#d6d1c7]"
                                >
                                  {sinal}
                                </span>
                              ))}

                              {sinaisEmocionais.length > 3 && (
                                <span className="inline-flex items-center border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#d6d1c7]">
                                  +{sinaisEmocionais.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f877f]">
                            Recebido em {formatarData(item.created_at)}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={() => abrirPaciente(item)}
                            className="inline-flex items-center gap-2 border border-[#c8a96a]/30 bg-[#c8a96a]/12 px-4 py-3 text-sm font-semibold text-[#e6c27a] transition hover:bg-[#c8a96a]/18"
                          >
                            Ver ficha
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </BlocoPainel>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-[#0b100d]">
          <div className="flex h-screen flex-col">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0f1612] px-4 py-4 md:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8a96a]">
                  Ficha do paciente
                </p>
                <h2 className="mt-1 truncate text-lg font-semibold text-[#f6f1e8] md:text-2xl">
                  {selecionado?.nome_completo || "Paciente"}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                className="inline-flex items-center gap-2 border border-white/10 bg-[#16221b] px-4 py-2.5 text-sm font-medium text-[#d6d1c7] transition hover:bg-[#1b2a21]"
              >
                <X className="h-4 w-4" />
                Fechar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#0f1612] p-4 md:p-6">
              <div className="mx-auto max-w-[1200px]">
                <FichaPaciente
                  paciente={selecionado}
                  prioridade={prioridadeSelecionado}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}