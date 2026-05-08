import { formatCurrency, formatPercent } from '../../utils/formatters';

function Metric({ label, value, sub, highlight, className = '', size = 'normal' }) {
  return (
    <div className={`metric-card ${highlight ? 'bg-brand-primary border-brand-primary' : ''} ${className}`}>
      <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${highlight ? 'text-white/60' : 'text-gray-400'}`}>
        {label}
      </p>
      <p className={`font-bold leading-none tabular-nums ${highlight ? 'text-white' : 'text-gray-800'} ${size === 'large' ? 'text-2xl xl:text-3xl' : 'text-lg'}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-[11px] mt-2 ${highlight ? 'text-white/55' : 'text-gray-400'}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function SummaryMetrics({ result }) {
  if (!result) return null;

  const interestRatio = result.totalPaid > 0
    ? ((result.totalInterest / result.totalPaid) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-4">
      {/* Prestações em destaque */}
      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="Prestação Mensal"
          value={formatCurrency(result.prestacaoMensal)}
          sub="capital + juros"
          highlight
          size="large"
        />
        <Metric
          label="Total Mensal c/ Seguros"
          value={formatCurrency(result.totalMensal)}
          sub={result.segurosMensais > 0 ? `+${formatCurrency(result.segurosMensais)} em seguros` : 'sem seguros'}
          highlight
          size="large"
        />
      </div>

      {/* Taxa mista — fase 2 */}
      {result.prestacaoFase2 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3.5">
          <div className="w-1 self-stretch rounded-full bg-blue-400 flex-shrink-0" />
          <div>
            <span className="text-blue-700 font-bold text-xs">Taxa Mista — Fase variável</span>
            <p className="text-blue-600 text-xs mt-0.5">
              Após o período fixo, a prestação passa para{' '}
              <strong>{formatCurrency(result.prestacaoFase2)}/mês</strong>
              {' '}(taxa variável: {formatPercent(result.annualRatePhase2)})
            </p>
          </div>
        </div>
      )}

      {/* Métricas secundárias — 4 colunas em desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <Metric
          label="Total em Juros"
          value={formatCurrency(result.totalInterest)}
          sub={`${interestRatio}% do total pago`}
        />
        <Metric
          label="Total Pago"
          value={formatCurrency(result.totalPaidComSeguros)}
          sub={result.segurosMensais > 0
            ? `+${formatCurrency(result.segurosMensais * result.totalMonths)} seguros`
            : 'capital + juros'}
        />
        <Metric
          label="TAEG"
          value={formatPercent(result.taeg)}
          sub="aprox."
        />
        <Metric
          label="LTV"
          value={result.ltv !== null ? `${result.ltv}%` : '—'}
          sub="loan-to-value"
          className={result.ltv !== null && result.ltv > 80 ? 'border-amber-300 bg-amber-50' : ''}
        />
      </div>

      {/* Resumo técnico */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 text-xs border border-gray-100">
        <span className="text-gray-500">
          Taxa aplicada:{' '}
          <strong className="text-gray-700">{formatPercent(result.annualRate)}</strong>
        </span>
        <span className="text-gray-500">
          Prazo:{' '}
          <strong className="text-gray-700">
            {result.totalMonths} meses ({(result.totalMonths / 12).toFixed(1)} anos)
          </strong>
        </span>
        <span className="text-gray-500">
          Capital:{' '}
          <strong className="text-gray-700">{formatCurrency(result.capital)}</strong>
        </span>
      </div>
    </div>
  );
}
