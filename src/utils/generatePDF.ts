import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AppData, Registro } from "../types";
import { SCHEDULE_DATA } from "../components/RastreadorInjecaoCard";
import { getDiasJornada } from "./dateUtils";

export function generatePDFReport(data: AppData, reportCutoffDateStr?: string) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  // Determine report cut-off date (default to today if not provided)
  const cutoffDate = reportCutoffDateStr ? new Date(reportCutoffDateStr) : new Date();
  const cutoffIso = cutoffDate.toISOString().split("T")[0];
  const cutoffFormatted = cutoffDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Filter registrations up to cutoffDate
  const registrosFiltrados = [...(data.registros || [])]
    .filter((r) => r.data <= cutoffIso)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  // Filter completed injections up to cutoffDate
  let completedInjectionsCount = 0;
  let tirzepatidaCount = 0;
  let retatrutidaCount = 0;
  try {
    const savedInjections = localStorage.getItem("subcutanea_completed_applications");
    if (savedInjections) {
      const ids: string[] = JSON.parse(savedInjections);
      ids.forEach((idStr) => {
        const idx = Number(idStr);
        if (SCHEDULE_DATA[idx] && SCHEDULE_DATA[idx].isoDate <= cutoffIso) {
          completedInjectionsCount++;
          if (SCHEDULE_DATA[idx].medication === "Tirzepatida") tirzepatidaCount++;
          if (SCHEDULE_DATA[idx].medication === "Retatrutida") retatrutidaCount++;
        }
      });
    }
  } catch (e) {
    console.error("Erro ao ler injeções concluídas:", e);
  }

  // Calculate stats based on filtered registrations
  const pesoInicial = data.config.pesoInicial || 0;
  let pesoAtual = pesoInicial;
  let maiorPeso = pesoInicial;
  let menorPeso = pesoInicial;
  let ultimaGlicemia: number | undefined = undefined;
  let somaFome = 0;
  let countFome = 0;

  if (registrosFiltrados.length > 0) {
    const registrosComPeso = registrosFiltrados.filter((r) => r.peso && r.peso > 0);
    if (registrosComPeso.length > 0) {
      pesoAtual = registrosComPeso[registrosComPeso.length - 1].peso;
      const pesos = registrosComPeso.map((r) => r.peso);
      maiorPeso = pesoInicial > 0 ? Math.max(...pesos, pesoInicial) : Math.max(...pesos);
      menorPeso = pesoInicial > 0 ? Math.min(...pesos, pesoInicial) : Math.min(...pesos);
    }

    // Last glucose measurement
    const registrosComGlicemia = [...registrosFiltrados]
      .filter((r) => r.glicemia !== undefined && r.glicemia !== null)
      .reverse();
    if (registrosComGlicemia.length > 0) {
      ultimaGlicemia = registrosComGlicemia[0].glicemia;
    }

    // Average hunger
    registrosFiltrados.forEach((r) => {
      if (r.fome !== undefined) {
        somaFome += r.fome;
        countFome++;
      }
    });
  }

  const pesoPerdido = pesoInicial > 0 ? pesoInicial - pesoAtual : 0;
  const metaPerda = data.config.metaPerda || 0;
  const pesoAlvo = pesoInicial > 0 && metaPerda > 0 ? (pesoInicial - metaPerda) : 0;
  const faltaParaMeta = pesoAlvo > 0 ? Math.max(0, pesoAtual - pesoAlvo) : 0;
  const mediaFome = countFome > 0 ? (somaFome / countFome).toFixed(1) : "--";

  // Days in journey
  const calculatedDias = getDiasJornada(data.config.dataInicio, cutoffIso);
  const diasJornada = calculatedDias !== null ? String(calculatedDias) : "--";

  // HEADER BANNER
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 26, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("EMAGRECER.IO", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254); // Indigo 200
  doc.text("RELATORIO COMPLETO DE EVOLUCAO E SAUDE", margin, 18);

  // Report Date badge right top
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Data do Relatorio: ${cutoffFormatted}`, pageWidth - margin, 12, { align: "right" });
  doc.text(`Dias em Acompanhamento: ${diasJornada} dias`, pageWidth - margin, 18, { align: "right" });

  let y = 32;

  // PROFILE & EXECUTIVE SUMMARY CARD
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, y, pageWidth - margin * 2, 38, 3, 3, "FD");

  let leftTextOffset = margin + 5;

  if (data.config.foto) {
    try {
      let format = "JPEG";
      if (data.config.foto.includes("image/png")) format = "PNG";
      if (data.config.foto.includes("image/webp")) format = "WEBP";

      // Draw photo
      doc.addImage(data.config.foto, format, margin + 5, y + 3, 14, 14);
      doc.setDrawColor(203, 213, 225); // Slate 300 border
      doc.roundedRect(margin + 5, y + 3, 14, 14, 1, 1, "S");

      leftTextOffset = margin + 22;
    } catch (e) {
      console.error("Erro ao incluir foto do perfil no PDF:", e);
    }
  }

  // User Name and details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Paciente: ${data.config.nome || "Usuario Focado"}`, leftTextOffset, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const infoLinha1 = `Sexo: ${data.config.sexo || "Nao informado"}  |  Idade: ${
    data.config.idade ? data.config.idade + " anos" : "Nao informada"
  }  |  Inicio: ${
    data.config.dataInicio ? data.config.dataInicio.split("-").reverse().join("/") : "--/--/----"
  }`;
  doc.text(infoLinha1, leftTextOffset, y + 14);

  // Key metrics grid inside card
  const gridY = y + 20;
  const colW = (pageWidth - margin * 2 - 10) / 4;

  // Box 1: Peso Inicial
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 5, gridY, colW - 2, 13, 2, 2, "FD");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("PESO INICIAL", margin + 8, gridY + 4.5);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`${pesoInicial.toFixed(1)} kg`, margin + 8, gridY + 10);

  // Box 2: Peso Atual
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 5 + colW, gridY, colW - 2, 13, 2, 2, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("PESO ATUAL", margin + 5 + colW + 3, gridY + 4.5);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text(`${pesoAtual.toFixed(1)} kg`, margin + 5 + colW + 3, gridY + 10);

  // Box 3: Total Perdido
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 5 + colW * 2, gridY, colW - 2, 13, 2, 2, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL PERDIDO", margin + 5 + colW * 2 + 3, gridY + 4.5);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105); // Emerald 600
  doc.text(`-${pesoPerdido.toFixed(1)} kg`, margin + 5 + colW * 2 + 3, gridY + 10);

  // Box 4: Meta Final Alvo
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 5 + colW * 3, gridY, colW - 2, 13, 2, 2, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("PESO ALVO FINAL", margin + 5 + colW * 3 + 3, gridY + 4.5);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(pesoAlvo > 0 ? `${pesoAlvo.toFixed(1)} kg` : "--", margin + 5 + colW * 3 + 3, gridY + 10);

  y += 44;

  // HEALTH & INJECTION INDICATORS (SECTION 2)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("INDICADORES DE SAUDE & TRATAMENTO SUBCUTANEO", margin, y);

  y += 4;

  const boxW = (pageWidth - margin * 2 - 4) / 2;

  // Left Card: Glicemia & Fome
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, boxW, 22, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("Glicemia e Nivel de Fome", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  let glicemiaStatusStr = "Nao registrada";
  if (ultimaGlicemia !== undefined) {
    if (ultimaGlicemia < 100) glicemiaStatusStr = `${ultimaGlicemia} mg/dL (Normal)`;
    else if (ultimaGlicemia < 126) glicemiaStatusStr = `${ultimaGlicemia} mg/dL (Atencao)`;
    else glicemiaStatusStr = `${ultimaGlicemia} mg/dL (Elevado)`;
  }

  doc.text(`* Ultima Glicemia: ${glicemiaStatusStr}`, margin + 4, y + 12);
  doc.text(`* Nivel Medio de Fome: ${mediaFome} / 10`, margin + 4, y + 17);

  // Right Card: Subcutaneous Injections
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + boxW + 4, y, boxW, 22, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("Avisos de Injeçoes Subcutaneas", margin + boxW + 8, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`* Aplicacoes Concluidas: ${completedInjectionsCount} doses`, margin + boxW + 8, y + 12);
  doc.text(
    `* Detalhamento: Tirzepatida (${tirzepatidaCount}) | Retatrutida (${retatrutidaCount})`,
    margin + boxW + 8,
    y + 17
  );

  y += 28;

  // MEDICATIONS TABLE SECTION (IF ANY)
  const medicamentos = data.medicamentos || [];
  if (medicamentos.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("GERENCIAMENTO DE MEDICAMENTOS & INVESTIMENTO", margin, y);

    const medTableBody = medicamentos.map((m) => {
      const valorTotal = (m.valor || 0) + (m.frete || 0);
      return [
        m.nome || "-",
        m.marca || "-",
        m.mg || "-",
        m.dataCompra ? m.dataCompra.split("-").reverse().join("/") : "-",
        `R$ ${(m.valor || 0).toFixed(2).replace(".", ",")}`,
        `R$ ${(m.frete || 0).toFixed(2).replace(".", ",")}`,
        `R$ ${valorTotal.toFixed(2).replace(".", ",")}`,
        m.ondeComprou || "-",
      ];
    });

    const totalInvestido = medicamentos.reduce((acc, curr) => acc + (curr.valor || 0) + (curr.frete || 0), 0);

    autoTable(doc, {
      startY: y + 3,
      margin: { left: margin, right: margin },
      head: [["Medicamento", "Marca", "Dosagem", "Data Compra", "Valor", "Frete", "Total", "Local/Loja"]],
      body: medTableBody,
      foot: [["TOTAL INVESTIDO ACUMULADO", "", "", "", "", "", `R$ ${totalInvestido.toFixed(2).replace(".", ",")}`, ""]],
      theme: "striped",
      headStyles: {
        fillColor: [79, 70, 229], // Indigo 600
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: "bold",
        fontSize: 8,
      },
    });

    // @ts-expect-error autoTable adds lastAutoTable to doc
    y = doc.lastAutoTable.finalY + 8;
  }

  // DETAILED WEIGHT REGISTRATION HISTORY TABLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`HISTORICO DE REGISTROS DE PESO & SAUDE (${registrosFiltrados.length} registros ate ${cutoffFormatted})`, margin, y);

  const historyRows = registrosFiltrados.map((r, i) => {
    const dataFmt = r.data.split("-").reverse().join("/");
    let evolucaoStr = "--";
    if (i === 0) {
      const diffIni = r.peso - pesoInicial;
      evolucaoStr = diffIni === 0 ? "0,0 kg" : `${diffIni > 0 ? "+" : ""}${diffIni.toFixed(1).replace(".", ",")} kg`;
    } else {
      const diffAnterior = r.peso - registrosFiltrados[i - 1].peso;
      evolucaoStr = diffAnterior === 0 ? "0,0 kg" : `${diffAnterior > 0 ? "+" : ""}${diffAnterior.toFixed(1).replace(".", ",")} kg`;
    }

    const glicemiaStr = r.glicemia !== undefined && r.glicemia !== null ? `${r.glicemia} mg/dL` : "-";
    const fomeStr = r.fome !== undefined ? `${r.fome}/10` : "-";

    return [
      dataFmt,
      `${r.peso.toFixed(1).replace(".", ",")} kg`,
      evolucaoStr,
      fomeStr,
      glicemiaStr,
      r.obs || "-",
    ];
  });

  autoTable(doc, {
    startY: y + 3,
    margin: { left: margin, right: margin },
    head: [["Data", "Peso", "Evolução", "Fome", "Glicemia", "Observações / Notas"]],
    body: historyRows.length > 0 ? historyRows : [["Sem registros até a data selecionada", "-", "-", "-", "-", "-"]],
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42], // Slate 900
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 20, fontStyle: "bold" },
      2: { cellWidth: 22 },
      3: { cellWidth: 16 },
      4: { cellWidth: 25 },
      5: { cellWidth: "auto" },
    },
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `EMAGRECER.IO • Relatorio de Acompanhamento do Paciente • Exclui Plano Nutricional • Pagina ${p} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  // Save PDF file
  const fileName = `Relatorio_EmagrecerIO_${cutoffIso}.pdf`;
  doc.save(fileName);
}
