import { useState } from 'react';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import BalanceChart from '../charts/BalanceChart';
import AmortizationTable from '../results/AmortizationTable';

/* ─── Banner de impacto ─────────────────────────────────────────────── */
function ImpactBanner({ result }) {
  const isWorse = result.poupancaTotal < 0;

  const metrics = [
    {
      label: 'Prestação mensal',
      value: `${result.diferencaPrestacao >= 0 ? '−' : '+'}${formatCurrency(Math.abs(result.diferencaPrestacao))}`,
      sub: result.diferencaPrestacao >= 0 ? 'menos / mês' : 'mais / mês',
      positive: result.diferencaPrestacao > 0,
      negative: result.diferencaPrestacao < 0,
    },
    {
      label: 'Poupança em juros',
      value: formatCurrency(Math.abs(result.poupancaJuros)),
      sub: result.poupancaJuros >= 0 ? 'poupados no total' : 'juros extra',
      positive: result.poupancaJuros > 0,
      negative: result.poupancaJuros < 0,
    },
    {
      label: 'Impacto total',
      value: formatCurrency(Math.abs(result.poupancaTotal)),
      sub: result.poupancaTotal >= 0 ? 'poupança total' : 'custo extra total',
      positive: result.poupancaTotal > 0,
      negative: result.poupancaTotal < 0,
      big: true,
    },
    result.tipoModificacao === 'amortizacao'
      ? {
          label: 'Custo da operação',
          value: formatCurrency(result.montanteAmortizacao + result.penalty),
          sub: result.penalty > 0 ? `+${formatCurrency(result.penalty)} comissão` : 'sem comissão',
        }
      : {
          label: 'Novo prazo',
          value: `${result.newResult.totalMonths} meses`,
          sub: (() => {
            const diff = result.currentResult.totalMonths - result.newResult.totalMonths;
            if (diff > 0) return `−${diff} meses (${(diff / 12).toFixed(1)} anos)`;
            if (diff < 0) return `+${Math.abs(diff)} meses`;
            return 'prazo inalterado';
          })(),
          positive: result.currentResult.totalMonths > result.newResult.totalMonths,
          negative: result.currentResult.totalMonths < result.newResult.totalMonths,
        },
  ];

  return (
    <div className={`rounded-2xl border-2 p-6 ${isWorse ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
      <div className="flex items-center gap-2 mb-5">
        <span className={`text-base ${isWorse ? 'text-red-500' : 'text-green-500'}`}>
          {isWorse ? '⚠' : '✓'}
        </span>
        <h3 className={`text-xs font-bold uppercase tracking-widest ${isWorse ? 'text-red-700' : 'text-green-700'}`}>
          Impacto da Modificação
        </h3>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div
            key={i}
            className={`text-center rounded-xl px-4 py-4 border ${
              m.big
                ? isWorse
                  ? 'bg-red-100/60 border-red-300'
                  : 'bg-green-100/60 border-green-300'
                : 'bg-white/70 border-white'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{m.label}</p>
            <p className={`text-2xl font-bold leading-none tabular-nums ${
              m.positive ? 'text-green-700' : m.negative ? 'text-red-600' : 'text-gray-800'
            }`}>
              {m.value}
            </p>
            {m.sub && <p className="text-[11px] text-gray-500 mt-2">{m.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Break-even ────────────────────────────────────────────────────── */
function BreakEvenCard({ result }) {
  const months = result.breakEvenMonths;
  if (!months) return null;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const label = years > 0
    ? `${years} ano${years > 1 ? 's' : ''}${rem > 0 ? ` e ${rem} meses` : ''}`
    : `${rem} meses`;

  return (
    <div className="card border border-blue-200 bg-blue-50/50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-xl">
          ⏱️
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-blue-800 text-sm">Ponto de Equilíbrio</h4>
          <p className="text-sm text-blue-700 mt-0.5">
            Recupera o investimento ao fim de <strong>{label}</strong>.
          </p>
          {result.tipoModificacao === 'amortizacao' && (
            <p className="text-xs text-blue-500 mt-1">
              {formatCurrency(result.montanteAmortizacao + result.penalty)} ÷ {formatCurrency(Math.abs(result.diferencaPrestacao))}/mês
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Tabela comparativa principal ──────────────────────────────────── */
function ComparisonTable({ result }) {
  const cur = result.currentResult;
  const nw = result.newResult;

  const rows = [
    { label: 'Prestação mensal',       cur: formatCurrency(cur.prestacaoMensal),       nw: formatCurrency(nw.prestacaoMensal),       better: nw.prestacaoMensal < cur.prestacaoMensal },
    { label: 'Total mensal c/ seguros',cur: formatCurrency(cur.totalMensal),            nw: formatCurrency(nw.totalMensal),            better: nw.totalMensal < cur.totalMensal },
    { label: 'Prazo',                  cur: `${cur.totalMonths} meses`,                 nw: `${nw.totalMonths} meses`,                 better: nw.totalMonths <= cur.totalMonths },
    { label: 'Total em juros',         cur: formatCurrency(cur.totalInterest),          nw: formatCurrency(nw.totalInterest),          better: nw.totalInterest < cur.totalInterest, highlight: true },
    { label: 'Total pago (c/ seguros)',cur: formatCurrency(cur.totalPaidComSeguros),    nw: formatCurrency(nw.totalPaidComSeguros),    better: nw.totalPaidComSeguros < cur.totalPaidComSeguros, highlight: true },
    { label: 'Taxa aplicada',          cur: formatPercent(cur.annualRate),              nw: formatPercent(nw.annualRate),              better: nw.annualRate < cur.annualRate },
    { label: 'TAEG (aprox.)',          cur: `${cur.taeg?.toFixed(3)}%`,                nw: `${nw.taeg?.toFixed(3)}%`,                better: nw.taeg < cur.taeg },
  ];

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-800">Comparação Detalhada</h3>
        <p className="text-xs text-gray-400 mt-0.5">Valores antes e depois da modificação</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="py-3 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Métrica</th>
              <th className="py-3 px-6 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Situação Atual</th>
              <th className="py-3 px-6 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Após Modificação
                <span className="ml-2 text-[9px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-full font-bold normal-case">novo</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row, i) => (
              <tr key={i} className={`transition-colors ${row.highlight ? 'bg-gray-50/60' : 'hover:bg-gray-50/40'}`}>
                <td className={`py-3.5 px-6 text-xs font-semibold ${row.highlight ? 'text-gray-700' : 'text-gray-500'}`}>
                  {row.label}
                </td>
                <td className="py-3.5 px-6 text-right text-gray-400 tabular-nums">
                  {row.cur}
                </td>
                <td className="py-3.5 px-6 text-right tabular-nums">
                  <span className={`font-bold text-base ${row.better ? 'text-green-700' : (row.cur !== row.nw ? 'text-red-600' : 'text-gray-600')}`}>
                    {row.nw}
                  </span>
                  {row.better && row.cur !== row.nw && (
                    <span className="ml-1 text-green-400 text-xs">↓</span>
                  )}
                  {!row.better && row.cur !== row.nw && (
                    <span className="ml-1 text-red-400 text-xs">↑</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Tabelas de amortização colapsáveis ────────────────────────────── */
function AmortizationSection({ result }) {
  const [show, setShow] = useState(false);

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setShow(o => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h3 className="text-sm font-bold text-gray-700">Tabelas de Amortização Detalhadas</h3>
          {!show && <p className="text-xs text-gray-400 mt-0.5">Clique para expandir</p>}
        </div>
        <span className={`text-gray-400 text-sm transition-transform duration-200 ${show ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {show && (
        <div className="mt-5 border-t border-gray-100 pt-5 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <p className="section-label mb-3">Situação Atual</p>
            <AmortizationTable table={result.currentResult.amortizationTable} />
          </div>
          <div>
            <p className="section-label mb-3">Após Modificação</p>
            <AmortizationTable table={result.newResult.amortizationTable} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Componente principal ──────────────────────────────────────────── */
export default function ModificationResult({ result }) {
  if (!result) return null;

  const chartScenarios = [
    { label: 'Situação Atual', table: result.currentResult.amortizationTable },
    { label: 'Após Modificação', table: result.newResult.amortizationTable },
  ];

  return (
    <div className="space-y-5">
      <ImpactBanner result={result} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <ComparisonTable result={result} />
        <div className="space-y-5">
          {result.breakEvenMonths && <BreakEvenCard result={result} />}
          <BalanceChart scenarios={chartScenarios} />
        </div>
      </div>

      <AmortizationSection result={result} />
    </div>
  );
}
