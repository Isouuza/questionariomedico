import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Questionario from "./pages/Questionario"
import AcessoPainel from "./pages/AcessoPainel"
import PainelMedicaRouter from "./pages/PainelMedicaRouter"

export default function App() {
  return (
    <Routes>

      {/* Página inicial */}
      <Route path="/" element={<Home />} />

      {/* Questionário do paciente */}
      <Route path="/questionario" element={<Questionario />} />

      {/* Tela de login do painel */}
      <Route path="/acesso-painel" element={<AcessoPainel />} />

      {/* Painel da médica (auto detecta mobile ou desktop) */}
      <Route path="/painel-medica" element={<PainelMedicaRouter />} />

    </Routes>
  )
}