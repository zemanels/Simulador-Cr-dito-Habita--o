import { useMemo } from 'react';

export function useComparison(scenarios) {
  return useMemo(() => {
    const withResults = scenarios.filter(s => s.result !== null);

    if (withResults.length < 2) {
      return { bestScenario: null, savings: [], hasComparison: false };
    }

    const bestScenario = withResults.reduce((best, current) =>
      current.result.totalPaidComSeguros < best.result.totalPaidComSeguros ? current : best
    );

    // Matriz de poupanças entre todos os pares
    const savings = [];
    for (let i = 0; i < withResults.length; i++) {
      for (let j = i + 1; j < withResults.length; j++) {
        const a = withResults[i];
        const b = withResults[j];
        const diffInterest = Math.abs(a.result.totalInterest - b.result.totalInterest);
        const diffTotal = Math.abs(a.result.totalPaidComSeguros - b.result.totalPaidComSeguros);
        const cheaper = a.result.totalPaidComSeguros < b.result.totalPaidComSeguros ? a : b;
        const dearer = a.result.totalPaidComSeguros < b.result.totalPaidComSeguros ? b : a;
        savings.push({
          from: dearer.label,
          to: cheaper.label,
          diffInterest: Math.round(diffInterest * 100) / 100,
          diffTotal: Math.round(diffTotal * 100) / 100,
        });
      }
    }

    return { bestScenario, savings, hasComparison: true };
  }, [scenarios]);
}
