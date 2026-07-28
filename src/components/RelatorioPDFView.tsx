import { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  User,
  Scale,
  Syringe,
  Pill,
  Activity,
  Award,
  CheckCircle2,
  Sparkles,
  Info
} from "lucide-react";
import { AppData } from "../types";
import { generatePDFReport } from "../utils/generatePDF";
import { SCHEDULE_DATA } from "./RastreadorInjecaoCard";
import { getDiasJornada } from "../utils/dateUtils";

interface RelatorioPDFViewProps {
  appData: AppData;
}

export default function RelatorioPDFView({ appData }: RelatorioPDFViewProps) {
  // Default cutoff date to today (YYYY-MM-DD)
  const todayIso = new Date().toISOString().split("T")[0];
  const [cutoffDateStr, setCutoffDateStr] = useState<string>(todayIso);

  // Formatted Brazilian date string for display
  const formattedCutoffDate = useMemo(() => {
    if (!cutoffDateStr) return "--/--/----";
    return cutoffDateStr.split("-").reverse().join("/");
  }, [cutoffDateStr]);

  // Filter registrations up to cutoffDate
  const registrosFiltrados = useMemo(() => {
    return [...(appData.registros || [])]
      .filter((r) => r.data <= cutoffDateStr)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()); // Newer first for UI table
  }, [appData.registros, cutoffDateStr]);

  // Filter completed injections up to cutoffDate
  const injectionsSummary = useMemo(() => {
    let completedCount = 0;
    let tirzepatida = 0;
    let retatrutida = 0;
    try {
      const savedInjections = localStorage.getItem("subcutanea_completed_applications");
      if (savedInjections) {
        const ids: string[] = JSON.parse(savedInjections);
        ids.forEach((idStr) => {
          const idx = Number(idStr);
          if (SCHEDULE_DATA[idx] && SCHEDULE_DATA[idx].isoDate <= cutoffDateStr) {
            completedCount++;
            if (SCHEDULE_DATA[idx].medication === "Tirzepatida") tirzepatida++;
            if (SCHEDULE_DATA[idx].medication === "Retatrutida") retatrutida++;
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
    return { completedCount, tirzepatida, retatrutida };
  }, [cutoffDateStr]);

  // Calculate statistics up to cutoffDate
  const stats = useMemo(() => {
    const pesoInicial = appData.config.pesoInicial || 0;
    let pesoAtual = pesoInicial;
    let ultimaGlicemia: number | undefined = undefined;
    let somaFome = 0;
    let countFome = 0;

    if (registrosFiltrados.length > 0) {
      const regComPeso = registrosFiltrados.filter((r) => r.peso && r.peso > 0);
      if (regComPeso.length > 0) {
        pesoAtual = regComPeso[0].peso; // Latest since sorted b-a
      }

      const regComGlicemia = registrosFiltrados.filter(
        (r) => r.glicemia !== undefined && r.glicemia !== null
      );
      if (regComGlicemia.length > 0) {
        ultimaGlicemia = regComGlicemia[0].glicemia;
      }

      registrosFiltrados.forEach((r) => {
        if (r.fome !== undefined) {
          somaFome += r.fome;
          countFome++;
        }
      });
    }

    const pesoPerdido = pesoInicial > 0 ? pesoInicial - pesoAtual : 0;
    const metaPerda = appData.config.metaPerda || 0;
    const pesoAlvo = pesoInicial > 0 && metaPerda > 0 ? pesoInicial - metaPerda : 0;
    const faltaParaMeta = pesoAlvo > 0 ? Math.max(0, pesoAtual - pesoAlvo) : 0;
    const mediaFome = countFome > 0 ? (somaFome / countFome).toFixed(1) : "--";

    // Days in journey
    const calculatedDias = getDiasJornada(appData.config.dataInicio, cutoffDateStr);
    const diasJornada = calculatedDias !== null ? String(calculatedDias) : "--";

    return {
      pesoInicial,
      pesoAtual,
      pesoPerdido,
      metaPerda,
      pesoAlvo,
      faltaParaMeta,
      ultimaGlicemia,
      mediaFome,
      diasJornada,
    };
  }, [appData.config, registrosFiltrados, cutoffDateStr]);

  // Handle Download PDF
  const handleDownloadPDF = () => {
    generatePDFReport(appData, cutoffDateStr);
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-indigo-400/30">
              <FileText className="w-3.5 h-3.5" />
              <span>Gerador de Relatórios Clínicos</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Relatório Completo em PDF 📄
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Exporte todos os seus dados de evolução, medições de peso, injeções de Tirzepatida e Retatrutida, glicemia e medicamentos acumulados até a data selecionada.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 mt-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Observação: Este relatório <strong>exclui</strong> o Plano Nutricional por padrão.</span>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-indigo-400/30 cursor-pointer shrink-0 w-full md:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Relatório PDF</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Date Selector & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Data de Corte do Relatório
            </label>
            <span className="text-xs font-bold text-slate-700">
              Considerar todos os dados registrados até:
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="date"
            value={cutoffDateStr}
            max={todayIso}
            onChange={(e) => setCutoffDateStr(e.target.value)}
            className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border font-bold text-slate-800 text-sm outline-none transition-all cursor-pointer bg-slate-50 w-full sm:w-auto"
          />

          <button
            onClick={handleDownloadPDF}
            className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
            title="Download PDF"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Baixar PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer border border-slate-200"
            title="Imprimir"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden md:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* LIVE INTUITIVE REPORT PREVIEW CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 md:p-10 space-y-8 print:p-0 print:border-none print:shadow-none" id="printable-report">
        
        {/* Report Document Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
              E.IO
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                EMAGRECER.IO — RELATÓRIO CLÍNICO & EVOLUÇÃO
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                DOCUMENTO OFICIAL DE ACOMPANHAMENTO PESSOAL E DE SAÚDE
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-0.5">
            <p className="font-bold text-slate-700">📅 Data do Relatório: <strong className="text-indigo-600 font-black">{formattedCutoffDate}</strong></p>
            <p className="text-slate-500 text-[11px]">⏳ Dias em Acompanhamento: <strong>{stats.diasJornada} dias</strong></p>
          </div>
        </div>

        {/* SECTION 1: PERFIL DO PACIENTE E METAS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <User className="w-4 h-4" />
            </span>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
              1. Dados do Paciente & Perfil
            </h3>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-4 md:col-span-2">
              {appData.config.foto ? (
                <img
                  src={appData.config.foto}
                  alt="Foto"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shrink-0 uppercase shadow-md">
                  {appData.config.nome ? appData.config.nome.trim().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "UF"}
                </div>
              )}
              <div>
                <h4 className="font-black text-slate-900 text-lg">
                  👤 {appData.config.nome || "Usuário Focado"}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {appData.config.sexo ? `Sexo: ${appData.config.sexo}` : "Sexo não informado"} • {appData.config.idade ? `${appData.config.idade} anos` : "Idade não informada"}
                </p>
                <p className="text-xs text-indigo-600 font-bold mt-0.5">
                  🚀 Início do tratamento: {appData.config.dataInicio ? appData.config.dataInicio.split("-").reverse().join("/") : "--/--/----"}
                </p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 text-center flex flex-col justify-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">⚖️ Peso Inicial</span>
              <span className="text-xl font-black text-slate-800">{stats.pesoInicial.toFixed(1)} kg</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-indigo-200 bg-indigo-50/40 text-center flex flex-col justify-center">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block">📊 Peso Atual</span>
              <span className="text-xl font-black text-indigo-600">{stats.pesoAtual.toFixed(1)} kg</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: METAS E EVOLUÇÃO DO PESO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Scale className="w-4 h-4" />
            </span>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
              2. Resumo de Progresso do Peso
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-black text-emerald-600 uppercase block">🎉 Total Elimando</span>
              <span className="text-2xl font-black text-emerald-700">-{stats.pesoPerdido.toFixed(1)} kg</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase block">🎯 Meta Alvo Final</span>
              <span className="text-2xl font-black text-slate-800">{stats.pesoAlvo > 0 ? `${stats.pesoAlvo.toFixed(1)} kg` : "--"}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase block">🏁 Falta p/ Meta</span>
              <span className="text-2xl font-black text-indigo-600">{stats.faltaParaMeta.toFixed(1)} kg</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase block">📉 Meta de Perda</span>
              <span className="text-2xl font-black text-slate-700">-{stats.metaPerda.toFixed(1)} kg</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: INDICADORES DE SAÚDE, GLICEMIA E INJEÇÕES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card Glicemia & Fome */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                🩺 Indicadores de Diabetes & Fome
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-600">🩸 Última GlicemiaMedida:</span>
                <span className={`font-black px-2 py-0.5 rounded-lg text-xs ${
                  stats.ultimaGlicemia === undefined
                    ? "text-slate-500"
                    : stats.ultimaGlicemia >= 126
                    ? "bg-rose-100 text-rose-700"
                    : stats.ultimaGlicemia >= 100
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {stats.ultimaGlicemia !== undefined ? `${stats.ultimaGlicemia} mg/dL` : "Sem medição"}
                </span>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-600">🍽️ Média de Nível de Fome:</span>
                <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {stats.mediaFome} / 10
                </span>
              </div>
            </div>
          </div>

          {/* Card Injeções Subcutâneas */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Syringe className="w-4 h-4 text-indigo-600" />
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                💉 Injeções Subcutâneas Concluídas
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-600">✅ Aplicações Realizadas:</span>
                <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {injectionsSummary.completedCount} doses
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Tirzepatida</span>
                  <span className="font-black text-blue-600">{injectionsSummary.tirzepatida} doses</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Retatrutida</span>
                  <span className="font-black text-emerald-600">{injectionsSummary.retatrutida} doses</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 4: MEDICAMENTOS E COMPRAS (IF ANY) */}
        {(appData.medicamentos || []).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-indigo-600" />
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                4. Investimento & Medicamentos Cadastrados
              </h3>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-900 text-white font-black text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Medicamento</th>
                    <th className="p-3">Marca</th>
                    <th className="p-3">Dosagem</th>
                    <th className="p-3">Data Compra</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Frete</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {appData.medicamentos?.map((m) => {
                    const total = (m.valor || 0) + (m.frete || 0);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{m.nome}</td>
                        <td className="p-3 text-slate-500">{m.marca || "-"}</td>
                        <td className="p-3 text-slate-600">{m.mg || "-"}</td>
                        <td className="p-3 text-slate-500">{m.dataCompra ? m.dataCompra.split("-").reverse().join("/") : "-"}</td>
                        <td className="p-3">R$ {(m.valor || 0).toFixed(2).replace(".", ",")}</td>
                        <td className="p-3">R$ {(m.frete || 0).toFixed(2).replace(".", ",")}</td>
                        <td className="p-3 text-right font-black text-indigo-600">R$ {total.toFixed(2).replace(".", ",")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 5: HISTÓRICO COMPLETO DE REGISTROS */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                5. Histórico Detalhado dos Registros
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {registrosFiltrados.length} medições registradas
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-900 text-white font-black text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Peso</th>
                  <th className="p-3">Nível Fome</th>
                  <th className="p-3">Glicemia</th>
                  <th className="p-3">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {registrosFiltrados.length > 0 ? (
                  registrosFiltrados.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{r.data.split("-").reverse().join("/")}</td>
                      <td className="p-3 font-black text-indigo-600">{r.peso.toFixed(1)} kg</td>
                      <td className="p-3 font-bold text-slate-700">{r.fome !== undefined ? `${r.fome}/10` : "-"}</td>
                      <td className="p-3 font-bold text-rose-600">{r.glicemia !== undefined && r.glicemia !== null ? `${r.glicemia} mg/dL` : "-"}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{r.obs || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-bold">
                      Nenhum registro de peso encontrado até a data {formattedCutoffDate}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info inside printable area */}
        <div className="text-center text-[10px] font-bold text-slate-400 pt-6 border-t border-slate-100">
          EMAGRECER.IO • Relatório de acompanhamento de tratamento • Gerado para {appData.config.nome || "Usuário"} em {new Date().toLocaleDateString("pt-BR")}
        </div>

      </div>
    </div>
  );
}
