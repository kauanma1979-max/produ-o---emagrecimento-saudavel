import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://qnrtjzlhrvlpfcyrmfnq.supabase.co";
const DEFAULT_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucnRqemxocnZscGZjeXJtZm5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NDkwMDEsImV4cCI6MjEwMTAyNTAwMX0.x3H_Gg78kyUxgG390VDSAoJ-xdFmIU910P7EW9MNqyY";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY).trim();

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export function gerarIdAparelho(): string {
  if (typeof window === "undefined") return "APARELHO_DESCONHECIDO";
  let id = localStorage.getItem("id_aparelho");
  if (!id) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else if (navigator) {
      const dados = [
        navigator.userAgent,
        window.screen ? `${window.screen.width}x${window.screen.height}` : "",
        navigator.language,
        navigator.platform,
      ].join("|");
      id = btoa(dados).replace(/=/g, "").slice(0, 40);
    } else {
      id = "DEV_" + Math.random().toString(36).substring(2, 12);
    }
    localStorage.setItem("id_aparelho", id);
  }
  return id;
}

export async function definirContextoSeguranca(senha: string, ehAdmin: boolean = false): Promise<void> {
  if (!supabase || !senha) return;
  try {
    await supabase.rpc("definir_contexto", {
      senha_atual: senha,
      admin: ehAdmin,
    });
  } catch (err) {
    console.warn("RPC definir_contexto ausente ou falhou:", err);
  }
}

export async function carregarDadosClienteSupabase(senha: string): Promise<any | null> {
  if (!supabase || !senha) return null;

  try {
    // 1. Tabela primária pedida no PASSO 2: acompanhamento_clientes com senha_acesso
    const { data: dataAcompanhamento, error: errAcom } = await supabase
      .from("acompanhamento_clientes")
      .select("*")
      .eq("senha_acesso", senha)
      .maybeSingle();

    if (!errAcom && dataAcompanhamento) {
      return dataAcompanhamento;
    }

    // 2. Fallback: Coluna dados_cliente na tabela senhas_acesso
    const { data: dataSenha, error: errSenha } = await supabase
      .from("senhas_acesso")
      .select("dados_cliente")
      .eq("senha", senha)
      .maybeSingle();

    if (!errSenha && dataSenha && dataSenha.dados_cliente) {
      return dataSenha.dados_cliente;
    }

    // 3. Fallback: Tabela dados_cliente
    const { data: dataCliente, error: errCliente } = await supabase
      .from("dados_cliente")
      .select("dados")
      .eq("senha", senha)
      .maybeSingle();

    if (!errCliente && dataCliente && dataCliente.dados) {
      return dataCliente.dados;
    }

    return null;
  } catch (err) {
    console.error("Erro ao carregar dados do Supabase:", err);
    return null;
  }
}

/**
 * Salva dados de acompanhamento do cliente no Supabase ligado à senha informada
 */
export async function salvarDadosClienteSupabase(senha: string, dados: any): Promise<boolean> {
  if (!supabase || !senha) return false;

  let sucesso = false;

  try {
    // 1. Tabela primária pedida no PASSO 2: acompanhamento_clientes com coluna senha_acesso
    const registroAcompanhamento = {
      senha_acesso: senha,
      nome_completo: dados.nome_completo || dados.nome || "",
      idade: dados.idade !== null && dados.idade !== undefined ? Number(dados.idade) : null,
      peso_inicial: dados.peso_inicial !== null && dados.peso_inicial !== undefined ? Number(dados.peso_inicial) : null,
      peso_atual: dados.peso_atual !== null && dados.peso_atual !== undefined ? Number(dados.peso_atual) : null,
      altura: dados.altura !== null && dados.altura !== undefined ? Number(dados.altura) : null,
      medida_cintura: dados.medida_cintura !== null && dados.medida_cintura !== undefined ? Number(dados.medida_cintura) : null,
      medida_quadril: dados.medida_quadril !== null && dados.medida_quadril !== undefined ? Number(dados.medida_quadril) : null,
      objetivo: dados.objetivo || "",
      observacoes: dados.observacoes || "",
      ultima_atualizacao: new Date().toISOString(),
    };

    const { data: existe } = await supabase
      .from("acompanhamento_clientes")
      .select("id")
      .eq("senha_acesso", senha)
      .maybeSingle();

    if (existe) {
      const { error: errUpdateAcom } = await supabase
        .from("acompanhamento_clientes")
        .update(registroAcompanhamento)
        .eq("senha_acesso", senha);
      if (!errUpdateAcom) sucesso = true;
    } else {
      const { error: errInsertAcom } = await supabase
        .from("acompanhamento_clientes")
        .insert(registroAcompanhamento);
      if (!errInsertAcom) sucesso = true;
    }

    // 2. Fallbacks de compatibilidade com senhas_acesso e dados_cliente
    const { error: errSenha } = await supabase
      .from("senhas_acesso")
      .update({
        dados_cliente: dados,
        atualizado_em: new Date().toISOString(),
      })
      .eq("senha", senha);

    if (!errSenha) sucesso = true;

    return sucesso;
  } catch (err) {
    console.error("Erro ao salvar dados no Supabase:", err);
    return false;
  }
}

// Funções globais para chamadas diretas DOM ou scripts legados
export async function carregarDadosCliente(senha: string) {
  return await carregarDadosClienteSupabase(senha);
}

export async function salvarDadosCliente(senha: string) {
  const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement)?.value || "";
  
  const dados = {
    nome_completo: getVal("nome_completo").trim(),
    idade: parseInt(getVal("idade")) || null,
    peso_inicial: parseFloat(getVal("peso_inicial").replace(",", ".")) || null,
    peso_atual: parseFloat(getVal("peso_atual").replace(",", ".")) || null,
    altura: parseFloat(getVal("altura").replace(",", ".")) || null,
    medida_cintura: parseFloat(getVal("medida_cintura").replace(",", ".")) || null,
    medida_quadril: parseFloat(getVal("medida_quadril").replace(",", ".")) || null,
    objetivo: getVal("objetivo").trim(),
    observacoes: getVal("observacoes").trim(),
  };

  const ok = await salvarDadosClienteSupabase(senha, dados);
  if (ok) {
    alert("✅ Dados salvos com sucesso!");
  } else {
    alert("❌ Erro ao salvar dados no Supabase.");
  }
}

if (typeof window !== "undefined") {
  (window as any).carregarDadosCliente = carregarDadosCliente;
  (window as any).salvarDadosCliente = salvarDadosCliente;
  (window as any).definirContextoSeguranca = definirContextoSeguranca;
}
