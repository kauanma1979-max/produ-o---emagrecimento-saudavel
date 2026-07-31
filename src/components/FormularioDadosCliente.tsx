import { useState, useEffect } from "react";
import { ClipboardList, Save, CheckCircle2, CloudUpload, Loader2, UserCheck } from "lucide-react";
import { AppConfig } from "../types";
import { salvarDadosClienteSupabase, carregarDadosClienteSupabase } from "../lib/supabase";

interface FormularioDadosClienteProps {
  config: AppConfig;
  onUpdateConfig: (newConfigPartial: Partial<AppConfig>) => void;
  inCard?: boolean;
}

export default function FormularioDadosCliente({
  config,
  onUpdateConfig,
  inCard = false,
}: FormularioDadosClienteProps) {
  const [formData, setFormData] = useState({
    nome_completo: config.nome || "",
    idade: config.idade !== undefined && config.idade !== null ? config.idade.toString() : "",
    altura: config.altura !== undefined && config.altura !== null ? config.altura.toString() : "",
    peso_inicial: config.pesoInicial ? config.pesoInicial.toString() : "",
    peso_atual: config.pesoAtual ? config.pesoAtual.toString() : "",
    medida_cintura: config.medidaCintura ? config.medidaCintura.toString() : "",
    medida_quadril: config.medidaQuadril ? config.medidaQuadril.toString() : "",
    objetivo: config.objetivo || "",
    observacoes: config.observacoes || "",
  });

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ texto: string; tipo: "sucesso" | "erro" | "info" } | null>(null);

  // Sync state if config prop updates
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      nome_completo: config.nome ?? prev.nome_completo,
      idade: config.idade !== undefined && config.idade !== null ? config.idade.toString() : prev.idade,
      altura: config.altura !== undefined && config.altura !== null ? config.altura.toString() : prev.altura,
      peso_inicial: config.pesoInicial ? config.pesoInicial.toString() : prev.peso_inicial,
      peso_atual: config.pesoAtual ? config.pesoAtual.toString() : prev.peso_atual,
      medida_cintura: config.medidaCintura ? config.medidaCintura.toString() : prev.medida_cintura,
      medida_quadril: config.medidaQuadril ? config.medidaQuadril.toString() : prev.medida_quadril,
      objetivo: config.objetivo ?? prev.objetivo,
      observacoes: config.observacoes ?? prev.observacoes,
    }));
  }, [config]);

  // Carrega dados do Supabase automaticamente se houver senha de acesso salva
  useEffect(() => {
    const carregarAutonomo = async () => {
      const rawOk = localStorage.getItem("acesso_ok");
      if (!rawOk) return;

      let senha = "";
      try {
        const parsed = JSON.parse(rawOk);
        senha = parsed?.senha || "";
      } catch {
        senha = rawOk;
      }

      if (senha) {
        const dadosSupabase = await carregarDadosClienteSupabase(senha);
        if (dadosSupabase) {
          setFormData({
            nome_completo: dadosSupabase.nome_completo || dadosSupabase.nome || "",
            idade: dadosSupabase.idade ? dadosSupabase.idade.toString() : "",
            altura: dadosSupabase.altura ? dadosSupabase.altura.toString() : "",
            peso_inicial: dadosSupabase.peso_inicial ? dadosSupabase.peso_inicial.toString() : "",
            peso_atual: dadosSupabase.peso_atual ? dadosSupabase.peso_atual.toString() : "",
            medida_cintura: dadosSupabase.medida_cintura ? dadosSupabase.medida_cintura.toString() : "",
            medida_quadril: dadosSupabase.medida_quadril ? dadosSupabase.medida_quadril.toString() : "",
            objetivo: dadosSupabase.objetivo || "",
            observacoes: dadosSupabase.observacoes || "",
          });

          // Atualiza o estado global da aplicação
          onUpdateConfig({
            nome: dadosSupabase.nome_completo || dadosSupabase.nome,
            idade: dadosSupabase.idade ? Number(dadosSupabase.idade) : undefined,
            altura: dadosSupabase.altura ? Number(dadosSupabase.altura) : undefined,
            pesoInicial: dadosSupabase.peso_inicial ? Number(dadosSupabase.peso_inicial) : undefined,
            pesoAtual: dadosSupabase.peso_atual ? Number(dadosSupabase.peso_atual) : undefined,
            medidaCintura: dadosSupabase.medida_cintura ? Number(dadosSupabase.medida_cintura) : undefined,
            medidaQuadril: dadosSupabase.medida_quadril ? Number(dadosSupabase.medida_quadril) : undefined,
            objetivo: dadosSupabase.objetivo,
            observacoes: dadosSupabase.observacoes,
          });
        }
      }
    };

    carregarAutonomo();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalvarDados = async () => {
    setSaving(true);
    setStatusMessage(null);

    // Obtém a senha de acesso salva no localStorage
    const rawOk = localStorage.getItem("acesso_ok");
    let senha = "";
    if (rawOk) {
      try {
        const parsed = JSON.parse(rawOk);
        senha = parsed?.senha || "";
      } catch {
        senha = rawOk;
      }
    }

    // Prepara objeto com conversões numéricas
    const dadosParaSalvar = {
      nome_completo: formData.nome_completo.trim(),
      idade: formData.idade ? Number(formData.idade) : null,
      altura: formData.altura ? Number(formData.altura.replace(",", ".")) : null,
      peso_inicial: formData.peso_inicial ? Number(formData.peso_inicial.replace(",", ".")) : null,
      peso_atual: formData.peso_atual ? Number(formData.peso_atual.replace(",", ".")) : null,
      medida_cintura: formData.medida_cintura ? Number(formData.medida_cintura.replace(",", ".")) : null,
      medida_quadril: formData.medida_quadril ? Number(formData.medida_quadril.replace(",", ".")) : null,
      objetivo: formData.objetivo.trim(),
      observacoes: formData.observacoes.trim(),
      atualizado_em: new Date().toISOString(),
    };

    // 1. Atualiza no estado global da aplicação
    onUpdateConfig({
      nome: dadosParaSalvar.nome_completo,
      idade: dadosParaSalvar.idade || undefined,
      altura: dadosParaSalvar.altura || undefined,
      pesoInicial: dadosParaSalvar.peso_inicial || undefined,
      pesoAtual: dadosParaSalvar.peso_atual || undefined,
      medidaCintura: dadosParaSalvar.medida_cintura || undefined,
      medidaQuadril: dadosParaSalvar.medida_quadril || undefined,
      objetivo: dadosParaSalvar.objetivo,
      observacoes: dadosParaSalvar.observacoes,
    });

    // 2. Tenta enviar para o Supabase
    let salvoSupabase = false;
    if (senha) {
      salvoSupabase = await salvarDadosClienteSupabase(senha, dadosParaSalvar);
    }

    setSaving(false);

    if (salvoSupabase) {
      setStatusMessage({
        texto: "✅ Dados salvos com sucesso e sincronizados na nuvem!",
        tipo: "sucesso",
      });
    } else {
      setStatusMessage({
        texto: "✅ Dados salvos localmente! (Aviso: Supabase offline ou senha não sincronizada)",
        tipo: "info",
      });
    }

    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  return (
    <div className={`formulario-dados ${inCard ? "" : "bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm"}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
          <ClipboardList className="w-6 h-6 text-indigo-600" />
          <span>📋 Seus Dados de Acompanhamento</span>
        </h3>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full flex items-center gap-1.5">
          <CloudUpload className="w-3.5 h-3.5" />
          Sincronizado via Supabase
        </span>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl mb-6 font-bold text-sm flex items-center gap-3 ${
            statusMessage.tipo === "sucesso"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-indigo-50 text-indigo-800 border border-indigo-200"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{statusMessage.texto}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Campo: Nome completo */}
        <div className="campo">
          <label htmlFor="nome_completo" className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
            Nome completo
          </label>
          <input
            type="text"
            id="nome_completo"
            value={formData.nome_completo}
            onChange={(e) => handleChange("nome_completo", e.target.value)}
            placeholder="Digite seu nome completo"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>

        {/* Linha dupla: Idade / Altura */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="campo">
            <label htmlFor="idade" className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Idade
            </label>
            <input
              type="number"
              id="idade"
              value={formData.idade}
              onChange={(e) => handleChange("idade", e.target.value)}
              placeholder="Ex: 35"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>

          <div className="campo">
            <label htmlFor="altura" className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Altura (ex: 1,65)
            </label>
            <input
              type="number"
              step="0.01"
              id="altura"
              value={formData.altura}
              onChange={(e) => handleChange("altura", e.target.value)}
              placeholder="1.65"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Linha dupla: Peso inicial / Peso atual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="campo">
            <label htmlFor="peso_inicial" className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Peso inicial (kg)
            </label>
            <input
              type="number"
              step="0.01"
              id="peso_inicial"
              value={formData.peso_inicial}
              onChange={(e) => handleChange("peso_inicial", e.target.value)}
              placeholder="80.0"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>

          <div className="campo">
            <label htmlFor="peso_atual" className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Peso atual (kg)
            </label>
            <input
              type="number"
              step="0.01"
              id="peso_atual"
              value={formData.peso_atual}
              onChange={(e) => handleChange("peso_atual", e.target.value)}
              placeholder="75.5"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Linha dupla: Medida Cintura / Medida Quadril */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="campo">
            <label htmlFor="medida_cintura" className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Medida Cintura (cm)
            </label>
            <input
              type="number"
              step="0.1"
              id="medida_cintura"
              value={formData.medida_cintura}
              onChange={(e) => handleChange("medida_cintura", e.target.value)}
              placeholder="85.0"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>

          <div className="campo">
            <label htmlFor="medida_quadril" className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Medida Quadril (cm)
            </label>
            <input
              type="number"
              step="0.1"
              id="medida_quadril"
              value={formData.medida_quadril}
              onChange={(e) => handleChange("medida_quadril", e.target.value)}
              placeholder="98.0"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Campo: Seu objetivo principal */}
        <div className="campo">
          <label htmlFor="objetivo" className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
            Seu objetivo principal
          </label>
          <textarea
            id="objetivo"
            rows={2}
            value={formData.objetivo}
            onChange={(e) => handleChange("objetivo", e.target.value)}
            placeholder="Ex: Eliminar 10kg com emagrecimento saudável e ganho de massa magra"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-y"
          ></textarea>
        </div>

        {/* Campo: Observações / Restrições */}
        <div className="campo">
          <label htmlFor="observacoes" className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
            Observações / Restrições
          </label>
          <textarea
            id="observacoes"
            rows={3}
            value={formData.observacoes}
            onChange={(e) => handleChange("observacoes", e.target.value)}
            placeholder="Ex: Intolerância a lactose, hipertensão controlada, prefere treinos matutinos"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-y"
          ></textarea>
        </div>

        {/* Botão Principal: Salvar Dados */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSalvarDados}
            disabled={saving}
            className="botao-principal w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] text-white py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Salvando e Sincronizando...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Salvar Dados</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
