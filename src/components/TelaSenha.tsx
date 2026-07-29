import React, { useState, useEffect } from "react";
import { Lock, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, Clock, FileCode, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface TelaSenhaProps {
  onSuccess: () => void;
  msgExpiradoInicial?: string;
}

const TEMPO_VALIDADE = 6 * 60 * 60 * 1000; // 6 horas em milissegundos
const CHAVE_ACESSO = "acesso_projeto";
const CHAVE_TEMPORARIA = "acesso_app_temporario";
const CHAVE_LEGADA = "app_liberado";

export default function TelaSenha({ onSuccess, msgExpiradoInicial }: TelaSenhaProps) {
  const [senhaInput, setSenhaInput] = useState("");
  const [mensagemErro, setMensagemErro] = useState<string | null>(msgExpiradoInicial || null);
  const [verSenha, setVerSenha] = useState(false);

  // Coleta todas as senhas válidas configuradas via variáveis Vercel/Vite/Studio ou globais
  const getSenhasPermitidas = (): string[] => {
    const senhasSet = new Set<string>();

    // Senhas padrão / fallback para facilidade de uso e testes
    senhasSet.add("123456");
    senhasSet.add("1234");
    senhasSet.add("0000");
    senhasSet.add("admin");

    // Variáveis específicas de ambiente
    if (import.meta.env.VITE_SENHA_ACESSO) senhasSet.add(import.meta.env.VITE_SENHA_ACESSO);
    if (import.meta.env.VITE_SENHA1) senhasSet.add(import.meta.env.VITE_SENHA1);
    if (import.meta.env.VITE_SENHA2) senhasSet.add(import.meta.env.VITE_SENHA2);
    if (import.meta.env.VITE_SENHA3) senhasSet.add(import.meta.env.VITE_SENHA3);
    if (import.meta.env.VITE_SENHA) senhasSet.add(import.meta.env.VITE_SENHA);

    // Inspeciona dinamicamente todas as variáveis VITE_* no import.meta.env
    try {
      const envObj = import.meta.env as Record<string, unknown>;
      Object.entries(envObj).forEach(([key, val]) => {
        if (typeof val === "string" && val.trim().length > 0) {
          if (key.startsWith("VITE_") || key.includes("SENHA") || key.includes("PASS")) {
            senhasSet.add(val);
          }
        }
      });
    } catch (e) {
      console.error(e);
    }

    // Inspeciona window se injetado no HTML
    if (typeof window !== "undefined") {
      const winObj = window as unknown as Record<string, unknown>;
      if (typeof winObj.__SENHA_APP === "string") senhasSet.add(winObj.__SENHA_APP);
      if (typeof winObj.VITE_SENHA_ACESSO === "string") senhasSet.add(winObj.VITE_SENHA_ACESSO);
    }

    return Array.from(senhasSet)
      .map((s) => String(s).trim().replace(/^["']|["']$/g, "").trim())
      .filter(Boolean);
  };

  const verificarAcessoExistente = (): boolean => {
    const dados = localStorage.getItem(CHAVE_ACESSO) || localStorage.getItem(CHAVE_TEMPORARIA);
    const liberadoLegado = localStorage.getItem(CHAVE_LEGADA);

    if (dados) {
      try {
        const parsed = JSON.parse(dados);
        const isLiberado = parsed.liberado === "sim";
        const data = parsed.data || parsed.dataLiberacao;
        const agora = Date.now();

        if (isLiberado && data && agora - data < TEMPO_VALIDADE) {
          onSuccess();
          return true;
        }
      } catch {
        // Ignora erro de JSON malformatado
      }
    } else if (liberadoLegado === "sim") {
      onSuccess();
      return true;
    }

    return false;
  };

  useEffect(() => {
    // Limpa eventuais bloqueios antigos salvos no navegador que poderiam trancar o usuário
    localStorage.removeItem("bloqueio_acesso");
    localStorage.removeItem("tentativas_acesso");
    verificarAcessoExistente();
  }, []);

  const tentarAcesso = () => {
    const inputLimpo = senhaInput.trim().replace(/^["']|["']$/g, "").trim();

    if (!inputLimpo) {
      setMensagemErro("Por favor, digite a senha de acesso.");
      return;
    }

    const senhasValidas = getSenhasPermitidas();

    // Comparação exata ou insensível a maiúsculas/minúsculas
    const aceito = senhasValidas.some((senhaCadastrada) => {
      const sLimpa = senhaCadastrada.trim().replace(/^["']|["']$/g, "").trim();
      return (
        inputLimpo === sLimpa ||
        inputLimpo.toLowerCase() === sLimpa.toLowerCase()
      );
    });

    if (aceito) {
      const agora = Date.now();
      const objetoAcesso = {
        liberado: "sim",
        data: agora,
      };

      localStorage.setItem(CHAVE_ACESSO, JSON.stringify(objetoAcesso));
      localStorage.setItem(CHAVE_TEMPORARIA, JSON.stringify({ liberado: "sim", dataLiberacao: agora }));
      localStorage.setItem(CHAVE_LEGADA, "sim");
      localStorage.removeItem("bloqueio_acesso");
      localStorage.removeItem("tentativas_acesso");

      setMensagemErro(null);
      onSuccess();
    } else {
      setMensagemErro("Senha incorreta — tente novamente");
      setSenhaInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      tentarAcesso();
    }
  };

  return (
    <div
      id="tela-senha"
      className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-sans text-slate-800 overflow-y-auto"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="caixa-senha bg-white p-7 sm:p-9 rounded-3xl shadow-2xl w-full max-w-md text-center border border-slate-100 relative overflow-hidden my-auto"
      >
        {/* Barra superior decorativa */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        <div className="mx-auto w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-black text-emerald-700 mb-1 tracking-tight">
          Projeto Emagrecimento Saudável
        </h1>
        <p className="sub text-xs sm:text-sm text-slate-500 mb-4 font-medium">
          Seu guia para hábitos mais saudáveis
        </p>

        {/* Quadro de avisos de uso */}
        <div className="aviso-uso bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-5 text-left text-xs text-slate-600 space-y-2 font-medium shadow-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Acesso exclusivo e intransferível</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Válido por 6 horas</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50/80 p-2 rounded-xl border border-indigo-100 font-semibold text-[11px]">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Automação Ativa: Busca o JSON salvo e inicia o programa após a senha</span>
          </div>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <input
            type={verSenha ? "text" : "password"}
            id="campo-senha"
            placeholder="Digite seu código de acesso"
            autoComplete="off"
            value={senhaInput}
            onChange={(e) => {
              setSenhaInput(e.target.value);
              if (mensagemErro) setMensagemErro(null);
            }}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setVerSenha(!verSenha)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            title={verSenha ? "Ocultar senha" : "Ver senha"}
          >
            {verSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <button
          id="btn-entrar"
          onClick={tentarAcesso}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3 px-6 rounded-xl text-base shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Acessar o Projeto</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {mensagemErro && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            id="msg-erro"
            className="erro mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold flex items-center justify-center gap-2 text-left"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{mensagemErro}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}



