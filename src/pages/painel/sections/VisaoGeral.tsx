import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Cigarette,
  Clock3,
  HeartHandshake,
  HeartPulse,
  MapPin,
  Moon,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Wine,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import CardResumo from "../components/CardResumo";

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

type PrioridadeInfo = {
  label: "Alta" | "Média" | "Baixa";
  score: number;
  badge: string;
};

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

function LinhaResumo({
  label,
  valor,
  destaque = false,
}: {
  label: string;
  valor: string | number;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/8 py-4 first:border-t-0 first:pt-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f978f]">
        {label}
      </p>
      <p
        className={`text-sm font-medium ${
          destaque ? "text-[#e6c27a]" : "text-[#f6f1e8]"
        }`}
      >
        {valor}
      </p>
    </div>
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
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8f978f]">
            {titulo}
          </p>
          {subtitulo && (
            <p className="mt-2 text-base leading-7 text-[#f6f1e8]">
              {subtitulo}
            </p>
          )}
        </div>

        {direita}
      </div>

      <div>{children}</div>
    </section>
  );
}

function ChipIndicador({
  icon: Icon,
  label,
  valor,
}: {
  icon: typeof Sparkles;
  label: string;
  valor: string | number;
}) {
  return (
    <div className="flex items-center gap-3 border border-white/10 bg-[#16221b] px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-[#0f1612] text-[#e6c27a]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8f978f]">
          {label}
        </p>
        <p className="mt-1 text-base font-semibold text-[#f6f1e8]">{valor}</p>
      </div>
    </div>
  );
}

export default function VisaoGeral() {
  const [dados, setDados] = useState<RespostaPreConsulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

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
    } catch (err) {
      console.error(err);
      setErro("Não foi possível carregar os dados da visão geral.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarRespostas();
  }, []);

  const metricas = useMemo(() => {
    const total = dados.length;

    const prioridadeAlta = dados.filter(
      (item) => calcularPrioridade(item).label === "Alta"
    ).length;

    const prioridadeMedia = dados.filter(
      (item) => calcularPrioridade(item).label === "Média"
    ).length;

    const prioridadeBaixa = dados.filter(
      (item) => calcularPrioridade(item).label === "Baixa"
    ).length;

    const comSinaisEmocionais = dados.filter((item) =>
      possuiSinaisEmocionais(item)
    ).length;

    const sonoRuim = dados.filter((item) => sonoAlterado(item)).length;

    const fumantes = dados.filter((item) => item.tabagismo === "Sim").length;

    const alcoolFrequente = dados.filter(
      (item) => item.consumo_alcool === "Frequente"
    ).length;

    const comMedicacao = dados.filter((item) => usaMedicacao(item)).length;

    const comDiagnostico = dados.filter((item) => temDiagnostico(item)).length;

    const consentimentoOk = dados.filter((item) => item.consentimento).length;

    return {
      total,
      prioridadeAlta,
      prioridadeMedia,
      prioridadeBaixa,
      comSinaisEmocionais,
      sonoRuim,
      fumantes,
      alcoolFrequente,
      comMedicacao,
      comDiagnostico,
      consentimentoOk,
    };
  }, [dados]);

  const pacientesRecentes = useMemo(() => dados.slice(0, 4), [dados]);

  return (
    <div className="min-h-full bg-[#0f1612] text-[#f6f1e8]">
      <div className="space-y-6 p-6 md:p-8">
        {erro && (
          <div className="border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
            {erro}
          </div>
        )}

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <BlocoPainel
            titulo="Panorama do painel"
            subtitulo="Resumo principal para leitura rápida"
            direita={
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9ea69d]">
                <Sparkles className="h-3.5 w-3.5 text-[#e6c27a]" />
                Atualização dinâmica
              </div>
            }
          >
            <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
              <CardResumo
                titulo="Pacientes"
                valor={loading ? "..." : metricas.total}
                detalhe="Total de pré-consultas registradas"
                icon={Users}
                destaque
              />

              <CardResumo
                titulo="Prioridade alta"
                valor={loading ? "..." : metricas.prioridadeAlta}
                detalhe="Casos com maior atenção clínica"
                icon={AlertCircle}
              />

              <CardResumo
                titulo="Sinais emocionais"
                valor={loading ? "..." : metricas.comSinaisEmocionais}
                detalhe="Relatos emocionais identificados"
                icon={HeartHandshake}
              />
            </div>
          </BlocoPainel>

          <BlocoPainel
            titulo="Indicadores rápidos"
            subtitulo="Leitura curta sem poluir a tela"
          >
            <div className="grid gap-3 px-5 py-5">
              <ChipIndicador
                icon={Moon}
                label="Sono alterado"
                valor={loading ? "..." : metricas.sonoRuim}
              />
              <ChipIndicador
                icon={HeartPulse}
                label="Com medicação"
                valor={loading ? "..." : metricas.comMedicacao}
              />
              <ChipIndicador
                icon={ShieldCheck}
                label="Com diagnóstico"
                valor={loading ? "..." : metricas.comDiagnostico}
              />
            </div>
          </BlocoPainel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <BlocoPainel
            titulo="Entradas mais recentes"
            subtitulo="Últimos pacientes enviados ao sistema"
          >
            {loading ? (
              <div className="space-y-4 px-5 py-5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse border border-white/8 bg-white/[0.03]"
                  />
                ))}
              </div>
            ) : pacientesRecentes.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center border border-white/10 bg-white/[0.03] text-[#c8a96a]">
                  <Stethoscope className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#f6f1e8]">
                  Nenhum registro encontrado
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#a8b0a7]">
                  Quando os pacientes enviarem respostas, eles aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/8">
                {pacientesRecentes.map((item, index) => {
                  const prioridade = calcularPrioridade(item);

                  return (
                    <div
                      key={`${item.id ?? item.nome_completo}-${index}`}
                      className="px-5 py-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#f6f1e8]">
                              {item.nome_completo}
                            </h3>

                            <span
                              className={`inline-flex items-center border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${prioridade.badge}`}
                            >
                              Prioridade {prioridade.label}
                            </span>
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#d6d1c7]">
                            {item.motivo_consulta || "Sem motivo informado"}
                          </p>
                        </div>

                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f877f]">
                          {formatarData(item.created_at)}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-[#a8b0a7] md:grid-cols-3">
                        <div className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#7f877f]" />
                          {item.cidade_estado || "Sem localidade"}
                        </div>

                        <div className="inline-flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-[#7f877f]" />
                          {item.tempo_queixa || "Sem tempo informado"}
                        </div>

                        <div className="inline-flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-[#7f877f]" />
                          {item.profissao || "Sem profissão"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </BlocoPainel>

          <div className="space-y-6">
            <BlocoPainel
              titulo="Distribuição atual"
              subtitulo="Como os casos estão classificados hoje"
            >
              <div className="px-5 py-5">
                <LinhaResumo
                  label="Prioridade alta"
                  valor={loading ? "..." : metricas.prioridadeAlta}
                  destaque
                />
                <LinhaResumo
                  label="Prioridade média"
                  valor={loading ? "..." : metricas.prioridadeMedia}
                />
                <LinhaResumo
                  label="Prioridade baixa"
                  valor={loading ? "..." : metricas.prioridadeBaixa}
                />
              </div>
            </BlocoPainel>

            <BlocoPainel
              titulo="Perfil clínico resumido"
              subtitulo="Alguns sinais úteis para leitura inicial"
            >
              <div className="px-5 py-5">
                <LinhaResumo
                  label="Fumantes"
                  valor={loading ? "..." : metricas.fumantes}
                />
                <LinhaResumo
                  label="Álcool frequente"
                  valor={loading ? "..." : metricas.alcoolFrequente}
                />
                <LinhaResumo
                  label="Consentimento válido"
                  valor={loading ? "..." : metricas.consentimentoOk}
                />
              </div>
            </BlocoPainel>

            <BlocoPainel
              titulo="Leitura da aba"
              subtitulo="Como usar esta visão sem sobrecarga"
            >
              <div className="space-y-4 px-5 py-5 text-sm leading-7 text-[#d6d1c7]">
                <div className="flex items-start gap-3">
                  <HeartPulse className="mt-1 h-4 w-4 shrink-0 text-[#e6c27a]" />
                  <p>
                    Esta tela serve como ponto de partida, não como análise
                    completa.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Wine className="mt-1 h-4 w-4 shrink-0 text-[#e6c27a]" />
                  <p>
                    O objetivo aqui é enxergar padrões e novos envios com mais
                    rapidez.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Cigarette className="mt-1 h-4 w-4 shrink-0 text-[#e6c27a]" />
                  <p>
                    Para leitura detalhada e decisão clínica individual, use a
                    aba de pacientes.
                  </p>
                </div>
              </div>
            </BlocoPainel>
          </div>
        </section>
      </div>
    </div>
  );
}