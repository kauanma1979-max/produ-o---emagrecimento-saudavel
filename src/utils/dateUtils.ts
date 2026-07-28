/**
 * Utility functions for date calculations.
 */

/**
 * Calculates the exact calendar day difference between a start date (YYYY-MM-DD)
 * and a target date (or today).
 *
 * Uses local midnight for both dates to avoid timezone shifts and time-of-day discrepancies.
 */
export function getDiasJornada(dataInicioStr?: string, dataFimStr?: string | Date): number | null {
  if (!dataInicioStr) return null;

  const parts = dataInicioStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [year, month, day] = parts;
  const inicio = new Date(year, month - 1, day, 0, 0, 0, 0);

  let target: Date;
  if (dataFimStr) {
    if (typeof dataFimStr === "string") {
      const endParts = dataFimStr.split("-").map(Number);
      if (endParts.length === 3 && !endParts.some(isNaN)) {
        target = new Date(endParts[0], endParts[1] - 1, endParts[2], 0, 0, 0, 0);
      } else {
        target = new Date(dataFimStr);
        target.setHours(0, 0, 0, 0);
      }
    } else {
      target = new Date(dataFimStr);
      target.setHours(0, 0, 0, 0);
    }
  } else {
    target = new Date();
    target.setHours(0, 0, 0, 0);
  }

  const diffMs = target.getTime() - inicio.getTime();
  if (diffMs < 0) return 0;

  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
