import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  ShieldCheck,
  HeartPulse,
  UserRound,
  ClipboardList,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type FormData = {
  nome_completo: string;
  data_nascimento: string;
  idade: string;
  telefone_whatsapp: string;
  email: string;
  cidade_estado: string;
  profissao: string;
  estado_civil: string;
  com_quem_mora: string;

  motivo_consulta: string;
  tempo_queixa: string;

  possui_diagnostico: string;
  diagnostico_medico: string;
  usa_medicacao: string;
  medicacao_continua: string;

  saude_emocional: string[];

  sono: string;
  atividade_fisica: string;
  consumo_alcool: string;
  tabagismo: string;

  historico_familiar: string[];
  historico_familiar_outros: string;

  preocupacao_recente: string;
  ajuda_momento_dificil: string;

  origem_paciente: string;
  origem_paciente_outros: string;

  consentimento: boolean;
};

const initialFormData: FormData = {
  nome_completo: "",
  data_nascimento: "",
  idade: "",
  telefone_whatsapp: "",
  email: "",
  cidade_estado: "",
  profissao: "",
  estado_civil: "",
  com_quem_mora: "",

  motivo_consulta: "",
  tempo_queixa: "",

  possui_diagnostico: "",
  diagnostico_medico: "",
  usa_medicacao: "",
  medicacao_continua: "",

  saude_emocional: [],

  sono: "",
  atividade_fisica: "",
  consumo_alcool: "",
  tabagismo: "",

  historico_familiar: [],
  historico_familiar_outros: "",

  preocupacao_recente: "",
  ajuda_momento_dificil: "",

  origem_paciente: "",
  origem_paciente_outros: "",

  consentimento: false,
};

const totalEtapas = 8;

const opcoesSaudeEmocional = [
  "Ansiedade",
  "Tristeza",
  "Desânimo",
  "Irritabilidade",
  "Dificuldade para dormir",
  "Cansaço constante",
  "Dificuldade de concentração",
  "Oscilações de humor",
  "Nenhum desses",
];

const opcoesHistoricoFamiliar = [
  "Diabetes",
  "Hipertensão",
  "Câncer",
  "Problemas cardíacos",
  "Vícios",
  "Outros",
  "Não sei informar",
];

function calcularIdade(dataNascimento: string) {
  if (!dataNascimento) return "";

  const hoje = new Date();
  const nascimento = new Date(`${dataNascimento}T00:00:00`);

  if (Number.isNaN(nascimento.getTime())) return "";

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade >= 0 ? String(idade) : "";
}

function normalizarTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 7) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }
  if (numeros.length <= 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  return valor;
}

function MobileShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#111713] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(184,154,95,0.12),transparent_22%),linear-gradient(180deg,#111713_0%,#182019_45%,#101612_100%)]" />
      <div className="relative mx-auto w-full max-w-md px-5 pb-28 pt-5">
        {children}
      </div>
    </main>
  );
}

function HeaderPill({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 border border-[#b89a5f]/25 bg-[#b89a5f]/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#e3cf9f]">
      {children}
    </div>
  );
}

function SectionBlock({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-white/10 pt-8">
      {eyebrow && (
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#b89a5f]">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-3 text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#f5f1e8]">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-[15px] leading-8 text-[#d7d0c4]/82">
          {description}
        </p>
      )}

      <div className="mt-7">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-[#e7decd]">
      {children}
    </label>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  readOnly = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[15px] text-[#f5f1e8] outline-none transition placeholder:text-[#bfb8ab] focus:border-[#b89a5f]/55 focus:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[15px] text-[#f5f1e8] outline-none transition placeholder:text-[#bfb8ab] focus:border-[#b89a5f]/55 focus:bg-white/[0.05]"
      />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Selecione",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[15px] text-[#f5f1e8] outline-none transition focus:border-[#b89a5f]/55 focus:bg-white/[0.05]"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#182019] text-white">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckCard({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 border px-4 py-4 text-left transition ${
        checked
          ? "border-[#b89a5f]/50 bg-[#b89a5f]/10 text-[#f5f1e8]"
          : "border-white/10 bg-white/[0.03] text-[#d7d0c4] active:scale-[0.995]"
      }`}
    >
      <span className="text-sm font-medium leading-6">{label}</span>

      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          checked
            ? "border-[#d9c58e] bg-[#b89a5f]/20 text-[#f1dfb5]"
            : "border-white/20 bg-transparent"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}

function MiniStep({
  index,
  active,
  done,
}: {
  index: number;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center border text-xs font-semibold transition ${
        active
          ? "border-[#b89a5f] bg-[#b89a5f] text-[#182018]"
          : done
          ? "border-[#b89a5f]/40 bg-[#b89a5f]/10 text-[#f1dfb5]"
          : "border-white/10 bg-white/[0.03] text-[#9f988b]"
      }`}
    >
      {done ? <Check className="h-4 w-4" /> : index}
    </div>
  );
}

function StepTag({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[#d7d0c4]">
      {icon}
      {text}
    </div>
  );
}

export default function QuestionarioMobile() {
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [mensagemErro, setMensagemErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);

  const progresso = (etapa / totalEtapas) * 100;

  const tituloEtapa = useMemo(() => {
    switch (etapa) {
      case 1:
        return "Dados pessoais";
      case 2:
        return "O que te trouxe até aqui";
      case 3:
        return "Sobre sua saúde";
      case 4:
        return "Como você tem se sentido";
      case 5:
        return "Rotina e estilo de vida";
      case 6:
        return "Histórico familiar";
      case 7:
        return "Quero conhecer você melhor";
      case 8:
        return "Para finalizarmos";
      default:
        return "Questionário";
    }
  }, [etapa]);

  const descricaoEtapa = useMemo(() => {
    switch (etapa) {
      case 1:
        return "Vamos começar com algumas informações básicas para identificação e contato.";
      case 2:
        return "Conte, com suas palavras, o que motivou a busca pelo atendimento neste momento.";
      case 3:
        return "Essas informações ajudam a médica a entender melhor seu contexto de saúde.";
      case 4:
        return "Marque o que você percebeu com mais frequência nos últimos meses.";
      case 5:
        return "Sua rotina também faz parte da avaliação e ajuda a construir uma visão mais completa.";
      case 6:
        return "O histórico familiar pode trazer informações relevantes para a consulta.";
      case 7:
        return "Essas respostas ajudam a tornar o atendimento mais humano, cuidadoso e individualizado.";
      case 8:
        return "Estamos quase terminando. Falta apenas a parte final e o consentimento.";
      default:
        return "";
    }
  }, [etapa]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (name === "telefone_whatsapp") {
      setFormData((prev) => ({
        ...prev,
        telefone_whatsapp: normalizarTelefone(value),
      }));
      return;
    }

    if (name === "data_nascimento") {
      const idadeCalculada = calcularIdade(value);
      setFormData((prev) => ({
        ...prev,
        data_nascimento: value,
        idade: idadeCalculada,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleArrayField = (
    field: "saude_emocional" | "historico_familiar",
    option: string
  ) => {
    setFormData((prev) => {
      const current = prev[field];
      const exists = current.includes(option);

      if (field === "saude_emocional") {
        if (option === "Nenhum desses") {
          return {
            ...prev,
            saude_emocional: exists ? [] : ["Nenhum desses"],
          };
        }

        const cleaned = current.filter((item) => item !== "Nenhum desses");
        return {
          ...prev,
          saude_emocional: exists
            ? cleaned.filter((item) => item !== option)
            : [...cleaned, option],
        };
      }

      if (field === "historico_familiar") {
        if (option === "Não sei informar") {
          return {
            ...prev,
            historico_familiar: exists ? [] : ["Não sei informar"],
            historico_familiar_outros: exists
              ? prev.historico_familiar_outros
              : "",
          };
        }

        const cleaned = current.filter((item) => item !== "Não sei informar");
        return {
          ...prev,
          historico_familiar: exists
            ? cleaned.filter((item) => item !== option)
            : [...cleaned, option],
          historico_familiar_outros:
            option === "Outros" && exists ? "" : prev.historico_familiar_outros,
        };
      }

      return prev;
    });
  };

  const validarEtapa = () => {
    setMensagemErro("");

    if (etapa === 1) {
      if (!formData.nome_completo.trim()) {
        setMensagemErro("Preencha o nome completo.");
        return false;
      }
      if (!formData.data_nascimento) {
        setMensagemErro("Informe a data de nascimento.");
        return false;
      }
      if (!formData.idade.trim()) {
        setMensagemErro("A idade não foi identificada corretamente.");
        return false;
      }
      if (!formData.telefone_whatsapp.trim()) {
        setMensagemErro("Preencha o telefone ou WhatsApp.");
        return false;
      }
      if (!formData.email.trim()) {
        setMensagemErro("Preencha o e-mail.");
        return false;
      }
      if (!formData.cidade_estado.trim()) {
        setMensagemErro("Preencha cidade / estado.");
        return false;
      }
      if (!formData.profissao.trim()) {
        setMensagemErro("Preencha a profissão ou ocupação atual.");
        return false;
      }
      if (!formData.estado_civil) {
        setMensagemErro("Selecione o estado civil.");
        return false;
      }
      if (!formData.com_quem_mora) {
        setMensagemErro("Selecione com quem você mora atualmente.");
        return false;
      }
    }

    if (etapa === 2) {
      if (!formData.motivo_consulta.trim()) {
        setMensagemErro("Descreva o principal motivo da consulta.");
        return false;
      }
      if (!formData.tempo_queixa.trim()) {
        setMensagemErro("Informe há quanto tempo essa questão começou.");
        return false;
      }
    }

    if (etapa === 3) {
      if (!formData.possui_diagnostico) {
        setMensagemErro("Informe se possui algum diagnóstico médico atualmente.");
        return false;
      }
      if (
        formData.possui_diagnostico === "Sim" &&
        !formData.diagnostico_medico.trim()
      ) {
        setMensagemErro("Descreva os diagnósticos informados.");
        return false;
      }
      if (!formData.usa_medicacao) {
        setMensagemErro("Informe se faz uso de medicação atualmente.");
        return false;
      }
      if (
        formData.usa_medicacao === "Sim" &&
        !formData.medicacao_continua.trim()
      ) {
        setMensagemErro("Informe quais medicamentos e doses utiliza.");
        return false;
      }
    }

    if (etapa === 4) {
      if (formData.saude_emocional.length === 0) {
        setMensagemErro(
          "Selecione pelo menos uma opção sobre saúde emocional."
        );
        return false;
      }
    }

    if (etapa === 5) {
      if (!formData.sono) {
        setMensagemErro("Selecione como está seu sono atualmente.");
        return false;
      }
      if (!formData.atividade_fisica) {
        setMensagemErro("Selecione a frequência de atividade física.");
        return false;
      }
      if (!formData.consumo_alcool) {
        setMensagemErro("Selecione o consumo de álcool.");
        return false;
      }
      if (!formData.tabagismo) {
        setMensagemErro("Selecione a opção de tabagismo.");
        return false;
      }
    }

    if (etapa === 6) {
      if (formData.historico_familiar.length === 0) {
        setMensagemErro("Selecione ao menos uma opção do histórico familiar.");
        return false;
      }
      if (
        formData.historico_familiar.includes("Outros") &&
        !formData.historico_familiar_outros.trim()
      ) {
        setMensagemErro("Especifique o histórico familiar em 'Outros'.");
        return false;
      }
    }

    if (etapa === 7) {
      if (!formData.preocupacao_recente.trim()) {
        setMensagemErro("Conte o que mais tem te preocupado recentemente.");
        return false;
      }
      if (!formData.ajuda_momento_dificil.trim()) {
        setMensagemErro(
          "Conte o que normalmente te ajuda em momentos difíceis."
        );
        return false;
      }
    }

    if (etapa === 8) {
      if (!formData.origem_paciente) {
        setMensagemErro("Selecione como encontrou o atendimento.");
        return false;
      }
      if (
        formData.origem_paciente === "Outros" &&
        !formData.origem_paciente_outros.trim()
      ) {
        setMensagemErro("Especifique como encontrou o atendimento.");
        return false;
      }
      if (!formData.consentimento) {
        setMensagemErro("Você precisa concordar com o termo para finalizar.");
        return false;
      }
    }

    return true;
  };

  const avancar = () => {
    if (!validarEtapa()) return;

    if (etapa < totalEtapas) {
      setEtapa((prev) => prev + 1);
      setMensagemErro("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const voltar = () => {
    if (etapa > 1) {
      setEtapa((prev) => prev - 1);
      setMensagemErro("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensagemErro("");

    if (!validarEtapa()) return;

    try {
      setEnviando(true);

      const payload = {
        nome_completo: formData.nome_completo.trim(),
        data_nascimento: formData.data_nascimento || null,
        idade: formData.idade ? Number(formData.idade) : null,
        telefone_whatsapp: formData.telefone_whatsapp.trim(),
        email: formData.email.trim(),
        cidade_estado: formData.cidade_estado.trim(),
        profissao: formData.profissao.trim(),
        estado_civil: formData.estado_civil,
        com_quem_mora: formData.com_quem_mora,

        motivo_consulta: formData.motivo_consulta.trim(),
        tempo_queixa: formData.tempo_queixa.trim(),

        diagnostico_medico:
          formData.possui_diagnostico === "Sim"
            ? formData.diagnostico_medico.trim()
            : "",
        medicacao_continua:
          formData.usa_medicacao === "Sim"
            ? formData.medicacao_continua.trim()
            : "",

        saude_emocional: formData.saude_emocional.join(", "),
        sono: formData.sono,
        atividade_fisica: formData.atividade_fisica,
        consumo_alcool: formData.consumo_alcool,
        tabagismo: formData.tabagismo,

        historico_familiar: formData.historico_familiar.join(", "),
        historico_familiar_outros: formData.historico_familiar.includes("Outros")
          ? formData.historico_familiar_outros.trim()
          : "",

        preocupacao_recente: formData.preocupacao_recente.trim(),
        ajuda_momento_dificil: formData.ajuda_momento_dificil.trim(),

        origem_paciente: formData.origem_paciente,
        origem_paciente_outros:
          formData.origem_paciente === "Outros"
            ? formData.origem_paciente_outros.trim()
            : "",

        consentimento: formData.consentimento,
      };

      const { error } = await supabase
        .from("respostas_pre_consulta")
        .insert([payload]);

      if (error) throw error;

      setFinalizado(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Erro ao enviar questionário:", error);
      setMensagemErro(
        "Não foi possível enviar o questionário agora. Tente novamente em instantes."
      );
    } finally {
      setEnviando(false);
    }
  };

  if (finalizado) {
    return (
      <MobileShell>
        <section className="pt-12">
          <HeaderPill>
            <Check className="h-3.5 w-3.5" />
            Questionário finalizado
          </HeaderPill>

          <h1 className="mt-5 text-[40px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#f5f1e8]">
            Recebemos suas informações com sucesso.
          </h1>

          <p className="mt-5 text-[15px] leading-8 text-[#d7d0c4]/82">
            Obrigada por compartilhar essas informações. Elas ajudam a preparar
            melhor a consulta e permitem um atendimento mais cuidadoso,
            individualizado e objetivo.
          </p>

          <div className="mt-8 flex h-20 w-20 items-center justify-center border border-[#b89a5f]/35 bg-[#b89a5f]/10 text-[#f1dfb5]">
            <Check className="h-10 w-10" />
          </div>

          <div className="mt-10 space-y-5 border-t border-white/10 pt-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#b89a5f]">
                Status
              </p>
              <p className="mt-2 text-[18px] font-semibold text-[#f5f1e8]">
                Enviado com sucesso
              </p>
            </div>

            <div className="border-t border-white/8 pt-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#b89a5f]">
                Segurança
              </p>
              <p className="mt-2 text-[18px] font-semibold text-[#f5f1e8]">
                Informações protegidas por sigilo médico
              </p>
            </div>

            <div className="border-t border-white/8 pt-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#b89a5f]">
                Próximo passo
              </p>
              <p className="mt-2 text-[18px] font-semibold text-[#f5f1e8]">
                Avaliação prévia da médica
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-[#b89a5f]/20 pt-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#b89a5f]">
              Mensagem final
            </p>
            <p className="mt-4 text-[15px] leading-8 text-[#d7d0c4]/82">
              Caso possua exames, receitas ou relatórios médicos relevantes,
              você pode enviá-los previamente pelo WhatsApp.
            </p>
            <p className="mt-4 text-sm font-medium text-[#f5f1e8]">
              Dra. Brenda de Souza Fernandes
            </p>
          </div>

          <div className="mt-10 grid gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex min-h-[56px] items-center justify-center bg-[#b89a5f] px-5 py-4 text-sm font-semibold text-[#182018] shadow-[0_18px_40px_rgba(184,154,95,0.24)] transition active:scale-[0.99]"
            >
              Voltar para o início
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-[52px] items-center justify-center border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-semibold text-[#f5f1e8] transition active:scale-[0.99]"
            >
              Salvar comprovante
            </button>
          </div>
        </section>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <section>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-[#f5f1e8]"
          >
            <ArrowLeft className="h-4 w-4" />
            Início
          </button>

          <div className="border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-[#d7d0c4]">
            Etapa {etapa} de {totalEtapas}
          </div>
        </div>

        <div className="mt-8">
          <HeaderPill>
            <ShieldCheck className="h-3.5 w-3.5" />
            Questionário médico
          </HeaderPill>

          <h1 className="mt-5 text-[40px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#f5f1e8]">
            {tituloEtapa}
          </h1>

          <p className="mt-4 text-[15px] leading-8 text-[#d7d0c4]/82">
            {descricaoEtapa}
          </p>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#b89a5f]">
                Progresso
              </p>
              <p className="mt-1 text-sm font-medium text-[#f5f1e8]">
                {Math.round(progresso)}% concluído
              </p>
            </div>

            <div className="border border-[#b89a5f]/30 bg-[#b89a5f]/10 px-3 py-2 text-sm font-semibold text-[#e8d39f]">
              {etapa}/{totalEtapas}
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden bg-white/10">
            <div
              className="h-full bg-[#b89a5f] transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: totalEtapas }).map((_, index) => (
              <MiniStep
                key={index}
                index={index + 1}
                active={etapa === index + 1}
                done={etapa > index + 1}
              />
            ))}
          </div>
        </div>

        <SectionBlock
          eyebrow={`Etapa ${etapa}`}
          title={tituloEtapa}
          description={descricaoEtapa}
        >
          {mensagemErro && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
              {mensagemErro}
            </div>
          )}

          <form className="space-y-7" onSubmit={handleSubmit}>
            {etapa === 1 && (
              <div className="space-y-4">
                <StepTag
                  icon={<UserRound className="h-3.5 w-3.5" />}
                  text="Identificação e contato"
                />

                <Input
                  label="Nome completo"
                  name="nome_completo"
                  value={formData.nome_completo}
                  onChange={handleInputChange}
                  placeholder="Digite seu nome completo"
                />

                <Input
                  label="Data de nascimento"
                  name="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={handleInputChange}
                />

                <Input
                  label="Idade"
                  name="idade"
                  value={formData.idade}
                  onChange={handleInputChange}
                  placeholder="Calculada automaticamente"
                  readOnly
                />

                <Input
                  label="Telefone / WhatsApp"
                  name="telefone_whatsapp"
                  value={formData.telefone_whatsapp}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />

                <Input
                  label="E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="voce@email.com"
                />

                <Input
                  label="Cidade / Estado"
                  name="cidade_estado"
                  value={formData.cidade_estado}
                  onChange={handleInputChange}
                  placeholder="Ex: Vitória / ES"
                />

                <Input
                  label="Profissão / ocupação atual"
                  name="profissao"
                  value={formData.profissao}
                  onChange={handleInputChange}
                  placeholder="Ex: Professora, estudante, autônoma..."
                />

                <Select
                  label="Estado civil"
                  name="estado_civil"
                  value={formData.estado_civil}
                  onChange={handleInputChange}
                  options={[
                    "Solteiro",
                    "Casado",
                    "União estável",
                    "Divorciado",
                    "Viúvo",
                  ]}
                />

                <Select
                  label="Com quem você mora atualmente?"
                  name="com_quem_mora"
                  value={formData.com_quem_mora}
                  onChange={handleInputChange}
                  options={[
                    "Sozinho",
                    "Parceiro(a)",
                    "Família",
                    "Amigos",
                    "Outros",
                  ]}
                />
              </div>
            )}

            {etapa === 2 && (
              <div className="space-y-4">
                <StepTag
                  icon={<ClipboardList className="h-3.5 w-3.5" />}
                  text="Motivo principal"
                />

                <Textarea
                  label="Qual o principal motivo que te levou a buscar atendimento neste momento?"
                  name="motivo_consulta"
                  value={formData.motivo_consulta}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Conte com suas palavras o que te trouxe até aqui."
                />

                <Input
                  label="Há quanto tempo essa questão começou?"
                  name="tempo_queixa"
                  value={formData.tempo_queixa}
                  onChange={handleInputChange}
                  placeholder="Ex: há 2 meses, algumas semanas, desde o ano passado..."
                />
              </div>
            )}

            {etapa === 3 && (
              <div className="space-y-4">
                <StepTag
                  icon={<HeartPulse className="h-3.5 w-3.5" />}
                  text="Contexto de saúde"
                />

                <Select
                  label="Você possui algum diagnóstico médico atualmente?"
                  name="possui_diagnostico"
                  value={formData.possui_diagnostico}
                  onChange={handleInputChange}
                  options={["Não", "Sim"]}
                />

                {formData.possui_diagnostico === "Sim" && (
                  <Textarea
                    label="Quais diagnósticos?"
                    name="diagnostico_medico"
                    value={formData.diagnostico_medico}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Descreva os diagnósticos informados."
                  />
                )}

                <Select
                  label="Faz uso de alguma medicação atualmente?"
                  name="usa_medicacao"
                  value={formData.usa_medicacao}
                  onChange={handleInputChange}
                  options={["Não", "Sim"]}
                />

                {formData.usa_medicacao === "Sim" && (
                  <Textarea
                    label="Quais medicamentos e doses?"
                    name="medicacao_continua"
                    value={formData.medicacao_continua}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Ex: nome do medicamento, dose e frequência."
                  />
                )}
              </div>
            )}

            {etapa === 4 && (
              <div className="space-y-4">
                <FieldLabel>
                  Nos últimos meses você percebeu com mais frequência:
                </FieldLabel>

                <div className="space-y-3">
                  {opcoesSaudeEmocional.map((option) => (
                    <CheckCard
                      key={option}
                      label={option}
                      checked={formData.saude_emocional.includes(option)}
                      onClick={() => toggleArrayField("saude_emocional", option)}
                    />
                  ))}
                </div>
              </div>
            )}

            {etapa === 5 && (
              <div className="space-y-4">
                <Select
                  label="Como está seu sono atualmente?"
                  name="sono"
                  value={formData.sono}
                  onChange={handleInputChange}
                  options={["Muito bom", "Regular", "Ruim"]}
                />

                <Select
                  label="Você pratica atividade física?"
                  name="atividade_fisica"
                  value={formData.atividade_fisica}
                  onChange={handleInputChange}
                  options={[
                    "Não",
                    "1–2 vezes por semana",
                    "3–4 vezes por semana",
                    "5 ou mais vezes por semana",
                  ]}
                />

                <Select
                  label="Consumo de álcool"
                  name="consumo_alcool"
                  value={formData.consumo_alcool}
                  onChange={handleInputChange}
                  options={["Não", "Ocasional", "Frequente"]}
                />

                <Select
                  label="Tabagismo"
                  name="tabagismo"
                  value={formData.tabagismo}
                  onChange={handleInputChange}
                  options={["Não", "Sim", "Ex-fumante"]}
                />
              </div>
            )}

            {etapa === 6 && (
              <div className="space-y-4">
                <FieldLabel>Na sua família existe histórico de:</FieldLabel>

                <div className="space-y-3">
                  {opcoesHistoricoFamiliar.map((option) => (
                    <CheckCard
                      key={option}
                      label={option}
                      checked={formData.historico_familiar.includes(option)}
                      onClick={() =>
                        toggleArrayField("historico_familiar", option)
                      }
                    />
                  ))}
                </div>

                {formData.historico_familiar.includes("Outros") && (
                  <Textarea
                    label="Quais outros históricos familiares?"
                    name="historico_familiar_outros"
                    value={formData.historico_familiar_outros}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Descreva outros antecedentes familiares importantes."
                  />
                )}
              </div>
            )}

            {etapa === 7 && (
              <div className="space-y-4">
                <Textarea
                  label="O que mais tem te preocupado recentemente?"
                  name="preocupacao_recente"
                  value={formData.preocupacao_recente}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Escreva livremente o que tem ocupado mais seus pensamentos ou gerado preocupação."
                />

                <Textarea
                  label="O que normalmente te ajuda quando você passa por um momento difícil?"
                  name="ajuda_momento_dificil"
                  value={formData.ajuda_momento_dificil}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Pode ser apoio familiar, descanso, oração, exercício, terapia, conversa, rotina, etc."
                />
              </div>
            )}

            {etapa === 8 && (
              <div className="space-y-5">
                <Select
                  label="Como você encontrou meu atendimento?"
                  name="origem_paciente"
                  value={formData.origem_paciente}
                  onChange={handleInputChange}
                  options={[
                    "Indicação",
                    "Instagram",
                    "Google",
                    "Amigos / familiares",
                    "Outros",
                  ]}
                />

                {formData.origem_paciente === "Outros" && (
                  <Input
                    label="Especifique"
                    name="origem_paciente_outros"
                    value={formData.origem_paciente_outros}
                    onChange={handleInputChange}
                    placeholder="Conte como encontrou o atendimento"
                  />
                )}

                <div className="border-t border-[#b89a5f]/20 pt-6">
                  <HeaderPill>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Termo de consentimento
                  </HeaderPill>

                  <h3 className="mt-4 text-[24px] font-semibold leading-tight tracking-[-0.03em] text-[#f5f1e8]">
                    Termo de Consentimento para Teleconsulta e Uso de Informações
                  </h3>

                  <div className="mt-5 space-y-3 text-sm leading-7 text-[#d7d0c4]/82">
                    <p>
                      1. Declaro que as informações fornecidas neste questionário
                      são verdadeiras e correspondem ao meu estado atual de
                      saúde.
                    </p>
                    <p>
                      2. Estou ciente de que este questionário tem caráter
                      informativo e preparatório, não substituindo a consulta
                      médica.
                    </p>
                    <p>
                      3. Autorizo o uso das informações aqui fornecidas pela
                      Dra. Brenda de Souza Fernandes (CRM-ES 23053)
                      exclusivamente para fins de avaliação clínica e condução
                      da consulta médica.
                    </p>
                    <p>
                      4. Estou ciente de que a consulta poderá ser realizada de
                      forma on-line (telemedicina), conforme regulamentação
                      vigente do Conselho Federal de Medicina.
                    </p>
                    <p>
                      5. Compreendo que todas as informações compartilhadas são
                      protegidas pelo sigilo médico, conforme previsto no Código
                      de Ética Médica.
                    </p>
                    <p>
                      6. Declaro estar de acordo com a realização da consulta
                      neste formato.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-[#e7decd]">
                  <input
                    type="checkbox"
                    name="consentimento"
                    checked={formData.consentimento}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <span>Li e concordo com as informações acima.</span>
                </label>

                <div className="border-t border-[#b89a5f]/20 pt-6">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#b89a5f]">
                    Mensagem final
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[#d7d0c4]/82">
                    Obrigada por compartilhar essas informações comigo. Elas me
                    ajudam a preparar melhor nossa consulta e oferecer um
                    atendimento mais cuidadoso e individualizado.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#d7d0c4]/82">
                    Caso possua exames, receitas ou relatórios médicos
                    relevantes, você pode enviá-los previamente pelo WhatsApp.
                  </p>
                  <p className="mt-4 text-sm font-medium text-[#f5f1e8]">
                    Dra. Brenda de Souza Fernandes
                  </p>
                </div>
              </div>
            )}

            <div className="h-2" />
          </form>
        </SectionBlock>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#111713]/92 px-5 py-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-md items-center gap-3">
          <button
            type="button"
            onClick={voltar}
            disabled={etapa === 1 || enviando}
            className="inline-flex h-12 min-w-[96px] items-center justify-center gap-2 border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-[#f5f1e8] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          {etapa < totalEtapas ? (
            <button
              type="button"
              onClick={avancar}
              disabled={enviando}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 bg-[#b89a5f] px-5 text-sm font-semibold text-[#182018] shadow-[0_16px_40px_rgba(184,154,95,0.22)] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima etapa
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const fakeEvent = {
                  preventDefault: () => undefined,
                } as FormEvent<HTMLFormElement>;
                void handleSubmit(fakeEvent);
              }}
              disabled={enviando}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 bg-[#b89a5f] px-5 text-sm font-semibold text-[#182018] shadow-[0_16px_40px_rgba(184,154,95,0.22)] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Finalizar"}
              {!enviando && <ArrowRight className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </MobileShell>
  );
}