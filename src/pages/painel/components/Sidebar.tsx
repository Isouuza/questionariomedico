import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings2,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

export type AbaPainel = "visao-geral" | "pacientes" | "configuracoes";

type SidebarProps = {
  abaAtiva: AbaPainel;
  setAbaAtiva: (aba: AbaPainel) => void;
};

type SidebarItemProps = {
  ativo?: boolean;
  titulo: string;
  subtitulo: string;
  icon: typeof LayoutDashboard;
  onClick: () => void;
  variante?: "normal" | "danger";
};

function SidebarItem({
  ativo = false,
  titulo,
  subtitulo,
  icon: Icon,
  onClick,
  variante = "normal",
}: SidebarItemProps) {
  const danger = variante === "danger";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-4 overflow-hidden border px-4 py-4 text-left transition-all duration-200 ${
        danger
          ? "border-rose-500/15 bg-rose-500/[0.04] hover:bg-rose-500/[0.08]"
          : ativo
          ? "border-[#c8a96a]/30 bg-[#c8a96a]/10 shadow-[0_0_0_1px_rgba(200,169,106,0.06)]"
          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
      }`}
    >
      {ativo && !danger && (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#c8a96a] via-[#d4b26e] to-[#e6c27a]" />
      )}

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center border transition ${
          danger
            ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
            : ativo
            ? "border-[#c8a96a]/30 bg-[#c8a96a]/15 text-[#e6c27a]"
            : "border-white/10 bg-[#1a241e] text-[#d6d1c7]"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-lg font-semibold leading-none tracking-[-0.03em] ${
            danger ? "text-rose-200" : "text-[#f6f1e8]"
          }`}
        >
          {titulo}
        </p>
        <p
          className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            danger ? "text-rose-300/80" : "text-[#9ea69d]"
          }`}
        >
          {subtitulo}
        </p>
      </div>

      <ChevronRight
        className={`h-5 w-5 shrink-0 transition ${
          danger
            ? "text-rose-300 group-hover:translate-x-0.5"
            : ativo
            ? "text-[#e6c27a]"
            : "text-[#6f786f] group-hover:translate-x-0.5 group-hover:text-[#d6d1c7]"
        }`}
      />
    </button>
  );
}

export default function Sidebar({ abaAtiva, setAbaAtiva }: SidebarProps) {
  function sairPainel() {
    sessionStorage.removeItem("painel_autorizado");
    window.location.href = "/acesso-painel";
  }

  return (
    <aside className="flex min-h-screen w-[290px] shrink-0 flex-col border-r border-white/10 bg-[linear-gradient(180deg,#0f1612_0%,#16221b_50%,#0f1612_100%)]">
      <div className="h-[3px] w-full bg-gradient-to-r from-[#c8a96a] via-[#d4b26e] to-[#e6c27a]" />

      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center border border-[#c8a96a]/20 bg-white/[0.05] text-[#e6c27a] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <Stethoscope className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-2xl font-semibold tracking-[-0.05em] text-[#f6f1e8]">
              Painel Médico
            </h2>

            <div className="mt-2 inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d4cec2]">
              <span className="h-2 w-2 rounded-full bg-[#c8a96a]" />
              Clínica / Gestão
            </div>
          </div>
        </div>

        <div className="mt-6 border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center border border-white/10 bg-[#1a241e] text-[#e6c27a]">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ea69d]">
                Logado como
              </p>
              <p className="mt-1 text-base font-semibold tracking-[-0.03em] text-[#e6c27a]">
                Dra. Brenda
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7f877f]">
          Navegação
        </p>

        <nav className="mt-4 space-y-3">
          <SidebarItem
            ativo={abaAtiva === "visao-geral"}
            titulo="Visão Geral"
            subtitulo={abaAtiva === "visao-geral" ? "Você está aqui" : "Abrir"}
            icon={LayoutDashboard}
            onClick={() => setAbaAtiva("visao-geral")}
          />

          <SidebarItem
            ativo={abaAtiva === "pacientes"}
            titulo="Pacientes"
            subtitulo={abaAtiva === "pacientes" ? "Você está aqui" : "Abrir"}
            icon={Users}
            onClick={() => setAbaAtiva("pacientes")}
          />

          <SidebarItem
            ativo={abaAtiva === "configuracoes"}
            titulo="Configurações"
            subtitulo={abaAtiva === "configuracoes" ? "Você está aqui" : "Abrir"}
            icon={Settings2}
            onClick={() => setAbaAtiva("configuracoes")}
          />

          <SidebarItem
            titulo="Sair"
            subtitulo="Encerrar sessão"
            icon={LogOut}
            onClick={sairPainel}
            variante="danger"
          />
        </nav>
      </div>
    </aside>
  );
}