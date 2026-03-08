import type { PrioridadeInfo, RespostaPreConsulta } from "../types/paciente";
import {
  normalizarTexto,
  possuiSinaisEmocionais,
  temDiagnostico,
  transformarListaTexto,
  usaMedicacao,
} from "./filtros";

export function calcularPrioridade(item: RespostaPreConsulta): PrioridadeInfo {
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