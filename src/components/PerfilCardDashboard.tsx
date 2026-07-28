import { useMemo } from "react";
import { User, Calendar, Settings, Syringe, Award, Scale, Camera, Target } from "lucide-react";
import { AppConfig, Registro } from "../types";
import { getScheduleStatusForDate } from "./RastreadorInjecaoCard";
import { getDiasJornada } from "../utils/dateUtils";

interface PerfilCardDashboardProps {
  config: AppConfig;
  registros?: Registro[];
  onOpenConfigModal: () => void;
}

export default function PerfilCardDashboard({
  config,
  registros = [],
  onOpenConfigModal,
}: PerfilCardDashboardProps) {
  // Get today's injection schedule status (correlating date with Tirzepatida / Retatrutida)
  const scheduleStatus = useMemo(() => {
    return getScheduleStatusForDate();
  }, []);

  // Calculate elapsed days since journey start
  const diasJornada = useMemo(() => {
    return getDiasJornada(config.dataInicio);
  }, [config.dataInicio]);

  // Calculate current weight from the latest registration date
  const pesoAtual = useMemo(() => {
    if (!registros || registros.length === 0) return config.pesoInicial || null;
    const sorted = [...registros]
      .filter((r) => r.peso !== undefined && r.peso !== null && r.peso > 0)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    return sorted.length > 0 ? sorted[0].peso : config.pesoInicial || null;
  }, [registros, config.pesoInicial]);

  const metaFinalPeso = useMemo(() => {
    if (config.pesoInicial && config.metaPerda) {
      return (config.pesoInicial - config.metaPerda).toFixed(1);
    }
    return null;
  }, [config.pesoInicial, config.metaPerda]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden transition-all">
      {/* Glow background effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

      {/* Main Top Header: Photo + Info + Actions */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left / Center Section: Avatar & Details */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full">
          
          {/* Photo Container with High Prominence */}
          <div 
            onClick={onOpenConfigModal}
            className="relative group cursor-pointer shrink-0"
            title="Clique para alterar foto e dados do perfil"
          >
            {config.foto ? (
              <img
                src={config.foto}
                alt={config.nome || "Foto de Perfil"}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-indigo-500/20 group-hover:ring-indigo-500/50 shadow-xl border-4 border-white transition-all duration-300 transform group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-3xl uppercase ring-4 ring-indigo-500/20 shadow-xl border-4 border-white group-hover:ring-indigo-500/50 transition-all duration-300">
                {config.nome
                  ? config.nome
                      .trim()
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "UF"}
              </div>
            )}
            
            {/* Edit overlay on hover */}
            <div className="absolute inset-0 bg-slate-900/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
              <Camera className="w-6 h-6" />
            </div>
          </div>

          {/* Symmetrical User Details with Enlarged Typography */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                {config.nome || "Usuário Focado"}
              </h2>

              <button
                type="button"
                onClick={onOpenConfigModal}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer sm:hidden"
                title="Editar Perfil"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Symmetrical Badges Bar */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              {config.sexo && (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  {config.sexo}
                </span>
              )}

              {config.idade ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-100 shadow-2xs">
                  🎂 {config.idade} anos
                </span>
              ) : null}

              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Início: {config.dataInicio ? config.dataInicio.split("-").reverse().join("/") : "--/--/----"}
              </span>
            </div>

            {/* Destaque Maior para Dias em Transformação Contínua */}
            <div className="pt-1">
              {diasJornada !== null ? (
                <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-50 via-purple-50/70 to-indigo-50 border border-indigo-200/90 px-4 py-2 rounded-2xl shadow-xs transition-all hover:border-indigo-300">
                  <span className="text-lg">🚀</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-700">
                    <strong className="text-indigo-600 font-black text-sm sm:text-base">{diasJornada} dias</strong> em transformação contínua
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium">
                  Defina sua data de início para acompanhar seus dias de jornada
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenConfigModal}
          className="shrink-0 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-indigo-200/80 shadow-2xs cursor-pointer relative z-10 w-full md:w-auto"
        >
          <Settings className="w-4 h-4 text-indigo-600" />
          <span>Configurar Perfil</span>
        </button>
      </div>

      {/* Symmetrical Bottom Grid: Injection Date Correlation & Goal Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 relative z-10">
        
        {/* Box 1: Correlação da Data - Tirzepatida ou Retatrutida */}
        <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 transition-all ${
          scheduleStatus.isToday
            ? scheduleStatus.medication === "Tirzepatida"
              ? "bg-blue-50/70 border-blue-200 shadow-sm"
              : "bg-emerald-50/70 border-emerald-200 shadow-sm"
            : "bg-slate-50/80 border-slate-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Syringe className={`w-3.5 h-3.5 ${
                scheduleStatus.isToday
                  ? scheduleStatus.medication === "Tirzepatida" ? "text-blue-600" : "text-emerald-600"
                  : "text-indigo-500"
              }`} />
              Aplicação de Hoje
            </span>
            {scheduleStatus.isToday && (
              <span className="animate-pulse flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </div>

          <div>
            {scheduleStatus.isToday ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-base font-black px-2.5 py-0.5 rounded-lg ${
                    scheduleStatus.medication === "Tirzepatida"
                      ? "bg-blue-600 text-white"
                      : "bg-emerald-600 text-white"
                  }`}>
                    {scheduleStatus.medication}
                  </span>
                  <span className="text-xs font-black text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {scheduleStatus.dosage}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-600 mt-1">
                  📍 {scheduleStatus.mainArea} <span className="text-slate-400 font-normal">({scheduleStatus.microArea})</span>
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-600">
                  Sem aplicação agendada para hoje.
                </p>
                {scheduleStatus.nextMedication ? (
                  <div className="bg-white p-2 rounded-xl border border-slate-200 text-xs mt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Próxima Aplicação:</span>
                    <span className="font-black text-indigo-700">{scheduleStatus.nextDateStr} ({scheduleStatus.nextDayOfWeek})</span>:{" "}
                    <strong className="text-slate-800">{scheduleStatus.nextMedication} ({scheduleStatus.nextDosage})</strong>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">Consulte a aba de injeções para o calendário completo.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Box 2: Peso Inicial & Peso Atual */}
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-500" />
              Peso Inicial & Atual
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase block">Peso Inicial</span>
              <span className="text-base font-black text-slate-800">
                {config.pesoInicial ? `${config.pesoInicial} kg` : "--"}
              </span>
            </div>

            <div className="bg-white p-2 rounded-xl border border-indigo-100/80 bg-indigo-50/30">
              <span className="text-[9px] font-black text-indigo-500 uppercase block">Peso Atual</span>
              <span className="text-base font-black text-indigo-600">
                {pesoAtual !== null ? `${pesoAtual.toFixed(1)} kg` : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* Box 3: Meta Alvo Projetada & Meta de Perda */}
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              Meta Alvo Projetada
            </span>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Objetivo
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white p-2 rounded-xl border border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase block">Peso Alvo Final</span>
              <span className="text-base font-black text-indigo-600">
                {metaFinalPeso ? `${metaFinalPeso} kg` : "--"}
              </span>
            </div>

            <div className="bg-white p-2 rounded-xl border border-emerald-100/80 bg-emerald-50/30">
              <span className="text-[9px] font-black text-emerald-600 uppercase block">Meta de Perda</span>
              <span className="text-base font-black text-emerald-600">
                {config.metaPerda ? `-${config.metaPerda} kg` : "--"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
