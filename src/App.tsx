import { Routes, Route } from "react-router-dom";

import HomeRouter from "./pages/HomeRouter";
import QuestionarioRouter from "./pages/QuestionarioRouter";
import AcessoPainel from "./pages/AcessoPainel";
import PainelMedicaRouter from "./pages/PainelMedicaRouter";

export default function App() {
  return (
    <Routes>
      {/* Página inicial */}
      <Route path="/" element={<HomeRouter />} />

      {/* Questionário do paciente (auto detecta mobile ou desktop) */}
      <Route path="/questionario" element={<QuestionarioRouter />} />

      {/* Tela de login do painel */}
      <Route path="/acesso-painel" element={<AcessoPainel />} />

      {/* Painel da médica (auto detecta mobile ou desktop) */}
      <Route path="/painel-medica" element={<PainelMedicaRouter />} />
    </Routes>
  );
}