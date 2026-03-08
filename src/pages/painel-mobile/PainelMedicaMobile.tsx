import { useMemo, useState } from "react";

import MobileBottomNav from "./components/MobileBottomNav";
import MobileHeader from "./components/MobileHeader";
import MobileConfiguracoes from "./sections/MobileConfiguracoes";
import MobilePacientes from "./sections/MobilePacientes";
import MobileVisaoGeral from "./sections/MobileVisaoGeral";

import type { AbaMobile } from "./types/navigation";

function ConteudoPainelMobile({ aba }: { aba: AbaMobile }) {
  switch (aba) {
    case "visao-geral":
      return <MobileVisaoGeral />;

    case "pacientes":
      return <MobilePacientes />;

    case "configuracoes":
      return <MobileConfiguracoes />;

    default:
      return <MobileVisaoGeral />;
  }
}

export default function PainelMedicaMobile() {
  const autorizado = useMemo(
    () => sessionStorage.getItem("painel_autorizado"),
    []
  );

  const [abaAtiva, setAbaAtiva] = useState<AbaMobile>("visao-geral");

  if (!autorizado) {
    window.location.href = "/acesso-painel";
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0f1612] text-[#f6f1e8]">
      <div className="flex min-h-screen flex-col">
        <MobileHeader abaAtiva={abaAtiva} />

        <section className="flex-1 overflow-y-auto px-4 py-4 pb-28">
          <ConteudoPainelMobile aba={abaAtiva} />
        </section>

        <MobileBottomNav
          abaAtiva={abaAtiva}
          onChange={setAbaAtiva}
        />
      </div>
    </main>
  );
}