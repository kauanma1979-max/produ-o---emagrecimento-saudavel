import { useState, useMemo } from "react";
import { Calculator, Scale, Target, Sparkles, CheckCircle2, AlertCircle, Info, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface CalculoIMCProps {
  pesoInicialDefault?: number;
  onAplicarMeta?: (novaMetaPerda: number) => void;
  inModal?: boolean;
}

export default function CalculoIMC({
  pesoInicialDefault = 80,
  onAplicarMeta,
  inModal = false,
}: CalculoIMCProps) {
  const [pesoInput, setPesoInput] = useState<string>(
    pesoInicialDefault > 0 ? pesoInicialDefault.toString() : "80"
  );
  const [alturaInput, setAlturaInput] = useState<string>("170"); // em cm
  const [sexo, setSexo] = useState<"M" | "F">("F");
  const [nivelAtividade, setNivelAtividade] = useState<string>("moderado");

  const peso = parseFloat(pesoInput) || 0;
  const alturaM = (parseFloat(alturaInput) || 0) / 100;

  // Calculo de IMC e analise
  const resultado = useMemo(() => {
    if (peso <= 0 || alturaM <= 0) return null;

    const imc = peso / (alturaM * alturaM);
    let classificacao = "";
    let corBadge = "";
    let corTexto = "";
    let descricao = "";

    if (imc < 18.5) {
      classificacao = "Abaixo do peso";
      corBadge = "bg-amber-100 border-amber-300 text-amber-800";
      corTexto = "text-amber-700";
      descricao = "Seu peso está abaixo do recomendado para sua altura. Consulte um profissional de nutrição.";
    } else if (imc < 25) {
      classificacao = "Peso normal (Ideal)";
      corBadge = "bg-emerald-100 border-emerald-300 text-emerald-800";
      corTexto = "text-emerald-700";
      descricao = "Parabéns! Seu peso atual está dentro da faixa saudável e de equilíbrio fisiológico.";
    } else if (imc < 30) {
      classificacao = "Sobrepeso";
      corBadge = "bg-yellow-100 border-yellow-300 text-yellow-800";
      corTexto = "text-yellow-700";
      descricao = "Atenção inicial: você está um pouco acima da faixa normal. Uma meta de reeducação ajudará bastante!";
    } else if (imc < 35) {
      classificacao = "Obesidade Grau I";
      corBadge = "bg-orange-100 border-orange-300 text-orange-800";
      corTexto = "text-orange-700";
      descricao = "Indicado planejamento alimentar reestruturado e prática regular de atividades físicas.";
    } else if (imc < 40) {
      classificacao = "Obesidade Grau II";
      corBadge = "bg-rose-100 border-rose-300 text-rose-800";
      corTexto = "text-rose-700";
      descricao = "Acompanhamento multidisciplinar médico e nutricional é altamente recomendado.";
    } else {
      classificacao = "Obesidade Grau III";
      corBadge = "bg-red-100 border-red-300 text-red-800";
      corTexto = "text-red-700";
      descricao = "Prioridade para saúde metabólica. Metas graduais e contínuas trarão enorme benefício à sua qualidade de vida.";
    }

    // Faixa ideal (IMC 21.7 é a média exata do intervalo saudável 18.5 - 24.9)
    const pesoMinIdeal = 18.5 * (alturaM * alturaM);
    const pesoMaxIdeal = 24.9 * (alturaM * alturaM);
    const pesoAlvoIdeal = 22 * (alturaM * alturaM);

    // Perda sugerida para chegar no limite saudável superior ou alvo ideal
    const perdaSugeridaLimpa = Math.max(0, peso - pesoMaxIdeal);
    const perdaSugeridaAlvo = Math.max(0, peso - pesoAlvoIdeal);

    // Sugestão de semanas para um ritmo seguro (0.5kg a 1.0kg por semana)
    const semanasEstimadasMin = Math.ceil(perdaSugeridaLimpa / 1.0);
    const semanasEstimadasMax = Math.ceil(perdaSugeridaLimpa / 0.5);

    // Necessidade hídrica diária (35ml x kg)
    const aguaDiariaRecomendada = Math.round(peso * 35);

    return {
      imc,
      classificacao,
      corBadge,
      corTexto,
      descricao,
      pesoMinIdeal,
      pesoMaxIdeal,
      pesoAlvoIdeal,
      perdaSugeridaLimpa,
      perdaSugeridaAlvo,
      semanasEstimadasMin,
      semanasEstimadasMax,
      aguaDiariaRecomendada,
    };
  }, [peso, alturaM]);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 ${inModal ? "p-4" : "p-6 shadow-sm"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Calculadora de IMC e Meta Personalizada
            </h3>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">
              Objetivo seguro e orientação emagrecimento
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Peso Atual (kg)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={pesoInput}
              onChange={(e) => setPesoInput(e.target.value)}
              placeholder="Ex: 82.5"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              kg
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Altura (cm)
          </label>
          <div className="relative">
            <input
              type="number"
              step="1"
              value={alturaInput}
              onChange={(e) => setAlturaInput(e.target.value)}
              placeholder="Ex: 170"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              cm
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Sexo
          </label>
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSexo("F")}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                sexo === "F" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Feminino
            </button>
            <button
              type="button"
              onClick={() => setSexo("M")}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                sexo === "M" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Masculino
            </button>
          </div>
        </div>
      </div>

      {/* Immediate Result Card */}
      {resultado && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Seu Índice de Massa Corporal (IMC)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {resultado.imc.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500 font-bold">kg/m²</span>
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full border ${resultado.corBadge}`}
                >
                  {resultado.classificacao}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Faixa de Peso Ideal Recomendada
              </span>
              <span className="text-sm font-black text-emerald-700 mt-0.5 block">
                {resultado.pesoMinIdeal.toFixed(1)} kg a {resultado.pesoMaxIdeal.toFixed(1)} kg
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {resultado.descricao}
          </p>

          {/* Goal guidance block */}
          <div className="bg-white border border-indigo-100 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Orientação de Meta Realista e Segura</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Ritmo de Emagrecimento Seguro
                </span>
                <span className="font-bold text-slate-800">
                  0,5 kg a 1,0 kg por semana
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Preserva a massa muscular e evita efeito sanfona.
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Meta Recomendada de Perda
                </span>
                <span className="font-black text-indigo-600">
                  {resultado.perdaSugeridaLimpa > 0
                    ? `Perder ${resultado.perdaSugeridaLimpa.toFixed(1)} kg`
                    : "Manutenção de peso saudável"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {resultado.perdaSugeridaLimpa > 0
                    ? `Tempo estimado: ${resultado.semanasEstimadasMin} a ${resultado.semanasEstimadasMax} semanas.`
                    : "Você já está na faixa ideal!"}
                </span>
              </div>
            </div>

            {/* Apply goal button */}
            {onAplicarMeta && resultado.perdaSugeridaLimpa > 0 && (
              <button
                type="button"
                onClick={() => onAplicarMeta(Math.round(resultado.perdaSugeridaLimpa * 10) / 10)}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Target className="w-4 h-4" />
                <span>Aplicar meta de -{resultado.perdaSugeridaLimpa.toFixed(1)} kg no aplicativo</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
