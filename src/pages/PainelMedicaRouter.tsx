import { useEffect, useState } from "react";
import PainelMedica from "./painel/PainelMedica";
import PainelMedicaMobile from "./PainelMedicaMobile";

function getIsMobile() {
  return window.innerWidth < 1024;
}

export default function PainelMedicaRouter() {
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    function handleResize() {
      setIsMobile(getIsMobile());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <PainelMedicaMobile /> : <PainelMedica />;
}