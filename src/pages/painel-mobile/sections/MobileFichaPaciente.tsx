import { useEffect } from "react";
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
  X,
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

type MobileFichaPacienteProps = {
  aberto?: boolean;
  paciente: RespostaPreConsulta | null;
  prioridade?: PrioridadeInfo | null;
  loading?: boolean;
  onFechar: () => void;
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

function obterCorPrioridade(label?: PrioridadeInfo["label"] | null) {
  if (label === "Alta") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (label === "Média") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function ModalShell({
  children,
  onFechar,
}: {
  children: React.ReactNode;
  onFechar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Fechar ficha"
        onClick={onFechar}
        className="absolute inset-0 bg-[#08100c]/65 backdrop-blur-[3px]"
      />

      <div className="relative flex h-[100dvh] items-end justify-center">
        <div className="relative flex h-[100dvh] w-full max-w-[520px] flex-col overflow-hidden bg-[linear-gradient(180deg,#f8f3ea_0%,#f3ece2_100%)] shadow-[0_-20px_60px_rgba(0,0,0,0.28)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function ModalHeader({
  nome,
  data,
  onFechar,
}: {
  nome: string;
  data?: string | null;
  onFechar: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-[#1f2b24] bg-[#0d1511]/96 px-4 pb-4 pt-[max(16px,env(safe-area-inset-top))] text-[#f6f1e8] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[520px] items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c8a96a]">
            Ficha do paciente
          </p>

          <h2 className="mt-1 line-clamp-2 text-[22px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#f6f1e8]">
            {nome}
          </h2>

          <p className="mt-2 text-xs text-[#a8b0a7]">
            Enviado em {formatarData(data)}
          </p>
        </div>

        <button
          type="button"
          onClick={onFechar}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#d6d1c7] transition active:scale-[0.98]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
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
    <section className="overflow-hidden rounded-[24px] border border-[#e7dece] bg-white shadow-[0_12px_32px_rgba(15,22,18,0.08)]">
      <div className="border-b border-[#efe6d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f9f3ea_100%)] px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#eadfca] bg-[#f6efe3] text-[#8a7550]">
            {Icon ? <Icon className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7550]">
              {titulo}
            </p>

            {subtitulo && (
              <p className="mt-1.5 text-[14px] leading-6 text-[#6d695f]">
                {subtitulo}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">{children}</div>
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
    <div className="rounded-[20px] border border-[#eee5d8] bg-[linear-gradient(180deg,#fffdfa_0%,#fbf7f1_100%)] p-4 shadow-[0_6px_18px_rgba(15,22,18,0.03)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a8c72]">
        {label}
      </p>

      <div className="mt-2.5 text-[15px] leading-6 text-[#1d241f]">
        {Icon ? (
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f4ecdf] text-[#8a7550]">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 break-words">{value}</span>
          </div>
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
    default: "border-[#e7dfd1] bg-[#f7f2e9] text-[#5b554c]",
    soft: "border-[#e8e1d5] bg-white text-[#6a6258]",
    accent: "border-[#e0d0af] bg-[#f6ead1] text-[#82673a]",
  };

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${estilos[variant]}`}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}

function EmptyMessage({ texto }: { texto: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#e5dccd] bg-[#fcfaf6] px-4 py-4 text-sm leading-6 text-[#6c6a63]">
      {texto}
    </div>
  );
}

function HeroResumo({
  paciente,
  prioridade,
}: {
  paciente: RespostaPreConsulta;
  prioridade?: PrioridadeInfo | null;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#ddd3c4] bg-[linear-gradient(180deg,#faf7f1_0%,#f3ede3_100%)] shadow-[0_20px_50px_rgba(0,0,0,0.10)]">
      <div className="relative overflow-hidden px-4 py-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,106,0.18),transparent_34%),radial-gradient(circle_at_left,rgba(255,255,255,0.68),transparent_28%)]" />

        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7550]">
            Resumo clínico
          </p>

          <h1 className="mt-2 text-[28px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#18201b]">
            {paciente.nome_completo}
          </h1>

          <div className="mt-4 flex flex-col gap-2 text-sm text-[#6b6a64]">
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

            {paciente.telefone_whatsapp ? (
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#8a7550]" />
                {paciente.telefone_whatsapp}
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="rounded-[20px] border border-[#e5d8c4] bg-white/85 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a8c72]">
                Prioridade
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-2xl font-semibold tracking-[-0.04em] text-[#18201b]">
                  {prioridade?.label ?? "Não definida"}
                </p>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${obterCorPrioridade(
                    prioridade?.label ?? null
                  )}`}
                >
                  Score {prioridade?.score ?? "—"}
                </span>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#e5d8c4] bg-white/85 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a8c72]">
                Origem
              </p>
              <p className="mt-2 text-[15px] font-semibold leading-6 text-[#18201b]">
                {paciente.origem_paciente || "Não informado"}
              </p>
              <p className="mt-1 text-sm text-[#6b6a64]">
                Encaminhamento / entrada
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {prioridade && (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${obterCorPrioridade(
                  prioridade.label
                )}`}
              >
                Prioridade {prioridade.label} · Score {prioridade.score}
              </span>
            )}

            {paciente.origem_paciente && (
              <Tag variant="accent">{paciente.origem_paciente}</Tag>
            )}

            {paciente.diagnostico_medico?.trim() && <Tag>Diagnóstico</Tag>}

            {paciente.medicacao_continua?.trim() && <Tag>Medicação</Tag>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MobileFichaPaciente({
  aberto = true,
  paciente,
  prioridade,
  loading = false,
  onFechar,
}: MobileFichaPacienteProps) {
  useEffect(() => {
    if (!aberto) return;

    const overflowOriginal = document.body.style.overflow;
    const touchActionOriginal = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onFechar();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflowOriginal;
      document.body.style.touchAction = touchActionOriginal;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  if (loading) {
    return (
      <ModalShell onFechar={onFechar}>
        <ModalHeader nome="Carregando ficha" data={undefined} onFechar={onFechar} />

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[max(24px,env(safe-area-inset-bottom))]">
          <div className="mx-auto max-w-[520px]">
            <div className="rounded-[28px] border border-[#dcd4c7] bg-[linear-gradient(180deg,#f9f5ee_0%,#f2ece1_100%)] px-6 py-16 text-center text-[#1b221d] shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-[3px] border-[#c9b28b]/30 border-t-[#8a7550]" />
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[#18201b]">
                Carregando ficha
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#67675f]">
                Preparando os dados do paciente.
              </p>
            </div>
          </div>
        </div>
      </ModalShell>
    );
  }

  if (!paciente) {
    return (
      <ModalShell onFechar={onFechar}>
        <ModalHeader
          nome="Nenhum paciente selecionado"
          data={undefined}
          onFechar={onFechar}
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[max(24px,env(safe-area-inset-bottom))]">
          <div className="mx-auto max-w-[520px]">
            <div className="rounded-[28px] border border-[#dcd4c7] bg-[linear-gradient(180deg,#f9f5ee_0%,#f2ece1_100%)] px-6 py-16 text-center text-[#1b221d] shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#e4dac9] bg-white/70 text-[#8a7550]">
                <UserRound className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#18201b]">
                Nenhum paciente selecionado
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#67675f]">
                Selecione um paciente para visualizar a ficha clínica completa.
              </p>
            </div>
          </div>
        </div>
      </ModalShell>
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
    <ModalShell onFechar={onFechar}>
      <ModalHeader
        nome={paciente.nome_completo}
        data={paciente.created_at}
        onFechar={onFechar}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-[520px] space-y-4">
          <HeroResumo paciente={paciente} prioridade={prioridade} />

          <SectionCard
            titulo="Identificação"
            subtitulo="Dados básicos do paciente para leitura rápida."
            icon={UserRound}
          >
            <div className="grid gap-3">
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
            <div className="grid gap-3">
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
            <div className="grid gap-3">
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
              <div className="flex flex-wrap gap-2">
                {saudeEmocional.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            ) : (
              <EmptyMessage texto="Nenhum sintoma emocional informado." />
            )}
          </SectionCard>

          <SectionCard
            titulo="Estilo de vida"
            subtitulo="Hábitos que ajudam na leitura clínica inicial."
            icon={Activity}
          >
            <div className="grid gap-3">
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
            <div className="space-y-3">
              {historicoFamiliar.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {historicoFamiliar.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </div>
              ) : (
                <EmptyMessage texto="Não informado." />
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
            <div className="grid gap-3">
              <InfoCard
                label="O que mais tem preocupado recentemente"
                value={paciente.preocupacao_recente || "Não informado"}
              />
              <InfoCard
                label="O que ajuda em momentos difíceis"
                value={paciente.ajuda_momento_dificil || "Não informado"}
              />
              <InfoCard label="Origem do paciente" value={origemPaciente} />
            </div>
          </SectionCard>
        </div>
      </div>
    </ModalShell>
  );
}