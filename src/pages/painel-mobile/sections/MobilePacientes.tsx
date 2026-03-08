import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Cigarette,
  Filter,
  HeartHandshake,
  HeartPulse,
  Moon,
  Search,
  ShieldCheck,
  Users,
  Wine,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import MobilePacienteCard from "../components/MobilePacienteCard";
import MobileSectionTitle from "../components/MobileSectionTitle";
import MobileFichaPaciente from "./MobileFichaPaciente";

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
      className={`inline-flex min-h-[38px] items-center gap-2 rounded-full border px-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
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

export default function MobilePacientes() {
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

  const totalPacientes = dadosFiltrados.length;
  const totalPrioridadeAlta = dadosFiltrados.filter(
    (item) => calcularPrioridade(item).label === "Alta"
  ).length;
  const totalComDiagnostico = dadosFiltrados.filter(temDiagnostico).length;
  const totalComMedicacao = dadosFiltrados.filter(usaMedicacao).length;
  const totalComSinaisEmocionais =
    dadosFiltrados.filter(possuiSinaisEmocionais).length;

  function abrirPaciente(item: RespostaPreConsulta) {
    setSelecionado(item);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  return (
    <div className="min-h-full bg-[#0f1612] px-4 py-4 pb-24 text-[#f6f1e8]">
      <div className="space-y-5">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <MobileSectionTitle
              titulo="Pacientes"
              subtitulo="Gestão mobile da pré-consulta"
              icon={Users}
            />

            
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f877f]" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, telefone, cidade, profissão..."
              className="w-full rounded-2xl border border-white/10 bg-[#16221b] px-10 py-3.5 text-sm text-[#f6f1e8] outline-none placeholder:text-[#7f877f] focus:border-[#c8a96a]/40"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <select
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#16221b] px-4 py-3.5 text-sm text-[#f6f1e8] outline-none focus:border-[#c8a96a]/40"
            >
              <option value="todos">Todas as prioridades</option>
              <option value="Alta">Prioridade alta</option>
              <option value="Média">Prioridade média</option>
              <option value="Baixa">Prioridade baixa</option>
            </select>

            <select
              value={filtroOrigem}
              onChange={(e) => setFiltroOrigem(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#16221b] px-4 py-3.5 text-sm text-[#f6f1e8] outline-none focus:border-[#c8a96a]/40"
            >
              <option value="todos">Todas as origens</option>
              {origensUnicas.map((origem) => (
                <option key={origem} value={origem}>
                  {origem}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        </section>

    
        <section className="space-y-3">
          <MobileSectionTitle
            titulo="Lista de pacientes"
            subtitulo={`${dadosFiltrados.length} resultado(s) encontrado(s)`}
            icon={Users}
          />

          {erro && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
              {erro}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-56 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]"
                />
              ))}
            </div>
          ) : dadosFiltrados.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#16221b] text-[#c8a96a]">
                <Users className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#f6f1e8]">
                Nenhum paciente encontrado
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#9ea69d]">
                Ajuste a busca ou os filtros para visualizar os registros.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dadosFiltrados.map((item, index) => {
                const prioridade = calcularPrioridade(item);

                return (
                  <MobilePacienteCard
                    key={`${item.id ?? item.nome_completo}-${index}`}
                    paciente={item}
                    prioridade={prioridade}
                    onAbrirFicha={abrirPaciente}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      {modalAberto && (
        <MobileFichaPaciente
          aberto={modalAberto}
          paciente={selecionado}
          prioridade={prioridadeSelecionado}
          loading={loading}
          onFechar={fecharModal}
        />
      )}
    </div>
  );
}