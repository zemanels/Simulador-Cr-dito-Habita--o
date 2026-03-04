import { formatCurrency } from '../../utils/formatters';

const SEMAFORO_CONFIG = {
  verde: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    dot: 'bg-green-500',
    label: 'Dentro do limite recomendado',
  },
  amarelo: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    label: 'Acima do recomendado (limite: 35%)',
  },
  vermelho: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    dot: 'bg-red-500',
    label: 'Acima do máximo permitido (50%)',
  },
};

function SemaforoCard({ label, taxaEsforco, semaforo, sub }) {
  const cfg = SEMAFORO_CONFIG[semaforo];
  return (
    <div className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
        <p className={`text-[10px] font-bold uppercase tracking-wide ${cfg.text}`}>{label}</p>
      </div>
      <p className={`text-3xl font-bold ${cfg.text} leading-none`}>{taxaEsforco.toFixed(1)}%</p>
      <p className={`text-xs mt-2 ${cfg.text} opacity-75`}>{cfg.label}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function AffordabilityResult({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-3 mt-4">
      <div className="grid grid-cols-2 gap-3">
        <SemaforoCard
          label="Taxa de Esforço"
          taxaEsforco={result.taxaEsforco}
          semaforo={result.semaforo}
          sub={`${formatCurrency(result.prestacaoTotal)}/mês`}
        />
        <SemaforoCard
          label="Stress Test +3pp"
          taxaEsforco={result.taxaEsforcoStress}
          semaforo={result.semaforoStress}
          sub={`Prestação: ${formatCurrency(result.prestacaoStress)}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Prestação máx. (35%)</p>
          <p className="text-lg font-bold text-gray-800">{formatCurrency(result.prestacaoMaxima35pct)}<span className="text-xs font-normal text-gray-400">/mês</span></p>
          <p className="text-[11px] text-gray-400 mt-1">Rendimento: {formatCurrency(result.rendimentoTotal)}/mês</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Rendimento mínimo</p>
          <p className="text-lg font-bold text-gray-800">{formatCurrency(result.rendimentoMinimo)}<span className="text-xs font-normal text-gray-400">/mês</span></p>
          <p className="text-[11px] text-gray-400 mt-1">Para manter esforço em 35%</p>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 bg-gray-50 rounded-xl p-3 leading-relaxed">
        <strong>Aviso BdP n.º 4/2017</strong> — O DSTI é testado com acréscimo de 3 pontos percentuais.
        A aprovação final depende da análise de risco da instituição financeira.
      </p>
    </div>
  );
}
