import { motion } from "motion/react";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      <h1 className="text-4xl font-extrabold text-emerald-600 mb-2 uppercase tracking-tight">
        PROJETO EMAGRECIMENTO SAUDÁVEL
      </h1>
      <p className="text-gray-500 font-medium">
        Controle Total da sua Jornada de Saúde
      </p>
    </motion.header>
  );
}
