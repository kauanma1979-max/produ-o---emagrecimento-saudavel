import React, { useState, useEffect } from "react";
import { Lock, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, Smartphone, Clock } from "lucide-react";
import { motion } from "motion/react";

interface TelaSenhaProps {
  onSuccess: () => void;
  msgExpiradoInicial?: string;
}

const TEMPO_VALIDADE = 6 * 60 * 60 * 1000; // 6 horas em milissegundos
const MAX_TENTATIVAS = 3;
const TEMPO_BLOQUEIO = 3600000; // 1 hora de bloqueio após errar 3 vezes
const CHAVE_ACESSO = "acesso_projeto";
const CHAVE_TENTATIVAS = "tentativas_acesso";
const CHAVE_BLOQUEIO = "bloqueio_acesso";

// Gera um ID único e consistente do dispositivo para vincular o acesso
function gerarIdDispositivo(): string {
  if (typeof window === "undefined") return "server-id";
  const dados = [
    navigator.userAgent,
    window.screen?.width + "x" + window.screen?.height,
    navigator.language,
    new Date().getTimezoneOffset(),
  ].join("|");
  
  try {
    return btoa(dados).slice(0, 32);
  } catch {
    return "dev-id-fallback";
  }
}

export default function TelaSenha({ onSuccess, msgExpiradoInicial }: TelaSenhaProps) {
  const [senhaInput, setSenhaInput] = useState("");
  const [mensagemErro, setMensagemErro] = useState<string | null>(msgExpiradoInicial || null);
  const [verSenha, setVerSenha] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);

  // Obtém lista de senhas permitidas a partir de variáveis de ambiente Vercel / Studio ou window.__SENHA_APP
  const envMeta = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
  const senhasPermitidas = [
    envMeta.VITE_SENHA_ACESSO,
    envMeta.VITE_SENHA1,
    envMeta.VITE_SENHA2,
    envMeta.VITE_SENHA3,
    typeof window !== "undefined" ? (window as unknown as Record<string, string>).__SENHA_APP : undefined,
    "123456",
    "1234"
  ].filter((s): s is string => Boolean(s && s.trim().length > 0));

  // Verifica se o usuário está temporariamente bloqueado por muitas tentativas
  const verificarBloqueio = (): boolean => {
    const dataBloqueioStr = localStorage.getItem(CHAVE_BLOQUEIO);
    if (!dataBloqueioStr) {
      setBloqueado(false);
      return false;
    }

    const dataBloqueio = parseInt(dataBloqueioStr, 10);
    const decorrido = Date.now() - dataBloqueio;

    if (decorrido < TEMPO_BLOQUEIO) {
      const minutosRestantes = Math.ceil((TEMPO_BLOQUEIO - decorrido) / 60000);
      setMensagemErro(`Bloqueado por segurança — tente novamente em ${minutosRestantes} minuto(s)`);
      setBloqueado(true);
      return true;
    }

    // Tempo de bloqueio expirou: reseta tentativas
    localStorage.removeItem(CHAVE_BLOQUEIO);
    localStorage.setItem(CHAVE_TENTATIVAS, "0");
    setBloqueado(false);
    return false;
  };

  const verificarAcessoExistente = (): boolean => {
    if (verificarBloqueio()) return false;

    // Tenta chave nova e chave legada
    const dados = localStorage.getItem(CHAVE_ACESSO) || localStorage.getItem("acesso_app_temporario");
    if (!dados) {
      if (localStorage.getItem("app_liberado") === "sim") {
        onSuccess();
        return true;
      }
      return false;
    }

    try {
      const parsed = JSON.parse(dados);
      const liberado = parsed.liberado;
      const data = parsed.data || parsed.dataLiberacao;
      const dispositivo = parsed.dispositivo;
      const idAtual = gerarIdDispositivo();
      const agora = Date.now();

      // Caso tenha binding por dispositivo, deve conferir; se for de sessão antiga sem dispositivo, libera se dentro da validade
      const dispositivoValido = !dispositivo || dispositivo === idAtual;

      if (liberado === "sim" && dispositivoValido && agora - data < TEMPO_VALIDADE) {
        onSuccess();
        return true;
      }

      localStorage.removeItem(CHAVE_ACESSO);
      localStorage.removeItem("acesso_app_temporario");
      localStorage.removeItem("app_liberado");
      
      if (!dispositivoValido) {
        setMensagemErro("Acesso não permitido neste dispositivo");
      } else {
        setMensagemErro("Seu acesso expirou — digite a senha novamente");
      }
    } catch {
      localStorage.removeItem(CHAVE_ACESSO);
      localStorage.removeItem("acesso_app_temporario");
      localStorage.removeItem("app_liberado");
    }
    return false;
  };

  useEffect(() => {
    verificarAcessoExistente();
    const interval = setInterval(() => {
      verificarAcessoExistente();
    }, 10000); // Checa periodicamente
    return () => clearInterval(interval);
  }, []);

  const tentarAcesso = () => {
    if (verificarBloqueio()) return;

    const tentativas = parseInt(localStorage.getItem(CHAVE_TENTATIVAS) || "0", 10);
    if (tentativas >= MAX_TENTATIVAS) {
      localStorage.setItem(CHAVE_BLOQUEIO, Date.now().toString());
      verificarBloqueio();
      return;
    }

    const senhaDigitada = senhaInput.trim();
    const senhaValida = senhasPermitidas.some(
      (s) => s.trim() === senhaDigitada
    );

    if (senhaValida) {
      const objetoAcesso = {
        liberado: "sim",
        data: Date.now(),
        dispositivo: gerarIdDispositivo(),
      };
      localStorage.setItem(CHAVE_ACESSO, JSON.stringify(objetoAcesso));
      localStorage.setItem("acesso_app_temporario", JSON.stringify({
        liberado: "sim",
        dataLiberacao: Date.now(),
      }));
      localStorage.setItem("app_liberado", "sim");
      localStorage.setItem(CHAVE_TENTATIVAS, "0");
      setMensagemErro(null);
      onSuccess();
    } else {
      const novasTentativas = tentativas + 1;
      localStorage.setItem(CHAVE_TENTATIVAS, novasTentativas.toString());

      if (novasTentativas >= MAX_TENTATIVAS) {
        localStorage.setItem(CHAVE_BLOQUEIO, Date.now().toString());
        verificarBloqueio();
      } else {
        const restantes = MAX_TENTATIVAS - novasTentativas;
        setMensagemErro(`Código inválido — ${restantes} tentativa(s) restante(s)`);
      }
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
        <div className="aviso-uso bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-5 text-left text-xs text-slate-600 space-y-1.5 font-medium shadow-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Acesso exclusivo e intransferível</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Válido por 6 horas</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Smartphone className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Funciona apenas neste dispositivo</span>
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
            disabled={bloqueado}
            onChange={(e) => setSenhaInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            autoFocus
          />
          <button
            type="button"
            disabled={bloqueado}
            onClick={() => setVerSenha(!verSenha)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-50"
            title={verSenha ? "Ocultar senha" : "Ver senha"}
          >
            {verSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <button
          id="btn-entrar"
          onClick={tentarAcesso}
          disabled={bloqueado}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3 px-6 rounded-xl text-base shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
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


