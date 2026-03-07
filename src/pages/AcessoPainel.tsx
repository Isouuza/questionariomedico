import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AcessoPainel() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const SENHA_CORRETA = "123456";

  function entrar() {
    if (senha === SENHA_CORRETA) {
      sessionStorage.setItem("painel_autorizado", "true");
      navigate("/painel-medica");
    } else {
      setErro("Senha incorreta.");
    }
  }

  return (
    <main className="min-h-screen bg-[#e9edf2] text-slate-800 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-10">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
            Acesso restrito
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Painel da médica
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            Digite a senha para acessar o painel com os questionários enviados.
          </p>
        </div>

        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Senha
          </label>

          <input
            type="password"
            placeholder="Digite a senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") entrar();
            }}
            className="w-full rounded-2xl border border-slate-300 bg-[#f8fafc] px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />

          {erro && (
            <p className="mt-3 text-sm font-medium text-red-600">{erro}</p>
          )}

          <button
            type="button"
            onClick={entrar}
            className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
          >
            Entrar
          </button>
        </div>
      </div>
    </main>
  );
}