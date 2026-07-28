import { useState, useEffect } from "react";
import { Syringe, Calendar, CheckCircle2, Search, Filter, Award } from "lucide-react";
import { motion } from "motion/react";

export interface ScheduleItem {
  id: string;
  dateStr: string; // DD/MM/YYYY
  isoDate: string; // YYYY-MM-DD
  dayOfWeek: string;
  medication: "Tirzepatida" | "Retatrutida";
  mainArea: string;
  microArea: string;
  monthGroup: string;
}

export const SCHEDULE_DATA: Omit<ScheduleItem, "id">[] = [
  // MÊS 1: JULHO/AGOSTO 2026
  { dateStr: "16/07/2026", isoDate: "2026-07-16", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte superior", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "20/07/2026", isoDate: "2026-07-20", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Braço Direito", microArea: "Terço superior, parte externa (trás do braço)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "23/07/2026", isoDate: "2026-07-23", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Braço Esquerdo", microArea: "Terço superior, parte externa (trás do braço)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "27/07/2026", isoDate: "2026-07-27", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Coxa Direita", microArea: "Terço superior da coxa (próximo à virilha), parte frontal", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "30/07/2026", isoDate: "2026-07-30", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Coxa Esquerda", microArea: "Terço superior da coxa (próximo à virilha), parte frontal", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "03/08/2026", isoDate: "2026-08-03", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte superior", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "06/08/2026", isoDate: "2026-08-06", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte média (na altura do umbigo)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "10/08/2026", isoDate: "2026-08-10", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Braço Direito", microArea: "Terço médio do braço, parte externa (trás do braço)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "13/08/2026", isoDate: "2026-08-13", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Braço Esquerdo", microArea: "Terço médio do braço, parte externa (trás do braço)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "17/08/2026", isoDate: "2026-08-17", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Coxa Direita", microArea: "Terço médio da coxa, parte frontal", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "20/08/2026", isoDate: "2026-08-20", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Coxa Esquerda", microArea: "Terço médio da coxa, parte frontal", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "24/08/2026", isoDate: "2026-08-24", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte média (na altura do umbigo)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "27/08/2026", isoDate: "2026-08-27", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte inferior", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "31/08/2026", isoDate: "2026-08-31", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Braço Direito", microArea: "Terço inferior (próximo ao cotovelo), parte externa (trás do braço)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },

  // MÊS 2: SETEMBRO 2026
  { dateStr: "03/09/2026", isoDate: "2026-09-03", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Braço Esquerdo", microArea: "Terço inferior (próximo ao cotovelo), parte externa (trás do braço)", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "07/09/2026", isoDate: "2026-09-07", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Coxa Direita", microArea: "Terço inferior da coxa (próximo ao joelho), parte frontal", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "10/09/2026", isoDate: "2026-09-10", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Coxa Esquerda", microArea: "Terço inferior da coxa (próximo ao joelho), parte frontal", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "14/09/2026", isoDate: "2026-09-14", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte inferior", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "17/09/2026", isoDate: "2026-09-17", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte lateral extrema (flanco)", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "21/09/2026", isoDate: "2026-09-21", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Braço Direito", microArea: "Terço superior, parte interna (lado do corpo)", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "24/09/2026", isoDate: "2026-09-24", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Braço Esquerdo", microArea: "Terço superior, parte interna (lado do corpo)", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "28/09/2026", isoDate: "2026-09-28", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Coxa Direita", microArea: "Terço superior da coxa, parte lateral (parte de fora da perna)", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },

  // MÊS 3: OUTUBRO 2026
  { dateStr: "01/10/2026", isoDate: "2026-10-01", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Coxa Esquerda", microArea: "Terço superior da coxa, parte lateral (parte de fora da perna)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "05/10/2026", isoDate: "2026-10-05", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte lateral extrema (flanco)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "08/10/2026", isoDate: "2026-10-08", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte superior (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "12/10/2026", isoDate: "2026-10-12", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Braço Direito", microArea: "Terço superior, parte externa (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "15/10/2026", isoDate: "2026-10-15", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Braço Esquerdo", microArea: "Terço superior, parte externa (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "19/10/2026", isoDate: "2026-10-19", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Coxa Direita", microArea: "Terço superior, parte frontal (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "22/10/2026", isoDate: "2026-10-22", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Coxa Esquerda", microArea: "Terço superior, parte frontal (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "26/10/2026", isoDate: "2026-10-26", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte superior (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "29/10/2026", isoDate: "2026-10-29", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte média (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },

  // MÊS 4: NOVEMBRO 2026
  { dateStr: "02/11/2026", isoDate: "2026-11-02", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Braço Direito", microArea: "Terço médio, parte externa (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "05/11/2026", isoDate: "2026-11-05", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Braço Esquerdo", microArea: "Terço médio, parte externa (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "09/11/2026", isoDate: "2026-11-09", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Coxa Direita", microArea: "Terço médio, parte frontal (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "12/11/2026", isoDate: "2026-11-12", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Coxa Esquerda", microArea: "Terço médio, parte frontal (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "16/11/2026", isoDate: "2026-11-16", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte média (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "19/11/2026", isoDate: "2026-11-19", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte inferior (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "23/11/2026", isoDate: "2026-11-23", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Braço Direito", microArea: "Terço inferior, parte externa (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "26/11/2026", isoDate: "2026-11-26", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Braço Esquerdo", microArea: "Terço inferior, parte externa (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "30/11/2026", isoDate: "2026-11-30", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Coxa Direita", microArea: "Terço inferior, parte frontal (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },

  // MÊS 5: DEZEMBRO 2026
  { dateStr: "03/12/2026", isoDate: "2026-12-03", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Coxa Esquerda", microArea: "Terço inferior, parte frontal (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "07/12/2026", isoDate: "2026-12-07", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte inferior (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "10/12/2026", isoDate: "2026-12-10", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte lateral extrema (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "14/12/2026", isoDate: "2026-12-14", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Braço Direito", microArea: "Terço superior, parte interna (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "17/12/2026", isoDate: "2026-12-17", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Braço Esquerdo", microArea: "Terço superior, parte interna (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "21/12/2026", isoDate: "2026-12-21", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Coxa Direita", microArea: "Terço superior, parte lateral (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "24/12/2026", isoDate: "2026-12-24", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Coxa Esquerda", microArea: "Terço superior, parte lateral (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "28/12/2026", isoDate: "2026-12-28", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte lateral extrema (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "31/12/2026", isoDate: "2026-12-31", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte superior (2ª volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },

  // MÊS 6: JANEIRO 2027
  { dateStr: "04/01/2027", isoDate: "2027-01-04", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Braço Direito", microArea: "Terço superior, parte externa (2ª volta)", monthGroup: "📅 MÊS 6: JANEIRO 2027" },
  { dateStr: "07/01/2027", isoDate: "2027-01-07", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Braço Esquerdo", microArea: "Terço superior, parte externa (2ª volta)", monthGroup: "📅 MÊS 6: JANEIRO 2027" },
  { dateStr: "11/01/2027", isoDate: "2027-01-11", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Coxa Direita", microArea: "Terço superior, parte frontal (2ª volta)", monthGroup: "📅 MÊS 6: JANEIRO 2027" },
  { dateStr: "14/01/2027", isoDate: "2027-01-14", dayOfWeek: "Quinta", medication: "Tirzepatida", mainArea: "Coxa Esquerda", microArea: "Terço superior, parte frontal (2ª volta)", monthGroup: "📅 MÊS 6: JANEIRO 2027" },
  { dateStr: "18/01/2027", isoDate: "2027-01-18", dayOfWeek: "Segunda", medication: "Retatrutida", mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte superior (2ª volta)", monthGroup: "📅 MÊS 6: JANEIRO 2027" },
];

export function getScheduleStatusForDate(targetIsoDate?: string) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const currentDateStr = targetIsoDate || `${year}-${month}-${day}`;

  const todaySchedule = SCHEDULE_DATA.find((item) => item.isoDate === currentDateStr);

  if (todaySchedule) {
    const idx = SCHEDULE_DATA.findIndex((item) => item.isoDate === currentDateStr);
    let dosage = 2.5;
    if (todaySchedule.medication === "Retatrutida") {
      let retatrutidaCount = 0;
      for (let i = 0; i <= idx; i++) {
        if (SCHEDULE_DATA[i].medication === "Retatrutida") {
          if (i === idx) break;
          retatrutidaCount++;
        }
      }
      if (retatrutidaCount < 4) dosage = 1.0;
      else if (retatrutidaCount < 8) dosage = 1.5;
      else if (retatrutidaCount < 12) dosage = 2.0;
      else dosage = 2.4;
    }
    return {
      isToday: true,
      medication: todaySchedule.medication,
      dosage: `${dosage.toFixed(1).replace(".", ",")} mg`,
      mainArea: todaySchedule.mainArea,
      microArea: todaySchedule.microArea,
      dateStr: todaySchedule.dateStr,
      dayOfWeek: todaySchedule.dayOfWeek,
    };
  }

  // Find next upcoming injection
  const upcoming = SCHEDULE_DATA.find((item) => item.isoDate > currentDateStr);
  if (upcoming) {
    const idx = SCHEDULE_DATA.findIndex((item) => item.isoDate === upcoming.isoDate);
    let dosage = 2.5;
    if (upcoming.medication === "Retatrutida") {
      let retatrutidaCount = 0;
      for (let i = 0; i <= idx; i++) {
        if (SCHEDULE_DATA[i].medication === "Retatrutida") {
          if (i === idx) break;
          retatrutidaCount++;
        }
      }
      if (retatrutidaCount < 4) dosage = 1.0;
      else if (retatrutidaCount < 8) dosage = 1.5;
      else if (retatrutidaCount < 12) dosage = 2.0;
      else dosage = 2.4;
    }
    return {
      isToday: false,
      nextMedication: upcoming.medication,
      nextDosage: `${dosage.toFixed(1).replace(".", ",")} mg`,
      nextDateStr: upcoming.dateStr,
      nextDayOfWeek: upcoming.dayOfWeek,
      nextMainArea: upcoming.mainArea,
    };
  }

  return { isToday: false };
}

export default function RastreadorInjecaoCard() {
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("subcutanea_completed_applications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [filterMed, setFilterMed] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("subcutanea_completed_applications", JSON.stringify(completedIds));
  }, [completedIds]);

  const toggleComplete = (idx: number) => {
    const idStr = String(idx);
    setCompletedIds((prev) =>
      prev.includes(idStr) ? prev.filter((i) => i !== idStr) : [...prev, idStr]
    );
  };

  const filteredData = SCHEDULE_DATA.map((item, idx) => ({ ...item, originalIndex: idx })).filter((item) => {
    if (filterMed !== "all" && item.medication.toLowerCase() !== filterMed.toLowerCase()) {
      return false;
    }
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      return (
        item.dateStr.includes(term) ||
        item.dayOfWeek.toLowerCase().includes(term) ||
        item.medication.toLowerCase().includes(term) ||
        item.mainArea.toLowerCase().includes(term) ||
        item.microArea.toLowerCase().includes(term) ||
        item.monthGroup.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Group filtered data by monthGroup
  const groupedData: { [key: string]: (typeof filteredData) } = {};
  filteredData.forEach((item) => {
    if (!groupedData[item.monthGroup]) {
      groupedData[item.monthGroup] = [];
    }
    groupedData[item.monthGroup].push(item);
  });

  const getMedicationDosage = (itemIndex: number) => {
    const item = SCHEDULE_DATA[itemIndex];
    if (!item) return 2.5;
    if (item.medication === "Tirzepatida") return 2.5;

    let retatrutidaCount = 0;
    for (let i = 0; i <= itemIndex; i++) {
      if (SCHEDULE_DATA[i].medication === "Retatrutida") {
        if (i === itemIndex) break;
        retatrutidaCount++;
      }
    }

    if (retatrutidaCount < 4) return 1.0;
    if (retatrutidaCount < 8) return 1.5;
    if (retatrutidaCount < 12) return 2.0;
    return 2.4;
  };

  const totalCount = SCHEDULE_DATA.length;
  const completedCount = completedIds.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Dosage sums
  const tirzepatidaCompletedCount = SCHEDULE_DATA.filter(
    (item, idx) => item.medication === "Tirzepatida" && completedIds.includes(String(idx))
  ).length;
  const tirzepatidaTotalMg = tirzepatidaCompletedCount * 2.5;

  let retatrutidaCompletedCount = 0;
  let retatrutidaTotalMg = 0;
  SCHEDULE_DATA.forEach((item, idx) => {
    if (item.medication === "Retatrutida" && completedIds.includes(String(idx))) {
      retatrutidaCompletedCount++;
      retatrutidaTotalMg += getMedicationDosage(idx);
    }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20 shrink-0">
            <Syringe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">Lista Completa de Aplicações</h2>
            <p className="text-xs text-blue-100 font-medium">17/07/2026 a 18/01/2027 (Planejamento de 6 Meses)</p>
          </div>
        </div>

        {/* Progress Counter */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 w-full md:w-auto">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-200">Progresso do Planejamento</p>
            <p className="text-lg font-black">{completedCount} de {totalCount} concluídas ({progressPercent}%)</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Dosage Accumulation Cards (Separate sums for Tirzepatida & Retatrutida) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tirzepatida Dosage Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-blue-600"></div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Tirzepatida (Total Aplicado)</h3>
            </div>
            <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {tirzepatidaTotalMg.toFixed(1).replace(".", ",")} mg
            </p>
            <p className="text-xs text-slate-500 font-semibold">
              {tirzepatidaCompletedCount} {tirzepatidaCompletedCount === 1 ? "aplicação realizada" : "aplicações realizadas"} (2,5 mg cada)
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* Retatrutida Dosage Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-emerald-600"></div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Retatrutida (Total Aplicado)</h3>
            </div>
            <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {retatrutidaTotalMg.toFixed(1).replace(".", ",")} mg
            </p>
            <p className="text-xs text-slate-500 font-semibold">
              {retatrutidaCompletedCount} {retatrutidaCompletedCount === 1 ? "aplicação realizada" : "aplicações realizadas"} (progressiva: 1,0 - 2,4 mg)
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Award className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Controls & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por data, área ou remédio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Medication Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <button
            type="button"
            onClick={() => setFilterMed("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              filterMed === "all" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFilterMed("tirzepatida")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              filterMed === "tirzepatida" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tirzepatida
          </button>
          <button
            type="button"
            onClick={() => setFilterMed("retatrutida")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              filterMed === "retatrutida" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Retatrutida
          </button>
        </div>
      </div>

      {/* Schedule Lists Grouped by Month */}
      <div className="space-y-6">
        {Object.keys(groupedData).length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs font-medium border border-slate-200 shadow-sm">
            Nenhuma aplicação encontrada com os filtros atuais.
          </div>
        ) : (
          Object.entries(groupedData).map(([monthTitle, items]) => (
            <div key={monthTitle} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {monthTitle}
                </h3>
                <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-lg">
                  {items.length} aplicações
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isCompleted = completedIds.includes(String(item.originalIndex));
                  const itemDosage = getMedicationDosage(item.originalIndex);
                  const dosageStr = itemDosage.toFixed(1).replace(".", ",") + " mg";

                  return (
                    <motion.div
                      key={item.originalIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                        isCompleted ? "bg-emerald-50/50" : "hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-start md:items-center gap-4 w-full md:w-auto">
                        {/* Checkbox button */}
                        <button
                          type="button"
                          onClick={() => toggleComplete(item.originalIndex)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer border ${
                            isCompleted
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20"
                              : "border-slate-300 bg-white hover:border-slate-400"
                          }`}
                          title={isCompleted ? "Marcar como pendente" : `Marcar como aplicada (+${dosageStr})`}
                        >
                          {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                              {item.dateStr}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              ({item.dayOfWeek})
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              item.medication === "Tirzepatida" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {item.medication} ({dosageStr})
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs">
                            <span className="font-extrabold text-slate-800 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                              {item.mainArea}
                            </span>
                            <span className="text-slate-400 hidden sm:inline">•</span>
                            <span className="text-slate-600 font-medium">
                              {item.microArea}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator pill */}
                      <div className="shrink-0 self-end md:self-center">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl ${
                          isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {isCompleted ? `Aplicada (+${dosageStr})` : "Pendente"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
