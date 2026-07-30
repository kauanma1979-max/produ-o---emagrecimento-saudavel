import React, { useState, useEffect } from "react";
import { Lock, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, AlertTriangle, Key } from "lucide-react";
import { motion } from "motion/react";

interface TelaSenhaProps {
  onSuccess: () => void;
  msgExpiradoInicial?: string;
}

export const CONFIG = {
  MAX_TENTATIVAS: 3,
  TEMPO_BLOQUEIO: 600000, // 10 minutos em ms
  CHAVE_ACESSO: "acesso_seguro_v2",
  CHAVE_TENTATIVAS: "tentativas_seguro_v2",
  CHAVE_BLOQUEIO: "bloqueio_seguro_v2",
  CHAVE_SELO_USO: "SENHAS_USADAS_V2",
  CHAVE_SECRETA: "projetoemagrecimento2026vercelsumare2026",
};

export function gerarIdDispositivo(): string {
  if (typeof window === "undefined") return "dispositivo_padrao";
  const dados = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    navigator.language,
    navigator.platform || "",
  ].join("|");
  try {
    return btoa(dados).replace(/=/g, "").slice(0, 40);
  } catch {
    return dados.slice(0, 40);
  }
}

export function gerarAssinatura(texto: string, chave: string): string {
  let saida = "";
  for (let i = 0; i < texto.length; i++) {
    saida += String.fromCharCode(texto.charCodeAt(i) + chave.charCodeAt(i % chave.length));
  }
  try {
    return btoa(saida).replace(/=/g, "").slice(0, 20);
  } catch {
    return "";
  }
}

export interface ItemAcesso {
  senha: string;
  validade: number; // ms (0 = Admin Infinito)
  valida?: boolean;
}

export function carregarSenhasValidas(): ItemAcesso[] {
  let usadas: string[] = [];
  try {
    const rawUsadas = localStorage.getItem(CONFIG.CHAVE_SELO_USO);
    if (rawUsadas) {
      usadas = JSON.parse(rawUsadas);
    }
  } catch {
    usadas = [];
  }

  // Senha padrão 12726658 com acesso de Administrador Infinito (validade: 0)
  const lista: ItemAcesso[] = [
    { senha: "12726658", validade: 0, valida: true },
  ];

  try {
    const env = import.meta.env as Record<string, unknown>;
    Object.entries(env || {}).forEach(([chave, valor]) => {
      if (chave.startsWith("VITE_SENHA") || chave.includes("SENHA") || chave.includes("PASS")) {
        if (typeof valor === "string" && valor.trim().length > 0) {
          const partes = valor.split("|");
          const s = partes[0]?.trim().replace(/^["']|["']$/g, "").trim();
          const valMs = partes[1] !== undefined ? parseInt(partes[1].trim(), 10) : 86400000;
          const assinatura = partes[2]?.trim();

          if (s) {
            let ehValida = true;
            if (assinatura) {
              const gerada = gerarAssinatura(`${s}|${valMs}`, CONFIG.CHAVE_SECRETA);
              ehValida = (assinatura === gerada);
            }
            if (ehValida) {
              lista.push({
                senha: s,
                validade: isNaN(valMs) ? 86400000 : valMs,
                valida: true,
              });
            }
          }
        }
      }
    });
  } catch (e) {
    console.error("Erro ao carregar senhas de ambiente:", e);
  }

  // Filtra senhas válidas e exclui senhas comuns que já foram usadas
  return lista.filter((item) => {
    if (!item.valida) return false;
    if (item.validade === 0) return true; // Admin livre
    return !usadas.includes(item.senha);
  });
}

// Marca senha comum como usada para sempre
export function marcarSenhaComoUsada(senha: string) {
  if (!senha) return;
  try {
    const raw = localStorage.getItem(CONFIG.CHAVE_SELO_USO);
    const usadas: string[] = raw ? JSON.parse(raw) : [];
    if (!usadas.includes(senha)) {
      usadas.push(senha);
      localStorage.setItem(CONFIG.CHAVE_SELO_USO, JSON.stringify(usadas));
    }
  } catch (e) {
    console.error("Erro ao marcar senha usada:", e);
  }
}

export default function TelaSenha({ onSuccess, msgExpiradoInicial }: TelaSenhaProps) {
  const [senhaInput, setSenhaInput] = useState("");
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: "erro" | "aviso" | "sucesso" } | null>(
    msgExpiradoInicial ? { texto: msgExpiradoInicial, tipo: "erro" } : null
  );
  const [verSenha, setVerSenha] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);

  const verificarBloqueio = (): boolean => {
    const timestampBloqueio = localStorage.getItem(CONFIG.CHAVE_BLOQUEIO);
    if (!timestampBloqueio) {
      setBloqueado(false);
      return false;
    }

    const decorrido = Date.now() - parseInt(timestampBloqueio, 10);
    if (decorrido < CONFIG.TEMPO_BLOQUEIO) {
      const restanteMin = Math.ceil((CONFIG.TEMPO_BLOQUEIO - decorrido) / 60000);
      setMensagem({
        texto: `Bloqueado — tente novamente em ${restanteMin} minutos`,
        tipo: "aviso",
      });
      setBloqueado(true);
      return true;
    }

    localStorage.removeItem(CONFIG.CHAVE_BLOQUEIO);
    localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, "0");
    setBloqueado(false);
    return false;
  };

  const verificarAcesso = (): boolean => {
    if (verificarBloqueio()) return false;

    const raw = localStorage.getItem(CONFIG.CHAVE_ACESSO);
    if (!raw) return false;

    try {
      const dados = JSON.parse(raw);
      if (!dados) return false;

      // 🔑 REGRA DE ADMINISTRADOR: VALIDADE INFINITA E LIVRE DE DISPOSITIVO
      if (dados.validade === 0) {
        onSuccess();
        return true;
      }

      // 👤 REGRA DE USUÁRIO COMUM: DISPOSITIVO E TEMPO
      const idAtual = gerarIdDispositivo();
      if (dados.dispositivo && dados.dispositivo !== idAtual) {
        localStorage.removeItem(CONFIG.CHAVE_ACESSO);
        setMensagem({
          texto: "Acesso só permitido no aparelho original",
          tipo: "erro",
        });
        return false;
      }

      if (dados.inicio && dados.validade && Date.now() - dados.inicio > dados.validade) {
        if (dados.senhaUsada || dados.senha) {
          marcarSenhaComoUsada(dados.senhaUsada || dados.senha);
        }
        localStorage.removeItem(CONFIG.CHAVE_ACESSO);
        localStorage.removeItem("acesso_projeto");
        localStorage.removeItem("acesso_app_temporario");
        localStorage.removeItem("app_liberado");

        setMensagem({
          texto: "Acesso expirou — solicite nova liberação",
          tipo: "erro",
        });
        return false;
      }

      onSuccess();
      return true;
    } catch {
      localStorage.removeItem(CONFIG.CHAVE_ACESSO);
      return false;
    }
  };

  useEffect(() => {
    verificarAcesso();
  }, []);

  const tentarAcesso = () => {
    if (verificarBloqueio()) return;

    let tentativas = parseInt(localStorage.getItem(CONFIG.CHAVE_TENTATIVAS) || "0", 10);
    if (tentativas >= CONFIG.MAX_TENTATIVAS) {
      localStorage.setItem(CONFIG.CHAVE_BLOQUEIO, Date.now().toString());
      verificarBloqueio();
      return;
    }

    const senhaInformada = senhaInput.trim().replace(/^["']|["']$/g, "").trim();

    if (!senhaInformada) {
      setMensagem({ texto: "Digite sua senha de acesso.", tipo: "aviso" });
      return;
    }

    const lista = carregarSenhasValidas();
    const acesso = lista.find(
      (item) => item.senha === senhaInformada || item.senha.toLowerCase() === senhaInformada.toLowerCase()
    );

    if (!acesso) {
      tentativas += 1;
      localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, tentativas.toString());

      if (tentativas >= CONFIG.MAX_TENTATIVAS) {
        localStorage.setItem(CONFIG.CHAVE_BLOQUEIO, Date.now().toString());
        verificarBloqueio();
      } else {
        setMensagem({
          texto: "Senha inválida ou já utilizada/expirada",
          tipo: "erro",
        });
      }
      setSenhaInput("");
      return;
    }

    // 🔑 REGRA ESPECIAL: ADMINISTRADOR (validade === 0)
    if (acesso.validade === 0) {
      const objetoAcesso = {
        inicio: Date.now(),
        validade: 0,
        dispositivo: "ADMIN_LIVRE",
        senhaUsada: acesso.senha,
        senha: acesso.senha,
        liberado: "sim",
      };

      localStorage.setItem(CONFIG.CHAVE_ACESSO, JSON.stringify(objetoAcesso));
      localStorage.setItem("acesso_projeto", JSON.stringify({ liberado: "sim", data: Date.now() }));
      localStorage.setItem("acesso_app_temporario", JSON.stringify({ liberado: "sim", dataLiberacao: Date.now() }));
      localStorage.setItem("app_liberado", "sim");
      localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, "0");
      localStorage.removeItem(CONFIG.CHAVE_BLOQUEIO);

      setMensagem({ texto: "Acesso de Administrador Autorizado!", tipo: "sucesso" });
      setTimeout(() => {
        onSuccess();
      }, 300);
      return;
    }

    // 👤 REGRA PARA USUÁRIOS COMUNS (validade > 0)
    // Marca como usada para sempre
    marcarSenhaComoUsada(acesso.senha);

    const agora = Date.now();
    const idDispositivo = gerarIdDispositivo();
    const objetoAcesso = {
      inicio: agora,
      validade: acesso.validade,
      dispositivo: idDispositivo,
      senhaUsada: acesso.senha,
      senha: acesso.senha,
      liberado: "sim",
    };

    localStorage.setItem(CONFIG.CHAVE_ACESSO, JSON.stringify(objetoAcesso));
    localStorage.setItem("acesso_projeto", JSON.stringify({ liberado: "sim", data: agora }));
    localStorage.setItem("acesso_app_temporario", JSON.stringify({ liberado: "sim", dataLiberacao: agora }));
    localStorage.setItem("app_liberado", "sim");
    localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, "0");
    localStorage.removeItem(CONFIG.CHAVE_BLOQUEIO);

    setMensagem({ texto: "Acesso autorizado! Carregando...", tipo: "sucesso" });
    setTimeout(() => {
      onSuccess();
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !bloqueado) {
      tentarAcesso();
    }
  };

  return (
    <div
      id="telaSenha"
      className="fixed inset-0 bg-[#263238]/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-sans text-[#263238] overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="caixa-acesso bg-white p-7 sm:p-9 rounded-3xl shadow-2xl w-full max-w-md text-center border border-slate-100 relative overflow-hidden my-auto"
      >
        {/* Barra superior decorativa com gradiente Verde + Azul */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#2E7D32] via-[#1976D2] to-[#2E7D32]" />

        <div className="mx-auto w-14 h-14 bg-[#E8F5E9] text-[#2E7D32] rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-[#2E7D32]/20">
          <Lock className="w-7 h-7 text-[#2E7D32]" />
        </div>

        <h1 className="logo text-xl sm:text-2xl font-black text-[#2E7D32] mb-1 uppercase tracking-tight">
          PROJETO EMAGRECIMENTO SAUDÁVEL
        </h1>
        <p className="subtitulo text-xs sm:text-sm text-[#607D8B] mb-5 font-medium">
          Acesso exclusivo com controle de validade
        </p>

        {/* Quadro informativo de segurança */}
        <div className="bg-[#F5F7FA] border border-slate-200/80 rounded-2xl p-3.5 mb-5 text-left text-xs text-[#607D8B] space-y-1.5 font-medium shadow-2xs">
          <div className="flex items-center gap-2 text-[#263238] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
            <span>Sistema de Acesso Restrito &amp; Seguro</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            As senhas comuns têm uso único e ficam vinculadas ao primeiro dispositivo utilizado. O acesso de administrador possui validade irrestrita.
          </p>
        </div>

        {/* Campo de Senha */}
        <div className="grupo-campo text-left mb-4">
          <label htmlFor="campoSenha" className="block text-xs font-bold text-[#263238] mb-1.5 uppercase tracking-wider">
            Digite sua senha de acesso
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#607D8B]">
              <KeyRound className="w-5 h-5" />
            </div>
            <input
              type={verSenha ? "text" : "password"}
              id="campoSenha"
              placeholder="Digite sua senha"
              autoComplete="off"
              disabled={bloqueado}
              value={senhaInput}
              onChange={(e) => {
                setSenhaInput(e.target.value);
                if (mensagem && mensagem.tipo === "erro") setMensagem(null);
              }}
              onKeyDown={handleKeyDown}
              className="w-full pl-11 pr-11 py-3 bg-[#F5F7FA] border border-[#B0BEC5] rounded-xl text-[#263238] placeholder:text-slate-400 font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setVerSenha(!verSenha)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#607D8B] hover:text-[#263238] cursor-pointer"
              title={verSenha ? "Ocultar senha" : "Ver senha"}
            >
              {verSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Botão Entrar */}
        <button
          id="btnEntrar"
          onClick={tentarAcesso}
          disabled={bloqueado}
          className="btn-entrar w-full bg-gradient-to-r from-[#2E7D32] to-[#1976D2] hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 px-6 rounded-xl text-sm sm:text-base shadow-lg shadow-[#2E7D32]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Acessar Sistema</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Mensagem de Erro / Aviso / Sucesso */}
        {mensagem && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            id="msgErro"
            className={`mensagem mt-4 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-left ${
              mensagem.tipo === "erro"
                ? "erro bg-[#FFEBEE] border border-[#D32F2F]/20 text-[#D32F2F]"
                : mensagem.tipo === "aviso"
                ? "aviso bg-amber-50 border border-amber-300/40 text-[#F57C00]"
                : "sucesso bg-emerald-50 border border-emerald-300/40 text-[#2E7D32]"
            }`}
          >
            {mensagem.tipo === "erro" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : mensagem.tipo === "aviso" ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 shrink-0" />
            )}
            <span>{mensagem.texto}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

