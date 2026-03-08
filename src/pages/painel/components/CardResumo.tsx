import type { LucideIcon } from "lucide-react";

type Props = {
  titulo: string;
  valor: string | number;
  detalhe?: string;
  icon?: LucideIcon;
  destaque?: boolean;
};

export default function CardResumo({
  titulo,
  valor,
  detalhe,
  icon: Icon,
  destaque = false,
}: Props) {
  return (
    <div
      className={`relative overflow-hidden border transition-all duration-300
      ${
        destaque
          ? "border-[#c8a96a]/30 bg-[#1b2a21]"
          : "border-white/10 bg-[#16221b]"
      }
      hover:bg-[#1f2f25]
      `}
    >
      {/* linha topo destaque */}
      {destaque && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#c8a96a] via-[#d4b26e] to-[#e6c27a]" />
      )}

      <div className="flex items-start justify-between gap-4 p-6">
        {/* texto */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ea69d]">
            {titulo}
          </p>

          <h3 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#f6f1e8]">
            {valor}
          </h3>

          {detalhe && (
            <p className="mt-2 text-sm leading-6 text-[#aab2aa]">
              {detalhe}
            </p>
          )}
        </div>

        {/* ícone */}
        {Icon && (
          <div
            className={`flex h-12 w-12 items-center justify-center border transition
            ${
              destaque
                ? "border-[#c8a96a]/30 bg-[#c8a96a]/15 text-[#e6c27a]"
                : "border-white/10 bg-[#0f1612] text-[#d6d1c7]"
            }`}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}