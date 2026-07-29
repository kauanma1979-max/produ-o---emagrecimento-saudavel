// Projeto Emagrecimento Saudável - Versão 1.1.0
// Atualizado em: Julho de 2026 para sincronização completa com GitHub e Vercel
import { useState, useEffect, ChangeEvent } from "react";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  TrendingUp, 
  History, 
  Settings, 
  PlusCircle, 
  Search,
  Dumbbell,
  Download,
  Upload,
  Database,
  Syringe,
  Pill,
  Apple,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lock,
  Ruler
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ConfigPerfil from "./components/ConfigPerfil";
import DashboardStatus from "./components/DashboardStatus";
import PerfilCardDashboard from "./components/PerfilCardDashboard";
import GraficosDashboard from "./components/GraficosDashboard";
import RegistroForm from "./components/RegistroForm";
import HistoricoTabela from "./components/HistoricoTabela";
import RastreadorInjecaoCard from "./components/RastreadorInjecaoCard";
import MedicamentosCard from "./components/MedicamentosCard";
import PlanoNutricional from "./components/PlanoNutricional";
import RelatorioPDFView from "./components/RelatorioPDFView";
import TelaSenha from "./components/TelaSenha";
import ControleAguaCard from "./components/ControleAguaCard";
import AbaEvolucaoMedidas from "./components/AbaEvolucaoMedidas";
import { AppData, AppConfig, Registro, MedicamentoItem } from "./types";

export default function App() {
  const verificarSessaoAtiva = (): boolean => {
    const TEMPO_VALIDADE = 6 * 60 * 60 * 1000; // 6 horas em milissegundos
    const dados = localStorage.getItem("acesso_projeto") || localStorage.getItem("acesso_app_temporario");

    if (dados) {
      try {
        const parsed = JSON.parse(dados);
        const liberado = parsed.liberado;
        const data = parsed.data || parsed.dataLiberacao;
        const agora = Date.now();
        if (liberado === "sim" && agora - data < TEMPO_VALIDADE) {
          return true;
        }
      } catch {
        // Ignora e cai no fallback
      }
      localStorage.removeItem("acesso_projeto");
      localStorage.removeItem("acesso_app_temporario");
      localStorage.removeItem("app_liberado");
      return false;
    }

    return localStorage.getItem("app_liberado") === "sim";
  };

  const [appLiberado, setAppLiberado] = useState<boolean>(() => verificarSessaoAtiva());

  useEffect(() => {
    const interval = setInterval(() => {
      const ativa = verificarSessaoAtiva();
      if (!ativa && appLiberado) {
        setAppLiberado(false);
      }
    }, 10000); // Checa a cada 10 segundos
    return () => clearInterval(interval);
  }, [appLiberado]);

  const handleBloquearApp = () => {
    localStorage.removeItem("acesso_projeto");
    localStorage.removeItem("acesso_app_temporario");
    localStorage.removeItem("app_liberado");
    localStorage.removeItem("bloqueio_acesso");
    localStorage.removeItem("tentativas_acesso");
    setAppLiberado(false);
    setMobileMenuOpen(false);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showRegistroModal, setShowRegistroModal] = useState(false);

  // Load initial data from localStorage
  const [appData, setAppData] = useState<AppData>(() => {
    const saved = localStorage.getItem("projetoEmagrecimentoFinal");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          config: {
            pesoInicial: parsed.config?.pesoInicial ?? 80,
            metaPerda: parsed.config?.metaPerda ?? 10,
            dataInicio: parsed.config?.dataInicio ?? "2026-06-01",
            foto: parsed.config?.foto ?? "",
            nome: parsed.config?.nome ?? "",
            sexo: parsed.config?.sexo ?? "",
            idade: parsed.config?.idade !== undefined ? Number(parsed.config.idade) : undefined,
          },
          registros: Array.isArray(parsed.registros) ? parsed.registros : [],
          medicamentos: Array.isArray(parsed.medicamentos) ? parsed.medicamentos : [],
        };
      } catch (e) {
        console.error("Erro ao carregar dados salvos:", e);
      }
    }
    return {
      config: {
        pesoInicial: 80,
        metaPerda: 10,
        dataInicio: "2026-06-01",
        foto: "",
        nome: "",
        sexo: "",
        idade: undefined,
      },
      registros: [],
      medicamentos: [],
    };
  });

  // Save data to localStorage whenever appData state changes
  useEffect(() => {
    localStorage.setItem("projetoEmagrecimentoFinal", JSON.stringify(appData));
  }, [appData]);

  // Handler to export COMPLETE app data as a JSON backup file
  const handleExportBackup = () => {
    try {
      // 1. Rastreador Subcutâneo (Aplicações concluídas)
      let subcutaneaCompleted: string[] = [];
      const savedInjections = localStorage.getItem("subcutanea_completed_applications");
      if (savedInjections) {
        try {
          subcutaneaCompleted = JSON.parse(savedInjections);
        } catch (e) {
          console.error("Erro ao ler injeções:", e);
        }
      }

      // 2. Cardápio do Dia / Plano Nutricional Semanal Customizado
      let planoNutricionalData: any = null;
      const savedPlano = localStorage.getItem("plano_nutricional_custom_v2");
      if (savedPlano) {
        try {
          planoNutricionalData = JSON.parse(savedPlano);
        } catch (e) {
          console.error("Erro ao ler plano nutricional:", e);
        }
      }

      // 3. Controle de Consumo de Água e Metas
      const metaAgua = localStorage.getItem("meta_agua_ml");
      const historicoAguaDiario: Record<string, number> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("agua_diaria_")) {
          const val = localStorage.getItem(key);
          if (val) {
            historicoAguaDiario[key] = parseInt(val, 10);
          }
        }
      }

      // 4. Segurança / Acesso por Senha (se configurado)
      const acessoProjeto = localStorage.getItem("acesso_projeto");
      const acessoTemporario = localStorage.getItem("acesso_app_temporario");

      const backupCompleto = {
        versaoBackup: "2.0",
        dataExportacao: new Date().toISOString(),
        versaoApp: "2.0.0",
        appTitle: "Projeto Emagrecimento & Dieta Pro",
        config: appData.config,
        registros: appData.registros,
        medicamentos: appData.medicamentos || [],
        rastreadorSubcutaneo: {
          completedApplications: subcutaneaCompleted
        },
        planoNutricional: planoNutricionalData,
        controleAgua: {
          metaAguaMl: metaAgua ? parseInt(metaAgua, 10) : undefined,
          historicoAguaDiario: historicoAguaDiario
        },
        segurancaAcesso: {
          acessoProjeto: acessoProjeto ? JSON.parse(acessoProjeto) : null,
          acessoTemporario: acessoTemporario ? JSON.parse(acessoTemporario) : null
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupCompleto, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `dieta_e_peso_backup_completo_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Erro ao gerar backup completo:", err);
      alert("Houve um erro ao gerar o arquivo de backup completo.");
    }
  };

  // Handler to import and restore complete app data from a JSON file
  const handleImportBackup = (e: ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === "object") {
            const pesoInicial = parseFloat(parsed.config?.pesoInicial) || 80;
            const metaPerda = parseFloat(parsed.config?.metaPerda) || 10;
            const dataInicio = parsed.config?.dataInicio || "2026-06-01";
            const foto = parsed.config?.foto || "";
            const nome = parsed.config?.nome || "";
            const sexo = parsed.config?.sexo || "";
            const idade = parsed.config?.idade !== undefined ? Number(parsed.config.idade) : undefined;
            const registros = Array.isArray(parsed.registros) ? parsed.registros : [];
            const medicamentos = Array.isArray(parsed.medicamentos) ? parsed.medicamentos : [];
            
            // 1. Atualiza estado principal da aplicação (Perfil, Histórico, Medicamentos e Fotos)
            const novoAppData: AppData = {
              config: {
                pesoInicial,
                metaPerda,
                dataInicio,
                foto,
                nome,
                sexo,
                idade,
              },
              registros,
              medicamentos
            };
            setAppData(novoAppData);
            localStorage.setItem("projetoEmagrecimentoFinal", JSON.stringify(novoAppData));

            // 2. Restaura dados do Rastreador Subcutâneo (Injeções)
            if (parsed.rastreadorSubcutaneo?.completedApplications && Array.isArray(parsed.rastreadorSubcutaneo.completedApplications)) {
              localStorage.setItem("subcutanea_completed_applications", JSON.stringify(parsed.rastreadorSubcutaneo.completedApplications));
            } else if (Array.isArray(parsed.subcutaneaCompleted)) {
              localStorage.setItem("subcutanea_completed_applications", JSON.stringify(parsed.subcutaneaCompleted));
            }

            // 3. Restaura Cardápio / Plano Nutricional Personalizado
            if (parsed.planoNutricional) {
              localStorage.setItem("plano_nutricional_custom_v2", JSON.stringify(parsed.planoNutricional));
            }

            // 4. Restaura Controle de Consumo de Água
            if (parsed.controleAgua) {
              if (parsed.controleAgua.metaAguaMl) {
                localStorage.setItem("meta_agua_ml", parsed.controleAgua.metaAguaMl.toString());
              }
              if (parsed.controleAgua.historicoAguaDiario && typeof parsed.controleAgua.historicoAguaDiario === "object") {
                Object.entries(parsed.controleAgua.historicoAguaDiario).forEach(([key, val]) => {
                  if (typeof val === "number" || typeof val === "string") {
                    localStorage.setItem(key, val.toString());
                  }
                });
              }
            }

            // 5. Restaura Senha / Segurança de Acesso se presente
            if (parsed.segurancaAcesso) {
              if (parsed.segurancaAcesso.acessoProjeto) {
                localStorage.setItem("acesso_projeto", JSON.stringify(parsed.segurancaAcesso.acessoProjeto));
              }
              if (parsed.segurancaAcesso.acessoTemporario) {
                localStorage.setItem("acesso_app_temporario", JSON.stringify(parsed.segurancaAcesso.acessoTemporario));
              }
            }

            alert("✅ Backup Completo restaurado com sucesso!\n\nForam restauradas todas as informações:\n• Foto e Perfil do Usuário\n• Registros Diários com Fotos e Medidas Corporal\n• Histórico de Glicemia e Observações\n• Medicamentos Comprados / Cadastrados\n• Informações do Rastreador de Injeções Subcutâneas\n• Cardápio e Plano Nutricional Semanal Customizado\n• Histórico e Meta de Consumo de Água");

            // Recarrega a página após 300ms para atualizar todos os componentes com o novo localStorage
            setTimeout(() => {
              window.location.reload();
            }, 300);
          } else {
            alert("❌ Erro: O arquivo selecionado não possui um formato de backup válido.");
          }
        } catch (error) {
          console.error(error);
          alert("❌ Erro ao decodificar arquivo. Certifique-se de que é um JSON de backup válido.");
        }
      };
    }
  };

  // Handler to update config values (pesoInicial, metaPerda, dataInicio)
  const handleConfigChange = (key: keyof AppConfig, value: string | number) => {
    setAppData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  // Handler to append a new log entry
  const handleAddRegistro = (novoReg: Omit<Registro, "id">) => {
    const regWithId: Registro = {
      ...novoReg,
      id: Date.now().toString(),
    };
    setAppData((prev) => ({
      ...prev,
      registros: [...prev.registros, regWithId],
    }));
  };

  // Handler to delete a log entry
  const handleDeleteRegistro = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      registros: prev.registros.filter((reg) => reg.id !== id),
    }));
  };

  // Handler to update a log entry
  const handleUpdateRegistro = (updatedReg: Registro) => {
    setAppData((prev) => ({
      ...prev,
      registros: prev.registros.map((reg) => (reg.id === updatedReg.id ? updatedReg : reg)),
    }));
  };

  // Handlers for Medicamentos
  const handleAddMedicamento = (novoMed: Omit<MedicamentoItem, "id">) => {
    const medWithId: MedicamentoItem = {
      ...novoMed,
      id: Date.now().toString(),
    };
    setAppData((prev) => ({
      ...prev,
      medicamentos: [...(prev.medicamentos || []), medWithId],
    }));
  };

  const handleUpdateMedicamento = (updatedMed: MedicamentoItem) => {
    setAppData((prev) => ({
      ...prev,
      medicamentos: (prev.medicamentos || []).map((m) => (m.id === updatedMed.id ? updatedMed : m)),
    }));
  };

  const handleDeleteMedicamento = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      medicamentos: (prev.medicamentos || []).filter((m) => m.id !== id),
    }));
  };

  const handleAplicarMeta = (novaMetaPerda: number) => {
    handleConfigChange("metaPerda", novaMetaPerda);
  };

  // Filter registrations based on search term (date or observations)
  const filteredRegistros = appData.registros.filter((reg) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const formattedDate = reg.data.split("-").reverse().join("/");
    return (
      formattedDate.includes(term) || 
      (reg.obs && reg.obs.toLowerCase().includes(term)) ||
      reg.peso.toString().includes(term)
    );
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-extrabold text-lg tracking-tight block">EMAGRECER.IO</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block -mt-1">PROJETO SAUDÁVEL</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer group shrink-0"
          title="Ocultar Painel Lateral (Melhorar visão)"
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
        </button>
      </div>

      {/* Main Navigation links */}
      <nav className="px-4 py-6 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">
          Navegação
        </div>
        
        <button
          onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Principal</span>
        </button>

        <button
          onClick={() => { setActiveTab("evolucao"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "evolucao"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>Evolução & Medidas</span>
        </button>

        <button
          onClick={() => { setActiveTab("plano"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "plano"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Apple className="w-4 h-4" />
          <span>Plano Nutricional</span>
        </button>

        <button
          onClick={() => { setActiveTab("injecoes"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "injecoes"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Syringe className="w-4 h-4" />
          <span>Rastreador Subcutâneo</span>
        </button>

        <button
          onClick={() => { setActiveTab("medicamentos"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "medicamentos"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Gerenciar Medicamentos</span>
        </button>

        <button
          onClick={() => { setActiveTab("relatorio"); setMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "relatorio"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Relatório PDF</span>
        </button>

        <button
          onClick={() => { setShowPerfilModal(true); setMobileMenuOpen(false); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <Settings className="w-4 h-4" />
          <span>Configurar Perfil</span>
        </button>

        <button
          onClick={handleBloquearApp}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
          title="Bloquear aplicativo com senha"
        >
          <Lock className="w-4 h-4" />
          <span>Bloquear App</span>
        </button>

        {/* Profile Card Summary in the Sidebar */}
        <div className="pt-6 border-t border-slate-800 mt-6 space-y-3">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">
            Seu Perfil
          </div>
          <div className="mx-3 p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center gap-3">
            {appData.config.foto ? (
              <img
                src={appData.config.foto}
                alt="Foto do perfil"
                className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xs shrink-0 uppercase">
                {appData.config.nome ? appData.config.nome.trim().split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "UF"}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-xs text-white font-bold truncate">{appData.config.nome || "Usuário Focado"}</p>
              <button
                type="button"
                onClick={() => { setShowPerfilModal(true); setMobileMenuOpen(false); }}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider flex items-center gap-1 mt-0.5 cursor-pointer bg-transparent border-none"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        </div>

        {/* Backup & Restore controls in the Sidebar */}
        <div className="pt-6 border-t border-slate-800 mt-6 space-y-3">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">
            Cópia de Segurança
          </div>
          <div className="grid grid-cols-2 gap-2 px-3">
            <button
              onClick={handleExportBackup}
              title="Exportar dados para um arquivo JSON local"
              className="flex items-center justify-center gap-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 py-2 px-2 rounded-xl text-xs font-bold transition-all border border-slate-800 hover:border-slate-700 active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Backup</span>
            </button>
            <button
              onClick={() => document.getElementById("restore-input-sidebar")?.click()}
              title="Restaurar dados a partir de um arquivo JSON"
              className="flex items-center justify-center gap-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 py-2 px-2 rounded-xl text-xs font-bold transition-all border border-slate-800 hover:border-slate-700 active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Restaurar</span>
            </button>
          </div>
          <input
            type="file"
            id="restore-input-sidebar"
            accept=".json"
            onChange={handleImportBackup}
            className="hidden"
          />
        </div>
      </nav>

      {/* Footer Profile Avatar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          {appData.config.foto ? (
            <img
              src={appData.config.foto}
              alt="Foto do perfil"
              className="w-9 h-9 rounded-full object-cover border border-indigo-500/30 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xs shrink-0 uppercase">
              {appData.config.nome ? appData.config.nome.trim().split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "UF"}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-xs text-white font-semibold truncate">{appData.config.nome || "Usuário Focado"}</p>
            <p className="text-[10px] text-slate-500 truncate">
              {appData.config.idade ? `${appData.config.idade} anos` : "Jornada Saudável"}
              {appData.config.sexo ? ` • ${appData.config.sexo}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!appLiberado) {
    return <TelaSenha onSuccess={() => setAppLiberado(true)} />;
  }

  return (
    <div id="conteudo-app" className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Desktop Sidebar (Collapsible with slide animation) */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.25 }}
            className="hidden lg:flex bg-slate-900 border-r border-slate-800 flex-col shrink-0 overflow-hidden"
          >
            <div className="w-64 h-full flex flex-col">
              {sidebarContent}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Drawer (Collapsible) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black"
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="relative w-64 max-w-xs h-full bg-slate-900 flex flex-col z-50"
            >
              <div className="absolute top-4 right-4 text-white">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Command Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop trigger to re-open sidebar when hidden */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all font-black text-xs cursor-pointer shadow-2xs group"
                title="Mostrar Painel Lateral (EMAGRECER.IO)"
              >
                <ChevronRight className="w-4 h-4 text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                <span className="text-slate-800 font-black">EMAGRECER.IO</span>
              </button>
            )}
            
            {/* Search inputs */}
            <div className="relative w-48 md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                placeholder="Pesquisar histórico..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleBloquearApp}
              title="Bloquear aplicativo e exigir senha"
              className="bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Bloquear</span>
            </button>
            <button 
              onClick={() => {
                setShowRegistroModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Registro</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Quick alert helper for setting goals */}
            {(!appData.config.pesoInicial || !appData.config.metaPerda) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-indigo-800"
              >
                <div>
                  <span className="font-bold">🎯 Defina seu perfil de emagrecimento!</span> Abra as configurações de perfil para cadastrar seu peso inicial, foto e meta.
                </div>
                <button
                  onClick={() => setShowPerfilModal(true)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Configurar Agora
                </button>
              </motion.div>
            )}

            {activeTab === "evolucao" ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <AbaEvolucaoMedidas
                  registros={appData.registros}
                  onAddRegistro={handleAddRegistro}
                  onDeleteRegistro={handleDeleteRegistro}
                />
              </motion.div>
            ) : activeTab === "injecoes" ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <RastreadorInjecaoCard />
              </motion.div>
            ) : activeTab === "medicamentos" ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <MedicamentosCard
                  medicamentos={appData.medicamentos || []}
                  onAddMedicamento={handleAddMedicamento}
                  onUpdateMedicamento={handleUpdateMedicamento}
                  onDeleteMedicamento={handleDeleteMedicamento}
                />
              </motion.div>
            ) : activeTab === "plano" ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <PlanoNutricional />
              </motion.div>
            ) : activeTab === "relatorio" ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <RelatorioPDFView appData={appData} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Cabeçalho de Perfil do Usuário */}
                <PerfilCardDashboard
                  config={appData.config}
                  registros={appData.registros}
                  onOpenConfigModal={() => setShowPerfilModal(true)}
                />

                {/* Stats row & Water Tracker */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <DashboardStatus
                      config={appData.config}
                      registros={appData.registros}
                    />
                  </div>
                  <div>
                    <ControleAguaCard pesoAtual={appData.config.pesoInicial} />
                  </div>
                </div>

                {/* Charts row */}
                <GraficosDashboard
                  registros={appData.registros}
                  pesoInicial={appData.config.pesoInicial}
                  onAplicarMeta={handleAplicarMeta}
                />

                {/* Grid for actions & history */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div id="registro-form-card" className="transition-all duration-300 rounded-2xl">
                    <RegistroForm
                      onAddRegistro={handleAddRegistro}
                      onAplicarMeta={handleAplicarMeta}
                    />
                  </div>
                  <HistoricoTabela
                    registros={filteredRegistros}
                    onDeleteRegistro={handleDeleteRegistro}
                    onUpdateRegistro={handleUpdateRegistro}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Configurações de Perfil */}
      <AnimatePresence>
        {showPerfilModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPerfilModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              id="perfil-modal-backdrop"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-2xl w-full relative z-10 max-h-[90vh] flex flex-col"
              id="perfil-modal-content"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                      Configurações do Perfil
                    </h3>
                    <p className="text-[10px] text-indigo-500 uppercase font-black tracking-widest mt-0.5">
                      Atualize seus dados e metas de peso
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPerfilModal(false)}
                  className="p-1.5 px-3 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-xs font-black uppercase tracking-wider"
                  id="close-perfil-modal-btn"
                >
                  Fechar
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-6">
                <ConfigPerfil
                  config={appData.config}
                  onChange={handleConfigChange}
                  inSidebar={false}
                />
                
                {/* Database Backup & Restore in Modal */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Exportar / Importar Dados do App
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleExportBackup}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs border border-slate-200 transition-all cursor-pointer shadow-sm"
                    >
                      <Download className="w-4 h-4 text-indigo-500" />
                      <span>Backup JSON</span>
                    </button>
                    <button
                      onClick={() => document.getElementById("restore-input-modal")?.click()}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs border border-slate-200 transition-all cursor-pointer shadow-sm"
                    >
                      <Upload className="w-4 h-4 text-indigo-500" />
                      <span>Restaurar JSON</span>
                    </button>
                    <input
                      type="file"
                      id="restore-input-modal"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Novo Registro */}
      <AnimatePresence>
        {showRegistroModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegistroModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              id="registro-modal-backdrop"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-lg w-full relative z-10 max-h-[90vh] flex flex-col overflow-y-auto custom-scrollbar"
              id="registro-modal-content"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                      Novo Registro
                    </h3>
                    <p className="text-[10px] text-indigo-500 uppercase font-black tracking-widest mt-0.5">
                      Registre peso, glicemia/diabetes, fome e fotos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegistroModal(false)}
                  className="p-1.5 px-3 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-xs font-black uppercase tracking-wider"
                >
                  Fechar
                </button>
              </div>

              <RegistroForm
                onAddRegistro={(newReg) => {
                  handleAddRegistro(newReg);
                  setShowRegistroModal(false);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

