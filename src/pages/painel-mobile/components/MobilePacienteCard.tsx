import {
  Briefcase,
  ChevronRight,
  Clock3,
  MapPin,
  Phone,
} from "lucide-react";
import type {
  PrioridadeInfo,
  RespostaPreConsulta,
} from "../types/paciente";

type Props = {
  paciente: RespostaPreConsulta;
  prioridade: PrioridadeInfo;
  onAbrirFicha: (paciente: RespostaPreConsulta) => void;
};

function formatarData(data?: string | null) {
  if (!data) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
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

export default function MobilePacienteCard({
  paciente,
  prioridade,
  onAbrirFicha,
}: Props) {
  const sinaisEmocionais = transformarListaTexto(
    paciente.saude_emocional
  ).filter((registro) => registro !== "Nenhum desses");

  return (
    <article className="overflow-hidden border border-white/10 bg-white/[0.03]">
      {prioridade.label === "Alta" && (
        <div className="h-[2px] w-full bg-gradient-to-r from-rose-400 via-rose-300 to-orange-300" />
      )}

      {prioridade.label === "Média" && (
        <div className="h-[2px] w-full bg-gradient-to-r from-[#c8a96a] via-[#d4b26e] to-[#e6c27a]" />
      )}

      {prioridade.label === "Baixa" && (
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300" />
      )}

      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[17px] font-semibold tracking-[-0.03em] text-[#f6f1e8]">
                {paciente.nome_completo || "Paciente sem nome"}
              </h3>

              <span
                className={`inline-flex items-center border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${prioridade.badge}`}
              >
                {prioridade.label}
              </span>
            </div>

            {paciente.idade ? (
              <p className="mt-2 text-sm text-[#9ea69d]">
                {paciente.idade} anos
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onAbrirFicha(paciente)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[#c8a96a]/25 bg-[#c8a96a]/10 text-[#e6c27a] transition hover:bg-[#c8a96a]/15"
            aria-label={`Abrir ficha de ${paciente.nome_completo}`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-[#a8b0a7]">
          <div className="inline-flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[#7f877f]" />
            <span className="break-words">
              {paciente.profissao || "Sem profissão"}
            </span>
          </div>

          <div className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4 text-[#7f877f]" />
            <span className="break-words">
              {paciente.telefone_whatsapp || "Sem telefone"}
            </span>
          </div>

          <div className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#7f877f]" />
            <span className="break-words">
              {paciente.cidade_estado || "Sem cidade"}
            </span>
          </div>

          <div className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[#7f877f]" />
            <span className="break-words">
              {paciente.tempo_queixa || "Sem tempo informado"}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-white/8 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f877f]">
            Motivo da consulta
          </p>

          <p className="mt-2 line-clamp-3 text-sm leading-7 text-[#d6d1c7]">
            {paciente.motivo_consulta || "Sem motivo informado"}
          </p>
        </div>

        {(temDiagnostico(paciente) ||
          usaMedicacao(paciente) ||
          sinaisEmocionais.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {temDiagnostico(paciente) && (
              <span className="inline-flex items-center border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d6d1c7]">
                Diagnóstico
              </span>
            )}

            {usaMedicacao(paciente) && (
              <span className="inline-flex items-center border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d6d1c7]">
                Medicação
              </span>
            )}

            {sinaisEmocionais.slice(0, 2).map((sinal) => (
              <span
                key={sinal}
                className="inline-flex items-center border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d6d1c7]"
              >
                {sinal}
              </span>
            ))}

            {sinaisEmocionais.length > 2 && (
              <span className="inline-flex items-center border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d6d1c7]">
                +{sinaisEmocionais.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7f877f]">
            Recebido em {formatarData(paciente.created_at)}
          </p>

          <button
            type="button"
            onClick={() => onAbrirFicha(paciente)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#e6c27a]"
          >
            Ver ficha
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}