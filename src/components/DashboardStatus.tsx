import { useMemo } from "react";
import { motion } from "motion/react";
import { Scale, Milestone, Flame, CalendarRange, Activity } from "lucide-react";
import { AppConfig, Registro } from "../types";
import { getDiasJornada } from "../utils/dateUtils";

interface DashboardStatusProps {
  config: AppConfig;
  registros: Registro[];
}

export default function DashboardStatus({ config, registros }: DashboardStatusProps) {
  const stats = useMemo(() => {
    const pesoInicial = config.pesoInicial || 0;
    const metaPerda = config.metaPerda || 0;
    
    // Determine current weight (most recent registration date, or initial weight if none)
    let pesoAtual = pesoInicial;
    let ultimaGlicemia: number | undefined = undefined;

    if (registros.length > 0) {
      const sortedPeso = [...registros]
        .filter((r) => r.peso !== undefined && r.peso !== null && r.peso > 0)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      if (sortedPeso.length > 0) {
        pesoAtual = sortedPeso[0].peso;
      }

      const sortedGlicemia = [...registros]
        .filter((r) => r.glicemia !== undefined && r.glicemia !== null)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      
      if (sortedGlicemia.length > 0) {
        ultimaGlicemia = sortedGlicemia[0].glicemia;
      }
    }

    const perdido = pesoInicial > 0 ? pesoInicial - pesoAtual : 0;
    const falta = metaPerda > 0 ? Math.max(0, metaPerda - perdido) : 0;

    const dias = getDiasJornada(config.dataInicio) ?? 0;

    return {
      pesoAtual,
      perdido,
      falta,
      dias,
      ultimaGlicemia,
    };
  }, [config, registros]);

  // Goal completion percentage calculation
  const percent = useMemo(() => {
    const metaPerda = config.metaPerda || 0;
    const perdido = stats.perdido;
    if (metaPerda <= 0) return 0;
    return Math.max(0, Math.min(100, (perdido / metaPerda) * 100));
  }, [config.metaPerda, stats.perdido]);

  // Color interpolation from Ferrari Red rgb(255, 40, 0) to Royal Blue rgb(59, 130, 246)
  const progressColor = useMemo(() => {
    const ratio = percent / 100;
    const r = Math.round(255 - (255 - 59) * ratio);
    const g = Math.round(40 + (130 - 40) * ratio);
    const b = Math.round(0 + (246 - 0) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  }, [percent]);

  // Dynamic motivational status message
  const progressMessage = useMemo(() => {
    if (config.pesoInicial <= 0 || config.metaPerda <= 0) {
      return "Configure seu peso inicial e meta de perda de peso no menu de Perfil para começar!";
    }
    if (percent === 0) {
      return "Sua jornada começou! Faça seu primeiro registro de peso abaixo.";
    }
    if (percent < 25) {
      return "Cada grama conta! Você deu a largada rumo a uma vida muito mais saudável.";
    }
    if (percent < 50) {
      return "Excelente avanço! Mantenha os treinos e a alimentação regrada sob controle.";
    }
    if (percent < 75) {
      return "Fantástico! Mais de metade do caminho percorrido. Continue com foco total!";
    }
    if (percent < 100) {
      return "Incrível determinação! O seu objetivo está logo ali na frente.";
    }
    return "🏆 META FINAL ATINGIDA! Você conquistou 100% do seu objetivo! Parabéns!";
  }, [config.pesoInicial, config.metaPerda, percent]);

  const cards = [
    {
      title: "Peso Atual",
      value: config.pesoInicial > 0 || registros.length > 0 ? `${stats.pesoAtual.toFixed(1)} kg` : "-- kg",
      subtext: config.pesoInicial > 0 ? `Iniciado com ${config.pesoInicial.toFixed(1)} kg` : "Defina seu peso inicial",
      icon: Scale,
      colorClass: "text-indigo-600 bg-indigo-50 border-indigo-100",
      subtextColorClass: "text-slate-500"
    },
    {
      title: "Total Perdido",
      value: config.pesoInicial > 0 ? `${stats.perdido.toFixed(1)} kg` : "-- kg",
      subtext: stats.perdido > 0 
        ? `🔥 Progresso ativo!` 
        : stats.perdido < 0 
        ? "Peso aumentou um pouco" 
        : "Nenhum peso perdido ainda",
      icon: Flame,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
      subtextColorClass: stats.perdido > 0 ? "text-emerald-600 font-semibold" : "text-slate-500"
    },
    {
      title: "Falta p/ Meta",
      value: config.metaPerda > 0 ? `${stats.falta.toFixed(1)} kg` : "-- kg",
      subtext: stats.falta === 0 && config.metaPerda > 0 
        ? "🎉 META ATINGIDA!" 
        : `Meta de perda: ${config.metaPerda.toFixed(1)} kg`,
      icon: Milestone,
      colorClass: "text-orange-600 bg-orange-50 border-orange-100",
      subtextColorClass: stats.falta === 0 && config.metaPerda > 0 ? "text-emerald-600 font-bold" : "text-slate-500"
    },
    {
      title: "Tempo do Projeto",
      value: config.dataInicio ? `${stats.dias} dias` : "-- dias",
      subtext: config.dataInicio 
        ? `Início: ${config.dataInicio.split("-").reverse().join("/")}` 
        : "Defina a data de início",
      icon: CalendarRange,
      colorClass: "text-purple-600 bg-purple-50 border-purple-100",
      subtextColorClass: "text-slate-500"
    },
    {
      title: "Glicemia / Diabetes",
      value: stats.ultimaGlicemia !== undefined ? `${stats.ultimaGlicemia} mg/dL` : "-- mg/dL",
      subtext: stats.ultimaGlicemia !== undefined 
        ? (stats.ultimaGlicemia >= 126 ? "⚠️ Nível Elevado" : stats.ultimaGlicemia >= 100 ? "⚡ Nível de Atenção" : "✅ Nível Normal") 
        : "Sem medições registradas",
      icon: Activity,
      colorClass: "text-rose-600 bg-rose-50 border-rose-100",
      subtextColorClass: stats.ultimaGlicemia !== undefined && stats.ultimaGlicemia >= 126 ? "text-rose-600 font-bold" : stats.ultimaGlicemia !== undefined && stats.ultimaGlicemia >= 100 ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Weight Goal Progress Bar Card */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: progressColor }} />
              Evolução da Meta de Peso
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {progressMessage}
            </p>
          </div>
          <div className="flex items-baseline gap-1.5 self-start sm:self-center">
            <span className="text-2xl font-black tracking-tight" style={{ color: progressColor }}>
              {percent.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              concluído
            </span>
          </div>
        </div>

        {/* The Track Container */}
        <div className="relative h-4 bg-slate-100 rounded-full border border-slate-200/50 mt-10 mb-5">
          {/* Fills dynamically based on progress percent */}
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percent}%`,
              backgroundColor: progressColor,
              boxShadow: `0 0 16px ${progressColor}35`,
            }}
          />

          {/* Bobbing and sliding Runner Indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
            style={{ left: `${percent}%` }}
          >
            <div className="relative">
              {/* Bobbing text speech bubble with runner emoji */}
              <div className="absolute -top-11 -translate-x-1/2 flex flex-col items-center animate-runner">
                <div 
                  className="text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap transition-colors duration-500"
                  style={{ backgroundColor: progressColor }}
                >
                  <span className="text-xs">🏃</span>
                  <span>
                    {stats.perdido > 0 
                      ? `-${stats.perdido.toFixed(1)} kg` 
                      : stats.perdido < 0 
                      ? `+${Math.abs(stats.perdido).toFixed(1)} kg` 
                      : "0.0 kg"
                    }
                  </span>
                </div>
                {/* Pointer arrow with matching background color */}
                <div 
                  className="w-1.5 h-1.5 rotate-45 -mt-1 transition-colors duration-500" 
                  style={{ backgroundColor: progressColor }} 
                />
              </div>

              {/* Central core pulsing point */}
              <div
                className="w-5 h-5 rounded-full bg-white border-2 shadow-md flex items-center justify-center -translate-x-1/2"
                style={{ borderColor: progressColor }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: progressColor }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom indicators */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">
          <span>Início: {config.pesoInicial > 0 ? `${config.pesoInicial.toFixed(1)} kg` : "0.0 kg"}</span>
          <span className="text-center text-slate-300 hidden sm:inline">|</span>
          <span>Meta: {config.metaPerda > 0 ? `-${config.metaPerda.toFixed(1)} kg` : "0.0 kg"}</span>
          <span className="text-center text-slate-300 hidden sm:inline">|</span>
          <span style={{ color: progressColor }}>Atual: {stats.pesoAtual > 0 ? `${stats.pesoAtual.toFixed(1)} kg` : "0.0 kg"}</span>
        </div>
      </motion.div>

      {/* Grid containing the status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg border ${card.colorClass}`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {card.value}
              </p>
            </div>
            <p className={`text-xs mt-3 ${card.subtextColorClass}`}>
              {card.subtext}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
