import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

function InfoMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-white/10 pt-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#b89a5f]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#f4efe6]">
        {value}
      </p>
    </div>
  );
}

function EditorialBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-t border-white/8 py-6">
      <h3 className="text-[28px] font-semibold leading-tight tracking-[-0.04em] text-[#f5f1e8]">
        {title}
      </h3>
      <p className="mt-4 max-w-2xl text-[16px] leading-8 text-[#d7d0c4]/82">
        {description}
      </p>
    </div>
  );
}

function JourneyStep({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative pl-20">
      <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center border border-[#b89a5f]/30 bg-[#b89a5f]/10 text-sm font-semibold text-[#e3cf9f]">
        {index}
      </div>

      <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.03em] text-[#1a211c]">
        {title}
      </h3>
      <p className="mt-3 max-w-md text-[15px] leading-8 text-[#505950]">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#111713] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(184,154,95,0.10),transparent_22%),linear-gradient(180deg,#111713_0%,#182019_48%,#101612_100%)]" />

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-8 md:px-10 xl:px-12">
          <header className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#d8c18c] backdrop-blur-xl">
              <Stethoscope className="h-3.5 w-3.5" />
              Pré-consulta médica
            </div>

            <div className="flex h-11 w-11 items-center justify-center border border-white/10 bg-white/[0.03] text-[#d8c18c]">
              <Sparkles className="h-4 w-4" />
            </div>
          </header>

          <div className="mt-14 grid items-start gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 border border-[#b89a5f]/25 bg-[#b89a5f]/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#e3cf9f]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Atendimento mais preparado
              </div>

              <h1 className="mt-7 max-w-4xl text-6xl font-semibold leading-[0.94] tracking-[-0.065em] text-[#f5f1e8] xl:text-7xl">
                Uma forma mais elegante de começar a consulta.
              </h1>

              <p className="mt-7 max-w-2xl text-[18px] leading-9 text-[#d7d0c4]/84">
                Antes do atendimento, o paciente responde um questionário breve
                para que a médica compreenda melhor seu contexto, seu momento e
                suas necessidades com mais profundidade, clareza e cuidado.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/questionario")}
                  className="inline-flex min-h-[58px] items-center justify-center gap-2 bg-[#b89a5f] px-7 py-4 text-sm font-semibold text-[#182018] shadow-[0_18px_40px_rgba(184,154,95,0.22)] transition hover:-translate-y-0.5"
                >
                  Começar questionário
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("visao-geral")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex min-h-[58px] items-center justify-center border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-semibold text-[#f5f1e8] transition hover:bg-white/[0.05]"
                >
                  Conhecer melhor
                </button>
              </div>

              <div className="mt-14 grid max-w-3xl grid-cols-3 gap-6">
                <InfoMetric label="Tempo" value="3–5 min" />
                <InfoMetric label="Formato" value="Desktop + Mobile" />
                <InfoMetric label="Sigilo" value="Protegido" />
              </div>
            </div>

            <div className="lg:pt-10">
              <section className="border-t border-[#b89a5f]/20 pt-7">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#b89a5f]">
                  Profissional responsável
                </p>

                <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#f5f1e8]">
                  Dra. Brenda de Souza Fernandes
                </h2>

                <p className="mt-3 text-sm text-[#d9c58e]">CRM-ES 23053</p>

                <div className="mt-10 space-y-6">
                  <div className="border-t border-white/8 pt-6">
                    <p className="text-[16px] leading-8 text-[#d7d0c4]/82">
                      Residente em Medicina de Família e Comunidade.
                    </p>
                  </div>

                  <div className="border-t border-white/8 pt-6">
                    <p className="text-[16px] leading-8 text-[#d7d0c4]/82">
                      Pós-graduanda em Psiquiatria.
                    </p>
                  </div>

                  <div className="border-t border-[#b89a5f]/15 pt-6">
                    <p className="text-[16px] leading-8 text-[#efe4c8]/86">
                      Este pré-atendimento foi pensado para tornar a consulta
                      mais organizada, mais humana e mais precisa desde o
                      primeiro contato.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section
            id="visao-geral"
            className="mt-24 border-t border-white/10 pt-4"
          >
            <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
              <div>
                <EditorialBlock
                  title="Mais contexto antes do encontro."
                  description="As respostas ajudam a médica a compreender melhor a rotina, as queixas e os pontos mais importantes da saúde do paciente antes mesmo da consulta começar."
                />

                <EditorialBlock
                  title="Um atendimento mais individualizado."
                  description="Quando a consulta não começa do zero, sobra mais espaço para escuta qualificada, raciocínio clínico e condução cuidadosa."
                />

                <EditorialBlock
                  title="Simples para o paciente. Valioso para a consulta."
                  description="Tudo foi pensado para funcionar com clareza, fluidez e uma experiência discreta, confortável e direta, seja no computador ou no celular."
                />
              </div>

              <div className="overflow-hidden border border-[#d6c7a0]/30 bg-[#f5f1e8] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.20)]">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#9a7f4a]">
                  Fluxo da experiência
                </p>

                <h3 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.05em] text-[#1b221d]">
                  Tudo foi desenhado para parecer natural.
                </h3>

                <p className="mt-5 max-w-xl text-[16px] leading-8 text-[#505950]">
                  O paciente preenche com tranquilidade, a médica analisa
                  previamente e a consulta acontece com muito mais direção,
                  presença e qualidade.
                </p>

                <div className="mt-10 space-y-10">
                  <JourneyStep
                    index="1"
                    title="O paciente responde com tranquilidade"
                    description="O questionário reúne informações relevantes sobre saúde, rotina e momento atual de forma simples, objetiva e acolhedora."
                  />

                  <JourneyStep
                    index="2"
                    title="A médica chega mais preparada"
                    description="As respostas oferecem um panorama inicial que ajuda a priorizar temas, perceber sinais e organizar melhor a avaliação."
                  />

                  <JourneyStep
                    index="3"
                    title="A consulta ganha outra qualidade"
                    description="O encontro fica mais humano, objetivo e individualizado, porque já existe uma base real para começar."
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-24 border-t border-white/10 pt-10">
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#b89a5f]">
                  Começar agora
                </p>

                <h2 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-[#f5f1e8] xl:text-6xl">
                  Poucos minutos que melhoram toda a experiência da consulta.
                </h2>

                <p className="mt-6 max-w-2xl text-[18px] leading-9 text-[#d7d0c4]/82">
                  O questionário pode ser preenchido agora mesmo, com calma,
                  segurança e praticidade, em uma experiência pensada para ser
                  elegante, simples e útil.
                </p>
              </div>

              <div className="flex flex-col gap-4 lg:min-w-[320px]">
                <button
                  type="button"
                  onClick={() => navigate("/questionario")}
                  className="inline-flex min-h-[60px] items-center justify-center gap-2 bg-[#b89a5f] px-8 py-4 text-sm font-semibold text-[#182018] shadow-[0_18px_40px_rgba(184,154,95,0.24)] transition hover:-translate-y-0.5"
                >
                  Iniciar questionário
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/acesso-painel")}
                  className="inline-flex min-h-[56px] items-center justify-center border border-white/10 bg-white/[0.03] px-8 py-4 text-sm font-semibold text-[#f5f1e8] transition hover:bg-white/[0.05]"
                >
                  Acesso restrito
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}