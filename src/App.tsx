import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Questionario from "./pages/Questionario"

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/questionario" element={<Questionario />} />

    </Routes>
  )
}