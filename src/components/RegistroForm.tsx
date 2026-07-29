import { useState, FormEvent, DragEvent, ChangeEvent } from "react";
import { PlusCircle, Camera, Image as ImageIcon, X, Loader2, Plus, Activity, Calculator } from "lucide-react";
import { Registro } from "../types";
import CalculoIMC from "./CalculoIMC";

interface RegistroFormProps {
  onAddRegistro: (registro: Omit<Registro, "id">) => void;
  onAplicarMeta?: (novaMetaPerda: number) => void;
}

// Client-side image compression and resizing helper
const compressImage = (file: File, maxWidth = 800, maxHeight = 800): Promise<string> => {
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
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality jpeg
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

export default function RegistroForm({ onAddRegistro, onAplicarMeta }: RegistroFormProps) {
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [data, setData] = useState(getTodayString());
  const [peso, setPeso] = useState("");
  const [glicemia, setGlicemia] = useState("");
  const [fome, setFome] = useState(5);
  const [obs, setObs] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showCalculoIMC, setShowCalculoIMC] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
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
      console.error("Erro ao processar imagem(ns):", err);
      alert("Houve um erro ao carregar algumas fotos.");
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

  const removeFoto = (indexToRemove: number) => {
    setFotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!data) return;

    onAddRegistro({
      data,
      peso: peso ? parseFloat(peso) : 0,
      fome,
      glicemia: glicemia ? parseFloat(glicemia) : undefined,
      obs,
      foto: fotos[0] || undefined, // First photo for single-image backwards compatibility
      fotos: fotos.length > 0 ? fotos : undefined,
    });

    // Reset fields
    setPeso("");
    setGlicemia("");
    setFome(5);
    setObs("");
    setFotos([]);
    setData(getTodayString());
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider flex items-center">
          <PlusCircle className="w-5 h-5 mr-2 text-indigo-500" />
          Novo Registro
        </h2>
        <button
          type="button"
          onClick={() => setShowCalculoIMC(!showCalculoIMC)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            showCalculoIMC
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{showCalculoIMC ? "Ocultar IMC" : "Calcular IMC & Meta"}</span>
        </button>
      </div>

      {showCalculoIMC && (
        <div className="bg-slate-50 p-1 rounded-2xl border border-indigo-100 animate-fade-in mb-4">
          <CalculoIMC
            pesoInicialDefault={peso ? parseFloat(peso) : 80}
            onAplicarMeta={(novaMeta) => {
              if (onAplicarMeta) onAplicarMeta(novaMeta);
              setShowCalculoIMC(false);
            }}
            inModal={true}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Data
            </label>
            <input
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border-slate-200 p-2 border text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Peso (kg)</span>
              <span className="text-[9px] text-slate-400 font-normal">Opcional</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="0.0"
              className="mt-1.5 block w-full rounded-lg border-slate-200 p-2 border text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Diabetes / Glicemia Field */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              Glicemia / Diabetes (mg/dL)
            </span>
            <span className="text-[9px] text-slate-400 font-normal">Opcional</span>
          </label>
          <div className="relative mt-1.5">
            <input
              type="number"
              step="1"
              value={glicemia}
              onChange={(e) => setGlicemia(e.target.value)}
              placeholder="Ex: 95 mg/dL"
              className="block w-full rounded-lg border-slate-200 p-2 pr-16 border text-sm font-bold text-slate-700 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
              mg/dL
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Nível de Fome
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={fome}
            onChange={(e) => setFome(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none mt-3"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
            <span>POUCA</span>
            <span className="text-indigo-600 text-sm font-black">{fome}</span>
            <span>MUITA</span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Observações
          </label>
          <textarea
            rows={2}
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Como foi seu dia? Alimentação, treinos..."
            className="mt-1.5 block w-full rounded-lg border-slate-200 p-2 border text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Premium Multiple File Upload Block */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Fotos do Progresso (Opcional)
            </label>
            {fotos.length > 0 && (
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-black">
                {fotos.length} {fotos.length === 1 ? "foto" : "fotos"}
              </span>
            )}
          </div>
          
          {/* List/Grid of loaded photos */}
          {fotos.length > 0 && (
            <div className="grid grid-cols-4 gap-2.5 mb-3">
              {fotos.map((src, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square group">
                  <img 
                    src={src} 
                    alt={`Progresso ${idx + 1}`} 
                    className="w-full h-full object-cover animate-fade-in"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeFoto(idx)}
                      className="bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1.5 shadow-md active:scale-90 transition-all cursor-pointer"
                      title="Remover foto"
                    >
                      <X className="w-3.5 h-3.5 font-bold" />
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black/60 text-[8px] font-black text-white px-1 py-0.2 rounded">
                    #{idx + 1}
                  </div>
                </div>
              ))}
              
              {/* Add more button in the grid */}
              <button
                type="button"
                onClick={() => document.getElementById("registro-foto-input")?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center aspect-square text-slate-400 hover:text-indigo-500 transition-all cursor-pointer bg-slate-50/50"
                title="Adicionar mais fotos"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">Mais</span>
              </button>
            </div>
          )}

          {/* Upload Drop Zone (only displays main helper text if no photos yet uploaded) */}
          {fotos.length === 0 && (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("registro-foto-input")?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer select-none text-center ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50/50"
                  : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50"
              }`}
            >
              <input
                type="file"
                id="registro-foto-input"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              {isCompressing ? (
                <div className="flex flex-col items-center py-2">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-xs font-bold text-indigo-600 mt-2 uppercase tracking-wider animate-pulse">
                    Otimizando Foto...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-2.5 bg-slate-100 rounded-full text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-colors">
                    <Camera className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-600 mt-2">
                    Clique para enviar ou arraste fotos aqui
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Selecione várias fotos do seu progresso
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Keep the hidden file input available for grid adding even when photos list is populated */}
          <input
            type="file"
            id="registro-foto-input-secondary"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <button
          type="submit"
          disabled={isCompressing}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:bg-indigo-400 disabled:scale-100 text-white py-3 rounded-xl transition-all font-black shadow-sm uppercase tracking-widest text-xs"
        >
          {isCompressing ? "Processando Imagens..." : "Registrar Agora"}
        </button>
      </form>
    </div>
  );
}
