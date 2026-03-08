import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Clock3,
  HeartHandshake,
  HeartPulse,
  MapPin,
  Moon,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import MobileResumoCard from "../components/MobileResumoCard";
import MobileSectionTitle from "../components/MobileSectionTitle";

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
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8f978f]">
            {titulo}
          </p>
          {subtitulo && (
            <p className="mt-2 text-sm leading-6 text-[#f6f1e8]">{subtitulo}</p>
          )}
        </div>

        {direita}
      </div>

      <div>{children}</div>
    </section>
  );
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8f978f]">
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
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#16221b] px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0f1612] text-[#e6c27a]">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8f978f]">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-[#f6f1e8]">{valor}</p>
      </div>
    </div>
  );
}

function CardPacienteRecente({ item }: { item: RespostaPreConsulta }) {
  const prioridade = calcularPrioridade(item);

  return (
    <article className="border-t border-white/8 px-4 py-4 first:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-[-0.03em] text-[#f6f1e8]">
              {item.nome_completo}
            </h3>

            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${prioridade.badge}`}
            >
              {prioridade.label}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#d6d1c7]">
            {item.motivo_consulta || "Sem motivo informado"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-[#a8b0a7]">
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

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7f877f]">
        {formatarData(item.created_at)}
      </p>
    </article>
  );
}

export default function MobileVisaoGeral() {
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
    <div className="min-h-full bg-[#0f1612] px-4 py-4 pb-24 text-[#f6f1e8]">
      <div className="space-y-5">
        {erro && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-300">
            {erro}
          </div>
        )}

        <section className="space-y-3">
          <MobileSectionTitle
            titulo="Panorama do painel"
            subtitulo="Resumo principal para leitura rápida"
            icon={Sparkles}
          />

          <div className="grid grid-cols-2 gap-3">
            <MobileResumoCard
              titulo="Pacientes"
              valor={loading ? "..." : metricas.total}
              detalhe="Pré-consultas registradas"
              icon={Users}
              destaque
            />

            <MobileResumoCard
              titulo="Prioridade alta"
              valor={loading ? "..." : metricas.prioridadeAlta}
              detalhe="Maior atenção clínica"
              icon={AlertCircle}
            />

            <MobileResumoCard
              titulo="Sinais emocionais"
              valor={loading ? "..." : metricas.comSinaisEmocionais}
              detalhe="Relatos identificados"
              icon={HeartHandshake}
            />

            <MobileResumoCard
              titulo="Com medicação"
              valor={loading ? "..." : metricas.comMedicacao}
              detalhe="Uso contínuo"
              icon={HeartPulse}
            />
          </div>
        </section>

        <section className="space-y-3">
          <MobileSectionTitle
            titulo="Indicadores rápidos"
            subtitulo="Leitura curta sem poluir a tela"
            icon={ShieldCheck}
          />

          <div className="grid gap-3">
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
        </section>

        <BlocoPainel
          titulo="Entradas mais recentes"
          subtitulo="Últimos pacientes enviados ao sistema"
        >
          {loading ? (
            <div className="space-y-3 px-4 py-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-3xl border border-white/8 bg-white/[0.03]"
                />
              ))}
            </div>
          ) : pacientesRecentes.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-[#c8a96a]">
                <Stethoscope className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[#f6f1e8]">
                Nenhum registro encontrado
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#a8b0a7]">
                Quando os pacientes enviarem respostas, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <div>
              {pacientesRecentes.map((item, index) => (
                <CardPacienteRecente
                  key={`${item.id ?? item.nome_completo}-${index}`}
                  item={item}
                />
              ))}
            </div>
          )}
        </BlocoPainel>

        <BlocoPainel
          titulo="Distribuição atual"
          subtitulo="Como os casos estão classificados hoje"
        >
          <div className="px-4 py-4">
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
          <div className="px-4 py-4">
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

      </div>
    </div>
  );
}