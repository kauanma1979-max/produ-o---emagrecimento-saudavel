import { useState, useMemo, MouseEvent, ChangeEvent, FormEvent } from "react";
import { 
  History, 
  Trash2, 
  Camera, 
  X, 
  Calendar, 
  Scale, 
  Flame, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ImageIcon,
  Edit2,
  Loader2,
  Activity
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Registro } from "../types";

interface HistoricoTabelaProps {
  registros: Registro[];
  onDeleteRegistro: (id: string) => void;
  onUpdateRegistro: (registro: Registro) => void;
}

export default function HistoricoTabela({
  registros,
  onDeleteRegistro,
  onUpdateRegistro,
}: HistoricoTabelaProps) {
  const [activeReg, setActiveReg] = useState<Registro | null>(null);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  // States for editing a record
  const [editingReg, setEditingReg] = useState<Registro | null>(null);
  const [editData, setEditData] = useState("");
  const [editPeso, setEditPeso] = useState("");
  const [editGlicemia, setEditGlicemia] = useState("");
  const [editFome, setEditFome] = useState(5);
  const [editObs, setEditObs] = useState("");
  const [editFotos, setEditFotos] = useState<string[]>([]);
  const [isCompressingEdit, setIsCompressingEdit] = useState(false);

  // Client-side image compression helper
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

  const handleOpenEdit = (reg: Registro) => {
    setEditingReg(reg);
    setEditData(reg.data);
    setEditPeso(reg.peso.toString());
    setEditGlicemia(reg.glicemia !== undefined ? reg.glicemia.toString() : "");
    setEditFome(reg.fome);
    setEditObs(reg.obs || "");
    const initialFotos = reg.fotos && reg.fotos.length > 0
      ? [...reg.fotos]
      : (reg.foto ? [reg.foto] : []);
    setEditFotos(initialFotos);
  };

  const handleEditFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      const validFiles = filesArray.filter(file => file.type.startsWith("image/"));
      if (validFiles.length === 0) return;

      try {
        setIsCompressingEdit(true);
        const compressedUrls: string[] = [];
        for (const file of validFiles) {
          const compressed = await compressImage(file);
          compressedUrls.push(compressed);
        }
        setEditFotos((prev) => [...prev, ...compressedUrls]);
      } catch (err) {
        console.error("Erro ao processar imagem(ns):", err);
        alert("Houve um erro ao carregar algumas fotos.");
      } finally {
        setIsCompressingEdit(false);
      }
    }
  };

  const handleRemoveEditFoto = (idxToRemove: number) => {
    setEditFotos((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingReg || !editData) return;

    const updatedReg: Registro = {
      ...editingReg,
      data: editData,
      peso: editPeso ? parseFloat(editPeso) : 0,
      glicemia: editGlicemia ? parseFloat(editGlicemia) : undefined,
      fome: editFome,
      obs: editObs,
      foto: editFotos[0] || undefined,
      fotos: editFotos.length > 0 ? editFotos : undefined,
    };

    onUpdateRegistro(updatedReg);
    setEditingReg(null);
  };

  // Compute ordered and sorted list
  const sortedRegistros = useMemo(() => {
    const withOriginalIndex = registros.map((r, index) => ({
      ...r,
      originalIndex: index + 1,
    }));
    return withOriginalIndex.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }, [registros]);

  // Extract photos list with fallback to single legacy photo
  const activePhotos = useMemo(() => {
    if (!activeReg) return [];
    if (activeReg.fotos && activeReg.fotos.length > 0) {
      return activeReg.fotos;
    }
    if (activeReg.foto) {
      return [activeReg.foto];
    }
    return [];
  }, [activeReg]);

  const handleOpenLightbox = (reg: Registro) => {
    setCurrentPhotoIdx(0);
    setActiveReg(reg);
  };

  const handleNextPhoto = (e: MouseEvent) => {
    e.stopPropagation();
    if (activePhotos.length > 1) {
      setCurrentPhotoIdx((prev) => (prev + 1) % activePhotos.length);
    }
  };

  const handlePrevPhoto = (e: MouseEvent) => {
    e.stopPropagation();
    if (activePhotos.length > 1) {
      setCurrentPhotoIdx((prev) => (prev - 1 + activePhotos.length) % activePhotos.length);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Deseja realmente excluir este registro com todas as fotos anexadas?")) {
      onDeleteRegistro(id);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2 flex flex-col relative">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider flex items-center">
          <History className="w-5 h-5 mr-2 text-indigo-500" />
          Histórico Detalhado
        </h2>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold">
          {sortedRegistros.length} registros
        </span>
      </div>

      <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-3">Avaliação</th>
              <th className="px-6 py-3">Fotos</th>
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3">Peso</th>
              <th className="px-6 py-3">Glicemia</th>
              <th className="px-6 py-3">Nível Fome</th>
              <th className="px-6 py-3">Obs.</th>
              <th className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {sortedRegistros.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm text-slate-400 font-medium"
                >
                  Nenhum registro encontrado. Comece adicionando um ao lado!
                </td>
              </tr>
            ) : (
              sortedRegistros.map((reg) => {
                // Determine Hunger Badge style
                let hungerBadgeClass = "bg-emerald-100 text-emerald-800";
                if (reg.fome > 7) {
                  hungerBadgeClass = "bg-rose-100 text-rose-800";
                } else if (reg.fome > 4) {
                  hungerBadgeClass = "bg-amber-100 text-amber-800";
                }

                // Check count of photos
                const totalPhotos = reg.fotos ? reg.fotos.length : (reg.foto ? 1 : 0);

                return (
                  <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs font-black text-indigo-600 uppercase">
                      #{reg.originalIndex}
                    </td>
                    
                    {/* Photos Thumbnail / Counter Column */}
                    <td className="px-6 py-4">
                      {totalPhotos > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleOpenLightbox(reg)}
                          className="relative h-11 w-11 rounded-lg overflow-hidden border border-slate-200 block shadow-xs hover:border-indigo-500 hover:scale-105 active:scale-95 hover:shadow-md transition-all group cursor-pointer"
                        >
                          <img
                            src={reg.fotos ? reg.fotos[0] : reg.foto}
                            alt={`Foto #${reg.originalIndex}`}
                            className="h-full w-full object-cover"
                          />
                          {totalPhotos > 1 && (
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl shadow">
                              +{totalPhotos - 1}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-indigo-900/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-3.5 h-3.5 text-white drop-shadow-md" />
                          </div>
                        </button>
                      ) : (
                        <div className="h-11 w-11 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300" title="Sem fotos">
                          <Camera className="w-4 h-4" />
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {formatDate(reg.data)}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-800">
                      {reg.peso && reg.peso > 0 ? `${reg.peso.toFixed(1)} kg` : "---"}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">
                      {reg.glicemia !== undefined && reg.glicemia !== null ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg font-black border border-rose-100/80 shadow-2xs">
                          <Activity className="w-3.5 h-3.5 text-rose-500" />
                          {reg.glicemia} <span className="text-[9px] text-rose-400 font-bold">mg/dL</span>
                        </span>
                      ) : (
                        <span className="text-slate-300 font-medium">---</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${hungerBadgeClass}`}>
                          {reg.fome}/10
                        </span>
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                          <div
                            className={`h-1.5 rounded-full ${
                              reg.fome > 7 ? "bg-rose-500" : reg.fome > 4 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${reg.fome * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 text-xs text-slate-500 italic max-w-[150px] truncate"
                      title={reg.obs || "Sem observações"}
                    >
                      {reg.obs || "---"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(reg)}
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                          title="Editar Registro"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(reg.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modern Photo Lightbox & Details Modal */}
      <AnimatePresence>
        {activeReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReg(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Card content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 z-10 grid grid-cols-1 md:grid-cols-12"
            >
              {/* Left Column (Span 7): Photos Carousel */}
              <div className="relative bg-slate-950 h-72 md:h-[500px] flex items-center justify-center col-span-1 md:col-span-7 select-none overflow-hidden group/carousel">
                {activePhotos.length > 0 ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Main Active Photo */}
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentPhotoIdx}
                        src={activePhotos[currentPhotoIdx]}
                        alt="Progresso do peso"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="w-full h-full object-contain"
                      />
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {activePhotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevPhoto}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/60 text-white p-2 rounded-full border border-white/10 active:scale-90 transition-all cursor-pointer opacity-80 group-hover/carousel:opacity-100 shadow-md"
                          title="Foto anterior"
                        >
                          <ChevronLeft className="w-5 h-5 font-bold" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextPhoto}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/60 text-white p-2 rounded-full border border-white/10 active:scale-90 transition-all cursor-pointer opacity-80 group-hover/carousel:opacity-100 shadow-md"
                          title="Próxima foto"
                        >
                          <ChevronRight className="w-5 h-5 font-bold" />
                        </button>
                      </>
                    )}

                    {/* Photo Index Indicator Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{currentPhotoIdx + 1} / {activePhotos.length}</span>
                    </div>

                    {/* Tiny Dots Indicator */}
                    {activePhotos.length > 1 && (
                      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
                        {activePhotos.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentPhotoIdx(dotIdx);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              dotIdx === currentPhotoIdx ? "w-4 bg-indigo-500" : "w-1.5 bg-white/50 hover:bg-white"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Camera className="w-12 h-12 text-slate-600 animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-wider">Sem fotos carregadas</p>
                  </div>
                )}

                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest border border-white/10">
                  Registro #{sortedRegistros.findIndex(r => r.id === activeReg.id) !== -1 ? sortedRegistros.find(r => r.id === activeReg.id)?.originalIndex : ""}
                </div>
              </div>

              {/* Right Column (Span 5): Details & Stats */}
              <div className="p-6 md:p-8 flex flex-col justify-between bg-white h-[430px] md:h-[500px] col-span-1 md:col-span-5 border-t md:border-t-0 md:border-l border-slate-100">
                <div>
                  {/* Title & Close button */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-wider">
                        Detalhes do Registro
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Visão detalhada do seu progresso</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveReg(null)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Weight, Date, and Glicemia quick highlights */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100 flex items-center gap-3">
                      <div className="p-2 bg-indigo-500 rounded-xl text-white">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Peso do Dia</p>
                        <p className="text-base font-black text-indigo-600">{activeReg.peso.toFixed(1)} kg</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
                      <div className="p-2 bg-slate-500 rounded-xl text-white">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Data</p>
                        <p className="text-xs font-black text-slate-700">{formatDate(activeReg.data)}</p>
                      </div>
                    </div>

                    {activeReg.glicemia !== undefined && (
                      <div className="bg-rose-50/50 rounded-2xl p-3 border border-rose-100 flex items-center gap-3 col-span-2 md:col-span-1">
                        <div className="p-2 bg-rose-500 rounded-xl text-white">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Glicemia</p>
                          <p className="text-base font-black text-rose-600">{activeReg.glicemia} mg/dL</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hunger stats inside modal */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-indigo-500" /> Nível de Fome</span>
                      <span className="text-indigo-600 font-black">{activeReg.fome}/10</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          activeReg.fome > 7 ? "bg-rose-500" : activeReg.fome > 4 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${activeReg.fome * 10}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Observations block */}
                  <div className="space-y-1 bg-slate-50/75 p-3.5 rounded-2xl border border-slate-100 max-h-[140px] overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      Observações Diárias
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
                      {activeReg.obs ? `"${activeReg.obs}"` : "Nenhuma observação informada para este dia."}
                    </p>
                  </div>
                </div>

                {/* Footer action button */}
                <button
                  onClick={() => setActiveReg(null)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer mt-4"
                >
                  Fechar Visualização
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Registration Modal */}
      <AnimatePresence>
        {editingReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingReg(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-indigo-400" />
                  <span className="font-black text-xs uppercase tracking-widest">
                    Editar Registro #{sortedRegistros.findIndex(r => r.id === editingReg.id) !== -1 ? sortedRegistros.find(r => r.id === editingReg.id)?.originalIndex : ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingReg(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Data
                    </label>
                    <input
                      type="date"
                      required
                      value={editData}
                      onChange={(e) => setEditData(e.target.value)}
                      className="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2 border font-bold text-slate-700 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                      <span>Peso (kg)</span>
                      <span className="text-[9px] text-slate-400 font-normal">Opcional</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={editPeso}
                      onChange={(e) => setEditPeso(e.target.value)}
                      className="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2 border font-bold text-slate-700 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-rose-500" />
                      Glicemia / Diabetes (mg/dL)
                    </span>
                    <span className="text-[9px] text-slate-400 font-normal">Opcional</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      placeholder="Ex: 95 mg/dL"
                      value={editGlicemia}
                      onChange={(e) => setEditGlicemia(e.target.value)}
                      className="w-full rounded-lg border-slate-200 focus:border-rose-500 focus:ring-rose-500 p-2 border font-bold text-slate-700 outline-none transition-all text-sm pr-16"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                      mg/dL
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    <span>Nível de Fome</span>
                    <span className="text-indigo-600 font-extrabold">{editFome}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={editFome}
                    onChange={(e) => setEditFome(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-1 px-1">
                    <span>Sem fome (0)</span>
                    <span>Moderada (5)</span>
                    <span>Muita fome (10)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Observações do Dia
                  </label>
                  <textarea
                    placeholder="Como foi sua alimentação, atividades, ou sintomas hoje..."
                    value={editObs}
                    onChange={(e) => setEditObs(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border font-semibold text-xs text-slate-700 outline-none transition-all resize-none"
                  />
                </div>

                {/* Photos Selector */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Fotos de Progresso (Direto do PC)
                  </label>
                  
                  <div className="space-y-3">
                    <label className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-indigo-50/20 transition-all flex items-center justify-center gap-2">
                      {isCompressingEdit ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                          <span className="text-xs font-semibold text-slate-600">Comprimindo...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-indigo-500" />
                          <span className="text-xs font-semibold text-slate-600">Adicionar fotos de progresso</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEditFileChange}
                        className="hidden"
                      />
                    </label>

                    {editFotos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 border border-slate-100 p-2 rounded-xl bg-slate-50">
                        {editFotos.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                            <img
                              src={img}
                              alt={`Progresso ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveEditFoto(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition-colors cursor-pointer"
                              title="Remover foto"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingReg(null)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer transition-colors"
                  >
                    Salvar Alterações
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
