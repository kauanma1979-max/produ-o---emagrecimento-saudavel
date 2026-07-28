export interface AppConfig {
  pesoInicial: number;
  metaPerda: number;
  dataInicio: string;
  foto?: string; // Base64 profile photo
  nome?: string; // Full Name
  sexo?: string; // Sex
  idade?: number; // Age
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

export interface AppData {
  config: AppConfig;
  registros: Registro[];
  medicamentos?: MedicamentoItem[];
}

