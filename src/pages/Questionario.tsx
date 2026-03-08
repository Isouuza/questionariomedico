import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
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

  if (
    mes < 0 ||
    (mes === 0 && hoje.getDate() < nascimento.getDate())
  ) {
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
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
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
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3.5 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
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
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
        checked
          ? "border-slate-900 bg-slate-900 text-white shadow-[0_12px_30px_rgba(15,23,42,0.12)]"
          : "border-slate-200 bg-white/85 text-slate-700 hover:bg-white"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
          checked
            ? "border-white/60 bg-white/15"
            : "border-slate-300 bg-white"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}

function EtapaBadge({
  etapa,
  titulo,
  ativa,
}: {
  etapa: number;
  titulo: string;
  ativa: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-3 py-2 transition ${
        ativa
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-white/70 bg-white/60 text-slate-500"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
        Etapa {etapa}
      </p>
      <p className="mt-1 text-sm font-medium">{titulo}</p>
    </div>
  );
}

export default function Questionario() {
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
            historico_familiar_outros: exists ? prev.historico_familiar_outros : "",
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
        setMensagemErro("Selecione pelo menos uma opção sobre saúde emocional.");
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
        setMensagemErro("Conte o que normalmente te ajuda em momentos difíceis.");
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

      if (error) {
        throw error;
      }

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
      <main className="min-h-screen bg-[#edf2f7] text-slate-800">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(203,213,225,0.40),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#edf2f7_50%,#e2e8f0_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:38px_38px] opacity-40" />

          <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-10 md:px-8">
            <div className="w-full rounded-[36px] border border-white/70 bg-white/72 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl md:p-12">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 shadow-[0_20px_40px_rgba(16,185,129,0.18)]">
                <Check className="h-11 w-11 text-emerald-600" />
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Questionário finalizado
                </p>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                  Recebemos suas informações com sucesso.
                </h1>

                <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                  Obrigada por compartilhar essas informações. Elas ajudam a
                  preparar melhor a consulta e permitem um atendimento mais
                  cuidadoso, individualizado e objetivo.
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Status
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-900">
                    Enviado com sucesso
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Segurança
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-900">
                    Informações protegidas por sigilo médico
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Próximo passo
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-900">
                    Avaliação prévia da médica
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-[28px] border border-slate-200 bg-[#f8fafc] p-6">
                <p className="text-lg font-semibold text-slate-900">
                  Mensagem final
                </p>
                <p className="mt-4 text-sm leading-8 text-slate-600">
                  Caso possua exames, receitas ou relatórios médicos
                  relevantes, você pode enviá-los previamente pelo WhatsApp.
                </p>
                <p className="mt-4 text-sm font-medium text-slate-900">
                  Dra. Brenda de Souza Fernandes
                </p>
              </div>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Voltar para o início
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/85 px-6 py-4 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  Salvar comprovante
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-800">
      <section className="mx-auto max-w-4xl px-6 py-8 md:px-10">
  <div className="mb-6 flex items-center justify-between gap-4">
    <button
      type="button"
      onClick={() => navigate("/")}
      className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      Voltar ao início
    </button>

    <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
      Etapa {etapa} de {totalEtapas}
    </span>
  </div>

  <div className="mb-4 flex items-center justify-between gap-4">
    <span className="text-sm font-medium text-slate-600">
      Progresso do preenchimento
    </span>
    <span className="text-sm font-semibold text-slate-900">
      {Math.round(progresso)}%
    </span>
  </div>

  <div className="overflow-hidden rounded-full bg-white">
    <div
      className="h-2.5 rounded-full bg-slate-900 transition-all duration-300"
      style={{ width: `${progresso}%` }}
    />
  </div>
</section>

      <section className="mx-auto max-w-4xl px-6 pb-10 md:px-10">
        <div className="rounded-[36px] border border-white/70 bg-white/72 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              {tituloEtapa}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {tituloEtapa}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              {descricaoEtapa}
            </p>
          </div>

          {mensagemErro && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {mensagemErro}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {etapa === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="Nome completo"
                    name="nome_completo"
                    value={formData.nome_completo}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome completo"
                  />
                </div>

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
              <div className="space-y-5">
                <Textarea
                  label="Qual o principal motivo que te levou a buscar atendimento neste momento?"
                  name="motivo_consulta"
                  value={formData.motivo_consulta}
                  onChange={handleInputChange}
                  rows={5}
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
              <div className="space-y-5">
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
              <div>
                <label className="mb-4 block text-sm font-medium text-slate-700">
                  Nos últimos meses você percebeu com mais frequência:
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  {opcoesSaudeEmocional.map((option) => (
                    <CheckCard
                      key={option}
                      label={option}
                      checked={formData.saude_emocional.includes(option)}
                      onClick={() =>
                        toggleArrayField("saude_emocional", option)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {etapa === 5 && (
              <div className="grid gap-5 md:grid-cols-2">
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
              <div className="space-y-5">
                <label className="block text-sm font-medium text-slate-700">
                  Na sua família existe histórico de:
                </label>

                <div className="grid gap-3 md:grid-cols-2">
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
              <div className="space-y-5">
                <Textarea
                  label="O que mais tem te preocupado recentemente?"
                  name="preocupacao_recente"
                  value={formData.preocupacao_recente}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Escreva livremente o que tem ocupado mais seus pensamentos ou gerado preocupação."
                />

                <Textarea
                  label="O que normalmente te ajuda quando você passa por um momento difícil?"
                  name="ajuda_momento_dificil"
                  value={formData.ajuda_momento_dificil}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Pode ser apoio familiar, descanso, oração, exercício, terapia, conversa, rotina, etc."
                />
              </div>
            )}

            {etapa === 8 && (
              <div className="space-y-6">
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

                <div className="rounded-[28px] border border-slate-200 bg-[#f8fafc] p-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Termo de Consentimento para Teleconsulta e Uso de Informações
                  </h3>

                  <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
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

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="consentimento"
                    checked={formData.consentimento}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <span>Li e concordo com as informações acima.</span>
                </label>

                <div className="rounded-[28px] border border-white/70 bg-slate-900 p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Mensagem final
                  </p>
                  <p className="mt-4 text-sm leading-8 text-slate-200">
                    Obrigada por compartilhar essas informações comigo. Elas me
                    ajudam a preparar melhor nossa consulta e oferecer um
                    atendimento mais cuidadoso e individualizado.
                  </p>
                  <p className="mt-4 text-sm leading-8 text-slate-200">
                    Caso possua exames, receitas ou relatórios médicos
                    relevantes, você pode enviá-los previamente pelo WhatsApp.
                  </p>
                  <p className="mt-4 text-sm font-medium text-white">
                    Dra. Brenda de Souza Fernandes
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={voltar}
                disabled={etapa === 1 || enviando}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  disabled={enviando}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sair
                </button>

                {etapa < totalEtapas ? (
                  <button
                    type="button"
                    onClick={avancar}
                    disabled={enviando}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Próxima etapa
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={enviando}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {enviando ? "Enviando..." : "Finalizar questionário"}
                    {!enviando && <ArrowRight className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}