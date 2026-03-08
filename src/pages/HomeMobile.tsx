import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#b89a5f]">
        {label}
      </p>
      <p className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#f4efe6]">
        {value}
      </p>
    </div>
  );
}

function TextBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-t border-white/8 py-5">
      <h3 className="text-[20px] font-semibold leading-snug tracking-[-0.03em] text-[#f4efe6]">
        {title}
      </h3>
      <p className="mt-3 text-[15px] leading-8 text-[#d7d0c4]/82">
        {description}
      </p>
    </div>
  );
}

export default function HomeMobile() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#111713] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(184,154,95,0.12),transparent_22%),linear-gradient(180deg,#111713_0%,#182019_45%,#101612_100%)]" />

      <div className="relative mx-auto w-full max-w-md px-5 pb-10 pt-5">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#d8c18c] backdrop-blur-xl">
            <Stethoscope className="h-3.5 w-3.5" />
            Pré-consulta médica
          </div>

          <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/[0.03] text-[#d8c18c]">
            <Sparkles className="h-4 w-4" />
          </div>
        </header>

        <section className="pt-10">
          <div className="max-w-[19rem]">
            <div className="inline-flex items-center gap-2 border border-[#b89a5f]/25 bg-[#b89a5f]/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#e3cf9f]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Atendimento mais preparado
            </div>

            <h1 className="mt-5 text-[46px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#f5f1e8]">
              Uma forma mais elegante de começar a consulta.
            </h1>

            <p className="mt-5 text-[16px] leading-8 text-[#d7d0c4]/84">
              Antes do atendimento, você responde um questionário breve para
              que a médica conheça melhor seu contexto, seu momento e suas
              necessidades com mais profundidade.
            </p>
          </div>
        </section>

        <section className="mt-12 border-t border-[#b89a5f]/20 pt-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#b89a5f]">
            Profissional responsável
          </p>

          <h2 className="mt-4 text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#f5f1e8]">
            Dra. Brenda de Souza Fernandes
          </h2>

          <p className="mt-3 text-sm text-[#d9c58e]">CRM-ES 23053</p>

          <div className="mt-8 space-y-5">
            <div className="border-t border-white/8 pt-5">
              <p className="text-[15px] leading-8 text-[#d7d0c4]/82">
                Residente em Medicina de Família e Comunidade.
              </p>
            </div>

            <div className="border-t border-white/8 pt-5">
              <p className="text-[15px] leading-8 text-[#d7d0c4]/82">
                Pós-graduanda em Psiquiatria.
              </p>
            </div>

            <div className="border-t border-[#b89a5f]/15 pt-5">
              <p className="text-[15px] leading-8 text-[#efe4c8]/86">
                Este pré-atendimento foi pensado para tornar a consulta mais
                organizada, mais humana e mais precisa desde o primeiro contato.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="grid grid-cols-3 gap-4">
            <InfoRow label="Tempo" value="3–5 min" />
            <InfoRow label="Formato" value="Mobile" />
            <InfoRow label="Sigilo" value="Protegido" />
          </div>
        </section>

        <section className="mt-12 border-t border-white/10 pt-2">
          <TextBlock
            title="Mais contexto antes do encontro."
            description="As respostas ajudam a médica a compreender melhor sua rotina, suas queixas e pontos importantes da sua saúde antes mesmo da consulta começar."
          />

          <TextBlock
            title="Um atendimento mais individualizado."
            description="Quando a consulta não começa do zero, sobra mais espaço para escuta qualificada, raciocínio clínico e condução cuidadosa."
          />

          <TextBlock
            title="Simples para você. Valioso para a consulta."
            description="Tudo foi pensado para funcionar bem no celular, com clareza, fluidez e uma experiência discreta, confortável e direta."
          />
        </section>

        <section className="mt-14 border-t border-white/10 pt-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#b89a5f]">
            Começar agora
          </p>

          <h2 className="mt-4 max-w-[18rem] text-[36px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#f5f1e8]">
            Poucos minutos que melhoram toda a experiência da consulta.
          </h2>

          <p className="mt-4 max-w-[20rem] text-[15px] leading-8 text-[#d7d0c4]/82">
            Você pode preencher agora mesmo, com calma, segurança e praticidade,
            direto pelo celular.
          </p>

          <div className="mt-7 grid gap-3">
            <button
              type="button"
              onClick={() => navigate("/questionario")}
              className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 bg-[#b89a5f] px-5 py-4 text-sm font-semibold text-[#182018] shadow-[0_18px_40px_rgba(184,154,95,0.24)] transition active:scale-[0.99]"
            >
              Iniciar questionário
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}