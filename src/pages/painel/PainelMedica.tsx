import { useMemo, useState } from "react";
import Sidebar, { type AbaPainel } from "./components/Sidebar";
import VisaoGeral from "./sections/VisaoGeral";
import Pacientes from "./sections/Pacientes";
import Configuracoes from "./sections/Configuracoes";

function ConteudoPainel({ aba }: { aba: AbaPainel }) {
  switch (aba) {
    case "visao-geral":
      return <VisaoGeral />;

    case "pacientes":
      return <Pacientes />;

    case "configuracoes":
      return <Configuracoes />;

    default:
      return <VisaoGeral />;
  }
}

export default function PainelMedica() {
  const autorizado = useMemo(
    () => sessionStorage.getItem("painel_autorizado"),
    []
  );

  const [abaAtiva, setAbaAtiva] = useState<AbaPainel>("visao-geral");

  if (!autorizado) {
    window.location.href = "/acesso-painel";
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0f1612] text-[#f6f1e8]">
      <div className="flex min-h-screen">

        <Sidebar
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
        />

        <section className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#0f1612,#16221b)]">
          <ConteudoPainel aba={abaAtiva} />
        </section>

      </div>
    </main>
  );
}