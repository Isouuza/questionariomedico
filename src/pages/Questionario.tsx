import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Questionario() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);

  const totalEtapas = 5;
  const progresso = (etapa / totalEtapas) * 100;

  const avancar = () => {
    if (etapa < totalEtapas) setEtapa(etapa + 1);
  };

  const voltar = () => {
    if (etapa > 1) setEtapa(etapa - 1);
  };

  return (
    <main className="min-h-screen bg-[#e9eaec] text-slate-800">
      <section className="mx-auto max-w-4xl px-6 py-10 md:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-2xl border border-slate-300 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
          >
            Voltar ao início
          </button>

          <span className="rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-sm text-slate-600">
            Etapa {etapa} de {totalEtapas}
          </span>
        </div>

        <div className="mb-5 overflow-hidden rounded-full bg-white/70">
          <div
            className="h-3 rounded-full bg-slate-800 transition-all duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>

        <div className="rounded-[32px] border border-white/60 bg-white/55 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
              Questionário pré-consulta
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {etapa === 1 && "Identificação"}
              {etapa === 2 && "Motivo da consulta"}
              {etapa === 3 && "Saúde geral"}
              {etapa === 4 && "Estilo de vida"}
              {etapa === 5 && "Consentimento"}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Responda com calma. O formulário foi pensado para ser simples,
              claro e confortável.
            </p>
          </div>

          <form className="space-y-8">
            {etapa === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                    placeholder="Digite seu nome"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Idade
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                    placeholder="Ex: 32"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Cidade / Estado
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                    placeholder="Ex: Vitória / ES"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Profissão
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                    placeholder="Ex: Professora"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            )}

            {etapa === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Qual o principal motivo da consulta?
                  </label>
                  <select className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400">
                    <option value="">Selecione</option>
                    <option>Ansiedade</option>
                    <option>Tristeza ou desânimo</option>
                    <option>Estresse ou sobrecarga</option>
                    <option>Problemas de sono</option>
                    <option>Dificuldade de concentração</option>
                    <option>Avaliação geral de saúde</option>
                    <option>Outro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Há quanto tempo isso acontece?
                  </label>
                  <select className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400">
                    <option value="">Selecione</option>
                    <option>Menos de 1 mês</option>
                    <option>1 a 3 meses</option>
                    <option>3 a 6 meses</option>
                    <option>Mais de 6 meses</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    De 0 a 10, quanto isso incomoda atualmente?
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                    placeholder="Digite um número de 0 a 10"
                  />
                </div>
              </div>
            )}

            {etapa === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Você possui algum diagnóstico médico?
                  </label>
                  <select className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400">
                    <option value="">Selecione</option>
                    <option>Não</option>
                    <option>Sim</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Se sim, qual?
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                    placeholder="Ex: hipertensão, diabetes, asma..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Faz uso de medicação contínua?
                  </label>
                  <select className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400">
                    <option value="">Selecione</option>
                    <option>Não</option>
                    <option>Sim</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Se sim, qual medicação?
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                    placeholder="Ex: nome e dose"
                  />
                </div>
              </div>
            )}

            {etapa === 4 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Como está seu sono atualmente?
                  </label>
                  <select className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400">
                    <option value="">Selecione</option>
                    <option>Bom</option>
                    <option>Regular</option>
                    <option>Ruim</option>
                    <option>Insônia frequente</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Você pratica atividade física?
                  </label>
                  <select className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400">
                    <option value="">Selecione</option>
                    <option>Não</option>
                    <option>1–2 vezes por semana</option>
                    <option>3–4 vezes por semana</option>
                    <option>5 ou mais vezes por semana</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Consumo de álcool
                  </label>
                  <select className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400">
                    <option value="">Selecione</option>
                    <option>Não</option>
                    <option>Ocasionalmente</option>
                    <option>Frequentemente</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tabagismo
                  </label>
                  <select className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400">
                    <option value="">Selecione</option>
                    <option>Não</option>
                    <option>Sim</option>
                    <option>Ex-fumante</option>
                  </select>
                </div>
              </div>
            )}

            {etapa === 5 && (
              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-[#f3f4f6] p-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Termo de consentimento
                  </h2>

                  <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                    <p>
                      Declaro que as informações fornecidas neste questionário
                      são verdadeiras e correspondem ao meu estado atual de
                      saúde.
                    </p>
                    <p>
                      Estou ciente de que este questionário tem caráter
                      informativo e preparatório, não substituindo a consulta
                      médica.
                    </p>
                    <p>
                      Autorizo o uso das informações aqui fornecidas
                      exclusivamente para fins de avaliação clínica e condução da
                      consulta médica.
                    </p>
                    <p>
                      Compreendo que todas as informações compartilhadas são
                      protegidas pelo sigilo médico.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700">
                  <input type="checkbox" className="mt-1" />
                  <span>Li e concordo com as informações acima.</span>
                </label>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={voltar}
                disabled={etapa === 1}
                className="rounded-2xl border border-slate-300 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Voltar
              </button>

              {etapa < totalEtapas ? (
                <button
                  type="button"
                  onClick={avancar}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
                >
                  Próxima etapa
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
                >
                  Enviar questionário
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}