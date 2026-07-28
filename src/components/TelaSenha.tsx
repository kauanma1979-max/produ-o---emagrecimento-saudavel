import React, { useState, useEffect } from "react";
import { Lock, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TelaSenhaProps {
  onSuccess: () => void;
}

export default function TelaSenha({ onSuccess }: TelaSenhaProps) {
  const [senhaInput, setSenhaInput] = useState("");
  const [mostrarErro, setMostrarErro] = useState(false);
  const [verSenha, setVerSenha] = useState(false);

  // Obtém a senha da variável de ambiente VITE_SENHA_ACESSO, de window.__SENHA_APP ou usa fallback padrão "123456"
  const envSenha = (import.meta as unknown as { env?: { VITE_SENHA_ACESSO?: string } }).env?.VITE_SENHA_ACESSO;
  const SENHA_CORRETA =
    envSenha ||
    (typeof window !== "undefined" && (window as unknown as Record<string, string>).__SENHA_APP) ||
    "123456";

  const tentarAcesso = () => {
    // Normaliza comparação sem espaços em branco no início/fim
    if (senhaInput.trim() === SENHA_CORRETA || (SENHA_CORRETA === "123456" && (senhaInput === "123456" || senhaInput === "1234"))) {
      localStorage.setItem("app_liberado", "sim");
      onSuccess();
    } else {
      setMostrarErro(true);
      setSenhaInput("");
      setTimeout(() => {
        setMostrarErro(false);
      }, 3000);
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
      className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-sans text-slate-800"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="caixa bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-slate-100 relative overflow-hidden"
      >
        {/* Top decorative bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

        <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">
          Acesso Protegido
        </h2>
        <p className="text-sm text-slate-500 mb-6 font-medium">
          Digite a senha de acesso para liberar o aplicativo.
        </p>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <input
            type={verSenha ? "text" : "password"}
            id="campo-senha"
            placeholder="Senha..."
            autoComplete="off"
            value={senhaInput}
            onChange={(e) => setSenhaInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 font-medium text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-base shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Entrar</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {mostrarErro && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            id="msg-erro"
            className="erro mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold flex items-center justify-center gap-2"
            style={{ display: "flex" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Senha incorreta — tente novamente</span>
          </motion.div>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400 flex flex-col gap-1">
          <p className="font-semibold text-slate-500">Projeto Emagrecimento Saudável</p>
          <p className="text-[11px]">
            Dica: Configure a variável <code className="bg-slate-100 text-emerald-700 px-1 py-0.5 rounded font-mono">VITE_SENHA_ACESSO</code> no ambiente Vercel/Studio.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
