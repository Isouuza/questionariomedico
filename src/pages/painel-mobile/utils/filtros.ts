import type { RespostaPreConsulta, PrioridadeInfo } from "../types/paciente";

export type FiltroRapido =
  | "todos"
  | "prioridade_alta"
  | "emocional"
  | "sono_ruim"
  | "fumantes"
  | "alcool_frequente"
  | "com_diagnostico"
  | "com_medicacao";

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

type FiltroParams = {
  dados: RespostaPreConsulta[];
  busca: string;
  filtroPrioridade: string;
  filtroOrigem: string;
  filtroRapido: FiltroRapido;
  calcularPrioridade: (item: RespostaPreConsulta) => PrioridadeInfo;
};

export function aplicarFiltros({
  dados,
  busca,
  filtroPrioridade,
  filtroOrigem,
  filtroRapido,
  calcularPrioridade,
}: FiltroParams) {
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
}