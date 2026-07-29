import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Trash2, 
  Flame, 
  Utensils, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  ChevronRight,
  Calculator,
  Filter,
  Info,
  Layers,
  ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TABELA_CALORIAS, CATEGORIAS_ALIMENTOS, AlimentoCaloria } from "../data/tabelaCalorias";

export interface ItemIngerido {
  id: string;
  nome: string;
  porcao: string;
  caloriasUnitarias: number;
  quantidade: number;
  caloriasTotais: number;
  categoria: string;
  emoji: string;
  horario?: string;
}

interface RegistroIngestaoCaloriasProps {
  metaCaloricaDiaria?: number;
}

export default function RegistroIngestaoCalorias({ metaCaloricaDiaria = 2000 }: RegistroIngestaoCaloriasProps) {
  // Search & Filter state
  const [busca, setBusca] = useState("");
  const [categoriaSel, setCategoriaSel] = useState("todas");

  // Custom Item Form state
  const [customNome, setCustomNome] = useState("");
  const [customCalorias, setCustomCalorias] = useState("");
  const [customPorcao, setCustomPorcao] = useState("1 porção");
  const [mostrarCustomForm, setMostrarCustomForm] = useState(false);

  // Ingested Items List state with localStorage persistence
  const [itensIngeridos, setItensIngeridos] = useState<ItemIngerido[]>(() => {
    if (typeof window === "undefined") return [];
    const salvos = localStorage.getItem("diario_ingestao_calorias_v1");
    if (!salvos) return [];
    try {
      return JSON.parse(salvos);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("diario_ingestao_calorias_v1", JSON.stringify(itensIngeridos));
  }, [itensIngeridos]);

  // Filter foods from official table
  const alimentosFiltrados = TABELA_CALORIAS.filter((item) => {
    const bateBusca = item.item.toLowerCase().includes(busca.toLowerCase().trim()) ||
                      item.porcao.toLowerCase().includes(busca.toLowerCase().trim());
    const bateCategoria = categoriaSel === "todas" || item.categoria === categoriaSel;
    return bateBusca && bateCategoria;
  });

  // Calculate Total Sum of Calories
  const totalCaloriasIngeridas = itensIngeridos.reduce((acc, item) => acc + item.caloriasTotais, 0);
  const totalItensRegistrados = itensIngeridos.reduce((acc, item) => acc + item.quantidade, 0);

  // Add item from table
  const handleAdicionarItemTabela = (alimento: AlimentoCaloria) => {
    const agora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    
    setItensIngeridos((prev) => {
      const indexExistente = prev.findIndex((i) => i.nome === alimento.item && i.porcao === alimento.porcao);
      if (indexExistente >= 0) {
        const cop = [...prev];
        const novaQtd = cop[indexExistente].quantidade + 1;
        cop[indexExistente] = {
          ...cop[indexExistente],
          quantidade: novaQtd,
          caloriasTotais: Math.round(cop[indexExistente].caloriasUnitarias * novaQtd)
        };
        return cop;
      }

      const novo: ItemIngerido = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        nome: alimento.item,
        porcao: alimento.porcao,
        caloriasUnitarias: alimento.calorias,
        quantidade: 1,
        caloriasTotais: alimento.calorias,
        categoria: alimento.categoria,
        emoji: alimento.emoji,
        horario: agora
      };
      return [novo, ...prev];
    });
  };

  // Add custom manual item
  const handleAdicionarCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNome.trim() || !customCalorias.trim()) {
      alert("Por favor, informe o nome e as calorias do alimento.");
      return;
    }
    const cals = parseFloat(customCalorias);
    if (isNaN(cals) || cals < 0) {
      alert("Por favor, informe um número válido de calorias.");
      return;
    }

    const agora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const novo: ItemIngerido = {
      id: Date.now().toString(),
      nome: customNome.trim(),
      porcao: customPorcao.trim() || "1 porção",
      caloriasUnitarias: Math.round(cals),
      quantidade: 1,
      caloriasTotais: Math.round(cals),
      categoria: "custom",
      emoji: "🍽️",
      horario: agora
    };

    setItensIngeridos((prev) => [novo, ...prev]);
    setCustomNome("");
    setCustomCalorias("");
    setCustomPorcao("1 porção");
    setMostrarCustomForm(false);
  };

  // Adjust item quantity
  const handleAlterarQuantidade = (id: string, delta: number) => {
    setItensIngeridos((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const novaQtd = Math.max(0, item.quantidade + delta);
            return {
              ...item,
              quantidade: novaQtd,
              caloriasTotais: Math.round(item.caloriasUnitarias * novaQtd)
            };
          }
          return item;
        })
        .filter((item) => item.quantidade > 0)
    );
  };

  // Remove single item
  const handleRemoverItem = (id: string) => {
    setItensIngeridos((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear list
  const handleLimparLista = () => {
    if (itensIngeridos.length === 0) return;
    if (confirm("Deseja limpar todos os itens da sua lista de controle de ingestão hoje?")) {
      setItensIngeridos([]);
    }
  };

  // Percent of meta
  const percentualMeta = Math.min(100, Math.round((totalCaloriasIngeridas / metaCaloricaDiaria) * 100));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6" id="quadro-ingestao-calorica">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-black uppercase tracking-widest border border-[#2E7D32]/20">
            <Calculator className="w-3.5 h-3.5 text-[#2E7D32]" />
            Controle Diário de Ingestão Alimentar
          </div>
          <h2 className="text-xl font-black text-[#263238] uppercase tracking-wider flex items-center gap-2">
            <span>Calculadora &amp; Diário de Calorias Ingeridas</span>
          </h2>
          <p className="text-xs text-[#607D8B] font-medium leading-relaxed">
            Pesquise os alimentos ingeridos na tabela oficial abaixo e monte seu controle diário para acompanhar suas calorias acumuladas em tempo real.
          </p>
        </div>

        {/* DESTAQUE PRINCIPAL DA SOMA TOTAL DE CALORIAS */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white rounded-2xl p-4 shadow-lg shadow-orange-500/20 flex items-center justify-between gap-4 border border-orange-400 shrink-0 min-w-[260px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <Flame className="w-7 h-7 text-yellow-200 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-100 block">
                TOTAL INGERIDO HOJE
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight drop-shadow-xs">
                  {totalCaloriasIngeridas.toLocaleString("pt-BR")}
                </span>
                <span className="text-xs font-bold text-orange-100">kcal</span>
              </div>
            </div>
          </div>

          <div className="text-right border-l border-white/20 pl-3">
            <span className="text-[9px] font-bold text-orange-100 block uppercase">Meta Diária</span>
            <span className="text-xs font-black text-white">~{metaCaloricaDiaria} kcal</span>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full block mt-1">
              {percentualMeta}% atingido
            </span>
          </div>
        </div>
      </div>

      {/* GRID DA SEÇÃO: QUADRO DE BUSCA DE ALIMENTOS & LISTA DO QUE A PESSOA INGERIU */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COLUNA ESQUERDA (7 cols): QUADRO DE BUSCA NA TABELA */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#263238] uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-[#1976D2]" />
              <span>1. Quadro de Busca de Alimentos</span>
            </h3>
            <span className="text-[10px] font-bold text-[#607D8B] bg-slate-100 px-2.5 py-1 rounded-full">
              {alimentosFiltrados.length} itens encontrados
            </span>
          </div>

          {/* CAMPO DE BUSCA PRINCIPAL */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#607D8B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Digite o alimento que você ingeriu (ex: Abacate, Banana, Arroz, Frango, Ovo, Suco)..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs font-bold text-[#263238] placeholder:text-slate-400 outline-none focus:border-[#1976D2] focus:bg-white focus:ring-2 focus:ring-[#1976D2]/10 transition-all shadow-xs"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Limpar
              </button>
            )}
          </div>

          {/* FILTROS POR CATEGORIA EM CHIPS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {CATEGORIAS_ALIMENTOS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaSel(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoriaSel === cat.id
                    ? "bg-[#1976D2] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.nome}</span>
              </button>
            ))}
          </div>

          {/* LISTA DE RESULTADOS DA TABELA DE CALORIAS */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 max-h-[360px] overflow-y-auto space-y-2 custom-scrollbar">
            {alimentosFiltrados.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-bold">Nenhum alimento encontrado para "{busca}".</p>
                <button
                  type="button"
                  onClick={() => setMostrarCustomForm(true)}
                  className="text-xs font-black text-[#1976D2] underline hover:text-[#1565C0] cursor-pointer"
                >
                  Clique aqui para adicionar um alimento personalizado manual
                </button>
              </div>
            ) : (
              alimentosFiltrados.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-xl border border-slate-200/80 hover:border-[#1976D2]/40 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg bg-slate-100 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60">
                      {item.emoji}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-[#263238] group-hover:text-[#1976D2] transition-colors leading-tight">
                        {item.item}
                      </h4>
                      <span className="text-[10px] font-semibold text-[#607D8B] block mt-0.5">
                        Porção: {item.porcao}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-600 block">
                        {item.calorias} kcal
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">
                        por porção
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdicionarItemTabela(item)}
                      className="bg-[#2E7D32] hover:bg-[#27682A] text-white p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                      title="Adicionar alimento à sua lista de ingestão"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline text-[10px] font-black uppercase">Adicionar</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* BOTÃO PARA EXPANDIR FORMULÁRIO MANUAL */}
          <div className="pt-1">
            {!mostrarCustomForm ? (
              <button
                type="button"
                onClick={() => setMostrarCustomForm(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-[#1976D2] bg-white text-[#1976D2] hover:bg-sky-50/50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Não encontrou seu alimento? Adicionar item personalizado manualmente</span>
              </button>
            ) : (
              <form onSubmit={handleAdicionarCustomItem} className="bg-sky-50/80 border border-[#1976D2]/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1976D2] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Adicionar Alimento Personalizado
                  </span>
                  <button
                    type="button"
                    onClick={() => setMostrarCustomForm(false)}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-700 underline cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Nome do Alimento *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Shake especial, Biscoito caseiro..."
                      value={customNome}
                      onChange={(e) => setCustomNome(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#263238] outline-none focus:border-[#1976D2]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Calorias (kcal) *
                    </label>
                    <input
                      type="number"
                      required
                      step="1"
                      placeholder="Ex: 150"
                      value={customCalorias}
                      onChange={(e) => setCustomCalorias(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#263238] outline-none focus:border-[#1976D2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Porção (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1 prato, 200ml, 1 unidade..."
                    value={customPorcao}
                    onChange={(e) => setCustomPorcao(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#1976D2]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1976D2] hover:bg-[#1565C0] text-white py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  Incluir na Minha Lista
                </button>
              </form>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA (5 cols): LISTA DO QUE A PESSOA INGERIU COM DESTAQUE DA SOMA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-[#263238] uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#2E7D32]" />
              <span>2. Lista do que Você Ingeriu Hoje</span>
            </h3>

            {itensIngeridos.length > 0 && (
              <button
                type="button"
                onClick={handleLimparLista}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Limpar todos os itens da lista"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Lista</span>
              </button>
            )}
          </div>

          {/* PAINEL DE SOMA EM GRANDE DESTAQUE */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Soma Total das Calorias
              </span>
              <span className="text-xs font-bold text-slate-400">
                {totalItensRegistrados} {totalItensRegistrados === 1 ? "porção" : "porções"}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-3xl font-black text-amber-400 tracking-tight drop-shadow-xs">
                  {totalCaloriasIngeridas.toLocaleString("pt-BR")}
                </span>
                <span className="text-sm font-bold text-slate-300 ml-1">kcal</span>
              </div>

              {metaCaloricaDiaria > 0 && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Saldo restante</span>
                  <span className={`text-sm font-black ${metaCaloricaDiaria - totalCaloriasIngeridas >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {(metaCaloricaDiaria - totalCaloriasIngeridas).toLocaleString("pt-BR")} kcal
                  </span>
                </div>
              )}
            </div>

            {/* Barra de progresso visual */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentualMeta > 100
                    ? "bg-rose-500"
                    : percentualMeta > 85
                    ? "bg-amber-500"
                    : "bg-[#2E7D32]"
                }`}
                style={{ width: `${percentualMeta}%` }}
              />
            </div>
          </div>

          {/* ITENS INGERIDOS ADICIONADOS NA LISTA */}
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
            {itensIngeridos.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2">
                <Utensils className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Sua lista de ingestão está vazia.</p>
                <p className="text-[11px] text-slate-400">
                  Pesquise um alimento no quadro ao lado e clique em <strong>"+ Adicionar"</strong> para somar suas calorias.
                </p>
              </div>
            ) : (
              itensIngeridos.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-base bg-slate-100 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60">
                      {item.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-[#263238] truncate leading-tight">
                        {item.nome}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#607D8B] font-semibold mt-0.5">
                        <span>{item.porcao}</span>
                        {item.horario && <span className="text-slate-400">• {item.horario}</span>}
                      </div>
                    </div>
                  </div>

                  {/* CONTROLE DE QUANTIDADE E REMOÇÃO */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => handleAlterarQuantidade(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                        title="Diminuir quantidade"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-xs font-black text-[#263238]">
                        {item.quantidade}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAlterarQuantidade(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                        title="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[65px]">
                      <span className="text-xs font-black text-[#2E7D32] block">
                        {item.caloriasTotais} kcal
                      </span>
                      {item.quantidade > 1 && (
                        <span className="text-[9px] font-bold text-slate-400 block">
                          ({item.caloriasUnitarias}x{item.quantidade})
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoverItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remover item da lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
