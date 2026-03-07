import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Questionario from "./pages/Questionario"
import PainelMedica from "./pages/PainelMedica"
import AcessoPainel from "./pages/AcessoPainel"

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/questionario" element={<Questionario />} />

      <Route path="/acesso-painel" element={<AcessoPainel />} />

      <Route path="/painel-medica" element={<PainelMedica />} />

    </Routes>
  )
}