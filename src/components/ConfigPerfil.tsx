import { useState, ChangeEvent } from "react";
import { User, Camera, Trash2, Loader2 } from "lucide-react";
import { AppConfig } from "../types";

interface ConfigPerfilProps {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
  inSidebar?: boolean;
}

// Client-side image compression and resizing helper
const compressImage = (file: File, maxWidth = 400, maxHeight = 400): Promise<string> => {
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
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
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

export default function ConfigPerfil({ config, onChange, inSidebar = false }: ConfigPerfilProps) {
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) return;
      try {
        setIsCompressing(true);
        const compressed = await compressImage(file);
        onChange("foto", compressed);
      } catch (err) {
        console.error("Erro ao carregar foto do perfil:", err);
        alert("Erro ao carregar a foto.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  if (inSidebar) {
    return (
      <div className="space-y-3">
        {/* Profile photo in sidebar */}
        <div className="flex items-center gap-3 bg-slate-850 p-2.5 rounded-xl border border-slate-800">
          <label className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-700 cursor-pointer bg-slate-800 flex items-center justify-center shrink-0 hover:border-indigo-500 transition-colors group">
            {isCompressing ? (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            ) : config.foto ? (
              <img src={config.foto} alt="Foto do perfil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-500" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
          <div className="overflow-hidden flex-1">
            <input
              type="text"
              placeholder="Seu Nome Completo"
              value={config.nome || ""}
              onChange={(e) => onChange("nome", e.target.value)}
              className="w-full bg-transparent border-0 p-0 text-xs font-bold text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">Clique para alterar a foto</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Idade
            </label>
            <input
              type="number"
              value={config.idade || ""}
              onChange={(e) => onChange("idade", parseInt(e.target.value) || 0)}
              className="mt-1 block w-full rounded-lg bg-slate-850 border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-1.5 font-bold text-xs outline-none transition-all"
              placeholder="Anos"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Sexo
            </label>
            <select
              value={config.sexo || ""}
              onChange={(e) => onChange("sexo", e.target.value)}
              className="mt-1 block w-full rounded-lg bg-slate-850 border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-1.5 font-bold text-xs outline-none transition-all cursor-pointer"
            >
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
            Peso Inicial (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={config.pesoInicial || ""}
            onChange={(e) =>
              onChange("pesoInicial", parseFloat(e.target.value) || 0)
            }
            className="mt-1 block w-full rounded-lg bg-slate-850 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-1.5 font-bold text-xs outline-none transition-all"
            placeholder="0.0"
          />
        </div>
        <div>
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
            Meta de Perda (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={config.metaPerda || ""}
            onChange={(e) =>
              onChange("metaPerda", parseFloat(e.target.value) || 0)
            }
            className="mt-1 block w-full rounded-lg bg-slate-850 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-1.5 font-bold text-xs outline-none transition-all"
            placeholder="0.0"
          />
        </div>
        <div>
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
            Data de Início
          </label>
          <input
            type="date"
            value={config.dataInicio}
            onChange={(e) => onChange("dataInicio", e.target.value)}
            className="mt-1 block w-full rounded-lg bg-slate-850 border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-1.5 font-bold text-xs outline-none transition-all"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-700 flex items-center uppercase tracking-wider">
          <User className="w-5 h-5 mr-2 text-indigo-500" />
          Configurações do Perfil
        </h2>
        {config.foto && (
          <button
            type="button"
            onClick={() => onChange("foto", "")}
            className="text-[10px] text-rose-500 hover:text-rose-700 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-transparent border-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remover Foto
          </button>
        )}
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Picture and basic info (Col Span 4) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center bg-slate-50/50 p-6 rounded-2xl border border-slate-150">
          <label className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-slate-300 hover:border-indigo-500 cursor-pointer bg-white flex flex-col items-center justify-center transition-all group shadow-sm">
            {isCompressing ? (
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            ) : config.foto ? (
              <img src={config.foto} alt="Foto do perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-3">
                <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1 group-hover:text-indigo-500 transition-colors" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Foto do Perfil</span>
              </div>
            )}
            {config.foto && !isCompressing && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
          <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider mt-3">
            Carregar foto direta do PC
          </p>
        </div>

        {/* Right: Personal Data (Col Span 8) */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Digite seu nome completo"
              value={config.nome || ""}
              onChange={(e) => onChange("nome", e.target.value)}
              className="block w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border font-semibold text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Sexo
            </label>
            <select
              value={config.sexo || ""}
              onChange={(e) => onChange("sexo", e.target.value)}
              className="block w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border font-bold text-sm text-slate-700 outline-none transition-all cursor-pointer"
            >
              <option value="">Selecione uma opção</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
              <option value="Não informado">Não informado</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Idade (Anos)
            </label>
            <input
              type="number"
              placeholder="Ex: 30"
              value={config.idade || ""}
              onChange={(e) => onChange("idade", parseInt(e.target.value) || 0)}
              className="block w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border font-semibold text-sm text-slate-700 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Peso Inicial (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={config.pesoInicial || ""}
              onChange={(e) =>
                onChange("pesoInicial", parseFloat(e.target.value) || 0)
              }
              className="block w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border font-bold text-slate-700 outline-none transition-all"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Meta de Perda (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={config.metaPerda || ""}
              onChange={(e) =>
                onChange("metaPerda", parseFloat(e.target.value) || 0)
              }
              className="block w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border font-bold text-slate-700 outline-none transition-all"
              placeholder="0.0"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Data de Início da Jornada
            </label>
            <input
              type="date"
              value={config.dataInicio}
              onChange={(e) => onChange("dataInicio", e.target.value)}
              className="block w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border font-bold text-slate-700 outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
