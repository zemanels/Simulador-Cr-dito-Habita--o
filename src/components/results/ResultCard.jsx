import SummaryMetrics from './SummaryMetrics';

export default function ResultCard({ result, label, isBest = false }) {
  if (!result) return null;

  return (
    <div className={`card relative ${isBest ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}>
      {isBest && (
        <div className="absolute -top-3 left-4">
          <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide uppercase">
            ✓ Melhor opção
          </span>
        </div>
      )}
      {label && (
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">{label}</h3>
      )}
      <SummaryMetrics result={result} />
    </div>
  );
}
