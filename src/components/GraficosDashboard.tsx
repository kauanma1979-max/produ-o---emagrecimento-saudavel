import { useMemo } from "react";
import { LineChart as LucideLineChart, BarChart3, Activity } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Registro } from "../types";

interface GraficosDashboardProps {
  registros: Registro[];
}

export default function GraficosDashboard({ registros }: GraficosDashboardProps) {
  // Process and sort records ascendingly by date (oldest to newest) for chronological progress
  const chartData = useMemo(() => {
    const sorted = [...registros].sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
    );
    return sorted.map((reg, index) => ({
      name: `#${index + 1}`,
      peso: reg.peso,
      fome: reg.fome,
      glicemia: reg.glicemia,
      data: reg.data,
      obs: reg.obs,
    }));
  }, [registros]);

  // Specific chart data for weight filtering out records where weight is 0 or missing
  const weightChartData = useMemo(() => {
    return chartData.filter((d) => d.peso !== undefined && d.peso !== null && d.peso > 0);
  }, [chartData]);

  // Check if there are any glicemia records available
  const hasGlicemiaData = useMemo(() => {
    return chartData.some((d) => d.glicemia !== undefined && d.glicemia !== null);
  }, [chartData]);

  // Determine minimum and maximum weight to auto-focus the Y axis
  const weightDomain = useMemo(() => {
    if (weightChartData.length === 0) return [0, 100];
    const weights = weightChartData.map((d) => d.peso);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const padding = (max - min) * 0.1 || 2;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [weightChartData]);

  // Determine domain for Glicemia Y axis
  const glicemiaDomain = useMemo(() => {
    const glicemias = chartData
      .map((d) => d.glicemia)
      .filter((g): g is number => g !== undefined && g !== null && !isNaN(g));
    if (glicemias.length === 0) return [60, 160];
    const min = Math.min(...glicemias);
    const max = Math.max(...glicemias);
    const padding = (max - min) * 0.15 || 15;
    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
  }, [chartData]);

  // Custom Tooltip component for weight
  const CustomWeightTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const [year, month, day] = data.data.split("-");
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-md text-xs">
          <p className="font-black text-slate-700 mb-1">{`${day}/${month}/${year}`}</p>
          <p className="text-indigo-600 font-bold">{`Peso: ${data.peso.toFixed(1)} kg`}</p>
          {data.glicemia !== undefined && (
            <p className="text-rose-600 font-bold text-[11px] mt-0.5">{`Glicemia: ${data.glicemia} mg/dL`}</p>
          )}
          {data.obs && (
            <p className="text-slate-400 italic mt-1 max-w-[200px] text-[10px] break-words">
              &quot;{data.obs}&quot;
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip component for glicemia / diabetes
  const CustomGlicemiaTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.glicemia === undefined || data.glicemia === null) return null;
      const [year, month, day] = data.data.split("-");
      let statusText = "Normal (< 100)";
      let statusClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
      if (data.glicemia >= 126) {
        statusText = "Elevado (≥ 126)";
        statusClass = "text-rose-700 bg-rose-50 border-rose-200";
      } else if (data.glicemia >= 100) {
        statusText = "Atenção (100 - 125)";
        statusClass = "text-amber-700 bg-amber-50 border-amber-200";
      }

      return (
        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-md text-xs space-y-1">
          <p className="font-black text-slate-700">{`${day}/${month}/${year}`}</p>
          <p className="text-rose-600 font-extrabold text-sm">{`Glicemia: ${data.glicemia} mg/dL`}</p>
          <div className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full border ${statusClass}`}>
            {statusText}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip component for hunger
  const CustomHungerTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const [year, month, day] = data.data.split("-");
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-md text-xs">
          <p className="font-black text-slate-700 mb-1">{`${day}/${month}/${year}`}</p>
          <p className="text-indigo-600 font-bold">{`Fome: ${data.fome}/10`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Chart 1: Progresso de Peso */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold mb-4 text-slate-700 uppercase tracking-wider flex items-center">
          <LucideLineChart className="w-5 h-5 mr-2 text-indigo-500" />
          Progresso de Peso
        </h2>
        <div className="h-[260px] w-full">
          {weightChartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-slate-400 font-medium">
              Sem dados de peso para exibir
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weightChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={weightDomain}
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomWeightTooltip />} />
                <Area
                  type="monotone"
                  dataKey="peso"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPeso)"
                  dot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Medição de Glicemia / Diabetes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <Activity className="w-5 h-5 mr-2 text-rose-500" />
            Glicemia / Diabetes
          </h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
            mg/dL
          </span>
        </div>
        <div className="h-[260px] w-full">
          {!hasGlicemiaData ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-4">
              <Activity className="w-8 h-8 text-rose-300 mb-2 animate-pulse" />
              <p className="text-xs font-bold text-slate-500">Nenhum registro de glicemia ainda</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                Informe o nível de glicemia ao criar um novo registro para acompanhar a evolução aqui.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData.filter((d) => d.glicemia !== undefined && d.glicemia !== null)}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorGlicemia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={glicemiaDomain}
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomGlicemiaTooltip />} />
                <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Normal (100)', fill: '#10b981', fontSize: 9 }} />
                <Area
                  type="monotone"
                  dataKey="glicemia"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGlicemia)"
                  dot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 3: Análise de Fome */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:col-span-2 lg:col-span-1">
        <h2 className="text-lg font-bold mb-4 text-slate-700 uppercase tracking-wider flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-indigo-500" />
          Análise de Fome
        </h2>
        <div className="h-[260px] w-full">
          {chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-slate-400 font-medium">
              Sem dados de fome para exibir
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomHungerTooltip />} />
                <Bar
                  dataKey="fome"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
