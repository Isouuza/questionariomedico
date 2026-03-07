import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#e9eaec] text-slate-800">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(203,213,225,0.45),transparent_30%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 md:px-10">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] border border-white/60 bg-white/55 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-12">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-slate-300/80 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
                  Pré-consulta médica
                </span>

                <span className="inline-flex items-center rounded-full border border-slate-300/70 bg-slate-100/80 px-4 py-1.5 text-sm text-slate-600">
                  Atendimento humanizado
                </span>
              </div>

              <div className="max-w-3xl">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
                  Questionário inicial
                </p>

                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-6xl">
                  Um início de consulta mais claro, acolhedor e organizado.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                  Este questionário foi pensado para conhecer melhor sua saúde
                  antes da consulta, tornando o atendimento mais objetivo,
                  confortável e cuidadoso desde o primeiro contato.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Tempo
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    3 a 5 minutos
                  </p>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Sigilo
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    Informações confidenciais
                  </p>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Objetivo
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    Pré-avaliação clínica
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/questionario")}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Começar questionário
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/70 px-6 py-4 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  Saiba como funciona
                </button>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/60 bg-[#f4f4f5]/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-8">
              <div className="rounded-[28px] border border-white/80 bg-white/70 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
                      Profissional responsável
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                      Dra. Brenda de Souza Fernandes
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">CRM-ES 23053</p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-lg font-semibold text-slate-700 shadow-sm">
                    DB
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl border border-slate-200/80 bg-[#f3f4f6] p-4">
                    <p className="text-sm font-medium text-slate-900">
                      Antes da consulta
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Você responde algumas perguntas rápidas sobre sua saúde,
                      rotina e motivo do atendimento.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-[#f3f4f6] p-4">
                    <p className="text-sm font-medium text-slate-900">
                      Durante a avaliação
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      As informações ajudam a tornar a consulta mais objetiva e
                      permitem um atendimento ainda mais individualizado.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-[#f3f4f6] p-4">
                    <p className="text-sm font-medium text-slate-900">
                      Segurança e cuidado
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Os dados compartilhados são tratados com confidencialidade
                      e respeito ao sigilo médico.
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-5">
                  <p className="text-sm font-medium text-slate-900">
                    Ideal para:
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
                      Pré-consulta
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
                      Triagem inicial
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
                      Teleconsulta
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
                      Saúde geral
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}