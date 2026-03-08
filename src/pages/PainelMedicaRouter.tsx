import { useEffect, useState } from "react";

import PainelMedica from "./painel/PainelMedica";
import PainelMedicaMobile from "./painel-mobile/PainelMedicaMobile";

const MOBILE_BREAKPOINT = 1024;

export default function PainelMedicaRouter() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <PainelMedicaMobile /> : <PainelMedica />;
}