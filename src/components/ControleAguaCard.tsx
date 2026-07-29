import { useState, useEffect } from "react";
import { Droplets, Plus, Minus, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface ControleAguaCardProps {
  pesoAtual?: number;
}

export default function ControleAguaCard({ pesoAtual }: ControleAguaCardProps) {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const hoje = getTodayString();
  const CHAVE_AGUA = `agua_diaria_${hoje}`;
  const CHAVE_META = "meta_agua_ml";

  // Calculate meta based on weight (35ml x kg) or default 2500ml
  const metaSugerida = pesoAtual && pesoAtual > 0 ? Math.round(pesoAtual * 35) : 2500;

  const [metaAgua, setMetaAgua] = useState<number>(() => {
    if (typeof window === "undefined") return metaSugerida;
    const salva = localStorage.getItem(CHAVE_META);
    return salva ? parseInt(salva, 10) : metaSugerida;
  });

  const [consumoAtual, setConsumoAtual] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const salvo = localStorage.getItem(CHAVE_AGUA);
    return salvo ? parseInt(salvo, 10) : 0;
  });

  const [animando, setAnimando] = useState(false);

  useEffect(() => {
    localStorage.setItem(CHAVE_AGUA, consumoAtual.toString());
  }, [consumoAtual, CHAVE_AGUA]);

  useEffect(() => {
    localStorage.setItem(CHAVE_META, metaAgua.toString());
  }, [metaAgua]);

  const adicionarAgua = (quantidadeMl: number) => {
    setConsumoAtual((prev) => Math.max(0, prev + quantidadeMl));
    setAnimando(true);
    setTimeout(() => setAnimando(false), 600);
  };

  const resetarDia = () => {
    if (confirm("Deseja zerar o contador de água de hoje?")) {
      setConsumoAtual(0);
    }
  };

  const porcentagem = Math.min(100, Math.round((consumoAtual / metaAgua) * 100));
  const faltaMl = Math.max(0, metaAgua - consumoAtual);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between"
    >
      {/* Background visual water glow */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-sky-500/10 transition-all duration-700 ease-out pointer-events-none"
        style={{ height: `${porcentagem}%` }}
      />

      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 shadow-sm">
              <Droplets className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Controle de Água Diária
              </h3>
              <p className="text-[10px] text-sky-600 font-bold uppercase tracking-widest mt-0.5">
                Hábito chave no emagrecimento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetarDia}
              title="Zerar água de hoje"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Counter Display & Progress Bar */}
        <div className="relative z-10 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-5">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {(consumoAtual / 1000).toFixed(2)}
              </span>
              <span className="text-sm font-extrabold text-sky-600 ml-1">L</span>
              <span className="text-xs text-slate-400 font-medium ml-2">
                / {(metaAgua / 1000).toFixed(2)} L
              </span>
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-sky-600 tracking-tight">
                {porcentagem}%
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {faltaMl > 0 ? `Falta ${faltaMl} ml` : "🎉 Meta Atingida!"}
              </p>
            </div>
          </div>

          {/* Water Progress Track */}
          <div className="w-full bg-slate-200/80 rounded-full h-3.5 overflow-hidden relative border border-slate-300/30">
            <motion.div
              className="bg-gradient-to-r from-sky-400 to-blue-600 h-full rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${porcentagem}%` }}
            >
              {porcentagem > 0 && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
            </motion.div>
          </div>

          {/* Meta Selector Pills */}
          <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-slate-400">
            <span>Ajustar meta:</span>
            <div className="flex gap-1.5">
              {[2000, 2500, 3000].map((m) => (
                <button
                  key={m}
                  onClick={() => setMetaAgua(m)}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    metaAgua === m
                      ? "bg-sky-600 text-white font-black shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {(m / 1000).toFixed(1)}L
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Cup Buttons */}
        <div className="relative z-10 grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => adicionarAgua(200)}
            className="flex flex-col items-center justify-center p-2.5 bg-sky-50/80 hover:bg-sky-100 border border-sky-200/80 text-sky-800 rounded-xl transition-all active:scale-95 cursor-pointer group"
          >
            <span className="text-lg mb-0.5 group-hover:scale-110 transition-transform">🥛</span>
            <span className="text-xs font-black">+200 ml</span>
            <span className="text-[9px] text-sky-600/80 font-bold">Copo Pq.</span>
          </button>

          <button
            onClick={() => adicionarAgua(350)}
            className="flex flex-col items-center justify-center p-2.5 bg-sky-50/80 hover:bg-sky-100 border border-sky-200/80 text-sky-800 rounded-xl transition-all active:scale-95 cursor-pointer group"
          >
            <span className="text-lg mb-0.5 group-hover:scale-110 transition-transform">🍺</span>
            <span className="text-xs font-black">+350 ml</span>
            <span className="text-[9px] text-sky-600/80 font-bold">Copo Gr.</span>
          </button>

          <button
            onClick={() => adicionarAgua(500)}
            className="flex flex-col items-center justify-center p-2.5 bg-sky-50/80 hover:bg-sky-100 border border-sky-200/80 text-sky-800 rounded-xl transition-all active:scale-95 cursor-pointer group"
          >
            <span className="text-lg mb-0.5 group-hover:scale-110 transition-transform">🧴</span>
            <span className="text-xs font-black">+500 ml</span>
            <span className="text-[9px] text-sky-600/80 font-bold">Garrafa</span>
          </button>
        </div>

        {/* Custom or Undo Controls */}
        <div className="relative z-10 flex items-center justify-between text-xs">
          <button
            onClick={() => adicionarAgua(-200)}
            disabled={consumoAtual <= 0}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-500 disabled:opacity-40 disabled:hover:text-slate-400 cursor-pointer transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Remover 200ml</span>
          </button>

          <div className="flex items-center gap-1 text-[10px] text-slate-400 italic">
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span>35ml por kg de peso</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
