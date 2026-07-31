export interface AppConfig {
  pesoInicial: number;
  metaPerda: number;
  dataInicio: string;
  foto?: string; // Base64 profile photo
  nome?: string; // Full Name
  sexo?: string; // Sex
  idade?: number; // Age
  altura?: number; // Height (m or cm)
  pesoAtual?: number; // Current weight (kg)
  medidaCintura?: number; // Waist (cm)
  medidaQuadril?: number; // Hip (cm)
  objetivo?: string; // Main goal
  observacoes?: string; // Notes / restrictions
}

export interface MedidasCorporais {
  cintura?: number; // cm
  quadril?: number; // cm
  braco?: number;   // cm
  coxa?: number;    // cm
  peito?: number;   // cm
}

export interface Registro {
  id: string;
  data: string; // YYYY-MM-DD
  peso: number;
  fome: number; // 0-10
  glicemia?: number; // Diabetes / Glicemia (mg/dL)
  obs: string;
  foto?: string; // Base64 encoded string of user uploaded photo
  fotos?: string[]; // Array of Base64 encoded strings
  medidas?: MedidasCorporais;
}

export interface MedicamentoItem {
  id: string;
  nome: string;
  marca: string;
  valor: number;
  frete: number;
  ondeComprou: string;
  contato: string;
  mg: string;
  obs: string;
  dataCompra?: string;
  imagem?: string;
}

export interface MusculacaoItem {
  id: string;
  vezesPorSemana: number;
  aparelho: string;
  exercicio: string;
  local: "Academia" | "Em Casa";
  pesoKg: number;
  obs?: string;
  dataRegistro?: string;
}

export interface CardioItem {
  id: string;
  vezesPorSemana: number;
  tipoExercicio: string;
  duracaoMinutos: number;
  intensidade?: "Leve" | "Moderada" | "Intensa";
  obs?: string;
  dataRegistro?: string;
}

export interface AppData {
  config: AppConfig;
  registros: Registro[];
  medicamentos?: MedicamentoItem[];
  musculacao?: MusculacaoItem[];
  cardio?: CardioItem[];
}

