import { useState, FormEvent, ChangeEvent } from "react";
import { Pill, Plus, Trash2, Edit2, DollarSign, Store, Phone, FileText, Tag, Calendar, X, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import { MedicamentoItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface MedicamentosCardProps {
  medicamentos: MedicamentoItem[];
  onAddMedicamento: (med: Omit<MedicamentoItem, "id">) => void;
  onUpdateMedicamento: (med: MedicamentoItem) => void;
  onDeleteMedicamento: (id: string) => void;
}

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

export default function MedicamentosCard({
  medicamentos = [],
  onAddMedicamento,
  onUpdateMedicamento,
  onDeleteMedicamento,
}: MedicamentosCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [valor, setValor] = useState("");
  const [frete, setFrete] = useState("");
  const [ondeComprou, setOndeComprou] = useState("");
  const [contato, setContato] = useState("");
  const [mg, setMg] = useState("");
  const [obs, setObs] = useState("");
  const [dataCompra, setDataCompra] = useState(new Date().toISOString().slice(0, 10));
  const [imagem, setImagem] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);

  const resetForm = () => {
    setNome("");
    setMarca("");
    setValor("");
    setFrete("");
    setOndeComprou("");
    setContato("");
    setMg("");
    setObs("");
    setDataCompra(new Date().toISOString().slice(0, 10));
    setImagem("");
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (item: MedicamentoItem) => {
    setEditingId(item.id);
    setNome(item.nome);
    setMarca(item.marca);
    setValor(item.valor ? String(item.valor) : "");
    setFrete(item.frete ? String(item.frete) : "");
    setOndeComprou(item.ondeComprou);
    setContato(item.contato);
    setMg(item.mg);
    setObs(item.obs);
    setDataCompra(item.dataCompra || new Date().toISOString().slice(0, 10));
    setImagem(item.imagem || "");
    setShowModal(true);
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione um arquivo de imagem válido.");
        return;
      }
      try {
        setIsCompressing(true);
        const compressed = await compressImage(file);
        setImagem(compressed);
      } catch (err) {
        console.error("Erro ao comprimir imagem:", err);
        alert("Erro ao carregar imagem.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert("Por favor, informe o nome do medicamento.");
      return;
    }

    const payload = {
      nome: nome.trim(),
      marca: marca.trim(),
      valor: parseFloat(valor.replace(",", ".")) || 0,
      frete: parseFloat(frete.replace(",", ".")) || 0,
      ondeComprou: ondeComprou.trim(),
      contato: contato.trim(),
      mg: mg.trim(),
      obs: obs.trim(),
      dataCompra,
      imagem: imagem || undefined,
    };

    if (editingId) {
      onUpdateMedicamento({
        id: editingId,
        ...payload,
      });
    } else {
      onAddMedicamento(payload);
    }

    setShowModal(false);
    resetForm();
  };

  // Calculations
  const totalGasto = medicamentos.reduce((acc, item) => acc + (item.valor || 0) + (item.frete || 0), 0);
  const totalValor = medicamentos.reduce((acc, item) => acc + (item.valor || 0), 0);
  const totalFrete = medicamentos.reduce((acc, item) => acc + (item.frete || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20 shrink-0">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">Gerenciamento de Medicamentos</h2>
            <p className="text-xs text-indigo-100 font-medium">Controle de marcas, fornecedores, valores, frete e dosagens (mg)</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-white hover:bg-slate-100 text-indigo-900 font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Adicionar Medicamento</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total de Medicamentos</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{medicamentos.length} cadastrados</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Valor em Produtos</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Custo Total (Com Frete)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              R$ {totalGasto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold">Frete acumulado: R$ {totalFrete.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Medications List */}
      <div className="space-y-4">
        {medicamentos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs font-medium border border-slate-200 shadow-sm space-y-3">
            <Pill className="w-10 h-10 mx-auto text-slate-300" />
            <p>Nenhum medicamento cadastrado ainda.</p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Cadastrar Primeiro Medicamento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicamentos.map((item) => {
              const valorNum = item.valor || 0;
              const freteNum = item.frete || 0;
              const subtotal = valorNum + freteNum;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-900">{item.nome}</h3>
                          {item.mg && (
                            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                              {item.mg}
                            </span>
                          )}
                          {item.marca && (
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
                              {item.marca}
                            </span>
                          )}
                        </div>
                        {item.dataCompra && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
                            <Calendar className="w-3.5 h-3.5" /> Compra em: {item.dataCompra.split("-").reverse().join("/")}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir ${item.nome}?`)) {
                              onDeleteMedicamento(item.id);
                            }
                          }}
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Financial details */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Valor</span>
                        <span className="font-extrabold text-slate-800">
                          R$ {valorNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Frete</span>
                        <span className="font-extrabold text-slate-800">
                          R$ {freteNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Total</span>
                        <span className="font-black text-emerald-600">
                          R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Store & Contact info */}
                    <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                      {item.ondeComprou && (
                        <div className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">Local:</span>
                          <span className="truncate">{item.ondeComprou}</span>
                        </div>
                      )}
                      {item.contato && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">Contato:</span>
                          <span className="truncate">{item.contato}</span>
                        </div>
                      )}
                      {item.obs && (
                        <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-500 italic leading-relaxed">{item.obs}</p>
                        </div>
                      )}
                    </div>

                    {/* Display image below data if present */}
                    {item.imagem && (
                      <div className="pt-2 border-t border-slate-100">
                        <img 
                          src={item.imagem} 
                          alt={item.nome}
                          onClick={() => {
                            setLightboxImage(item.imagem || null);
                            setLightboxTitle(item.nome);
                          }}
                          className="w-full h-48 object-cover rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:opacity-95 transition-all hover:scale-[1.01]"
                          referrerPolicy="no-referrer"
                          title="Clique para ampliar a foto"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Image Zoom Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col cursor-default"
            >
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-400" />
                  <span className="font-black text-sm uppercase tracking-wide">
                    {lightboxTitle || "Visualização da Foto"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 md:p-8 bg-slate-950 flex items-center justify-center overflow-auto max-h-[calc(90vh-70px)]">
                <img
                  src={lightboxImage}
                  alt={lightboxTitle || "Foto original"}
                  className="w-auto h-auto max-w-none max-h-none rounded-xl shadow-2xl border border-slate-700 block mx-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Add / Edit */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Pill className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight">
                    {editingId ? "Editar Medicamento" : "Novo Medicamento"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Nome do Medicamento *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Tirzepatida / Mounjaro"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Marca / Laboratório
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Eli Lilly, Manipulado..."
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Quantidade (mg)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2.5 mg, 5 mg"
                      value={mg}
                      onChange={(e) => setMg(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Frete (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={frete}
                      onChange={(e) => setFrete(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Onde Comprou (Local)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Farmácia São Paulo, Site X..."
                      value={ondeComprou}
                      onChange={(e) => setOndeComprou(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Contato / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: (11) 99999-9999"
                      value={contato}
                      onChange={(e) => setContato(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Data da Compra
                  </label>
                  <input
                    type="date"
                    value={dataCompra}
                    onChange={(e) => setDataCompra(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Observações
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Lote, validade, cupom de desconto, reações, etc..."
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 resize-none"
                  ></textarea>
                </div>

                {/* Image Upload Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Foto do Medicamento / Comprovante
                  </label>
                  <div className="flex flex-col gap-3">
                    <label className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-indigo-50/20 transition-all flex items-center justify-center gap-2">
                      {isCompressing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                          <span className="text-xs font-semibold text-slate-600">Processando imagem...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 text-indigo-600" />
                          <span className="text-xs font-semibold text-slate-700">Clique para enviar imagem do computador</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                      />
                    </label>

                    {imagem && (
                      <div className="relative inline-block w-full">
                        <img 
                          src={imagem} 
                          alt="Preview" 
                          onClick={() => {
                            setLightboxImage(imagem);
                            setLightboxTitle(nome || "Pré-visualização");
                          }}
                          className="w-full h-36 object-cover rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:opacity-95"
                          referrerPolicy="no-referrer"
                          title="Clique para ampliar"
                        />
                        <button
                          type="button"
                          onClick={() => setImagem("")}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 cursor-pointer"
                          title="Remover imagem"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingId ? "Salvar Alterações" : "Salvar Medicamento"}</span>
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

