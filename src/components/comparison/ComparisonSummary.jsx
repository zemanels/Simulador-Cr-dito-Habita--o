import { useComparison } from '../../hooks/useComparison';
import { useSimulator } from '../../context/SimulatorContext';
import { formatCurrency } from '../../utils/formatters';
import BalanceChart from '../charts/BalanceChart';

export default function ComparisonSummary() {
  const { state } = useSimulator();
  const { bestScenario, savings, hasComparison } = useComparison(state.scenarios);

  if (!hasComparison) return null;

  const scenariosWithResults = state.scenarios.filter(s => s.result !== null);

  const chartScenarios = scenariosWithResults.map(s => ({
    label: s.label,
    table: s.result.amortizationTable,
  }));

  return (
    <div className="space-y-5 mt-6">
      {/* Tabela comparativa */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Resumo Comparativo</h3>
          <span className="text-xs text-gray-400">{scenariosWithResults.length} cenários calculados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="py-3 px-5 text-left font-bold text-gray-400 uppercase tracking-wider">Cenário</th>
                <th className="py-3 px-4 text-right font-bold text-gray-400 uppercase tracking-wider">Prestação</th>
                <th className="py-3 px-4 text-right font-bold text-gray-400 uppercase tracking-wider">Total Mensal</th>
                <th className="py-3 px-4 text-right font-bold text-gray-400 uppercase tracking-wider">Total Juros</th>
                <th className="py-3 px-4 text-right font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Total Pago</th>
                <th className="py-3 px-4 text-right font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">TAEG</th>
                <th className="py-3 px-4 text-right font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">LTV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {scenariosWithResults.map(s => (
                <tr
                  key={s.id}
                  className={`transition-colors ${s.id === bestScenario?.id ? 'bg-green-50/60' : 'hover:bg-gray-50/60'}`}
                >
                  <td className="py-3 px-5 font-bold text-gray-800">
                    {s.label}
                    {s.id === bestScenario?.id && (
                      <span className="ml-2 text-[10px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                        ★ melhor
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700 tabular-nums">{formatCurrency(s.result.prestacaoMensal)}</td>
                  <td className="py-3 px-4 text-right font-bold text-bpi-primary tabular-nums">{formatCurrency(s.result.totalMensal)}</td>
                  <td className="py-3 px-4 text-right text-red-500 tabular-nums">{formatCurrency(s.result.totalInterest)}</td>
                  <td className="py-3 px-4 text-right text-gray-600 tabular-nums hidden sm:table-cell">{formatCurrency(s.result.totalPaidComSeguros)}</td>
                  <td className="py-3 px-4 text-right text-gray-500 tabular-nums hidden md:table-cell">{s.result.taeg?.toFixed(3)}%</td>
                  <td className="py-3 px-4 text-right tabular-nums hidden lg:table-cell">
                    {s.result.ltv !== null
                      ? <span className={s.result.ltv > 80 ? 'text-amber-600 font-semibold' : 'text-gray-500'}>{s.result.ltv}%</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {savings.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4">
            <h4 className="section-label">Poupança em Juros</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {savings.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs">
                  <span className="text-gray-700">
                    <strong className="text-green-700">{s.to}</strong>
                    <span className="text-gray-400 mx-1.5">vs</span>
                    <span className="text-gray-500">{s.from}</span>
                  </span>
                  <div className="text-right ml-3 flex-shrink-0">
                    <span className="font-bold text-green-700">{formatCurrency(s.diffInterest)}</span>
                    <span className="text-gray-400 ml-1">poupados</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {chartScenarios.length >= 2 && (
        <BalanceChart scenarios={chartScenarios} />
      )}
    </div>
  );
}
