import { useState, ChangeEvent, DragEvent, FormEvent, useMemo } from "react";
import {
  Ruler,
  TrendingDown,
  Camera,
  Plus,
  X,
  Loader2,
  Calendar,
  Sparkles,
  Scale,
  Activity,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Registro, MedidasCorporais } from "../types";

interface AbaEvolucaoMedidasProps {
  registros: Registro[];
  onAddRegistro: (registro: Omit<Registro, "id">) => void;
  onDeleteRegistro?: (id: string) => void;
}

// Client-side image compression helper
const compressImage = (file: File, maxWidth = 900, maxHeight = 900): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AbaEvolucaoMedidas({
  registros,
  onAddRegistro,
  onDeleteRegistro,
}: AbaEvolucaoMedidasProps) {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Form states
  const [data, setData] = useState(getTodayString());
  const [peso, setPeso] = useState("");
  const [cintura, setCintura] = useState("");
  const [quadril, setQuadril] = useState("");
  const [braco, setBraco] = useState("");
  const [coxa, setCoxa] = useState("");
  const [peito, setPeito] = useState("");
  const [obs, setObs] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fotoExpandida, setFotoExpandida] = useState<string | null>(null);

  // Active chart view state
  const [medidaGrafico, setMedidaGrafico] = useState<"peso" | "cintura" | "quadril" | "braco" | "todas">("peso");

  // File handling from PC
  const processFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    try {
      setIsCompressing(true);
      const compressedUrls: string[] = [];
      for (const file of validFiles) {
        const compressed = await compressImage(file);
        compressedUrls.push(compressed);
      }
      setFotos((prev) => [...prev, ...compressedUrls]);
    } catch (err) {
      console.error("Erro ao carregar fotos do PC:", err);
      alert("Houve um erro ao processar a imagem do PC.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const medidasObj: MedidasCorporais = {
      cintura: cintura ? parseFloat(cintura) : undefined,
      quadril: quadril ? parseFloat(quadril) : undefined,
      braco: braco ? parseFloat(braco) : undefined,
      coxa: coxa ? parseFloat(coxa) : undefined,
      peito: peito ? parseFloat(peito) : undefined,
    };

    onAddRegistro({
      data,
      peso: peso ? parseFloat(peso) : 0,
      fome: 5,
      obs,
      foto: fotos[0] || undefined,
      fotos: fotos.length > 0 ? fotos : undefined,
      medidas: medidasObj,
    });

    // Clear form
    setPeso("");
    setCintura("");
    setQuadril("");
    setBraco("");
    setCoxa("");
    setPeito("");
    setObs("");
    setFotos([]);
    setData(getTodayString());
    alert("✅ Registro de evolução e medidas salvo com sucesso!");
  };

  // Process timeline data for trend charts
  const sortedRegistros = useMemo(() => {
    return [...registros].sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
    );
  }, [registros]);

  const chartData = useMemo(() => {
    return sortedRegistros.map((reg, idx) => {
      const [year, month, day] = reg.data.split("-");
      return {
        id: reg.id,
        name: `${day}/${month}`,
        dataOriginal: reg.data,
        peso: reg.peso > 0 ? reg.peso : undefined,
        cintura: reg.medidas?.cintura,
        quadril: reg.medidas?.quadril,
        braco: reg.medidas?.braco,
        coxa: reg.medidas?.coxa,
        peito: reg.medidas?.peito,
        obs: reg.obs,
        fotos: reg.fotos || (reg.foto ? [reg.foto] : []),
      };
    });
  }, [sortedRegistros]);

  // Gallery of all uploaded progress photos from PC across records
  const todasFotosProgresso = useMemo(() => {
    const lista: { data: string; src: string; peso?: number; obs?: string }[] = [];
    sortedRegistros.forEach((r) => {
      const imgs = r.fotos || (r.foto ? [r.foto] : []);
      imgs.forEach((src) => {
        if (src) {
          lista.push({
            data: r.data,
            src,
            peso: r.peso,
            obs: r.obs,
          });
        }
      });
    });
    return lista;
  }, [sortedRegistros]);

  // Measurement comparisons (First vs Last)
  const comparacaoEvolucao = useMemo(() => {
    if (sortedRegistros.length === 0) return null;

    const primeiroComPeso = sortedRegistros.find((r) => r.peso > 0);
    const ultimoComPeso = [...sortedRegistros].reverse().find((r) => r.peso > 0);

    const primeiroComCintura = sortedRegistros.find((r) => r.medidas?.cintura);
    const ultimoComCintura = [...sortedRegistros].reverse().find((r) => r.medidas?.cintura);

    const pesoDiff =
      primeiroComPeso && ultimoComPeso
        ? ultimoComPeso.peso - primeiroComPeso.peso
        : 0;

    const cinturaDiff =
      primeiroComCintura?.medidas?.cintura && ultimoComCintura?.medidas?.cintura
        ? ultimoComCintura.medidas.cintura - primeiroComCintura.medidas.cintura
        : 0;

    return {
      pesoInicial: primeiroComPeso?.peso,
      pesoAtual: ultimoComPeso?.peso,
      pesoDiff,
      cinturaInicial: primeiroComCintura?.medidas?.cintura,
      cinturaAtual: ultimoComCintura?.medidas?.cintura,
      cinturaDiff,
    };
  }, [sortedRegistros]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-indigo-200 mb-3">
            <Ruler className="w-3.5 h-3.5" />
            <span>Evolução Real de Peso & Medidas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Acompanhe sua Transformação Corporal
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed font-medium">
            Registre suas medidas em centímetros, acompanhe os gráficos de tendência e carregue fotos direto do seu computador para ver sua evolução física dia a dia.
          </p>
        </div>

        {/* Highlight cards */}
        {comparacaoEvolucao && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-700/50">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Peso Atual</span>
              <span className="text-xl font-black">{comparacaoEvolucao.pesoAtual ? `${comparacaoEvolucao.pesoAtual.toFixed(1)} kg` : "--"}</span>
              {comparacaoEvolucao.pesoDiff !== 0 && (
                <span className={`text-[10px] font-bold block ${comparacaoEvolucao.pesoDiff < 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {comparacaoEvolucao.pesoDiff < 0 ? `🔻 ${Math.abs(comparacaoEvolucao.pesoDiff).toFixed(1)} kg` : `🔺 +${comparacaoEvolucao.pesoDiff.toFixed(1)} kg`}
                </span>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Cintura</span>
              <span className="text-xl font-black">{comparacaoEvolucao.cinturaAtual ? `${comparacaoEvolucao.cinturaAtual} cm` : "--"}</span>
              {comparacaoEvolucao.cinturaDiff !== 0 && (
                <span className={`text-[10px] font-bold block ${comparacaoEvolucao.cinturaDiff < 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {comparacaoEvolucao.cinturaDiff < 0 ? `🔻 ${Math.abs(comparacaoEvolucao.cinturaDiff)} cm` : `🔺 +${comparacaoEvolucao.cinturaDiff} cm`}
                </span>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Registros</span>
              <span className="text-xl font-black">{sortedRegistros.length}</span>
              <span className="text-[10px] text-indigo-200 font-bold block">Histórico total</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Fotos no Galeria</span>
              <span className="text-xl font-black">{todasFotosProgresso.length}</span>
              <span className="text-[10px] text-indigo-200 font-bold block">Do PC / Celular</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Form + Trend Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Novo Registro de Peso & Medidas
                </h2>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">
                  Preencha para atualizar seus gráficos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full rounded-xl border-slate-200 p-2.5 border text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ex: 78.5"
                  className="w-full rounded-xl border-slate-200 p-2.5 border text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Medidas Corporais (cm) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-indigo-500" />
                Medidas Corporais em Centímetros (cm)
              </span>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">
                    Cintura
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={cintura}
                    onChange={(e) => setCintura(e.target.value)}
                    placeholder="cm"
                    className="mt-1 w-full rounded-lg border-slate-200 p-2 border text-xs font-bold text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">
                    Quadril
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={quadril}
                    onChange={(e) => setQuadril(e.target.value)}
                    placeholder="cm"
                    className="mt-1 w-full rounded-lg border-slate-200 p-2 border text-xs font-bold text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">
                    Braço
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={braco}
                    onChange={(e) => setBraco(e.target.value)}
                    placeholder="cm"
                    className="mt-1 w-full rounded-lg border-slate-200 p-2 border text-xs font-bold text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">
                    Coxa
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={coxa}
                    onChange={(e) => setCoxa(e.target.value)}
                    placeholder="cm"
                    className="mt-1 w-full rounded-lg border-slate-200 p-2 border text-xs font-bold text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">
                    Peito / Busto
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={peito}
                    onChange={(e) => setPeito(e.target.value)}
                    placeholder="cm"
                    className="mt-1 w-full rounded-lg border-slate-200 p-2 border text-xs font-bold text-slate-800 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Photo upload directly from PC */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Fotos do Progresso (Direto do PC / Celular)
              </label>

              {fotos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {fotos.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                      <img src={src} alt="PC upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFotos((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("pc-foto-input")?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer text-center ${
                  dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
                }`}
              >
                <input
                  type="file"
                  id="pc-foto-input"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                {isCompressing ? (
                  <div className="flex flex-col items-center py-2">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    <span className="text-xs font-bold text-indigo-600 mt-1">Carregando do PC...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="w-6 h-6 text-indigo-500 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Selecione fotos do seu PC</span>
                    <span className="text-[10px] text-slate-400">Clique aqui para procurar no computador</span>
                  </div>
                )}
              </div>
            </div>

            {/* Obs */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Observações
              </label>
              <textarea
                rows={2}
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Ex: Treino de pernas concluído, dieta seguidade 100%"
                className="w-full rounded-xl border-slate-200 p-2.5 border text-xs text-slate-700 outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isCompressing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Salvar Evolução de Medidas
            </button>
          </form>
        </div>

        {/* Charts & Trends Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-indigo-600" />
                  Gráfico de Linha de Tendência Corporal
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Acompanhe a curva de redução real das suas medidas
                </p>
              </div>

              {/* View Selector Buttons */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setMedidaGrafico("peso")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    medidaGrafico === "peso" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Peso
                </button>
                <button
                  onClick={() => setMedidaGrafico("cintura")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    medidaGrafico === "cintura" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Cintura
                </button>
                <button
                  onClick={() => setMedidaGrafico("quadril")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    medidaGrafico === "quadril" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Quadril
                </button>
                <button
                  onClick={() => setMedidaGrafico("todas")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    medidaGrafico === "todas" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Todas
                </button>
              </div>
            </div>

            {/* Line Chart Container */}
            <div className="h-[320px] w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Ruler className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold">Nenhum registro para exibir o gráfico</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cadastre suas primeiras medidas no formulário ao lado.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {medidaGrafico === "todas" ? (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                      <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="cintura" name="Cintura (cm)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="quadril" name="Quadril (cm)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="braco" name="Braço (cm)" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  ) : (
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEvolucao" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey={medidaGrafico}
                        name={medidaGrafico === "peso" ? "Peso (kg)" : `${medidaGrafico} (cm)`}
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorEvolucao)"
                        dot={{ r: 5, fill: "#4f46e5" }}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PC Photo Evolution Gallery */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Galeria Visual de Comparação (Fotos do PC)
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Veja seu progresso físico lado a lado em alta qualidade
              </p>
            </div>
          </div>

          <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black">
            {todasFotosProgresso.length} {todasFotosProgresso.length === 1 ? "foto" : "fotos"}
          </span>
        </div>

        {todasFotosProgresso.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <Camera className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">Nenhuma foto do PC cadastrada ainda</p>
            <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
              Carregue fotos do seu computador no formulário acima para construir sua galeria de antes e depois.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {todasFotosProgresso.map((foto, idx) => {
              const [year, month, day] = foto.data.split("-");
              return (
                <div
                  key={idx}
                  onClick={() => setFotoExpandida(foto.src)}
                  className="group relative bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-300"
                >
                  <img
                    src={foto.src}
                    alt={`Evolução ${foto.data}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-black uppercase text-indigo-300">
                      {day}/{month}/{year}
                    </span>
                    {foto.peso && (
                      <span className="text-xs font-black">{foto.peso.toFixed(1)} kg</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expanded Photo Modal */}
      <AnimatePresence>
        {fotoExpandida && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
              <button
                onClick={() => setFotoExpandida(null)}
                className="absolute -top-10 right-0 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={fotoExpandida}
                alt="Foto Expandida"
                className="max-h-[80vh] w-auto rounded-2xl shadow-2xl object-contain border border-white/20"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
