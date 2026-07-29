import { useState, useEffect } from "react";
import { 
  Syringe, 
  Calendar, 
  CheckCircle2, 
  Search, 
  Filter, 
  Award, 
  Pencil, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  X,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ScheduleItem {
  id?: string;
  dateStr: string; // DD/MM/YYYY
  isoDate: string; // YYYY-MM-DD
  dayOfWeek: string;
  medication: string;
  dosageMg?: number;
  mainArea: string;
  microArea: string;
  monthGroup: string;
}

export const DIAS_DA_SEMANA_COMPLETOS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado"
];

export function getDiaDaSemanaFromIso(isoDateStr: string): string {
  if (!isoDateStr) return "";
  const parts = isoDateStr.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d);
    if (!isNaN(dt.getTime())) {
      return DIAS_DA_SEMANA_COMPLETOS[dt.getDay()];
    }
  }
  return "";
}

export function formatIsoToDateStr(isoDateStr: string): string {
  if (!isoDateStr) return "";
  const parts = isoDateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDateStr;
}

const MESES_NOME = [
  "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
  "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
];

export function getMonthGroupNameFromIso(isoDateStr: string, fallbackMonthGroup?: string): string {
  if (!isoDateStr) return fallbackMonthGroup || "📅 OUTRAS DATAS";
  const parts = isoDateStr.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    if (!isNaN(y) && !isNaN(m) && m >= 0 && m < 12) {
      return `📅 ${MESES_NOME[m]} ${y}`;
    }
  }
  return fallbackMonthGroup || "📅 OUTRAS DATAS";
}

export const SCHEDULE_DATA: ScheduleItem[] = [
  // MÊS 1: JULHO/AGOSTO 2026
  { dateStr: "16/07/2026", isoDate: "2026-07-16", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte superior", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "20/07/2026", isoDate: "2026-07-20", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 1.0, mainArea: "Braço Direito", microArea: "Terço superior, parte externa (trás do braço)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "23/07/2026", isoDate: "2026-07-23", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Braço Esquerdo", microArea: "Terço superior, parte externa (trás do braço)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "27/07/2026", isoDate: "2026-07-27", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 1.0, mainArea: "Coxa Direita", microArea: "Terço superior da coxa (próximo à virilha), parte frontal", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "30/07/2026", isoDate: "2026-07-30", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Coxa Esquerda", microArea: "Terço superior da coxa (próximo à virilha), parte frontal", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "03/08/2026", isoDate: "2026-08-03", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 1.0, mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte superior", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "06/08/2026", isoDate: "2026-08-06", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte média (na altura do umbigo)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "10/08/2026", isoDate: "2026-08-10", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 1.0, mainArea: "Braço Direito", microArea: "Terço médio do braço, parte externa (trás do braço)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "13/08/2026", isoDate: "2026-08-13", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Braço Esquerdo", microArea: "Terço médio do braço, parte externa (trás do braço)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "17/08/2026", isoDate: "2026-08-17", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 1.5, mainArea: "Coxa Direita", microArea: "Terço médio da coxa, parte frontal", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "20/08/2026", isoDate: "2026-08-20", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Coxa Esquerda", microArea: "Terço médio da coxa, parte frontal", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "24/08/2026", isoDate: "2026-08-24", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 1.5, mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte média (na altura do umbigo)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "27/08/2026", isoDate: "2026-08-27", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte inferior", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },
  { dateStr: "31/08/2026", isoDate: "2026-08-31", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 1.5, mainArea: "Braço Direito", microArea: "Terço inferior (próximo ao cotovelo), parte externa (trás do braço)", monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026" },

  // MÊS 2: SETEMBRO 2026
  { dateStr: "03/09/2026", isoDate: "2026-09-03", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Braço Esquerdo", microArea: "Terço inferior (próximo ao cotovelo), parte externa (trás do braço)", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "07/09/2026", isoDate: "2026-09-07", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 1.5, mainArea: "Coxa Direita", microArea: "Terço inferior da coxa (próximo ao joelho), parte frontal", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "10/09/2026", isoDate: "2026-09-10", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Coxa Esquerda", microArea: "Terço inferior da coxa (próximo ao joelho), parte frontal", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "14/09/2026", isoDate: "2026-09-14", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.0, mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte inferior", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "17/09/2026", isoDate: "2026-09-17", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte lateral extrema (flanco)", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "21/09/2026", isoDate: "2026-09-21", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.0, mainArea: "Braço Direito", microArea: "Terço superior, parte interna (lado do corpo)", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "24/09/2026", isoDate: "2026-09-24", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Braço Esquerdo", microArea: "Terço superior, parte interna (lado do corpo)", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },
  { dateStr: "28/09/2026", isoDate: "2026-09-28", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.0, mainArea: "Coxa Direita", microArea: "Terço superior da coxa, parte lateral (parte de fora da perna)", monthGroup: "📅 MÊS 2: SETEMBRO 2026" },

  // MÊS 3: OUTUBRO 2026
  { dateStr: "01/10/2026", isoDate: "2026-10-01", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Coxa Esquerda", microArea: "Terço superior da coxa, parte lateral (parte de fora da perna)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "05/10/2026", isoDate: "2026-10-05", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.0, mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte lateral extrema (flanco)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "08/10/2026", isoDate: "2026-10-08", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte superior (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "12/10/2026", isoDate: "2026-10-12", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Braço Direito", microArea: "Terço superior, parte externa (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "15/10/2026", isoDate: "2026-10-15", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Braço Esquerdo", microArea: "Terço superior, parte externa (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "19/10/2026", isoDate: "2026-10-19", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Coxa Direita", microArea: "Terço superior, parte frontal (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "22/10/2026", isoDate: "2026-10-22", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Coxa Esquerda", microArea: "Terço superior, parte frontal (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "26/10/2026", isoDate: "2026-10-26", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte superior (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },
  { dateStr: "29/10/2026", isoDate: "2026-10-29", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte média (volta)", monthGroup: "📅 MÊS 3: OUTUBRO 2026" },

  // MÊS 4: NOVEMBRO 2026
  { dateStr: "02/11/2026", isoDate: "2026-11-02", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Braço Direito", microArea: "Terço médio, parte externa (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "05/11/2026", isoDate: "2026-11-05", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Braço Esquerdo", microArea: "Terço médio, parte externa (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "09/11/2026", isoDate: "2026-11-09", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Coxa Direita", microArea: "Terço médio, parte frontal (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "12/11/2026", isoDate: "2026-11-12", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Coxa Esquerda", microArea: "Terço médio, parte frontal (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "16/11/2026", isoDate: "2026-11-16", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte média (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "19/11/2026", isoDate: "2026-11-19", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte inferior (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "23/11/2026", isoDate: "2026-11-23", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Braço Direito", microArea: "Terço inferior, parte externa (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "26/11/2026", isoDate: "2026-11-26", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Braço Esquerdo", microArea: "Terço inferior, parte externa (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },
  { dateStr: "30/11/2026", isoDate: "2026-11-30", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Coxa Direita", microArea: "Terço inferior, parte frontal (volta)", monthGroup: "📅 MÊS 4: NOVEMBRO 2026" },

  // MÊS 5: DEZEMBRO 2026
  { dateStr: "03/12/2026", isoDate: "2026-12-03", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Coxa Esquerda", microArea: "Terço inferior, parte frontal (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "07/12/2026", isoDate: "2026-12-07", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte inferior (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "10/12/2026", isoDate: "2026-12-10", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte lateral extrema (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "14/12/2026", isoDate: "2026-12-14", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Braço Direito", microArea: "Terço superior, parte interna (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "17/12/2026", isoDate: "2026-12-17", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Braço Esquerdo", microArea: "Terço superior, parte interna (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "21/12/2026", isoDate: "2026-12-21", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Coxa Direita", microArea: "Terço superior, parte lateral (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "24/12/2026", isoDate: "2026-12-24", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Coxa Esquerda", microArea: "Terço superior, parte lateral (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "28/12/2026", isoDate: "2026-12-28", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte lateral extrema (volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },
  { dateStr: "31/12/2026", isoDate: "2026-12-31", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Abdômen Esquerdo", microArea: "Lado esquerdo do umbigo, parte superior (2ª volta)", monthGroup: "📅 MÊS 5: DEZEMBRO 2026" },

  // MÊS 6: JANEIRO 2027
  { dateStr: "04/01/2027", isoDate: "2027-01-04", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Braço Direito", microArea: "Terço superior, parte externa (2ª volta)", monthGroup: "📅 MÊS 6: JANEIRO 2027" },
  { dateStr: "07/01/2027", isoDate: "2027-01-07", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Braço Esquerdo", microArea: "Terço superior, parte externa (2ª volta)", monthGroup: "📅 MÊS 6: JANEIRO 2027" },
  { dateStr: "11/01/2027", isoDate: "2027-01-11", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Coxa Direita", microArea: "Terço superior, parte frontal (2ª volta)", monthGroup: "📅 MÊS 6: JANEIRO 2027" },
  { dateStr: "14/01/2027", isoDate: "2027-01-14", dayOfWeek: "Quinta-feira", medication: "Tirzepatida", dosageMg: 2.5, mainArea: "Coxa Esquerda", microArea: "Terço superior, parte frontal (2ª volta)", monthGroup: "📅 MÊS 6: JANEIRO 2027" },
  { dateStr: "18/01/2027", isoDate: "2027-01-18", dayOfWeek: "Segunda-feira", medication: "Retatrutida", dosageMg: 2.4, mainArea: "Abdômen Direito", microArea: "Lado direito do umbigo, parte superior (2ª volta)", monthGroup: "📅 MÊS 6: JANEIRO 2027" },
];

export function loadCustomScheduleList(): ScheduleItem[] {
  if (typeof window === "undefined") return SCHEDULE_DATA;
  const saved = localStorage.getItem("subcutanea_schedule_custom_v2");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return SCHEDULE_DATA;
}

export function getScheduleStatusForDate(targetIsoDate?: string) {
  const scheduleData = loadCustomScheduleList();
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const currentDateStr = targetIsoDate || `${year}-${month}-${day}`;

  const todaySchedule = scheduleData.find((item) => item.isoDate === currentDateStr);

  if (todaySchedule) {
    const idx = scheduleData.findIndex((item) => item.isoDate === currentDateStr);
    let dosage = todaySchedule.dosageMg ?? 2.5;
    if (todaySchedule.dosageMg === undefined && todaySchedule.medication === "Retatrutida") {
      let retatrutidaCount = 0;
      for (let i = 0; i <= idx; i++) {
        if (scheduleData[i].medication === "Retatrutida") {
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
      dosage: `${dosage.toString().replace(".", ",")} mg`,
      mainArea: todaySchedule.mainArea,
      microArea: todaySchedule.microArea,
      dateStr: todaySchedule.dateStr,
      dayOfWeek: todaySchedule.dayOfWeek,
    };
  }

  // Find next upcoming injection
  const upcoming = scheduleData.find((item) => item.isoDate > currentDateStr);
  if (upcoming) {
    const idx = scheduleData.findIndex((item) => item.isoDate === upcoming.isoDate);
    let dosage = upcoming.dosageMg ?? 2.5;
    if (upcoming.dosageMg === undefined && upcoming.medication === "Retatrutida") {
      let retatrutidaCount = 0;
      for (let i = 0; i <= idx; i++) {
        if (scheduleData[i].medication === "Retatrutida") {
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
      nextDosage: `${dosage.toString().replace(".", ",")} mg`,
      nextDateStr: upcoming.dateStr,
      nextDayOfWeek: upcoming.dayOfWeek,
      nextMainArea: upcoming.mainArea,
    };
  }

  return { isToday: false };
}

export default function RastreadorInjecaoCard() {
  const [scheduleList, setScheduleList] = useState<ScheduleItem[]>(() => loadCustomScheduleList());

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

  // Modal State for Editing / Adding Injection Applications
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isNewApplication, setIsNewApplication] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<ScheduleItem>({
    dateStr: "28/07/2026",
    isoDate: "2026-07-28",
    dayOfWeek: "Terça-feira",
    medication: "Tirzepatida",
    dosageMg: 2.5,
    mainArea: "Abdômen Esquerdo",
    microArea: "Lado esquerdo do umbigo, parte superior",
    monthGroup: "📅 MÊS 1: JULHO/AGOSTO 2026"
  });

  // Periodicity and batch generation state
  const [periodicityDays, setPeriodicityDays] = useState<number>(7);
  const [isCustomPeriodicity, setIsCustomPeriodicity] = useState<boolean>(false);
  const [repeatCount, setRepeatCount] = useState<number>(4);
  const [isCustomRepeatCount, setIsCustomRepeatCount] = useState<boolean>(false);
  const [autoRotateAreas, setAutoRotateAreas] = useState<boolean>(true);

  // Save changes to localStorage whenever scheduleList changes
  useEffect(() => {
    localStorage.setItem("subcutanea_schedule_custom_v2", JSON.stringify(scheduleList));
  }, [scheduleList]);

  // Save completed ids to localStorage
  useEffect(() => {
    localStorage.setItem("subcutanea_completed_applications", JSON.stringify(completedIds));
  }, [completedIds]);

  const toggleComplete = (idx: number) => {
    const idStr = String(idx);
    setCompletedIds((prev) =>
      prev.includes(idStr) ? prev.filter((i) => i !== idStr) : [...prev, idStr]
    );
  };

  // Open modal to EDIT existing application
  const handleOpenEditModal = (originalIndex: number) => {
    const target = scheduleList[originalIndex];
    if (target) {
      setEditingIndex(originalIndex);
      setIsNewApplication(false);
      setEditForm({ ...target });
      setPeriodicityDays(7);
      setIsCustomPeriodicity(false);
      setRepeatCount(1);
      setIsCustomRepeatCount(false);
      setAutoRotateAreas(true);
    }
  };

  // Open modal to ADD new application
  const handleOpenAddModal = () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const dayOfWeek = getDiaDaSemanaFromIso(todayIso);
    const dateStr = formatIsoToDateStr(todayIso);

    setEditingIndex(null);
    setIsNewApplication(true);
    setEditForm({
      dateStr: dateStr,
      isoDate: todayIso,
      dayOfWeek: dayOfWeek || "Segunda-feira",
      medication: "Tirzepatida",
      dosageMg: 2.5,
      mainArea: "Abdômen Esquerdo",
      microArea: "Lado esquerdo do umbigo, parte superior",
      monthGroup: getMonthGroupNameFromIso(todayIso)
    });
    setPeriodicityDays(7);
    setIsCustomPeriodicity(false);
    setRepeatCount(4);
    setIsCustomRepeatCount(false);
    setAutoRotateAreas(true);
  };

  // When date is changed in form, auto-update dateStr and dayOfWeek!
  const handleDateInputChange = (newIsoDate: string) => {
    const dateStr = formatIsoToDateStr(newIsoDate);
    const autoDayOfWeek = getDiaDaSemanaFromIso(newIsoDate);
    
    setEditForm((prev) => ({
      ...prev,
      isoDate: newIsoDate,
      dateStr: dateStr,
      dayOfWeek: autoDayOfWeek || prev.dayOfWeek
    }));
  };

  // Save changes in modal
  const handleSaveEditModal = () => {
    if (!editForm.isoDate) {
      alert("Por favor, preencha a data inicial da aplicação.");
      return;
    }

    const finalMedicationName = editForm.medication === "Outro" ? "Outro Medicamento" : editForm.medication;
    if (!finalMedicationName || !finalMedicationName.trim()) {
      alert("Por favor, informe o nome do medicamento.");
      return;
    }

    const updated = [...scheduleList];
    const countToGenerate = repeatCount > 0 ? repeatCount : 1;
    const intervalDays = periodicityDays > 0 ? periodicityDays : 7;

    if (countToGenerate === 1) {
      const itemToSave: ScheduleItem = {
        ...editForm,
        medication: finalMedicationName,
        monthGroup: getMonthGroupNameFromIso(editForm.isoDate, editForm.monthGroup)
      };
      if (isNewApplication || editingIndex === null) {
        updated.push(itemToSave);
      } else {
        updated[editingIndex] = itemToSave;
      }
    } else {
      // Generate multiple recurring application dates starting from initial date
      const [y, m, d] = editForm.isoDate.split("-").map(Number);

      const ROTATION_AREAS = [
        { main: "Abdômen Esquerdo", micro: "Lado esquerdo do umbigo, parte superior" },
        { main: "Braço Direito", micro: "Terço superior, parte externa (trás do braço)" },
        { main: "Coxa Esquerda", micro: "Terço superior da coxa, parte frontal" },
        { main: "Abdômen Direito", micro: "Lado direito do umbigo, parte superior" },
        { main: "Braço Esquerdo", micro: "Terço superior, parte externa (trás do braço)" },
        { main: "Coxa Direita", micro: "Terço superior da coxa, parte frontal" },
      ];

      for (let i = 0; i < countToGenerate; i++) {
        const curDt = new Date(y, m - 1, d + i * intervalDays);
        const yr = curDt.getFullYear();
        const mo = String(curDt.getMonth() + 1).padStart(2, "0");
        const dy = String(curDt.getDate()).padStart(2, "0");
        const itemIso = `${yr}-${mo}-${dy}`;
        const itemDateStr = `${dy}/${mo}/${yr}`;
        const itemDayOfWeek = getDiaDaSemanaFromIso(itemIso) || "Segunda-feira";
        const monthGrpName = getMonthGroupNameFromIso(itemIso);

        const rot = autoRotateAreas
          ? ROTATION_AREAS[i % ROTATION_AREAS.length]
          : { main: editForm.mainArea || "Abdômen Esquerdo", micro: editForm.microArea || "Região padrão" };

        const newItem: ScheduleItem = {
          isoDate: itemIso,
          dateStr: itemDateStr,
          dayOfWeek: itemDayOfWeek,
          medication: finalMedicationName,
          dosageMg: editForm.dosageMg,
          mainArea: rot.main,
          microArea: rot.micro,
          monthGroup: monthGrpName
        };

        if (i === 0 && !isNewApplication && editingIndex !== null) {
          updated[editingIndex] = newItem;
        } else {
          updated.push(newItem);
        }
      }
    }

    // Sort chronologically by isoDate
    updated.sort((a, b) => a.isoDate.localeCompare(b.isoDate));

    setScheduleList(updated);
    setEditingIndex(null);
    setIsNewApplication(false);

    if (countToGenerate > 1) {
      alert(`✅ ${countToGenerate} aplicações de ${finalMedicationName} foram geradas a cada ${intervalDays} dias!`);
    } else {
      alert("✅ Aplicação salva com sucesso!");
    }
  };

  // Delete application entry
  const handleDeleteApplication = (originalIndex: number) => {
    if (confirm("Tem certeza que deseja excluir esta aplicação do cronograma?")) {
      const updated = scheduleList.filter((_, idx) => idx !== originalIndex);
      setScheduleList(updated);
      setEditingIndex(null);
      setIsNewApplication(false);
    }
  };

  // Restore default schedule
  const handleRestoreDefaultSchedule = () => {
    if (confirm("Deseja restaurar o cronograma de aplicações original de 6 meses?")) {
      setScheduleList(SCHEDULE_DATA);
      localStorage.removeItem("subcutanea_schedule_custom_v2");
    }
  };

  const getItemDosageNumber = (itemIndex: number) => {
    const item = scheduleList[itemIndex];
    if (!item) return 2.5;
    if (item.dosageMg !== undefined && item.dosageMg !== null) {
      return item.dosageMg;
    }
    if (item.medication === "Tirzepatida") return 2.5;

    let retatrutidaCount = 0;
    for (let i = 0; i <= itemIndex; i++) {
      if (scheduleList[i].medication === "Retatrutida") {
        if (i === itemIndex) break;
        retatrutidaCount++;
      }
    }

    if (retatrutidaCount < 4) return 1.0;
    if (retatrutidaCount < 8) return 1.5;
    if (retatrutidaCount < 12) return 2.0;
    return 2.4;
  };

  // List of unique medications present in the current schedule list
  const availableMedications: string[] = [];
  scheduleList.forEach((item) => {
    const name = item.medication?.trim();
    if (name && !availableMedications.some((m) => m.toLowerCase() === name.toLowerCase())) {
      availableMedications.push(name);
    }
  });

  const sortedScheduleList = [...scheduleList].sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  const filteredData = sortedScheduleList
    .map((item) => ({ ...item, originalIndex: scheduleList.indexOf(item) }))
    .filter((item) => {
      if (filterMed !== "all" && item.medication.toLowerCase() !== filterMed.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const monthGrpName = getMonthGroupNameFromIso(item.isoDate, item.monthGroup).toLowerCase();
        return (
          item.dateStr.includes(term) ||
          item.dayOfWeek.toLowerCase().includes(term) ||
          item.medication.toLowerCase().includes(term) ||
          item.mainArea.toLowerCase().includes(term) ||
          item.microArea.toLowerCase().includes(term) ||
          monthGrpName.includes(term)
        );
      }
      return true;
    });

  // Group filtered data by calendar month
  const groupedData: { [key: string]: (typeof filteredData) } = {};
  filteredData.forEach((item) => {
    const groupTitle = getMonthGroupNameFromIso(item.isoDate, item.monthGroup);
    if (!groupedData[groupTitle]) {
      groupedData[groupTitle] = [];
    }
    groupedData[groupTitle].push(item);
  });

  const totalCount = scheduleList.length;
  const completedCount = completedIds.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate dosage stats per medication & grand total
  const medStatsMap: Record<string, { totalAppliedMg: number; completedCount: number; totalCount: number }> = {};
  let grandTotalAppliedMg = 0;
  let grandTotalCompletedCount = 0;

  scheduleList.forEach((item, idx) => {
    const isDone = completedIds.includes(String(idx));
    const dose = getItemDosageNumber(idx);
    const rawMedName = item.medication?.trim() || "Outro";
    const canonicalName = availableMedications.find((m) => m.toLowerCase() === rawMedName.toLowerCase()) || rawMedName;

    if (!medStatsMap[canonicalName]) {
      medStatsMap[canonicalName] = { totalAppliedMg: 0, completedCount: 0, totalCount: 0 };
    }
    medStatsMap[canonicalName].totalCount++;

    if (isDone) {
      medStatsMap[canonicalName].completedCount++;
      medStatsMap[canonicalName].totalAppliedMg += dose;
      grandTotalAppliedMg += dose;
      grandTotalCompletedCount++;
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">Rastreador Subcutâneo</h2>
              <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-white/30">
                Editável
              </span>
            </div>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              Gerencie datas, doses em mg, macro/micro regiões de aplicação e dias da semana.
            </p>
          </div>
        </div>

        {/* Action Button & Progress Counter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Aplicação</span>
          </button>

          <div className="bg-slate-900/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 flex items-center gap-3 w-full sm:w-auto">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-blue-200">Progresso Geral</p>
              <p className="text-sm font-black">{completedCount} de {totalCount} ({progressPercent}%)</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
              {progressPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Dosage Accumulation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card Total Geral */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <h3 className="text-[11px] font-black uppercase tracking-wider text-indigo-200">Total Geral Aplicado</h3>
            </div>
            <p className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {grandTotalAppliedMg.toFixed(1).replace(".", ",")} mg
            </p>
            <p className="text-xs text-indigo-200 font-semibold">
              {grandTotalCompletedCount} {grandTotalCompletedCount === 1 ? "aplicação realizada" : "aplicações realizadas"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-300 flex items-center justify-center backdrop-blur-md z-10 shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Dynamic Cards per Medication */}
        {Object.entries(medStatsMap).map(([medName, stats]) => {
          const lower = medName.toLowerCase();
          const isTirz = lower.includes("tirzepatida");
          const isReta = lower.includes("retatrutida");
          const isOzempic = lower.includes("ozempic") || lower.includes("semaglutida");
          const isMounjaro = lower.includes("mounjaro");

          const borderBg = isTirz ? "bg-blue-600" : isReta ? "bg-emerald-600" : isOzempic ? "bg-purple-600" : isMounjaro ? "bg-amber-600" : "bg-indigo-600";
          const iconBg = isTirz ? "bg-blue-50 text-blue-600" : isReta ? "bg-emerald-50 text-emerald-600" : isOzempic ? "bg-purple-50 text-purple-600" : isMounjaro ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600";

          return (
            <div key={medName} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex items-center justify-between relative overflow-hidden">
              <div className={`absolute right-0 top-0 bottom-0 w-2 ${borderBg}`}></div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${borderBg}`}></span>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 truncate max-w-[170px]" title={medName}>
                    {medName} (Total)
                  </h3>
                </div>
                <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {stats.totalAppliedMg.toFixed(1).replace(".", ",")} mg
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  {stats.completedCount} de {stats.totalCount} {stats.completedCount === 1 ? "aplicação realizada" : "aplicações realizadas"}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-inner shrink-0`}>
                <Award className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por data, área ou remédio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Medication Filter & Restore button */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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

          {availableMedications.map((med) => {
            const isSelected = filterMed.toLowerCase() === med.toLowerCase();
            return (
              <button
                key={med}
                type="button"
                onClick={() => setFilterMed(med.toLowerCase())}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {med}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleRestoreDefaultSchedule}
            title="Restaurar Cronograma Padrão"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-xs ml-auto sm:ml-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schedule Lists Grouped by Month */}
      <div className="space-y-6">
        {Object.keys(groupedData).length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs font-medium border border-slate-200 shadow-sm">
            Nenhuma aplicação encontrada. Clique em "Nova Aplicação" para cadastrar.
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
                  const itemDosage = getItemDosageNumber(item.originalIndex);
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
                      <div className="flex items-start md:items-center gap-4 w-full md:w-auto flex-1">
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

                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                              {item.dateStr}
                            </span>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {item.dayOfWeek}
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
                              <strong className="text-slate-500 font-medium">Macro:</strong> {item.mainArea}
                            </span>
                            <span className="text-slate-400 hidden sm:inline">•</span>
                            <span className="text-slate-600 font-medium">
                              <strong className="text-slate-400 font-medium">Micro:</strong> {item.microArea}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls: Edit & Status pill */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item.originalIndex)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-indigo-100"
                          title="Editar informações desta aplicação"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl ${
                          isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {isCompleted ? `Aplicada` : "Pendente"}
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

      {/* MODAL PARA EDITAR OU ADICIONAR APLICAÇÃO */}
      <AnimatePresence>
        {(editingIndex !== null || isNewApplication) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingIndex(null);
                setIsNewApplication(false);
              }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-xl w-full relative z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                      {isNewApplication ? "Cadastrar Nova Aplicação" : "Editar Dados da Aplicação"}
                    </h3>
                    <p className="text-[10px] text-indigo-500 uppercase font-black tracking-widest mt-0.5">
                      Atualize data, mg, regiões de aplicação e dia da semana
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setIsNewApplication(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* Data & Dia da semana */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Data da Aplicação (Busca dia automático)
                    </label>
                    <input
                      type="date"
                      value={editForm.isoDate}
                      onChange={(e) => handleDateInputChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Data Formatada: <strong className="text-slate-700">{editForm.dateStr}</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Dia da Semana (Preenchido Automático)
                    </label>
                    <input
                      type="text"
                      value={editForm.dayOfWeek}
                      onChange={(e) => setEditForm({ ...editForm, dayOfWeek: e.target.value })}
                      placeholder="Ex: Terça-feira"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-indigo-700 outline-none focus:border-indigo-500"
                    />
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Atualizado conforme a data
                    </span>
                  </div>
                </div>

                {/* Medicamento & Dose (mg) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Medicamento
                    </label>
                    <select
                      value={["Tirzepatida", "Retatrutida", "Ozempic", "Mounjaro"].includes(editForm.medication) ? editForm.medication : "Outro"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Outro") {
                          setEditForm({ ...editForm, medication: "Outro" });
                        } else {
                          setEditForm({ ...editForm, medication: val });
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                    >
                      <option value="Tirzepatida">Tirzepatida</option>
                      <option value="Retatrutida">Retatrutida</option>
                      <option value="Ozempic">Ozempic / Semaglutida</option>
                      <option value="Mounjaro">Mounjaro</option>
                      <option value="Outro">Outro Medicamento...</option>
                    </select>

                    {(!["Tirzepatida", "Retatrutida", "Ozempic", "Mounjaro"].includes(editForm.medication) || editForm.medication === "Outro") && (
                      <div className="mt-2">
                        <label className="block text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Pencil className="w-3 h-3" /> Digite o Nome do Medicamento:
                        </label>
                        <input
                          type="text"
                          value={editForm.medication === "Outro" ? "" : editForm.medication}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditForm({ ...editForm, medication: val === "" ? "Outro" : val });
                          }}
                          placeholder="Ex: Saxenda, Victoza, Wegovy..."
                          className="w-full bg-indigo-50/60 border border-indigo-300 rounded-xl p-2.5 text-xs font-bold text-indigo-950 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Dose (mg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.dosageMg ?? 2.5}
                      onChange={(e) => setEditForm({ ...editForm, dosageMg: parseFloat(e.target.value) || 0 })}
                      placeholder="Ex: 2.5 ou 1.0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Seção de Periodicidade e Gerador de Lista de Aplicações */}
                <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3.5 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                      Periodicidade & Cronograma em Lote
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Campo Periodicidade */}
                    <div>
                      <label className="block text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-1">
                        Periodicidade (Intervalo em Dias)
                      </label>
                      <select
                        value={isCustomPeriodicity ? "custom" : periodicityDays}
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            setIsCustomPeriodicity(true);
                          } else {
                            setIsCustomPeriodicity(false);
                            setPeriodicityDays(Number(e.target.value));
                          }
                        }}
                        className="w-full bg-white border border-indigo-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 shadow-sm"
                      >
                        <option value={7}>A cada 7 dias (Semanal - Padrão)</option>
                        <option value={3}>A cada 3 dias</option>
                        <option value={4}>A cada 4 dias</option>
                        <option value={5}>A cada 5 dias</option>
                        <option value={14}>A cada 14 dias (Quinzenal)</option>
                        <option value={30}>A cada 30 dias (Mensal)</option>
                        <option value="custom">Outro intervalo personalizado...</option>
                      </select>

                      {isCustomPeriodicity && (
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={periodicityDays}
                          onChange={(e) => setPeriodicityDays(Math.max(1, parseInt(e.target.value) || 1))}
                          placeholder="Digite o número de dias..."
                          className="w-full mt-2 bg-white border border-indigo-300 rounded-xl p-2 text-xs font-bold text-indigo-900 outline-none focus:border-indigo-600 shadow-inner"
                        />
                      )}
                    </div>

                    {/* Campo Quantidade de Aplicações */}
                    <div>
                      <label className="block text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-1">
                        Qtd. de Aplicações a Gerar
                      </label>
                      <select
                        value={isCustomRepeatCount ? "custom" : repeatCount}
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            setIsCustomRepeatCount(true);
                          } else {
                            setIsCustomRepeatCount(false);
                            setRepeatCount(Number(e.target.value));
                          }
                        }}
                        className="w-full bg-white border border-indigo-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 shadow-sm"
                      >
                        <option value={1}>1 Aplicação (Apenas esta data)</option>
                        <option value={4}>4 Aplicações (1 Mês)</option>
                        <option value={8}>8 Aplicações (2 Meses)</option>
                        <option value={12}>12 Aplicações (3 Meses)</option>
                        <option value={24}>24 Aplicações (6 Meses)</option>
                        <option value="custom">Outra quantidade...</option>
                      </select>

                      {isCustomRepeatCount && (
                        <input
                          type="number"
                          min={1}
                          max={52}
                          value={repeatCount}
                          onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))}
                          placeholder="Digite a quantidade..."
                          className="w-full mt-2 bg-white border border-indigo-300 rounded-xl p-2 text-xs font-bold text-indigo-900 outline-none focus:border-indigo-600 shadow-inner"
                        />
                      )}
                    </div>
                  </div>

                  {/* Rotação e Preview */}
                  {repeatCount > 1 && (
                    <div className="pt-2 border-t border-indigo-100/80 space-y-2">
                      <label className="flex items-center gap-2 text-xs text-indigo-950 font-semibold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoRotateAreas}
                          onChange={(e) => setAutoRotateAreas(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <span>Rotacionar locais de aplicação automaticamente (Abdômen, Braço, Coxa)</span>
                      </label>

                      {/* Preview das primeiras datas geradas */}
                      {editForm.isoDate && (
                        <div className="bg-white/90 rounded-xl p-2 border border-indigo-100 text-[10px] text-indigo-950">
                          <span className="font-bold block mb-1">Preview das primeiras datas a serem geradas:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(() => {
                              const items = [];
                              const [y, m, d] = editForm.isoDate.split("-").map(Number);
                              for (let i = 0; i < Math.min(repeatCount, 4); i++) {
                                const cur = new Date(y, m - 1, d + i * periodicityDays);
                                const dy = String(cur.getDate()).padStart(2, "0");
                                const mo = String(cur.getMonth() + 1).padStart(2, "0");
                                const yr = cur.getFullYear();
                                const dayName = getDiaDaSemanaFromIso(`${yr}-${mo}-${dy}`);
                                items.push(
                                  <span key={i} className="bg-indigo-100/70 text-indigo-800 px-2 py-0.5 rounded-md font-bold">
                                    #{i + 1}: {dy}/{mo}/{yr} ({dayName})
                                  </span>
                                );
                              }
                              if (repeatCount > 4) {
                                items.push(
                                  <span key="more" className="text-slate-500 self-center font-bold">
                                    ... +{repeatCount - 4} mais
                                  </span>
                                );
                              }
                              return items;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Macro Região */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Macro Região (Área Principal)
                  </label>
                  <input
                    type="text"
                    value={editForm.mainArea}
                    onChange={(e) => setEditForm({ ...editForm, mainArea: e.target.value })}
                    placeholder="Ex: Abdômen Esquerdo, Braço Direito, Coxa Esquerda"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {["Abdômen Esquerdo", "Abdômen Direito", "Braço Esquerdo", "Braço Direito", "Coxa Esquerda", "Coxa Direita"].map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, mainArea: area })}
                        className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer"
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Micro Região */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Micro Região (Localização Detalhada da Aplicação)
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.microArea}
                    onChange={(e) => setEditForm({ ...editForm, microArea: e.target.value })}
                    placeholder="Ex: Lado esquerdo do umbigo, parte superior / Terço superior da coxa..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-medium outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Grupo de Mês / Período */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Grupo de Mês / Categoria
                  </label>
                  <input
                    type="text"
                    value={editForm.monthGroup}
                    onChange={(e) => setEditForm({ ...editForm, monthGroup: e.target.value })}
                    placeholder="Ex: 📅 MÊS 1: JULHO/AGOSTO 2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 shrink-0">
                {!isNewApplication && editingIndex !== null ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteApplication(editingIndex)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIndex(null);
                      setIsNewApplication(false);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditModal}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Dados</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

