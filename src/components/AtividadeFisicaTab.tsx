import React, { useState, useEffect } from "react";
import { 
  Dumbbell, 
  HeartPulse, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Building2, 
  Home, 
  Clock, 
  Scale, 
  Activity, 
  Trophy, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  X,
  Flame,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MusculacaoItem, CardioItem } from "../types";

// Default initial data for Musculação if empty
const DEFAULT_MUSCULACAO: MusculacaoItem[] = [
  {
    id: "musc-1",
    vezesPorSemana: 4,
    aparelho: "Barra e Halteres / Banco",
    exercicio: "Supino Reto",
    local: "Academia",
    pesoKg: 30,
    obs: "4 séries de 10 repetições",
    dataRegistro: "2026-07-20"
  },
  {
    id: "musc-2",
    vezesPorSemana: 3,
    aparelho: "Leg Press 45°",
    exercicio: "Leg Press",
    local: "Academia",
    pesoKg: 120,
    obs: "Foco em amplitude total",
    dataRegistro: "2026-07-22"
  },
  {
    id: "musc-3",
    vezesPorSemana: 3,
    aparelho: "Halteres",
    exercicio: "Agachamento Goblet",
    local: "Em Casa",
    pesoKg: 16,
    obs: "Treino funcional em casa",
    dataRegistro: "2026-07-25"
  }
];

// Default initial data for Cardio if empty
const DEFAULT_CARDIO: CardioItem[] = [
  {
    id: "cardio-1",
    vezesPorSemana: 3,
    tipoExercicio: "Esteira / Corrida",
    duracaoMinutos: 40,
    intensidade: "Moderada",
    obs: "Manter frequência cardíaca em ~135 bpm",
    dataRegistro: "2026-07-21"
  },
  {
    id: "cardio-2",
    vezesPorSemana: 5,
    tipoExercicio: "Caminhada ao Ar Livre",
    duracaoMinutos: 45,
    intensidade: "Leve",
    obs: "Caminhada matinal em jejum",
    dataRegistro: "2026-07-24"
  }
];

interface AtividadeFisicaTabProps {
  musculacaoData?: MusculacaoItem[];
  cardioData?: CardioItem[];
  onSaveMusculacao?: (items: MusculacaoItem[]) => void;
  onSaveCardio?: (items: CardioItem[]) => void;
}

export default function AtividadeFisicaTab({
  musculacaoData,
  cardioData,
  onSaveMusculacao,
  onSaveCardio
}: AtividadeFisicaTabProps) {
  // Sub tab state: "musculacao" | "cardio"
  const [subTab, setSubTab] = useState<"musculacao" | "cardio">("musculacao");

  // Musculacao state
  const [musculacaoList, setMusculacaoList] = useState<MusculacaoItem[]>(() => {
    if (musculacaoData && musculacaoData.length > 0) return musculacaoData;
    const saved = localStorage.getItem("atividade_musculacao_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_MUSCULACAO;
  });

  // Cardio state
  const [cardioList, setCardioList] = useState<CardioItem[]>(() => {
    if (cardioData && cardioData.length > 0) return cardioData;
    const saved = localStorage.getItem("atividade_cardio_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_CARDIO;
  });

  // Keep local storage in sync & notify parent component
  useEffect(() => {
    localStorage.setItem("atividade_musculacao_list", JSON.stringify(musculacaoList));
    if (onSaveMusculacao) onSaveMusculacao(musculacaoList);
  }, [musculacaoList]);

  useEffect(() => {
    localStorage.setItem("atividade_cardio_list", JSON.stringify(cardioList));
    if (onSaveCardio) onSaveCardio(cardioList);
  }, [cardioList]);

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocal, setFilterLocal] = useState<"todos" | "Academia" | "Em Casa">("todos");

  // Modal / Form state for Musculação
  const [showMuscModal, setShowMuscModal] = useState(false);
  const [editingMuscId, setEditingMuscId] = useState<string | null>(null);
  const [muscForm, setMuscForm] = useState<{
    vezesPorSemana: number;
    aparelho: string;
    exercicio: string;
    local: "Academia" | "Em Casa";
    pesoKg: number;
    obs: string;
  }>({
    vezesPorSemana: 3,
    aparelho: "",
    exercicio: "",
    local: "Academia",
    pesoKg: 10,
    obs: ""
  });

  // Modal / Form state for Cardio
  const [showCardioModal, setShowCardioModal] = useState(false);
  const [editingCardioId, setEditingCardioId] = useState<string | null>(null);
  const [cardioForm, setCardioForm] = useState<{
    vezesPorSemana: number;
    tipoExercicio: string;
    duracaoMinutos: number;
    intensidade: "Leve" | "Moderada" | "Intensa";
    obs: string;
  }>({
    vezesPorSemana: 3,
    tipoExercicio: "",
    duracaoMinutos: 30,
    intensidade: "Moderada",
    obs: ""
  });

  // Open Musculacao Modal
  const handleOpenMuscModal = (item?: MusculacaoItem) => {
    if (item) {
      setEditingMuscId(item.id);
      setMuscForm({
        vezesPorSemana: item.vezesPorSemana || 3,
        aparelho: item.aparelho || "",
        exercicio: item.exercicio || "",
        local: item.local || "Academia",
        pesoKg: item.pesoKg || 0,
        obs: item.obs || ""
      });
    } else {
      setEditingMuscId(null);
      setMuscForm({
        vezesPorSemana: 3,
        aparelho: "",
        exercicio: "",
        local: "Academia",
        pesoKg: 10,
        obs: ""
      });
    }
    setShowMuscModal(true);
  };

  // Save Musculacao Item
  const handleSaveMuscItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muscForm.exercicio.trim()) return;

    if (editingMuscId) {
      setMusculacaoList((prev) =>
        prev.map((item) =>
          item.id === editingMuscId
            ? {
                ...item,
                vezesPorSemana: Number(muscForm.vezesPorSemana),
                aparelho: muscForm.aparelho.trim() || "N/A",
                exercicio: muscForm.exercicio.trim(),
                local: muscForm.local,
                pesoKg: Number(muscForm.pesoKg),
                obs: muscForm.obs.trim()
              }
            : item
        )
      );
    } else {
      const newItem: MusculacaoItem = {
        id: "musc-" + Date.now(),
        vezesPorSemana: Number(muscForm.vezesPorSemana),
        aparelho: muscForm.aparelho.trim() || "N/A",
        exercicio: muscForm.exercicio.trim(),
        local: muscForm.local,
        pesoKg: Number(muscForm.pesoKg),
        obs: muscForm.obs.trim(),
        dataRegistro: new Date().toISOString().split("T")[0]
      };
      setMusculacaoList((prev) => [newItem, ...prev]);
    }
    setShowMuscModal(false);
  };

  const handleDeleteMuscItem = (id: string) => {
    if (window.confirm("Deseja realmente remover este exercício de musculação?")) {
      setMusculacaoList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Open Cardio Modal
  const handleOpenCardioModal = (item?: CardioItem) => {
    if (item) {
      setEditingCardioId(item.id);
      setCardioForm({
        vezesPorSemana: item.vezesPorSemana || 3,
        tipoExercicio: item.tipoExercicio || "",
        duracaoMinutos: item.duracaoMinutos || 30,
        intensidade: item.intensidade || "Moderada",
        obs: item.obs || ""
      });
    } else {
      setEditingCardioId(null);
      setCardioForm({
        vezesPorSemana: 3,
        tipoExercicio: "",
        duracaoMinutos: 30,
        intensidade: "Moderada",
        obs: ""
      });
    }
    setShowCardioModal(true);
  };

  // Save Cardio Item
  const handleSaveCardioItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardioForm.tipoExercicio.trim()) return;

    if (editingCardioId) {
      setCardioList((prev) =>
        prev.map((item) =>
          item.id === editingCardioId
            ? {
                ...item,
                vezesPorSemana: Number(cardioForm.vezesPorSemana),
                tipoExercicio: cardioForm.tipoExercicio.trim(),
                duracaoMinutos: Number(cardioForm.duracaoMinutos),
                intensidade: cardioForm.intensidade,
                obs: cardioForm.obs.trim()
              }
            : item
        )
      );
    } else {
      const newItem: CardioItem = {
        id: "cardio-" + Date.now(),
        vezesPorSemana: Number(cardioForm.vezesPorSemana),
        tipoExercicio: cardioForm.tipoExercicio.trim(),
        duracaoMinutos: Number(cardioForm.duracaoMinutos),
        intensidade: cardioForm.intensidade,
        obs: cardioForm.obs.trim(),
        dataRegistro: new Date().toISOString().split("T")[0]
      };
      setCardioList((prev) => [newItem, ...prev]);
    }
    setShowCardioModal(false);
  };

  const handleDeleteCardioItem = (id: string) => {
    if (window.confirm("Deseja realmente remover este exercício de cardio?")) {
      setCardioList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Restore defaults function
  const handleRestoreDefaults = () => {
    if (window.confirm("Deseja restaurar os exercícios padrões de Atividade Física?")) {
      setMusculacaoList(DEFAULT_MUSCULACAO);
      setCardioList(DEFAULT_CARDIO);
    }
  };

  // Filtered lists
  const filteredMusculacao = musculacaoList.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      item.exercicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.aparelho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.obs && item.obs.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocal = filterLocal === "todos" || item.local === filterLocal;
    return matchesSearch && matchesLocal;
  });

  const filteredCardio = cardioList.filter((item) => {
    return (
      searchTerm.trim() === "" ||
      item.tipoExercicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.obs && item.obs.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate stats
  const totalMuscCount = musculacaoList.length;
  const maxMuscPeso = musculacaoList.reduce((max, item) => (item.pesoKg > max ? item.pesoKg : max), 0);
  const academiaMuscCount = musculacaoList.filter((i) => i.local === "Academia").length;
  const casaMuscCount = musculacaoList.filter((i) => i.local === "Em Casa").length;

  const totalCardioCount = cardioList.length;
  const totalCardioMinutesWeekly = cardioList.reduce((acc, item) => acc + (item.duracaoMinutos * item.vezesPorSemana), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Atividade Física & Treinos
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Rotina de Exercícios
            </h1>
            <p className="text-slate-300 text-sm max-w-xl font-medium">
              Gerencie seus treinos de <strong>Musculação</strong> (aparelhos, carga em kg e local) e sessões de <strong>Cardio</strong> (duração e frequência semanal).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRestoreDefaults}
              title="Restaurar dados padrões"
              className="p-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-700 transition-all cursor-pointer hover:text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            {subTab === "musculacao" ? (
              <button
                onClick={() => handleOpenMuscModal()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95 text-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Exercício (Musculação)</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenCardioModal()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95 text-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Treino (Cardio)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Sub-Tabs Navigation (MUSCULAÇÃO & CARDIO) */}
      <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 gap-2 flex-1 sm:max-w-md">
          <button
            type="button"
            onClick={() => setSubTab("musculacao")}
            className={`py-3 px-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              subTab === "musculacao"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Musculação</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              subTab === "musculacao" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {musculacaoList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("cardio")}
            className={`py-3 px-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              subTab === "cardio"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Cardio</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              subTab === "cardio" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {cardioList.length}
            </span>
          </button>
        </div>

        {/* Search & Secondary Filter Bar */}
        <div className="flex items-center gap-2 px-2 pb-2 sm:pb-0">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={subTab === "musculacao" ? "Buscar exercício ou aparelho..." : "Buscar tipo de cardio..."}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium transition-all"
            />
          </div>

          {subTab === "musculacao" && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterLocal("todos")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  filterLocal === "todos" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterLocal("Academia")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  filterLocal === "Academia" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Building2 className="w-3 h-3" /> Academia
              </button>
              <button
                type="button"
                onClick={() => setFilterLocal("Em Casa")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  filterLocal === "Em Casa" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Home className="w-3 h-3" /> Casa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          SUB-ABA 1: MUSCULAÇÃO CONTENT
         ========================================== */}
      {subTab === "musculacao" && (
        <div className="space-y-6">
          {/* Quick Metrics Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Exercícios Cadastrados</p>
                <p className="text-xl font-black text-slate-900">{totalMuscCount} itens</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Maior Carga Registrada</p>
                <p className="text-xl font-black text-slate-900">{maxMuscPeso} kg</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Local do Treino</p>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  🏢 {academiaMuscCount} Academia • 🏠 {casaMuscCount} Em Casa
                </p>
              </div>
            </div>
          </div>

          {/* Cards List for Musculação */}
          {filteredMusculacao.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Dumbbell className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Nenhum exercício encontrado</h3>
                <p className="text-xs text-slate-500">Cadastre seu primeiro exercício de musculação ou limpe a busca.</p>
              </div>
              <button
                onClick={() => handleOpenMuscModal()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Cadastrar Exercício
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMusculacao.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all relative group overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Top Row: Local badge & actions */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        item.local === "Academia" 
                          ? "bg-indigo-100 text-indigo-900 border border-indigo-200/80" 
                          : "bg-amber-100 text-amber-900 border border-amber-200/80"
                      }`}>
                        {item.local === "Academia" ? (
                          <><Building2 className="w-3 h-3 text-indigo-600" /> Academia</>
                        ) : (
                          <><Home className="w-3 h-3 text-amber-600" /> Em Casa</>
                        )}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenMuscModal(item)}
                          title="Editar"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMuscItem(item.id)}
                          title="Excluir"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Equipment */}
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {item.exercicio}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1">
                        <span className="text-slate-400 font-normal">Aparelho:</span> {item.aparelho}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Frequência</span>
                        <span className="text-sm font-black text-indigo-600 flex items-center gap-1 mt-0.5">
                          <Activity className="w-3.5 h-3.5" /> {item.vezesPorSemana}x / semana
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Carga / Peso</span>
                        <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
                          <Scale className="w-3.5 h-3.5 text-amber-600" /> {item.pesoKg} kg
                        </span>
                      </div>
                    </div>

                    {/* Notes if present */}
                    {item.obs && (
                      <p className="text-xs text-slate-600 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/60 font-medium italic">
                        "{item.obs}"
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          SUB-ABA 2: CARDIO CONTENT
         ========================================== */}
      {subTab === "cardio" && (
        <div className="space-y-6">
          {/* Quick Metrics Header for Cardio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Tipos de Cardio Cadastrados</p>
                <p className="text-xl font-black text-slate-900">{totalCardioCount} modalidades</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Tempo Acumulado Semanal</p>
                <p className="text-xl font-black text-slate-900">{totalCardioMinutesWeekly} min / semana</p>
              </div>
            </div>
          </div>

          {/* Cards List for Cardio */}
          {filteredCardio.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <HeartPulse className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Nenhum treino de cardio encontrado</h3>
                <p className="text-xs text-slate-500">Cadastre seu primeiro exercício aeróbico (esteira, corrida, caminhada, etc.).</p>
              </div>
              <button
                onClick={() => handleOpenCardioModal()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Cadastrar Cardio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCardio.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all relative group overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Top Row: Cardio Badge & Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200/80 flex items-center gap-1.5">
                        <HeartPulse className="w-3 h-3 text-emerald-600" /> Cardio Aeróbico
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenCardioModal(item)}
                          title="Editar"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCardioItem(item.id)}
                          title="Excluir"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {item.tipoExercicio}
                      </h3>
                      {item.intensidade && (
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          Intensidade: <span className="text-emerald-700 font-bold">{item.intensidade}</span>
                        </p>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Frequência</span>
                        <span className="text-sm font-black text-emerald-600 flex items-center gap-1 mt-0.5">
                          <Activity className="w-3.5 h-3.5" /> {item.vezesPorSemana}x / semana
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Duração</span>
                        <span className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" /> {item.duracaoMinutos} min
                        </span>
                      </div>
                    </div>

                    {/* Notes if present */}
                    {item.obs && (
                      <p className="text-xs text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/60 font-medium italic">
                        "{item.obs}"
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          MODAL DE CADASTRO / EDIÇÃO DE MUSCULAÇÃO
         ========================================== */}
      <AnimatePresence>
        {showMuscModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {editingMuscId ? "Editar Exercício de Musculação" : "Novo Exercício de Musculação"}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Preencha os detalhes do seu treino de força</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMuscModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMuscItem} className="space-y-4">
                {/* 1. Quantas vezes por semana */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Quantas vezes por semana *
                  </label>
                  <select
                    value={muscForm.vezesPorSemana}
                    onChange={(e) => setMuscForm({ ...muscForm, vezesPorSemana: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
                  >
                    <option value={1}>1x por semana</option>
                    <option value={2}>2x por semana</option>
                    <option value={3}>3x por semana</option>
                    <option value={4}>4x por semana</option>
                    <option value={5}>5x por semana</option>
                    <option value={6}>6x por semana</option>
                    <option value={7}>7x por semana (Diário)</option>
                  </select>
                </div>

                {/* 2. Qual exercício */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Qual exercício *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Supino Reto, Agachamento, Puxada Alta"
                    value={muscForm.exercicio}
                    onChange={(e) => setMuscForm({ ...muscForm, exercicio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
                  />
                </div>

                {/* 3. Qual aparelho */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Qual aparelho / equipamento *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Leg Press 45°, Halteres, Smith Machine, Crossover"
                    value={muscForm.aparelho}
                    onChange={(e) => setMuscForm({ ...muscForm, aparelho: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
                  />
                </div>

                {/* 4. Academia ou Em Casa */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Academia ou Em Casa *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMuscForm({ ...muscForm, local: "Academia" })}
                      className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        muscForm.local === "Academia"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Building2 className="w-4 h-4" /> Academia
                    </button>
                    <button
                      type="button"
                      onClick={() => setMuscForm({ ...muscForm, local: "Em Casa" })}
                      className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        muscForm.local === "Em Casa"
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Home className="w-4 h-4" /> Em Casa
                    </button>
                  </div>
                </div>

                {/* 5. Qual o peso (kg) */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Qual o peso (Carga em kg) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      placeholder="Ex: 25"
                      value={muscForm.pesoKg}
                      onChange={(e) => setMuscForm({ ...muscForm, pesoKg: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                      kg
                    </span>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Observações / Séries (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 4 séries de 12 repetições"
                    value={muscForm.obs}
                    onChange={(e) => setMuscForm({ ...muscForm, obs: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowMuscModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    {editingMuscId ? "Salvar Alterações" : "Cadastrar Exercício"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL DE CADASTRO / EDIÇÃO DE CARDIO
         ========================================== */}
      <AnimatePresence>
        {showCardioModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {editingCardioId ? "Editar Treino de Cardio" : "Novo Treino de Cardio"}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Preencha os detalhes da sua atividade aeróbica</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCardioModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCardioItem} className="space-y-4">
                {/* 1. Quantas vezes por semana */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Quantas vezes por semana *
                  </label>
                  <select
                    value={cardioForm.vezesPorSemana}
                    onChange={(e) => setCardioForm({ ...cardioForm, vezesPorSemana: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
                  >
                    <option value={1}>1x por semana</option>
                    <option value={2}>2x por semana</option>
                    <option value={3}>3x por semana</option>
                    <option value={4}>4x por semana</option>
                    <option value={5}>5x por semana</option>
                    <option value={6}>6x por semana</option>
                    <option value={7}>7x por semana (Diário)</option>
                  </select>
                </div>

                {/* 2. Tipo de exercício */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Tipo de exercício *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Corrida, Caminhada, Bicicleta, Esteira, Natação, Elíptico"
                    value={cardioForm.tipoExercicio}
                    onChange={(e) => setCardioForm({ ...cardioForm, tipoExercicio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
                  />
                  {/* Quick Pill options */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Corrida", "Caminhada", "Bicicleta", "Esteira", "Natação", "Elíptico", "HIIT"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCardioForm({ ...cardioForm, tipoExercicio: type })}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        + {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Quanto tempo */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Quanto tempo (Duração em minutos) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="5"
                      step="5"
                      required
                      placeholder="Ex: 30"
                      value={cardioForm.duracaoMinutos}
                      onChange={(e) => setCardioForm({ ...cardioForm, duracaoMinutos: Number(e.target.value) || 0 })}
                      className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                      minutos
                    </span>
                  </div>
                </div>

                {/* Intensidade */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Intensidade
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Leve", "Moderada", "Intensa"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setCardioForm({ ...cardioForm, intensidade: level })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          cardioForm.intensidade === level
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    Observações (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Frequência cardíaca alvo ~130bpm"
                    value={cardioForm.obs}
                    onChange={(e) => setCardioForm({ ...cardioForm, obs: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCardioModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    {editingCardioId ? "Salvar Alterações" : "Cadastrar Cardio"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
