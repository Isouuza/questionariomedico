import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, ShieldCheck, Stethoscope } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#f3f5f7] text-slate-800">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(226,232,240,0.55),transparent_30%)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                <Stethoscope className="h-4 w-4" />
                Pré-consulta médica
              </div>

              <p className="mt-8 text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
                Questionário inicial
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-6xl">
                Um início de consulta mais simples, humano e organizado.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Antes da consulta, você responde um breve questionário com
                informações importantes sobre sua saúde. Isso ajuda a tornar o
                atendimento mais objetivo, cuidadoso e individualizado.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/questionario")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Começar questionário
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("como-funciona")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Saiba como funciona
                </button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock3 className="h-4 w-4" />
                    <p className="text-sm font-medium">3 a 5 minutos</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Preenchimento rápido e simples.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-sm font-medium">Sigilo e cuidado</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Informações tratadas com confidencialidade.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Stethoscope className="h-4 w-4" />
                    <p className="text-sm font-medium">Pré-avaliação clínica</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Mais clareza antes da consulta.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:pl-6">
              <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
                  Profissional responsável
                </p>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                  Dra. Brenda de Souza Fernandes
                </h2>

                <p className="mt-3 text-sm text-slate-600">CRM-ES 23053</p>

                <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                  <p className="text-sm leading-7 text-slate-600">
                    Residente em Medicina de Família e Comunidade.
                  </p>

                  <p className="text-sm leading-7 text-slate-600">
                    Pós-graduanda em Psiquiatria.
                  </p>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm leading-7 text-slate-600">
                      Este formulário foi pensado para preparar melhor a
                      consulta e acolher cada paciente de forma mais atenta e
                      individualizada.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            id="como-funciona"
            className="mt-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  Etapa 1
                </p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  Você preenche o questionário
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Responde perguntas breves sobre sua saúde, rotina e motivo do
                  atendimento.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  Etapa 2
                </p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  A médica analisa previamente
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  As informações ajudam a organizar melhor a avaliação e a
                  consulta.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  Etapa 3
                </p>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  Atendimento mais objetivo
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Isso permite um encontro mais claro, cuidadoso e
                  individualizado desde o início.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}