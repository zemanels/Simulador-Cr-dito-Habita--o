import { useState } from 'react';
import { formatCurrency, formatMonthLabel } from '../../utils/formatters';

function exportToCSV(table) {
  const headers = ['Mês', 'Data', 'Prestação (€)', 'Juros (€)', 'Amortização (€)', 'Capital em Dívida (€)'];
  const rows = table.map(r => [
    r.month,
    r.date ? new Date(r.date).toLocaleDateString('pt-PT', { month: '2-digit', year: 'numeric' }) : '',
    r.payment.toFixed(2),
    r.interest.toFixed(2),
    r.amortization.toFixed(2),
    r.balance.toFixed(2),
  ]);
  const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tabela-amortizacao.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const PAGE_OPTIONS = [12, 24, 60, 'Todos'];

export default function AmortizationTable({ table }) {
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(0);

  if (!table || table.length === 0) return null;

  const rows = pageSize === 'Todos' ? table : table.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = pageSize === 'Todos' ? 1 : Math.ceil(table.length / pageSize);

  const totalJuros = table.reduce((s, r) => s + r.interest, 0);
  const totalAmort = table.reduce((s, r) => s + r.amortization, 0);
  const totalPago = table.reduce((s, r) => s + r.payment, 0);
  const hasFase = rows.some(r => r.fase);

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-800">Tabela de Amortização</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportToCSV(table)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            title="Exportar para CSV"
          >
            ↓ CSV
          </button>
          <div className="flex items-center gap-1">
          {PAGE_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { setPageSize(opt); setPage(0); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                pageSize === opt
                  ? 'bg-bpi-primary text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {opt === 'Todos' ? 'Todos' : `${opt}m`}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-2.5 px-4 text-left font-semibold text-gray-500 uppercase tracking-wide">Mês</th>
              <th className="py-2.5 px-3 text-left font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Data</th>
              <th className="py-2.5 px-3 text-right font-semibold text-gray-500 uppercase tracking-wide">Prestação</th>
              <th className="py-2.5 px-3 text-right font-semibold text-gray-500 uppercase tracking-wide">Juros</th>
              <th className="py-2.5 px-3 text-right font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Amortização</th>
              <th className="py-2.5 px-3 text-right font-semibold text-gray-500 uppercase tracking-wide">Capital em Dívida</th>
              {hasFase && <th className="py-2.5 px-3 text-center font-semibold text-gray-500 uppercase tracking-wide">Fase</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.month} className={`hover:bg-gray-50/70 transition-colors ${row.fase === 2 ? 'bg-blue-50/40' : ''}`}>
                <td className="py-2 px-4 text-gray-500 font-medium tabular-nums">{row.month}</td>
                <td className="py-2 px-3 text-gray-400 hidden sm:table-cell">{formatMonthLabel(row.date)}</td>
                <td className="py-2 px-3 text-right font-semibold text-gray-800 tabular-nums">{formatCurrency(row.payment)}</td>
                <td className="py-2 px-3 text-right text-red-500 tabular-nums">{formatCurrency(row.interest)}</td>
                <td className="py-2 px-3 text-right text-green-600 tabular-nums hidden md:table-cell">{formatCurrency(row.amortization)}</td>
                <td className="py-2 px-3 text-right text-gray-700 tabular-nums">{formatCurrency(row.balance)}</td>
                {hasFase && (
                  <td className="py-2 px-3 text-center">
                    {row.fase && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${row.fase === 1 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        F{row.fase}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
              <td className="py-2.5 px-4 text-gray-600" colSpan={2}>Total</td>
              <td className="py-2.5 px-3 text-right text-gray-800 tabular-nums">{formatCurrency(totalPago)}</td>
              <td className="py-2.5 px-3 text-right text-red-600 tabular-nums">{formatCurrency(totalJuros)}</td>
              <td className="py-2.5 px-3 text-right text-green-700 tabular-nums hidden md:table-cell">{formatCurrency(totalAmort)}</td>
              <td className="py-2.5 px-3 text-right text-gray-400">—</td>
              {hasFase && <td />}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Paginação */}
      {pageSize !== 'Todos' && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 px-4 py-3 border-t border-gray-100">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 font-medium transition-colors"
          >
            ← Anterior
          </button>
          <span className="px-3 py-1.5 text-xs text-gray-500 font-medium">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 font-medium transition-colors"
          >
            Seguinte →
          </button>
        </div>
      )}
    </div>
  );
}
