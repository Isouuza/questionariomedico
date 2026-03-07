import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type FormData = {
  nome_completo: string;
  idade: string;
  cidade_estado: string;
  profissao: string;
  telefone_whatsapp: string;
  motivo_consulta: string;
  tempo_queixa: string;
  intensidade: string;
  possui_diagnostico: string;
  diagnostico_medico: string;
  usa_medicacao: string;
  medicacao_continua: string;
  sono: string;
  atividade_fisica: string;
  consumo_alcool: string;
  tabagismo: string;
  consentimento: boolean;
};

const initialFormData: FormData = {
  nome_completo: "",
  idade: "",
  cidade_estado: "",
  profissao: "",
  telefone_whatsapp: "",
  motivo_consulta: "",
  tempo_queixa: "",
  intensidade: "",
  possui_diagnostico: "",
  diagnostico_medico: "",
  usa_medicacao: "",
  medicacao_continua: "",
  sono: "",
  atividade_fisica: "",
  consumo_alcool: "",
  tabagismo: "",
  consentimento: false,
};

export default function Questionario() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [finalizado, setFinalizado] = useState(false);

  const totalEtapas = 5;
  const progresso = (etapa / totalEtapas) * 100;

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarEtapa = () => {
    setMensagemErro("");

    if (etapa === 1) {
      if (!formData.nome_completo.trim()) {
        setMensagemErro("Preencha o nome completo.");
        return false;
      }

      if (!formData.idade.trim()) {
        setMensagemErro("Preencha a idade.");
        return false;
      }

      if (!formData.cidade_estado.trim()) {
        setMensagemErro("Preencha cidade / estado.");
        return false;
      }

      if (!formData.telefone_whatsapp.trim()) {
        setMensagemErro("Preencha telefone / WhatsApp.");
        return false;
      }
    }

    if (etapa === 2) {
      if (!formData.motivo_consulta) {
        setMensagemErro("Selecione o motivo da consulta.");
        return false;
      }

      if (!formData.tempo_queixa) {
        setMensagemErro("Selecione há quanto tempo isso acontece.");
        return false;
      }

      if (!formData.intensidade.trim()) {
        setMensagemErro("Informe a intensidade de 0 a 10.");
        return false;
      }
    }

    if (etapa === 3) {
      if (!formData.possui_diagnostico) {
        setMensagemErro("Informe se possui diagnóstico médico.");
        return false;
      }

      if (!formData.usa_medicacao) {
        setMensagemErro("Informe se faz uso de medicação contínua.");
        return false;
      }
    }

    if (etapa === 4) {
      if (!formData.sono) {
        setMensagemErro("Selecione como está seu sono.");
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

    if (etapa === 5) {
      if (!formData.consentimento) {
        setMensagemErro("Você precisa concordar com o termo para enviar.");
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

      const { error } = await supabase.from("respostas_pre_consulta").insert([
        {
          nome_completo: formData.nome_completo.trim(),
          idade: formData.idade ? Number(formData.idade) : null,
          cidade_estado: formData.cidade_estado.trim(),
          profissao: formData.profissao.trim(),
          telefone_whatsapp: formData.telefone_whatsapp.trim(),
          motivo_consulta: formData.motivo_consulta,
          tempo_queixa: formData.tempo_queixa,
          intensidade: formData.intensidade
            ? Number(formData.intensidade)
            : null,
          diagnostico_medico:
            formData.possui_diagnostico === "Sim"
              ? formData.diagnostico_medico.trim()
              : "",
          medicacao_continua:
            formData.usa_medicacao === "Sim"
              ? formData.medicacao_continua.trim()
              : "",
          sono: formData.sono,
          atividade_fisica: formData.atividade_fisica,
          consumo_alcool: formData.consumo_alcool,
          tabagismo: formData.tabagismo,
          consentimento: formData.consentimento,
        },
      ]);

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
      <main className="min-h-screen bg-[#e9eaec] text-slate-800">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(203,213,225,0.45),transparent_30%)]" />

          <div className="relative mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-10 md:px-8">
            <div className="w-full rounded-[32px] border border-white/60 bg-white/65 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 shadow-sm">
                <svg
                  className="h-10 w-10 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <p className="mt-6 text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
                Questionário finalizado
              </p>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Recebemos suas informações com sucesso.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Obrigada por preencher o questionário pré-consulta. Suas
                respostas foram enviadas com segurança e irão contribuir para um
                atendimento mais objetivo, cuidadoso e individualizado.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    Enviado com sucesso
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Segurança
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    Dados tratados com sigilo
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Próximo passo
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    Avaliação pela médica
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Voltar para o início
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/80 px-6 py-4 text-sm font-semibold text-slate-700 transition hover:bg-white"
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

          {mensagemErro && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {mensagemErro}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {etapa === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    name="nome_completo"
                    value={formData.nome_completo}
                    onChange={handleInputChange}
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
                    name="idade"
                    value={formData.idade}
                    onChange={handleInputChange}
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
                    name="cidade_estado"
                    value={formData.cidade_estado}
                    onChange={handleInputChange}
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
                    name="profissao"
                    value={formData.profissao}
                    onChange={handleInputChange}
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
                    name="telefone_whatsapp"
                    value={formData.telefone_whatsapp}
                    onChange={handleInputChange}
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
                  <select
                    name="motivo_consulta"
                    value={formData.motivo_consulta}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Selecione</option>
                    <option value="Ansiedade">Ansiedade</option>
                    <option value="Tristeza ou desânimo">
                      Tristeza ou desânimo
                    </option>
                    <option value="Estresse ou sobrecarga">
                      Estresse ou sobrecarga
                    </option>
                    <option value="Problemas de sono">Problemas de sono</option>
                    <option value="Dificuldade de concentração">
                      Dificuldade de concentração
                    </option>
                    <option value="Avaliação geral de saúde">
                      Avaliação geral de saúde
                    </option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Há quanto tempo isso acontece?
                  </label>
                  <select
                    name="tempo_queixa"
                    value={formData.tempo_queixa}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Selecione</option>
                    <option value="Menos de 1 mês">Menos de 1 mês</option>
                    <option value="1 a 3 meses">1 a 3 meses</option>
                    <option value="3 a 6 meses">3 a 6 meses</option>
                    <option value="Mais de 6 meses">Mais de 6 meses</option>
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
                    name="intensidade"
                    value={formData.intensidade}
                    onChange={handleInputChange}
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
                  <select
                    name="possui_diagnostico"
                    value={formData.possui_diagnostico}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Selecione</option>
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Se sim, qual?
                  </label>
                  <input
                    type="text"
                    name="diagnostico_medico"
                    value={formData.diagnostico_medico}
                    onChange={handleInputChange}
                    disabled={formData.possui_diagnostico !== "Sim"}
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:border-slate-400"
                    placeholder="Ex: hipertensão, diabetes, asma..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Faz uso de medicação contínua?
                  </label>
                  <select
                    name="usa_medicacao"
                    value={formData.usa_medicacao}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Selecione</option>
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Se sim, qual medicação?
                  </label>
                  <input
                    type="text"
                    name="medicacao_continua"
                    value={formData.medicacao_continua}
                    onChange={handleInputChange}
                    disabled={formData.usa_medicacao !== "Sim"}
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus:border-slate-400"
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
                  <select
                    name="sono"
                    value={formData.sono}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Selecione</option>
                    <option value="Bom">Bom</option>
                    <option value="Regular">Regular</option>
                    <option value="Ruim">Ruim</option>
                    <option value="Insônia frequente">Insônia frequente</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Você pratica atividade física?
                  </label>
                  <select
                    name="atividade_fisica"
                    value={formData.atividade_fisica}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Selecione</option>
                    <option value="Não">Não</option>
                    <option value="1–2 vezes por semana">
                      1–2 vezes por semana
                    </option>
                    <option value="3–4 vezes por semana">
                      3–4 vezes por semana
                    </option>
                    <option value="5 ou mais vezes por semana">
                      5 ou mais vezes por semana
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Consumo de álcool
                  </label>
                  <select
                    name="consumo_alcool"
                    value={formData.consumo_alcool}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Selecione</option>
                    <option value="Não">Não</option>
                    <option value="Ocasionalmente">Ocasionalmente</option>
                    <option value="Frequentemente">Frequentemente</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Tabagismo
                  </label>
                  <select
                    name="tabagismo"
                    value={formData.tabagismo}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-300 bg-[#f5f5f6] px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Selecione</option>
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                    <option value="Ex-fumante">Ex-fumante</option>
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
                  <input
                    type="checkbox"
                    name="consentimento"
                    checked={formData.consentimento}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <span>Li e concordo com as informações acima.</span>
                </label>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={voltar}
                disabled={etapa === 1 || enviando}
                className="rounded-2xl border border-slate-300 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Voltar
              </button>

              {etapa < totalEtapas ? (
                <button
                  type="button"
                  onClick={avancar}
                  disabled={enviando}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Próxima etapa
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={enviando}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {enviando ? "Enviando..." : "Finalizar questionário"}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}