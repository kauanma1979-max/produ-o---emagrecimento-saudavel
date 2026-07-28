import { useState, useEffect } from "react";
import { 
  Apple, 
  Calendar, 
  Zap, 
  Award, 
  Activity, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  Info, 
  Flame, 
  Utensils, 
  Coffee, 
  Scale, 
  TrendingUp, 
  ChevronRight,
  Smile,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Refeicao {
  nome: string;
  horario: string;
  alimentos: string;
  proteina: number;
  carbos?: number;
  gorduras?: number;
  contemWhey: boolean;
  receitaNome?: string;
  receitaModo?: string;
}

interface DiaPlano {
  dia: string;
  sigla: string;
  tipoTreino: string;
  isTreino: boolean;
  totalKcal: number;
  totalProteina: number;
  totalCarbo: number;
  totalGordura: number;
  refeicoes: Refeicao[];
  ingredientesUnicos: string[];
}

export default function PlanoNutricional() {
  const [selectedDiaIdx, setSelectedDiaIdx] = useState<number>(0);
  const [checkedRefeicoes, setCheckedRefeicoes] = useState<Record<string, boolean>>({});
  const [showIngredientsModal, setShowIngredientsModal] = useState<boolean>(false);

  // Get current day of the week to pre-select
  useEffect(() => {
    const today = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    // Map JS Sunday(0) to our Sunday(6), Monday(1) to Monday(0)...
    const mappedIdx = today === 0 ? 6 : today - 1;
    setSelectedDiaIdx(mappedIdx);
  }, []);

  // 4 main Whey Recipes for quick access and strategic use
  const receitasWhey = [
    {
      id: "rec-3",
      titulo: "Shake Pós-Treino (Hipertrófico)",
      tempo: "2 min",
      proteina: "45g",
      kcal: "390",
      ingredientes: ["30g Whey Protein", "1 Banana de tamanho médio", "1 colher de sopa de Pasta de Amendoim", "200ml de Leite Desnatado (ou água)"],
      modo: "Bata tudo no liquidificador ou mixer até obter consistência cremosa. Ideal para consumir logo após o treino devido à alta absorção e reposição rápida.",
      relevancia: "Obrigatório nos dias de treino (Seg e Qui) no lanche da tarde."
    },
    {
      id: "rec-4",
      titulo: "Shake Leve Antienjoo (Dias de Náusea)",
      tempo: "1 min",
      proteina: "30g",
      kcal: "210",
      ingredientes: ["30g Whey Protein (baunilha ou coco)", "200ml de Água de Coco gelada", "1 fatia média de Melão picado"],
      modo: "Misture ou agite bem. O melão e a água de coco dão frescor absoluto, hidratam e diminuem a sensação de estômago cheio ou enjoado.",
      relevancia: "Perfeito para substituir refeições sólidas quando estiver com pouco apetite."
    },
    {
      id: "rec-1",
      titulo: "Panquecas Proteicas Fit",
      tempo: "8 min",
      proteina: "35g",
      kcal: "310",
      ingredientes: ["1 scoop (~30g) Whey Protein", "2 Claras de ovo + 1 Ovo inteiro", "30g de Aveia em flocos finos", "1 colher de chá de adoçante culinário"],
      modo: "Misture bem os ingredientes. Despeje em uma frigideira antiaderente pré-aquecida e vire dos dois lados. Adicione 1 colher de geleia sem açúcar no topo.",
      relevancia: "Excelente opção de café da manhã para Terça e Sábado."
    },
    {
      id: "rec-yogurt",
      titulo: "Iogurte Turbinado (Bomba Proteica)",
      tempo: "1 min",
      proteina: "40g",
      kcal: "240",
      ingredientes: ["200g de Iogurte Grego 0% gordura", "30g (~1 scoop) Whey Protein", "50g de Frutas vermelhas (morangos, mirtilos)", "15g de Granola sem açúcar"],
      modo: "Misture vigorosamente o Whey diretamente no iogurte até homogeneizar (fica com consistência de mousse). Jogue as frutas e a granola por cima.",
      relevancia: "Bomba rápida de proteína para iniciar o dia focado no Café da Manhã."
    }
  ];

  // Full Weekly Meal Data based on André's customized plan
  const planoSemanal: DiaPlano[] = [
    {
      dia: "Segunda-feira",
      sigla: "SEG",
      tipoTreino: "TREINO A",
      isTreino: true,
      totalKcal: 2380,
      totalProteina: 217,
      totalCarbo: 158,
      totalGordura: 57,
      ingredientesUnicos: [
        "Iogurte Grego 0% gordura (400g)",
        "Whey Protein (~60g / 2 scoops)",
        "Frutas Vermelhas (50g)",
        "Granola sem açúcar (15g)",
        "Pão integral (3 fatias)",
        "Peito de Peru (100g)",
        "Queijo Minas Padrão (1 fatia)",
        "Peito de Frango Grelhado (200g)",
        "Arroz Integral (180g)",
        "Feijão cozido (1 concha)",
        "Brócolis cozido",
        "Banana de tamanho médio (2 unidades)",
        "Pasta de Amendoim (1 colher de sopa)",
        "Leite Desnatado (200ml)",
        "Ovos de galinha (3 unidades)",
        "Abacate maduro (1/2 unidade)",
        "Caseína de lenta absorção (opcional para a ceia)"
      ],
      refeicoes: [
        {
          nome: "Café da Manhã",
          horario: "07:30",
          alimentos: "200g Iogurte Grego 0% + 30g Whey + 50g Frutas Vermelhas + 15g Granola",
          proteina: 40,
          carbos: 30,
          gorduras: 5,
          contemWhey: true,
          receitaNome: "Iogurte Turbinado",
          receitaModo: "Misture o Whey direto no iogurte até virar um creme, salpique as frutas e a granola."
        },
        {
          nome: "Lanche da Manhã",
          horario: "10:00",
          alimentos: "2 fatias pão integral + 100g Peito de Peru + 1 fatia Queijo Minas Padrão",
          proteina: 32,
          carbos: 25,
          gorduras: 8,
          contemWhey: false
        },
        {
          nome: "Almoço",
          horario: "12:00",
          alimentos: "200g Peito de Frango Grelhado + 180g Arroz Integral + 1 concha de Feijão + Brócolis cozido",
          proteina: 55,
          carbos: 45,
          gorduras: 12,
          contemWhey: false
        },
        {
          nome: "Lanche da Tarde (Pré/Pós-Treino)",
          horario: "15:30",
          alimentos: "Shake Pós-Treino (Receita 3): 30g Whey + 1 banana + 1 col. Pasta Amendoim + 200ml leite desnatado",
          proteina: 32,
          carbos: 30,
          gorduras: 10,
          contemWhey: true,
          receitaNome: "Shake Pós-Treino (Receita 3)",
          receitaModo: "Bata o whey, a banana picada, a pasta de amendoim e o leite no liquidificador."
        },
        {
          nome: "Jantar",
          horario: "19:00",
          alimentos: "3 Ovos Mexidos + 1 fatia pão integral + 1/2 abacate maduro",
          proteina: 28,
          carbos: 20,
          gorduras: 22,
          contemWhey: false
        },
        {
          nome: "Ceia",
          horario: "21:30",
          alimentos: "200g Iogurte Grego 0% (ou 1 scoop Caseína lenta absorção)",
          proteina: 20,
          carbos: 8,
          gorduras: 0,
          contemWhey: true,
          receitaNome: "Mousse Noturno de Caseína/Whey",
          receitaModo: "Misture bem with 50ml de água para formar uma pasta consistente e coma de colher."
        }
      ]
    },
    {
      dia: "Terça-feira",
      sigla: "TER",
      tipoTreino: "DESCANSO / CARDIO LEVE",
      isTreino: false,
      totalKcal: 2150,
      totalProteina: 213,
      totalCarbo: 130,
      totalGordura: 48,
      ingredientesUnicos: [
        "Whey Protein (~45g / 1.5 scoop)",
        "Claras de ovo (2 unidades)",
        "Ovos inteiros (3 unidades)",
        "Aveia em flocos finos (30g)",
        "Geleia sem açúcar (1 colher de sopa)",
        "Leite Desnatado (200ml)",
        "Frango cozido desfiado (para a sopa cremosa)",
        "Patinho moído ou grelhado (180g)",
        "Arroz Integral cozido (330g)",
        "Lentilha cozida (100g)",
        "Salada de folhas verdes à vontade",
        "Queijo Cottage (200g)",
        "Maçã fresca (1 unidade)",
        "Pasta de Amendoim (1 colher de sopa)",
        "Legumes e temperos para Sopa Cremosa"
      ],
      refeicoes: [
        {
          nome: "Café da Manhã",
          horario: "07:30",
          alimentos: "Panquecas Proteicas (Receita 1) + 1 col. geleia sem açúcar",
          proteina: 35,
          carbos: 22,
          gorduras: 6,
          contemWhey: true,
          receitaNome: "Panquecas Proteicas (Receita 1)",
          receitaModo: "Bata 1 scoop de whey, aveia e os ovos. Doure os dois lados em frigideira antiaderente."
        },
        {
          nome: "Lanche da Manhã",
          horario: "10:00",
          alimentos: "Leite Proteico de Emergência: 200ml Leite Desnatado + 1/2 scoop Whey",
          proteina: 15,
          carbos: 10,
          gorduras: 1,
          contemWhey: true,
          receitaNome: "Leite Proteico",
          receitaModo: "Dilua o whey no leite desnatado gelado."
        },
        {
          nome: "Almoço",
          horario: "12:00",
          alimentos: "Sopa Cremosa de Frango (Receita 2) + 180g Arroz Integral cozido",
          proteina: 55,
          carbos: 42,
          gorduras: 10,
          contemWhey: false
        },
        {
          nome: "Lanche da Tarde",
          horario: "15:30",
          alimentos: "1 fruta (maçã) + 1 col. Pasta de Amendoim + 1 ovo cozido",
          proteina: 15,
          carbos: 18,
          gorduras: 10,
          contemWhey: false
        },
        {
          nome: "Jantar",
          horario: "19:00",
          alimentos: "180g Patinho Grelhado + 150g Arroz Integral + 100g Lentilha cozida + Salada livre",
          proteina: 75,
          carbos: 40,
          gorduras: 15,
          contemWhey: false
        },
        {
          nome: "Ceia",
          horario: "21:30",
          alimentos: "1 pote Queijo Cottage (200g) com ervas finas",
          proteina: 18,
          carbos: 6,
          gorduras: 4,
          contemWhey: false
        }
      ]
    },
    {
      dia: "Quarta-feira",
      sigla: "QUA",
      tipoTreino: "DESCANSO COMPLETO",
      isTreino: false,
      totalKcal: 1980,
      totalProteina: 166,
      totalCarbo: 120,
      totalGordura: 45,
      ingredientesUnicos: [
        "Whey Protein sabor Chocolate (30g / 1 scoop)",
        "Pasta de Amendoim (1 colher de sopa)",
        "Cacau em pó 100% (1 colher de sopa)",
        "Goma de Tapioca",
        "Atum em água (100g)",
        "Queijo Minas Magro (1 fatia)",
        "Filé de Tilápia Grelhada (150g)",
        "Batata-Doce cozida (1 batata média)",
        "Salada de folhas verdes",
        "Azeite de oliva extra virgem",
        "Iogurte Grego 0% (200g)",
        "Granola Integral (15g)",
        "Claras de ovo (4 unidades)",
        "Ovos inteiros (1 unidade)",
        "Peito de Frango Desfiado (100g)",
        "Leite Desnatado (200ml)",
        "Caseína de lenta absorção (1/2 scoop)"
      ],
      refeicoes: [
        {
          nome: "Café da Manhã",
          horario: "07:30",
          alimentos: "Shake de Chocolate: 300ml água + 1 scoop Whey Choc + 1 col. Pasta Amendoim + 1 col. cacau em pó 100%",
          proteina: 30,
          carbos: 12,
          gorduras: 10,
          contemWhey: true,
          receitaNome: "Shake de Chocolate",
          receitaModo: "Bata bem todos os ingredientes no liquidificador com pedras de gelo."
        },
        {
          nome: "Lanche da Manhã",
          horario: "10:00",
          alimentos: "2 Tapiocas + 100g Atum (em água) + 1 fatia Queijo Minas Magro",
          proteina: 30,
          carbos: 35,
          gorduras: 8,
          contemWhey: false
        },
        {
          nome: "Almoço",
          horario: "12:00",
          alimentos: "150g Tilápia Grelhada + 1 batata doce média cozida + Salada de folhas verdes com azeite",
          proteina: 32,
          carbos: 28,
          gorduras: 7,
          contemWhey: false
        },
        {
          nome: "Lanche da Tarde",
          horario: "15:30",
          alimentos: "1 pote Iogurte Grego 0% (200g) + 15g Granola integral",
          proteina: 20,
          carbos: 15,
          gorduras: 2,
          contemWhey: false
        },
        {
          nome: "Jantar",
          horario: "19:00",
          alimentos: "Omelete de Claras (4 claras + 1 gema) recheado com 100g frango desfiado temperado",
          proteina: 38,
          carbos: 5,
          gorduras: 8,
          contemWhey: false
        },
        {
          nome: "Ceia",
          horario: "21:30",
          alimentos: "200ml Leite desnatado + 1/2 scoop Caseína",
          proteina: 16,
          carbos: 10,
          gorduras: 0,
          contemWhey: true,
          receitaNome: "Bebida Noturna Conforto",
          receitaModo: "Misture bem e tome morno se preferir para acalmar o sono."
        }
      ]
    },
    {
      dia: "Quinta-feira",
      sigla: "QUI",
      tipoTreino: "TREINO B",
      isTreino: true,
      totalKcal: 2390,
      totalProteina: 219,
      totalCarbo: 162,
      totalGordura: 60,
      ingredientesUnicos: [
        "Iogurte Grego 0% gordura (200g)",
        "Whey Protein (~60g / 2 scoops)",
        "Banana pequena/média (2 unidades)",
        "Pão Integral (2 fatias)",
        "Peito de Peru (100g)",
        "Queijo Minas (1 fatia)",
        "Patinho Moído (200g)",
        "Arroz Integral cozido (180g)",
        "Vegetais variados cozidos",
        "Pasta de Amendoim (1 colher de sopa)",
        "Leite Desnatado (200ml)",
        "Filé de Salmão Grelhado (150g)",
        "Abacate maduro (1/2 unidade)",
        "Aspargos frescos ou vagem",
        "Caseína de lenta absorção (30g / 1 scoop)"
      ],
      refeicoes: [
        {
          nome: "Café da Manhã",
          horario: "07:30",
          alimentos: "200g Iogurte Grego 0% + 30g Whey + 1 banana pequena picada",
          proteina: 38,
          carbos: 25,
          gorduras: 3,
          contemWhey: true,
          receitaNome: "Mousse de Whey com Iogurte",
          receitaModo: "Misture o iogurte grego e o whey até homogeneizar, adicione as rodelas de banana."
        },
        {
          nome: "Lanche da Manhã",
          horario: "10:00",
          alimentos: "2 fatias pão integral + 100g Peito de Peru + 1 fatia Queijo Minas",
          proteina: 32,
          carbos: 24,
          gorduras: 8,
          contemWhey: false
        },
        {
          nome: "Almoço",
          horario: "12:00",
          alimentos: "200g Patinho Moído (refogado ou formato de hambúrguer caseiro) + 180g Arroz integral + vegetais variados",
          proteina: 62,
          carbos: 44,
          gorduras: 16,
          contemWhey: false
        },
        {
          nome: "Lanche da Tarde (Pré/Pós-Treino)",
          horario: "15:30",
          alimentos: "Shake Pós-Treino (Receita 3): 30g Whey + 1 banana + 1 col. Pasta Amendoim + 200ml leite desnatado",
          proteina: 32,
          carbos: 30,
          gorduras: 10,
          contemWhey: true,
          receitaNome: "Shake Pós-Treino (Receita 3)",
          receitaModo: "Bata o whey, leite, banana e pasta de amendoim. Rápido e prático para o anabolismo."
        },
        {
          nome: "Jantar",
          horario: "19:00",
          alimentos: "150g Salmão Grelhado + 1/2 abacate picado + Aspargos ou vagem na chapa",
          proteina: 30,
          carbos: 10,
          gorduras: 23,
          contemWhey: false
        },
        {
          nome: "Ceia",
          horario: "21:30",
          alimentos: "1 scoop Caseína (ou Whey) misturado em 200ml água gelada",
          proteina: 25,
          carbos: 2,
          gorduras: 0,
          contemWhey: true,
          receitaNome: "Shake Noturno Puro",
          receitaModo: "Agite bem em uma coqueteleira e consuma para manter o fluxo de aminoácidos."
        }
      ]
    },
    {
      dia: "Sexta-feira",
      sigla: "SEX",
      tipoTreino: "CARDIO / DESCANSO ATIVO",
      isTreino: false,
      totalKcal: 2200,
      totalProteina: 195,
      totalCarbo: 140,
      totalGordura: 52,
      ingredientesUnicos: [
        "Ovos de galinha (4 unidades)",
        "Queijo Cottage (150g)",
        "Leite Desnatado (450ml total)",
        "Whey Protein (15g / 1/2 scoop)",
        "Frango cozido e vegetais para Sopa Cremosa",
        "Pão Integral (1 fatia)",
        "Pera fresca (1 unidade)",
        "Queijo Minas Frescal (30g)",
        "Peito de Frango Grelhado (200g)",
        "Macarrão Integral (100g)",
        "Tomates frescos para molho caseiro",
        "Iogurte Grego 0% gordura (200g)"
      ],
      refeicoes: [
        {
          nome: "Café da Manhã",
          horario: "07:30",
          alimentos: "4 Ovos Mexidos + 150g Queijo Cottage + 250ml Leite Desnatado",
          proteina: 53,
          carbos: 15,
          gorduras: 18,
          contemWhey: false
        },
        {
          nome: "Lanche da Manhã",
          horario: "10:00",
          alimentos: "Leite Proteico: 200ml Leite Desnatado + 1/2 scoop Whey",
          proteina: 15,
          carbos: 10,
          gorduras: 1,
          contemWhey: true,
          receitaNome: "Leite Proteico",
          receitaModo: "Adicione o whey ao leite bem gelado e misture para obter sabor agradável."
        },
        {
          nome: "Almoço",
          horario: "12:00",
          alimentos: "Sopa Cremosa de Frango (Receita 2) + 1 fatia pão integral tostada",
          proteina: 42,
          carbos: 25,
          gorduras: 8,
          contemWhey: false
        },
        {
          nome: "Lanche da Tarde",
          horario: "15:30",
          alimentos: "1 fruta fresca (pera) + 30g queijo minas frescal",
          proteina: 10,
          carbos: 18,
          gorduras: 6,
          contemWhey: false
        },
        {
          nome: "Jantar",
          horario: "19:00",
          alimentos: "200g Peito de Frango Grelhado + 100g Macarrão Integral cozido + Molho caseiro de tomate fresco",
          proteina: 55,
          carbos: 45,
          gorduras: 8,
          contemWhey: false
        },
        {
          nome: "Ceia",
          horario: "21:30",
          alimentos: "1 pote de 200g Iogurte Grego 0% gordura",
          proteina: 20,
          carbos: 7,
          gorduras: 0,
          contemWhey: false
        }
      ]
    },
    {
      dia: "Sábado",
      sigla: "SÁB",
      tipoTreino: "DESCANSO ATIVO / RECARGA",
      isTreino: false,
      totalKcal: 2310,
      totalProteina: 208,
      totalCarbo: 170,
      totalGordura: 55,
      ingredientesUnicos: [
        "Whey Protein (~60g / 2 scoops)",
        "Claras de ovo (2 unidades)",
        "Ovos inteiros (1 unidade)",
        "Aveia em flocos finos (30g)",
        "Geleia de morango sem açúcar (1 colher de sopa)",
        "Goma de Tapioca",
        "Peito de Frango (250g total - desfiado e grelhado)",
        "Queijo Minas (1 fatia)",
        "Arroz Japonês ou integral (150g)",
        "Manga madura em cubos",
        "Pepino",
        "Sementes de gergelim",
        "Água de Coco gelada (200ml)",
        "Melão fresco (1 fatia média)",
        "Filé de Tilápia Grelhada (180g)",
        "Batata-doce cozida (150g)",
        "Brócolis no vapor",
        "Caseína de lenta absorção (1 scoop / 30g)"
      ],
      refeicoes: [
        {
          nome: "Café da Manhã",
          horario: "07:30",
          alimentos: "Panquecas Proteicas (Receita 1) + 1 col. geleia de morango sem açúcar",
          proteina: 35,
          carbos: 25,
          gorduras: 6,
          contemWhey: true,
          receitaNome: "Panquecas Proteicas",
          receitaModo: "Misture 1 scoop de whey, clara, aveia e asse em frigideira untada."
        },
        {
          nome: "Lanche da Manhã",
          horario: "10:00",
          alimentos: "2 Tapiocas recheadas com 100g Peito de frango desfiado + 1 fatia queijo minas",
          proteina: 40,
          carbos: 35,
          gorduras: 9,
          contemWhey: false
        },
        {
          nome: "Almoço",
          horario: "12:00",
          alimentos: "Poke Bowl de Frango Grelhado: 150g frango + 150g arroz japonês (ou integral) + manga + pepino + gergelim",
          proteina: 45,
          carbos: 48,
          gorduras: 8,
          contemWhey: false
        },
        {
          nome: "Lanche da Tarde",
          horario: "15:30",
          alimentos: "Shake para dias de náusea/enjoo (Receita 4): 30g Whey + 200ml água de coco gelada + melão",
          proteina: 30,
          carbos: 25,
          gorduras: 2,
          contemWhey: true,
          receitaNome: "Shake Antienjoo (Melão e Coco)",
          receitaModo: "Bata o whey com melão e água de coco gelada. Super fresco para o estômago."
        },
        {
          nome: "Jantar",
          horario: "19:00",
          alimentos: "180g Tilápia Grelhada + Batata-doce cozida (150g) + Brócolis no vapor",
          proteina: 33,
          carbos: 32,
          gorduras: 5,
          contemWhey: false
        },
        {
          nome: "Ceia",
          horario: "21:30",
          alimentos: "1 scoop Caseína lenta absorção (ou Whey) misturado em água gelada",
          proteina: 25,
          carbos: 2,
          gorduras: 0,
          contemWhey: true,
          receitaNome: "Batido Puro Proteico",
          receitaModo: "Simples, rápido e anti-catabólico para dormir em paz."
        }
      ]
    },
    {
      dia: "Domingo",
      sigla: "DOM",
      tipoTreino: "DESCANSO TOTAL",
      isTreino: false,
      totalKcal: 1950,
      totalProteina: 176,
      totalCarbo: 130,
      totalGordura: 42,
      ingredientesUnicos: [
        "Whey Protein sabor Chocolate (30g / 1 scoop)",
        "Pasta de Amendoim pura (2 colheres de sopa)",
        "Iogurte Grego 0% gordura (200g)",
        "Granola zero açúcar (15g)",
        "Peito de Frango Grelhado (200g)",
        "Arroz Integral cozido (180g)",
        "Lentilha cozida bem temperada (100g)",
        "Salada de folhas verdes frescas",
        "Ovos de galinha (4 unidades)",
        "Fruta fresca / Laranja (1 unidade)",
        "Manteiga Ghee (pequena porção para fritar)",
        "Abacate maduro fatiado (1/2 unidade)",
        "Pão Integral (1 fatia)",
        "Queijo Cottage fresco (200g)",
        "Pimenta preta moida"
      ],
      refeicoes: [
        {
          nome: "Café da Manhã",
          horario: "07:30",
          alimentos: "Shake de Chocolate Premium: 300ml água + 1 scoop Whey Choc + 1 col. Pasta Amendoim",
          proteina: 30,
          carbos: 10,
          gorduras: 10,
          contemWhey: true,
          receitaNome: "Shake de Chocolate",
          receitaModo: "Bata com bastante gelo para imitar um milkshake cremoso de chocolate."
        },
        {
          nome: "Lanche da Manhã",
          horario: "10:00",
          alimentos: "1 pote Iogurte Grego 0% (200g) + 15g Granola zero açúcar",
          proteina: 20,
          carbos: 15,
          gorduras: 2,
          contemWhey: false
        },
        {
          nome: "Almoço",
          horario: "12:00",
          alimentos: "200g Frango Grelhado na brasa + 180g Arroz Integral + 100g Lentilha bem temperada + Salada de folhas",
          proteina: 65,
          carbos: 42,
          gorduras: 8,
          contemWhey: false
        },
        {
          nome: "Lanche da Tarde",
          horario: "15:30",
          alimentos: "1 ovo cozido + 1 fruta fresca (laranja) + 1 col. pasta de amendoim pura",
          proteina: 15,
          carbos: 15,
          gorduras: 8,
          contemWhey: false
        },
        {
          nome: "Jantar",
          horario: "19:00",
          alimentos: "3 Ovos Mexidos na manteiga ghee + 1/2 abacate fatiado + 1 fatia pão integral",
          proteina: 28,
          carbos: 20,
          gorduras: 18,
          contemWhey: false
        },
        {
          nome: "Ceia",
          horario: "21:30",
          alimentos: "200g Queijo Cottage fresco com pitada de pimenta preta",
          proteina: 18,
          carbos: 6,
          gorduras: 4,
          contemWhey: false
        }
      ]
    }
  ];

  const currentDia = planoSemanal[selectedDiaIdx];

  // Helper to calculate check percentage
  const diaKey = currentDia.sigla;
  const mealsInDay = currentDia.refeicoes;
  const checkedCount = mealsInDay.filter((_, idx) => checkedRefeicoes[`${diaKey}-${idx}`]).length;
  const completionPercent = Math.round((checkedCount / mealsInDay.length) * 100);

  // Dynamic calculated nutrition progress based on checks
  const consumedProteina = mealsInDay.reduce((acc, ref, idx) => {
    return acc + (checkedRefeicoes[`${diaKey}-${idx}`] ? ref.proteina : 0);
  }, 0);

  const toggleMealCheck = (idx: number) => {
    const key = `${diaKey}-${idx}`;
    setCheckedRefeicoes((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Target & Objectives banner */}
      <div className="bg-slate-900 rounded-3xl text-white p-6 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Metas Nutritivas Diárias do André
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase">Plano Nutricional Semanal</h1>
            <p className="text-xs text-slate-400">Cardápio planejado estrategicamente para ganho de massa, saciedade e perda de gordura.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-center p-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Calorias</span>
              <span className="text-lg font-black text-emerald-400">~2.400 <span className="text-[9px] text-slate-500">kcal</span></span>
            </div>
            <div className="text-center p-2 border-l border-slate-800/80">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Proteína</span>
              <span className="text-lg font-black text-indigo-400">218<span className="text-[9px] text-slate-500">g</span></span>
            </div>
            <div className="text-center p-2 border-l border-slate-800/80">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Carbos</span>
              <span className="text-lg font-black text-amber-400">240<span className="text-[9px] text-slate-500">g</span></span>
            </div>
            <div className="text-center p-2 border-l border-slate-800/80">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Gorduras</span>
              <span className="text-lg font-black text-rose-400">67<span className="text-[9px] text-slate-500">g</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Days Selector Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1 flex-1">
          {planoSemanal.map((dia, idx) => (
            <button
              key={dia.dia}
              type="button"
              onClick={() => setSelectedDiaIdx(idx)}
              className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex-1 min-w-[70px] text-center ${
                selectedDiaIdx === idx
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <span className="block text-[10px]">{dia.sigla}</span>
              <span className="block text-[8px] font-bold text-slate-400 mt-0.5 group-hover:text-white">
                {dia.isTreino ? "Treino" : "Off"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTAINER: Split into Top Whey Strategy and Full Daily Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT & CENTER PANEL (Col span 2): meals list */}
        <div className="lg:col-span-2 space-y-6">

          {/* 2. CHRONOLOGICAL MEAL CHECKLIST */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Cardápio do Dia: {currentDia.dia}
                </h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <p className="text-xs text-slate-400">
                    Meta diária estimada: ~{currentDia.totalKcal} kcal • {currentDia.totalProteina}g Proteína
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowIngredientsModal(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-indigo-100 shrink-0"
                    id="view-ingredients-btn"
                  >
                    <Apple className="w-3.5 h-3.5" />
                    Ver Ingredientes
                  </button>
                </div>
              </div>

              {/* Progress and indicators */}
              <div className="flex items-center gap-4 bg-slate-50 py-2 px-4 rounded-xl border border-slate-100 shrink-0">
                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Refeições Feitas</span>
                  <span className="text-sm font-black text-slate-700">{checkedCount} de {mealsInDay.length}</span>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 flex items-center justify-center relative overflow-hidden shrink-0">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-indigo-500 transition-all duration-500" 
                    style={{ height: `${completionPercent}%` }} 
                  />
                  <span className="text-[10px] font-black relative text-slate-800 mix-blend-difference">
                    {completionPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Meals Timeline */}
            <div className="p-6 space-y-4">
              {mealsInDay.map((ref, idx) => {
                const isChecked = checkedRefeicoes[`${diaKey}-${idx}`];
                return (
                  <motion.div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col md:flex-row items-start justify-between gap-4 ${
                      isChecked
                        ? "bg-emerald-50/40 border-emerald-200/60 shadow-sm"
                        : ref.contemWhey
                        ? "bg-gradient-to-r from-indigo-50/30 to-transparent border-indigo-200 hover:border-indigo-400 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Checkbox button */}
                      <button
                        type="button"
                        onClick={() => toggleMealCheck(idx)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer shrink-0 mt-0.5 transition-all ${
                          isChecked
                            ? "bg-emerald-500 border-emerald-600 text-white"
                            : ref.contemWhey
                            ? "border-indigo-400 text-indigo-600 hover:bg-indigo-50"
                            : "border-slate-300 text-slate-500 hover:border-slate-400"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                            {ref.horario}
                          </span>
                          <h4 className={`text-xs font-black uppercase tracking-wider ${isChecked ? "text-slate-400 line-through" : "text-slate-700"}`}>
                            {ref.nome}
                          </h4>
                          {ref.contemWhey && (
                            <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded border border-amber-500/20">
                              <Zap className="w-2.5 h-2.5" />
                              Opção Whey Protein
                            </span>
                          )}
                        </div>

                        <p className={`text-xs font-semibold leading-relaxed ${isChecked ? "text-slate-400 line-through" : "text-slate-600"}`}>
                          {ref.alimentos}
                        </p>

                        {/* If has special recipe details, reveal it */}
                        {ref.receitaNome && (
                          <div className="mt-2 text-[11px] bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-slate-500 font-medium">
                            <strong className="text-slate-700 block text-[10px] uppercase font-bold mb-0.5">🍳 Como preparar:</strong>
                            {ref.receitaModo}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meal Macro Badge */}
                    <div className="flex items-center gap-3 self-stretch md:self-auto justify-end border-t border-slate-100 md:border-0 pt-2.5 md:pt-0 shrink-0">
                      <div className="text-center bg-slate-50 border border-slate-100 py-1.5 px-3 rounded-lg min-w-[70px]">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Proteína</span>
                        <span className="text-xs font-bold text-slate-700">{ref.proteina}g</span>
                      </div>
                      {ref.carbos !== undefined && (
                        <div className="text-center bg-slate-50 border border-slate-100 py-1.5 px-3 rounded-lg min-w-[55px]">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Carbos</span>
                          <span className="text-xs font-semibold text-slate-500">{ref.carbos}g</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (Col span 1): substitution guide & daily summaries */}
        <div className="space-y-6">

          {/* Dicas de Substituição e Trocas Inteligentes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Guia de Trocas Inteligentes
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Para não ficar enjoado e garantir a aderência, utilize o sistema de substituições com macros equivalentes:
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">🥩 Proteína Grelhada</span>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Troque 200g de Frango por <strong className="text-slate-700">180g de Patinho Grelhado</strong> ou <strong className="text-slate-700">180g de Filé de Tilápia</strong> ou <strong className="text-slate-700">4 Ovos Inteiros</strong>.
                </p>
              </div>

              <div className="space-y-1 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">🍚 Carboidratos Bons</span>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Troque 180g de Arroz Integral por <strong className="text-slate-700">150g de Batata-Doce cozida</strong>, <strong className="text-slate-700">120g de Macarrão Integral</strong> ou <strong className="text-slate-700">160g de Mandioca</strong>.
                </p>
              </div>

              <div className="space-y-1 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">🥑 Gorduras Boas</span>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Troque 1/2 Abacate por <strong className="text-slate-700">1.5 colheres de Pasta de Amendoim</strong> ou <strong className="text-slate-700">12g de Azeite de Oliva</strong> na salada.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2 text-[10px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                <strong>Regra de Ouro:</strong> O importante é bater a meta de <strong>218g de Proteína</strong> diária e manter o déficit calórico geral. O cardápio é flexível!
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Ingredients Modal */}
      <AnimatePresence>
        {showIngredientsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIngredientsModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              id="ingredients-modal-backdrop"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full relative z-10 max-h-[85vh] flex flex-col"
              id="ingredients-modal-content"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
                      Lista de Ingredientes
                    </h3>
                    <p className="text-[10px] text-indigo-500 uppercase font-black tracking-widest mt-0.5">
                      {currentDia.dia}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIngredientsModal(false)}
                  className="p-1.5 px-3 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-xs font-black uppercase tracking-wider"
                  id="close-ingredients-modal-btn"
                >
                  Fechar
                </button>
              </div>

              {/* Unique Ingredients List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Esta é a lista única consolidada de ingredientes para realizar as opções das refeições de <strong className="text-slate-700">{currentDia.dia}</strong>:
                </p>

                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
                  {currentDia.ingredientesUnicos && currentDia.ingredientesUnicos.length > 0 ? (
                    currentDia.ingredientesUnicos.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-1.5 first:pt-0 last:pb-0 border-b border-slate-100 last:border-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="text-xs text-slate-700 font-bold">{ing}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-4">Nenhum ingrediente configurado para hoje.</p>
                  )}
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-600 font-bold leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    Dica: Use esta lista unificada para separar ou comprar todos os itens do seu dia de forma rápida e organizada!
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
