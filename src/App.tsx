import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import HomeRouter from "./pages/HomeRouter";
import QuestionarioRouter from "./pages/QuestionarioRouter";
import AcessoPainel from "./pages/AcessoPainel";
import PainelMedicaRouter from "./pages/PainelMedicaRouter";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Página inicial */}
        <Route path="/" element={<HomeRouter />} />

        {/* Questionário do paciente */}
        <Route path="/questionario" element={<QuestionarioRouter />} />

        {/* Tela de login do painel */}
        <Route path="/acesso-painel" element={<AcessoPainel />} />

        {/* Painel da médica */}
        <Route path="/painel-medica" element={<PainelMedicaRouter />} />
      </Routes>
    </>
  );
}