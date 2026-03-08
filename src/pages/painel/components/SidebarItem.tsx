import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  ativo?: boolean;
  titulo: string;
  subtitulo?: string;
  icon: LucideIcon;
  onClick?: () => void;
};

export default function SidebarItem({
  ativo = false,
  titulo,
  subtitulo,
  icon: Icon,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-4 border px-4 py-4 text-left transition-all duration-200
      ${
        ativo
          ? "border-cyan-400/20 bg-white/10"
          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
      }`}
    >
      {/* linha superior destaque */}
      {ativo && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500" />
      )}

      {/* ícone */}
      <div
        className={`flex h-11 w-11 items-center justify-center border transition
        ${
          ativo
            ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
            : "border-white/10 bg-[#07111f] text-slate-300"
        }`}
      >
        <Icon size={18} />
      </div>

      {/* texto */}
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-semibold tracking-[-0.02em] text-white">
          {titulo}
        </p>

        {subtitulo && (
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            {subtitulo}
          </p>
        )}
      </div>

      {/* seta */}
      <ChevronRight
        className={`h-4 w-4 shrink-0 transition
        ${
          ativo
            ? "text-cyan-300"
            : "text-slate-500 group-hover:translate-x-0.5 group-hover:text-slate-300"
        }`}
      />
    </button>
  );
}