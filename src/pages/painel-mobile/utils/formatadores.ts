import type { RespostaPreConsulta } from "../types/paciente";

/* --------------------------------------------------
   Datas
-------------------------------------------------- */

export function formatarData(data?: string | null) {
  if (!data) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

export function formatarDataNascimento(data?: string | null) {
  if (!data) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(new Date(`${data}T00:00:00`));
}

/* --------------------------------------------------
   Texto
-------------------------------------------------- */

export function normalizarTexto(valor?: string | null) {
  return (valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function transformarListaTexto(valor?: string | null) {
  if (!valor?.trim()) return [];

  return valor
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/* --------------------------------------------------
   Origem do paciente
-------------------------------------------------- */

export function formatarOrigemPaciente(item: RespostaPreConsulta) {
  if (
    item.origem_paciente === "Outros" &&
    item.origem_paciente_outros
  ) {
    return `${item.origem_paciente} — ${item.origem_paciente_outros}`;
  }

  return item.origem_paciente || "Não informado";
}

/* --------------------------------------------------
   Utilidades clínicas
-------------------------------------------------- */

export function temDiagnostico(item: RespostaPreConsulta) {
  return Boolean(item.diagnostico_medico?.trim());
}

export function usaMedicacao(item: RespostaPreConsulta) {
  return Boolean(item.medicacao_continua?.trim());
}

export function possuiSinaisEmocionais(item: RespostaPreConsulta) {
  const lista = transformarListaTexto(item.saude_emocional);

  return lista.some((registro) => registro !== "Nenhum desses");
}

export function sonoAlterado(item: RespostaPreConsulta) {
  return item.sono === "Ruim" || item.sono === "Regular";
}