import { motion } from "motion/react";
import { Sparkles, Activity } from "lucide-react";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-[#2E7D32]/15 shadow-sm"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold mb-3 border border-[#2E7D32]/20 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
        <span>Projeto Emagrecimento Saudável</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-black mb-2 uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#2E7D32] via-[#1976D2] to-[#2E7D32] animate-gradient">
        PROJETO EMAGRECIMENTO SAUDÁVEL
      </h1>
      <p className="text-[#607D8B] font-medium text-sm sm:text-base max-w-xl mx-auto flex items-center justify-center gap-2">
        <Activity className="w-4 h-4 text-[#1976D2]" />
        Modernidade, Clareza e Identidade Unificada na sua Jornada de Saúde
      </p>
    </motion.header>
  );
}
