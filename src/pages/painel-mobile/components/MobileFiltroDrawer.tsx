import { Search, SlidersHorizontal, X } from "lucide-react";

type Props = {
  aberto: boolean;
  busca: string;
  filtroPrioridade: string;
  filtroOrigem: string;
  origens: string[];
  onChangeBusca: (valor: string) => void;
  onChangePrioridade: (valor: string) => void;
  onChangeOrigem: (valor: string) => void;
  onClose: () => void;
  onLimpar: () => void;
  onAplicar?: () => void;
};

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f978f]">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full border border-white/10 bg-[#16221b] px-4 text-sm text-[#f6f1e8] outline-none transition focus:border-[#c8a96a]/40"
      >
        {children}
      </select>
    </div>
  );
}

export default function MobileFiltroDrawer({
  aberto,
  busca,
  filtroPrioridade,
  filtroOrigem,
  origens,
  onChangeBusca,
  onChangePrioridade,
  onChangeOrigem,
  onClose,
  onLimpar,
  onAplicar,
}: Props) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          aberto
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed bottom-0 left-0 right-0 z-50 max-h-[88vh] overflow-hidden border-t border-white/10 bg-[#0f1612] shadow-[0_-20px_60px_rgba(0,0,0,0.45)] transition-transform duration-300 ${
          aberto ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-[#c8a96a] via-[#d4b26e] to-[#e6c27a]" />

        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[#c8a96a]/20 bg-[#16221b] text-[#e6c27a]">
              <SlidersHorizontal className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f978f]">
                Filtros
              </p>
              <h2 className="text-base font-semibold tracking-[-0.03em] text-[#f6f1e8]">
                Refinar pacientes
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center border border-white/10 bg-[#16221b] text-[#d6d1c7] transition hover:bg-[#1b2a21]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-4 py-5 pb-28">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f978f]">
              Busca
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f877f]" />
              <input
                value={busca}
                onChange={(e) => onChangeBusca(e.target.value)}
                placeholder="Nome, telefone, cidade, motivo..."
                className="h-12 w-full border border-white/10 bg-[#16221b] px-10 pr-4 text-sm text-[#f6f1e8] outline-none placeholder:text-[#7f877f] transition focus:border-[#c8a96a]/40"
              />
            </div>
          </div>

          <SelectField
            label="Prioridade"
            value={filtroPrioridade}
            onChange={onChangePrioridade}
          >
            <option value="todos">Todas as prioridades</option>
            <option value="Alta">Prioridade alta</option>
            <option value="Média">Prioridade média</option>
            <option value="Baixa">Prioridade baixa</option>
          </SelectField>

          <SelectField
            label="Origem"
            value={filtroOrigem}
            onChange={onChangeOrigem}
          >
            <option value="todos">Todas as origens</option>
            {origens.map((origem) => (
              <option key={origem} value={origem}>
                {origem}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#0f1612]/95 px-4 py-4 backdrop-blur">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onLimpar}
              className="inline-flex h-12 items-center justify-center border border-white/10 bg-[#16221b] px-4 text-sm font-medium text-[#d6d1c7] transition hover:bg-[#1b2a21]"
            >
              Limpar
            </button>

            <button
              type="button"
              onClick={() => {
                onAplicar?.();
                onClose();
              }}
              className="inline-flex h-12 items-center justify-center bg-gradient-to-r from-[#c8a96a] via-[#d4b26e] to-[#e6c27a] px-4 text-sm font-semibold text-[#16221b] transition hover:opacity-90"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}