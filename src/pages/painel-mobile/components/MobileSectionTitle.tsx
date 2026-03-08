import type { LucideIcon } from "lucide-react";

type Props = {
  titulo: string;
  subtitulo?: string;
  icon?: LucideIcon;
  direita?: React.ReactNode;
};

export default function MobileSectionTitle({
  titulo,
  subtitulo,
  icon: Icon,
  direita,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 bg-[#16221b] text-[#e6c27a]">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-[#f6f1e8]">
            {titulo}
          </h2>

          {subtitulo && (
            <p className="mt-1 text-sm leading-6 text-[#9ea69d]">
              {subtitulo}
            </p>
          )}
        </div>
      </div>

      {direita && (
        <div className="flex items-center gap-2 shrink-0">
          {direita}
        </div>
      )}
    </div>
  );
}