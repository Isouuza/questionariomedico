import { Home, Settings2, Users } from "lucide-react";
import type { AbaMobile } from "../types/navigation";

type Props = {
  abaAtiva: AbaMobile;
  onChange: (aba: AbaMobile) => void;
};

function Item({
  ativo,
  label,
  icon: Icon,
  onClick,
}: {
  ativo: boolean;
  label: string;
  icon: typeof Home;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center justify-center gap-1 py-3"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
          ativo
            ? "border-[#c8a96a]/30 bg-[#c8a96a]/12 text-[#e6c27a]"
            : "border-white/10 bg-[#16221b] text-[#8f978f]"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
          ativo ? "text-[#f6f1e8]" : "text-[#8f978f]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export default function MobileBottomNav({ abaAtiva, onChange }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0f1612]/95 px-3 pb-3 pt-2 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center gap-2 rounded-[28px] border border-white/10 bg-[#111915] px-2">
        <Item
          ativo={abaAtiva === "visao-geral"}
          label="Início"
          icon={Home}
          onClick={() => onChange("visao-geral")}
        />

        <Item
          ativo={abaAtiva === "pacientes"}
          label="Pacientes"
          icon={Users}
          onClick={() => onChange("pacientes")}
        />

        <Item
          ativo={abaAtiva === "configuracoes"}
          label="Config"
          icon={Settings2}
          onClick={() => onChange("configuracoes")}
        />
      </div>
    </div>
  );
}