import {
  Filter,
  RefreshCw,
  Settings2,
  Sparkles,
  Users,
} from "lucide-react";

export type AbaMobile = "visao-geral" | "pacientes" | "configuracoes";

type Props = {
  abaAtiva: AbaMobile;
  totalPacientes?: number;
  onAbrirFiltros?: () => void;
  onAtualizar?: () => void;
  mostrandoFiltros?: boolean;
};

function HeaderBadge({
  label,
  valor,
}: {
  label: string;
  valor: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7f877f]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#f6f1e8]">{valor}</p>
    </div>
  );
}

export default function MobileHeader({
  abaAtiva,
  totalPacientes = 0,
  onAbrirFiltros,
  onAtualizar,
  mostrandoFiltros = false,
}: Props) {
  const isVisaoGeral = abaAtiva === "visao-geral";
  const isPacientes = abaAtiva === "pacientes";
  const isConfiguracoes = abaAtiva === "configuracoes";

  const titulo = isVisaoGeral
    ? "Visão geral"
    : isPacientes
    ? "Pacientes"
    : "Configurações";

  const subtitulo = isVisaoGeral
    ? "Resumo rápido do painel médico"
    : isPacientes
    ? "Gerencie os registros recebidos"
    : "Ajustes do painel médico";

  const IconeAtual = isVisaoGeral
    ? Sparkles
    : isPacientes
    ? Users
    : Settings2;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f1612]/95 backdrop-blur">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#c8a96a] via-[#d4b26e] to-[#e6c27a]" />

      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#c8a96a]/20 bg-[#16221b] text-[#e6c27a]">
                <IconeAtual className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c8a96a]">
                  Painel médico
                </p>
                <h1 className="truncate text-xl font-semibold tracking-[-0.04em] text-[#f6f1e8]">
                  {titulo}
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm text-[#9ea69d]">{subtitulo}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isPacientes && onAbrirFiltros && (
              <button
                type="button"
                onClick={onAbrirFiltros}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                  mostrandoFiltros
                    ? "border-[#c8a96a]/30 bg-[#c8a96a]/12 text-[#e6c27a]"
                    : "border-white/10 bg-[#16221b] text-[#d6d1c7] hover:bg-[#1b2a21]"
                }`}
                aria-label="Abrir filtros"
              >
                <Filter className="h-4 w-4" />
              </button>
            )}

            {onAtualizar && (
              <button
                type="button"
                onClick={onAtualizar}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#16221b] text-[#d6d1c7] transition hover:bg-[#1b2a21]"
                aria-label="Atualizar dados"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {isVisaoGeral && (
            <>
              <HeaderBadge label="Área" valor="Resumo" />
              <HeaderBadge label="Tela" valor="Mobile" />
            </>
          )}

          {isPacientes && (
            <>
              <HeaderBadge label="Total" valor={totalPacientes} />
              <HeaderBadge label="Tela" valor="Mobile" />
            </>
          )}

          {isConfiguracoes && (
            <>
              <HeaderBadge label="Área" valor="Painel" />
              <HeaderBadge label="Tela" valor="Mobile" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}