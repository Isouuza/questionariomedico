import {
  Activity,
  AlertCircle,
  Briefcase,
  CalendarDays,
  Cigarette,
  HeartPulse,
  Home,
  Mail,
  MapPin,
  Moon,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wine,
} from "lucide-react";

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

  
};

type PrioridadeInfo = {
  label: "Alta" | "Média" | "Baixa";
  score: number;
  badge: string;
};

type FichaPacienteProps = {
  paciente: RespostaPreConsulta | null;
  prioridade?: PrioridadeInfo | null;
  loading?: boolean;
};

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

function transformarListaTexto(valor?: string | null) {
  if (!valor?.trim()) return [];
  return valor
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function SectionCard({
  titulo,
  subtitulo,
  icon: Icon,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  icon?: typeof Sparkles;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#d9d1c3] bg-white shadow-[0_20px_70px_rgba(15,22,18,0.08)]">
      <div className="border-b border-[#ebe4d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f3ea_100%)] px-5 py-5 md:px-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#e6dccb] bg-[#f6efe3] text-[#8a7550] shadow-[0_8px_24px_rgba(138,117,80,0.12)]">
            {Icon ? <Icon className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a7550]">
              {titulo}
            </p>
            {subtitulo && (
              <p className="mt-2 text-sm leading-7 text-[#6b6a64]">{subtitulo}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-5 md:px-7 md:py-6">{children}</div>
    </section>
  );
}

function InfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Phone;
}) {
  return (
    <div className="rounded-2xl border border-[#ece5d8] bg-[linear-gradient(180deg,#fffdfa_0%,#fbf8f2_100%)] p-4 shadow-[0_10px_30px_rgba(15,22,18,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8c72]">
        {label}
      </p>

      <div className="mt-3 text-[15px] leading-7 text-[#1d241f]">
        {Icon ? (
          <span className="inline-flex items-start gap-2.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#f4ecdf] text-[#8a7550]">
              <Icon className="h-4 w-4" />
            </span>
            <span className="break-words">{value}</span>
          </span>
        ) : (
          <span className="break-words">{value}</span>
        )}
      </div>
    </div>
  );
}

function Tag({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "soft" | "accent";
}) {
  const estilos = {
    default:
      "border-[#e7dfd1] bg-[#f7f2e9] text-[#5b554c]",
    soft:
      "border-[#e8e1d5] bg-white text-[#6a6258]",
    accent:
      "border-[#e0d0af] bg-[#f6ead1] text-[#82673a]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${estilos[variant]}`}
    >
      {children}
    </span>
  );
}

function MensagemVazia({ texto }: { texto: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e5dccd] bg-[#fcfaf6] px-4 py-5 text-sm leading-7 text-[#6c6a63]">
      {texto}
    </div>
  );
}

export default function FichaPaciente({
  paciente,
  prioridade,
  loading = false,
}: FichaPacienteProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-[32px] border border-[#dcd4c7] bg-[linear-gradient(180deg,#f9f5ee_0%,#f2ece1_100%)] text-[#1b221d] shadow-[0_30px_90px_rgba(0,0,0,0.14)]">
        <div className="px-8 py-20 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-[3px] border-[#c9b28b]/30 border-t-[#8a7550]" />
          <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-[#18201b]">
            Carregando ficha
          </h3>
          <p className="mt-2 text-sm leading-7 text-[#67675f]">
            Preparando os dados do paciente.
          </p>
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="overflow-hidden rounded-[32px] border border-[#dcd4c7] bg-[linear-gradient(180deg,#f9f5ee_0%,#f2ece1_100%)] text-[#1b221d] shadow-[0_30px_90px_rgba(0,0,0,0.14)]">
        <div className="px-8 py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#e4dac9] bg-white/70 text-[#8a7550] shadow-[0_16px_40px_rgba(138,117,80,0.12)]">
            <UserRound className="h-8 w-8" />
          </div>

          <h3 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#18201b]">
            Nenhum paciente selecionado
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#67675f]">
            Selecione um paciente na lista para visualizar a ficha clínica completa.
          </p>
        </div>
      </div>
    );
  }

  const saudeEmocional = transformarListaTexto(paciente.saude_emocional).filter(
    (item) => item !== "Nenhum desses"
  );

  const historicoFamiliar = transformarListaTexto(paciente.historico_familiar);

  const origemPaciente =
    paciente.origem_paciente === "Outros" && paciente.origem_paciente_outros
      ? `${paciente.origem_paciente} — ${paciente.origem_paciente_outros}`
      : paciente.origem_paciente || "Não informado";

  return (
    <div className="overflow-hidden rounded-[32px] border border-[#dcd4c7] bg-[linear-gradient(180deg,#faf7f1_0%,#f3ede3_100%)] text-[#1b221d] shadow-[0_30px_90px_rgba(0,0,0,0.14)]">
      <div className="relative overflow-hidden border-b border-[#ddd3c4] px-6 py-7 md:px-8 md:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,106,0.18),transparent_34%),radial-gradient(circle_at_left,rgba(255,255,255,0.6),transparent_28%)]" />

        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a7550]">
                Ficha clínica detalhada
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#18201b] md:text-5xl">
                {paciente.nome_completo}
              </h2>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#6b6a64]">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#8a7550]" />
                  Enviado em {formatarData(paciente.created_at)}
                </span>

                {paciente.idade ? (
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-[#8a7550]" />
                    {paciente.idade} anos
                  </span>
                ) : null}

                {paciente.cidade_estado ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#8a7550]" />
                    {paciente.cidade_estado}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:w-[340px]">
              <div className="rounded-2xl border border-[#e5d8c4] bg-white/80 p-4 shadow-[0_12px_30px_rgba(15,22,18,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8c72]">
                  Prioridade
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#18201b]">
                  {prioridade?.label ?? "Não definida"}
                </p>
                <p className="mt-1 text-sm text-[#6b6a64]">
                  Score {prioridade?.score ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e5d8c4] bg-white/80 p-4 shadow-[0_12px_30px_rgba(15,22,18,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8c72]">
                  Origem
                </p>
                <p className="mt-2 text-base font-semibold text-[#18201b]">
                  {paciente.origem_paciente || "Não informado"}
                </p>
                <p className="mt-1 text-sm text-[#6b6a64]">
                  Encaminhamento / entrada
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {prioridade && (
              <span
                className={`inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${prioridade.badge}`}
              >
                Prioridade {prioridade.label} · Score {prioridade.score}
              </span>
            )}

            {paciente.origem_paciente && <Tag variant="accent">{paciente.origem_paciente}</Tag>}
            {paciente.diagnostico_medico?.trim() && <Tag>Diagnóstico</Tag>}
            {paciente.medicacao_continua?.trim() && <Tag>Medicação</Tag>}
            
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
        <SectionCard
          titulo="Identificação"
          subtitulo="Dados básicos do paciente para leitura rápida."
          icon={UserRound}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              label="Telefone / WhatsApp"
              value={paciente.telefone_whatsapp || "Não informado"}
              icon={Phone}
            />
            <InfoCard
              label="E-mail"
              value={paciente.email || "Não informado"}
              icon={Mail}
            />
            <InfoCard
              label="Cidade / Estado"
              value={paciente.cidade_estado || "Não informado"}
              icon={MapPin}
            />
            <InfoCard
              label="Profissão"
              value={paciente.profissao || "Não informada"}
              icon={Briefcase}
            />
            <InfoCard
              label="Data de nascimento"
              value={formatarDataNascimento(paciente.data_nascimento)}
              icon={CalendarDays}
            />
            <InfoCard
              label="Idade"
              value={paciente.idade ? `${paciente.idade} anos` : "Não informada"}
              icon={UserRound}
            />
            <InfoCard
              label="Estado civil"
              value={paciente.estado_civil || "Não informado"}
            />
            <InfoCard
              label="Com quem mora"
              value={paciente.com_quem_mora || "Não informado"}
              icon={Home}
            />
          </div>
        </SectionCard>

        <SectionCard
          titulo="Queixa principal"
          subtitulo="Motivo do atendimento e duração da queixa."
          icon={AlertCircle}
        >
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <InfoCard
              label="Motivo da consulta"
              value={paciente.motivo_consulta || "Não informado"}
            />
            <InfoCard
              label="Tempo da queixa"
              value={paciente.tempo_queixa || "Não informado"}
              icon={AlertCircle}
            />
          </div>
        </SectionCard>

        <SectionCard
          titulo="Histórico de saúde"
          subtitulo="Condições médicas e medicações relatadas."
          icon={ShieldCheck}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              label="Diagnóstico médico"
              value={paciente.diagnostico_medico || "Nenhum informado"}
              icon={ShieldCheck}
            />
            <InfoCard
              label="Medicação contínua"
              value={paciente.medicacao_continua || "Nenhuma informada"}
              icon={HeartPulse}
            />
          </div>
        </SectionCard>

        <SectionCard
          titulo="Saúde emocional"
          subtitulo="Sinais emocionais percebidos no pré-atendimento."
          icon={Sparkles}
        >
          {saudeEmocional.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {saudeEmocional.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
          ) : (
            <MensagemVazia texto="Nenhum sintoma emocional informado." />
          )}
        </SectionCard>

        <SectionCard
          titulo="Estilo de vida"
          subtitulo="Hábitos que ajudam na leitura clínica inicial."
          icon={Activity}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              label="Sono"
              value={paciente.sono || "Não informado"}
              icon={Moon}
            />
            <InfoCard
              label="Atividade física"
              value={paciente.atividade_fisica || "Não informada"}
              icon={Activity}
            />
            <InfoCard
              label="Consumo de álcool"
              value={paciente.consumo_alcool || "Não informado"}
              icon={Wine}
            />
            <InfoCard
              label="Tabagismo"
              value={paciente.tabagismo || "Não informado"}
              icon={Cigarette}
            />
          </div>
        </SectionCard>

        <SectionCard
          titulo="Histórico familiar"
          subtitulo="Contexto familiar relevante para o atendimento."
          icon={Home}
        >
          <div className="space-y-4">
            {historicoFamiliar.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {historicoFamiliar.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            ) : (
              <MensagemVazia texto="Não informado." />
            )}

            {paciente.historico_familiar_outros && (
              <InfoCard
                label="Outros"
                value={paciente.historico_familiar_outros}
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          titulo="Contexto ampliado"
          subtitulo="Informações subjetivas que enriquecem a consulta."
          icon={Sparkles}
        >
          <div className="grid gap-4">
            <InfoCard
              label="O que mais tem preocupado recentemente"
              value={paciente.preocupacao_recente || "Não informado"}
            />
            <InfoCard
              label="O que ajuda em momentos difíceis"
              value={paciente.ajuda_momento_dificil || "Não informado"}
            />
            <InfoCard
              label="Origem do paciente"
              value={origemPaciente}
            />
          </div>
        </SectionCard>

      </div>
    </div>
  );
}