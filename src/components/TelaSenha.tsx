import React, { useState, useEffect } from "react";
import { Lock, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, AlertTriangle, UserPlus, LogIn, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { definirContextoSeguranca } from "../lib/supabase";

interface TelaSenhaProps {
  onSuccess: () => void;
  msgExpiradoInicial?: string;
}

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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

export function gerarIdAparelho(): string {
  return gerarIdDispositivo();
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
  const [abaAtiva, setAbaAtiva] = useState<"pin" | "login" | "cadastrar">("pin");
  const [senhaInput, setSenhaInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [nomeInput, setNomeInput] = useState("");
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: "erro" | "aviso" | "sucesso" } | null>(
    msgExpiradoInicial ? { texto: msgExpiradoInicial, tipo: "erro" } : null
  );
  const [verSenha, setVerSenha] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);

  const verificarBloqueio = (): boolean => {
    const timestampBloqueio = localStorage.getItem("bloq") || localStorage.getItem(CONFIG.CHAVE_BLOQUEIO);
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

    localStorage.removeItem("bloq");
    localStorage.removeItem(CONFIG.CHAVE_BLOQUEIO);
    localStorage.setItem("tent", "0");
    localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, "0");
    setBloqueado(false);
    return false;
  };

  const verificarAcesso = async (): Promise<boolean> => {
    if (verificarBloqueio()) return false;

    const rawOk = localStorage.getItem("acesso_ok");
    const rawAcesso = localStorage.getItem(CONFIG.CHAVE_ACESSO);

    let senhaSalva = "";
    if (rawOk) {
      try {
        const parsed = JSON.parse(rawOk);
        senhaSalva = parsed?.senha || "";
      } catch {
        senhaSalva = rawOk;
      }
    }
    if (!senhaSalva && rawAcesso) {
      try {
        const parsed = JSON.parse(rawAcesso);
        senhaSalva = parsed?.senhaUsada || parsed?.senha || "";
      } catch {}
    }

    if (senhaSalva && supabase) {
      try {
        const { data, error } = await supabase
          .from("senhas_acesso")
          .select("*")
          .eq("senha", senhaSalva)
          .maybeSingle();

        if (!error && data) {
          const idAparelhoLocal = gerarIdAparelho();
          const idApBanco = data.id_aparelho || data.dispositivo_vinculado;
          const primeiroAcesso = data.primeiro_acesso ? new Date(data.primeiro_acesso).getTime() : null;
          const validoAte = primeiroAcesso
            ? primeiroAcesso + (data.validade_ms || 86400000)
            : (data.valido_ate ? (typeof data.valido_ate === "number" ? data.valido_ate : new Date(data.valido_ate).getTime()) : null);

          if (validoAte && Date.now() > validoAte && data.tipo !== "admin") {
            localStorage.removeItem("acesso_ok");
            localStorage.removeItem(CONFIG.CHAVE_ACESSO);
            setMensagem({ texto: "Essa senha expirou", tipo: "erro" });
            return false;
          }

          if (idApBanco && idApBanco !== idAparelhoLocal && data.tipo !== "admin") {
            localStorage.removeItem("acesso_ok");
            localStorage.removeItem(CONFIG.CHAVE_ACESSO);
            setMensagem({ texto: "Essa senha já foi usada em outro dispositivo", tipo: "erro" });
            return false;
          }

          // ✅ Define o contexto de segurança com a senha logada
          await definirContextoSeguranca(senhaSalva, data.tipo === "admin");

          onSuccess();
          return true;
        }
      } catch (err) {
        console.warn("Consulta Supabase ao verificar acesso:", err);
      }
    }

    if (rawAcesso) {
      try {
        const dados = JSON.parse(rawAcesso);
        if (dados) {
          if (dados.validade === 0) {
            onSuccess();
            return true;
          }

          const idAtual = gerarIdDispositivo();
          if (dados.dispositivo && dados.dispositivo !== idAtual) {
            localStorage.removeItem(CONFIG.CHAVE_ACESSO);
            setMensagem({ texto: "Acesso só permitido no aparelho original", tipo: "erro" });
            return false;
          }

          if (dados.inicio && dados.validade && Date.now() - dados.inicio > dados.validade) {
            marcarSenhaComoUsada(dados.senhaUsada || dados.senha);
            localStorage.removeItem(CONFIG.CHAVE_ACESSO);
            localStorage.removeItem("acesso_ok");
            setMensagem({ texto: "Acesso expirou — solicite nova liberação", tipo: "erro" });
            return false;
          }

          onSuccess();
          return true;
        }
      } catch {
        localStorage.removeItem(CONFIG.CHAVE_ACESSO);
      }
    }

    return false;
  };

  useEffect(() => {
    verificarAcesso();
  }, []);

  const tentarAcesso = async () => {
    if (verificarBloqueio()) return;

    let tentativas = parseInt(
      localStorage.getItem("tent") || localStorage.getItem(CONFIG.CHAVE_TENTATIVAS) || "0",
      10
    );
    if (tentativas >= CONFIG.MAX_TENTATIVAS) {
      localStorage.setItem("bloq", Date.now().toString());
      localStorage.setItem(CONFIG.CHAVE_BLOQUEIO, Date.now().toString());
      verificarBloqueio();
      return;
    }

    const senha = senhaInput.trim().replace(/^["']|["']$/g, "").trim();

    if (!senha) {
      setMensagem({ texto: "Digite sua senha de acesso.", tipo: "aviso" });
      return;
    }

    // 1. TENTA PRIMEIRO VIA SUPABASE
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("senhas_acesso")
          .select("*")
          .eq("senha", senha)
          .maybeSingle();

        if (!error && data) {
          const idAparelhoLocal = gerarIdAparelho();
          const idApBanco = data.id_aparelho || data.dispositivo_vinculado;
          const primeiroAcesso = data.primeiro_acesso ? new Date(data.primeiro_acesso).getTime() : null;
          const validoAte = primeiroAcesso
            ? primeiroAcesso + (data.validade_ms || 86400000)
            : (data.valido_ate ? (typeof data.valido_ate === "number" ? data.valido_ate : new Date(data.valido_ate).getTime()) : null);

          // ❌ É ADMIN: LIBERA TOTAL
          if (data.tipo === "admin") {
            localStorage.setItem("acesso_ok", JSON.stringify({ senha }));
            localStorage.setItem("tent", "0");
            localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, "0");
            localStorage.removeItem("bloq");
            localStorage.removeItem(CONFIG.CHAVE_BLOQUEIO);

            await definirContextoSeguranca(senha, true);
            setMensagem({ texto: "✅ Acesso liberado!", tipo: "sucesso" });
            setTimeout(() => {
              onSuccess();
            }, 300);
            return;
          }

          // ❌ JÁ EXPIROU
          if (validoAte && Date.now() > validoAte) {
            tentativas++;
            localStorage.setItem("tent", tentativas.toString());
            localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, tentativas.toString());
            setMensagem({ texto: "Essa senha expirou", tipo: "erro" });
            setSenhaInput("");
            return;
          }

          // 🔒 BARRADO SE PERTENCE A OUTRO APARELHO
          if (idApBanco && idApBanco !== idAparelhoLocal) {
            tentativas++;
            localStorage.setItem("tent", tentativas.toString());
            localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, tentativas.toString());
            setMensagem({ texto: "Essa senha já foi usada em outro dispositivo", tipo: "erro" });
            setSenhaInput("");
            return;
          }

          // 🔒 PRIMEIRO ACESSO: REGISTRA NA NUVEM
          if (!data.primeiro_acesso && !data.usado) {
            const dataIso = new Date().toISOString();
            const duracaoMs = data.validade_ms || 86400000;
            const dataFinalMs = Date.now() + duracaoMs;

            await supabase
              .from("senhas_acesso")
              .update({
                primeiro_acesso: dataIso,
                id_aparelho: idAparelhoLocal,
                dispositivo_vinculado: idAparelhoLocal,
                usado: true,
                valido_ate: dataFinalMs,
              })
              .eq("senha", senha);

            data.primeiro_acesso = dataIso;
            data.id_aparelho = idAparelhoLocal;
            data.dispositivo_vinculado = idAparelhoLocal;
            data.usado = true;
            data.valido_ate = dataFinalMs;
          }

          localStorage.setItem("acesso_ok", JSON.stringify({ senha }));
          localStorage.setItem(
            CONFIG.CHAVE_ACESSO,
            JSON.stringify({
              inicio: Date.now(),
              validade: data.valido_ate ? Math.max(0, data.valido_ate - Date.now()) : 86400000,
              dispositivo: idAparelhoLocal,
              senhaUsada: senha,
              senha: senha,
              liberado: "sim",
              tipo: data.tipo,
            })
          );
          localStorage.setItem("tent", "0");
          localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, "0");
          localStorage.removeItem("bloq");
          localStorage.removeItem(CONFIG.CHAVE_BLOQUEIO);

          // ✅ Define o contexto de segurança com a senha logada
          await definirContextoSeguranca(senha, false);

          setMensagem({
            texto: "✅ Acesso liberado!",
            tipo: "sucesso",
          });

          setTimeout(() => {
            onSuccess();
          }, 300);
          return;
        }
      } catch (err) {
        console.warn("Erro ao consultar Supabase, usando validação local:", err);
      }
    }

    // 2. FALLBACK PARA VALIDAÇÃO DE SENHAS LOCAIS (ADMIN E ENVS)
    const lista = carregarSenhasValidas();
    const acesso = lista.find(
      (item) => item.senha === senha || item.senha.toLowerCase() === senha.toLowerCase()
    );

    if (!acesso) {
      tentativas++;
      localStorage.setItem("tent", tentativas.toString());
      localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, tentativas.toString());

      if (tentativas >= CONFIG.MAX_TENTATIVAS) {
        localStorage.setItem("bloq", Date.now().toString());
        localStorage.setItem(CONFIG.CHAVE_BLOQUEIO, Date.now().toString());
        verificarBloqueio();
      } else {
        setMensagem({ texto: "Senha inválida ou já utilizada/expirada", tipo: "erro" });
      }
      setSenhaInput("");
      return;
    }

    // REGRA DE ADMINISTRADOR LOCAL
    if (acesso.validade === 0) {
      localStorage.setItem("acesso_ok", JSON.stringify({ senha: acesso.senha }));
      localStorage.setItem(
        CONFIG.CHAVE_ACESSO,
        JSON.stringify({
          inicio: Date.now(),
          validade: 0,
          dispositivo: "ADMIN_LIVRE",
          senhaUsada: acesso.senha,
          senha: acesso.senha,
          liberado: "sim",
        })
      );
      localStorage.setItem("tent", "0");
      localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, "0");
      localStorage.removeItem("bloq");
      localStorage.removeItem(CONFIG.CHAVE_BLOQUEIO);

      setMensagem({ texto: "Acesso de Administrador Autorizado!", tipo: "sucesso" });
      setTimeout(() => {
        onSuccess();
      }, 300);
      return;
    }

    // REGRA DE USUÁRIO COMUM LOCAL
    marcarSenhaComoUsada(acesso.senha);
    const agora = Date.now();
    const idDispositivo = gerarIdAparelho();

    localStorage.setItem("acesso_ok", JSON.stringify({ senha: acesso.senha }));
    localStorage.setItem(
      CONFIG.CHAVE_ACESSO,
      JSON.stringify({
        inicio: agora,
        validade: acesso.validade,
        dispositivo: idDispositivo,
        senhaUsada: acesso.senha,
        senha: acesso.senha,
        liberado: "sim",
      })
    );
    localStorage.setItem("tent", "0");
    localStorage.setItem(CONFIG.CHAVE_TENTATIVAS, "0");
    localStorage.removeItem("bloq");
    localStorage.removeItem(CONFIG.CHAVE_BLOQUEIO);

    setMensagem({ texto: "Acesso autorizado! Carregando...", tipo: "sucesso" });
    setTimeout(() => {
      onSuccess();
    }, 300);
  };

  const handleCadastrar = async () => {
    if (!senhaInput && !emailInput) {
      setMensagem({ texto: "Preencha a senha ou e-mail desejado para cadastro.", tipo: "aviso" });
      return;
    }
    const senhaCadastro = (senhaInput || emailInput).trim();

    if (supabase) {
      try {
        const { data: existe } = await supabase
          .from("senhas_acesso")
          .select("senha")
          .eq("senha", senhaCadastro)
          .maybeSingle();

        if (!existe) {
          await supabase.from("senhas_acesso").insert({
            senha: senhaCadastro,
            tipo: "cliente",
            usado: false,
            validade_ms: 2592000000,
          });
        }
      } catch (e) {
        console.warn("Erro ao cadastrar senha no Supabase:", e);
      }
    }

    setMensagem({
      texto: "✅ Cadastro/Solicitação enviada com sucesso! Conectando...",
      tipo: "sucesso",
    });

    setSenhaInput(senhaCadastro);
    setTimeout(() => {
      tentarAcesso();
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !bloqueado) {
      if (abaAtiva === "cadastrar") {
        handleCadastrar();
      } else {
        tentarAcesso();
      }
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
        className="caixa-acesso bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-slate-100 relative overflow-hidden my-auto"
      >
        {/* Barra superior decorativa com gradiente Verde + Azul */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#2E7D32] via-[#1976D2] to-[#2E7D32]" />

        {/* Ícone de cadeado em quadrado verde arredondado */}
        <div className="mx-auto w-14 h-14 bg-[#E8F5E9] text-[#2E7D32] rounded-2xl flex items-center justify-center mb-3.5 shadow-xs border border-[#2E7D32]/20">
          <Lock className="w-7 h-7 text-[#2E7D32]" />
        </div>

        <h1 className="logo text-xl sm:text-2xl font-extrabold text-[#2E7D32] mb-1 uppercase tracking-tight">
          PROJETO EMAGRECIMENTO SAUDÁVEL
        </h1>
        <p className="subtitulo text-xs sm:text-sm text-slate-500 mb-4 font-medium">
          Acesso exclusivo com controle de validade
        </p>

        {/* Seletor de Abas (Modos de Acesso) - Substitui "Login Firebase" por "Login / Senha" */}
        <div className="bg-slate-100/90 p-1 border border-slate-200/70 rounded-2xl flex gap-1 mb-5">
          <button
            type="button"
            onClick={() => { setAbaAtiva("pin"); setMensagem(null); }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              abaAtiva === "pin"
                ? "bg-white text-[#2E7D32] shadow-xs border border-slate-200/80"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <KeyRound className="w-4 h-4 text-[#2E7D32]" />
            <span>Senha PIN</span>
          </button>

          <button
            type="button"
            onClick={() => { setAbaAtiva("login"); setMensagem(null); }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              abaAtiva === "login"
                ? "bg-white text-[#2E7D32] shadow-xs border border-slate-200/80"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LogIn className="w-4 h-4 text-[#2E7D32]" />
            <span>Login / Senha</span>
          </button>

          <button
            type="button"
            onClick={() => { setAbaAtiva("cadastrar"); setMensagem(null); }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              abaAtiva === "cadastrar"
                ? "bg-white text-[#2E7D32] shadow-xs border border-slate-200/80"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#2E7D32]" />
            <span>Cadastrar</span>
          </button>
        </div>

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

        {/* FORMULÁRIO DE ACESSO */}
        {abaAtiva === "pin" && (
          <div className="grupo-campo text-left mb-4 space-y-3">
            <div>
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

            <button
              id="btnEntrar"
              onClick={tentarAcesso}
              disabled={bloqueado}
              className="btn-entrar w-full bg-gradient-to-r from-[#2E7D32] to-[#1976D2] hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3.5 px-6 rounded-xl text-sm sm:text-base shadow-lg shadow-[#2E7D32]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Acessar Sistema</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {abaAtiva === "login" && (
          <div className="grupo-campo text-left mb-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1 uppercase tracking-wider">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#607D8B]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="seu.email@exemplo.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F5F7FA] border border-[#B0BEC5] rounded-xl text-[#263238] placeholder:text-slate-400 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1 uppercase tracking-wider">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#607D8B]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type={verSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-11 py-2.5 bg-[#F5F7FA] border border-[#B0BEC5] rounded-xl text-[#263238] placeholder:text-slate-400 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
                <button
                  type="button"
                  onClick={() => setVerSenha(!verSenha)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#607D8B] hover:text-[#263238] cursor-pointer"
                >
                  {verSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={tentarAcesso}
              disabled={bloqueado}
              className="w-full bg-gradient-to-r from-[#2E7D32] to-[#1976D2] hover:opacity-95 active:scale-[0.98] disabled:opacity-50 text-white font-black py-3.5 px-6 rounded-xl text-sm sm:text-base shadow-lg shadow-[#2E7D32]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Entrar com Login / Senha</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {abaAtiva === "cadastrar" && (
          <div className="grupo-campo text-left mb-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1 uppercase tracking-wider">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#607D8B]">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nomeInput}
                  onChange={(e) => setNomeInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F5F7FA] border border-[#B0BEC5] rounded-xl text-[#263238] placeholder:text-slate-400 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1 uppercase tracking-wider">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#607D8B]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="seu.email@exemplo.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F5F7FA] border border-[#B0BEC5] rounded-xl text-[#263238] placeholder:text-slate-400 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263238] mb-1 uppercase tracking-wider">
                Senha de Acesso Desejada
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#607D8B]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="Crie uma senha de acesso"
                  value={senhaInput}
                  onChange={(e) => setSenhaInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-[#F5F7FA] border border-[#B0BEC5] rounded-xl text-[#263238] placeholder:text-slate-400 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>
            </div>

            <button
              onClick={handleCadastrar}
              className="w-full bg-gradient-to-r from-[#2E7D32] to-[#1976D2] hover:opacity-95 text-white font-black py-3.5 px-6 rounded-xl text-sm sm:text-base shadow-lg shadow-[#2E7D32]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Solicitar / Cadastrar Acesso</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

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

