import { TAXA_OPTIONS } from '../../constants/defaults';

export default function RateTypeSelector({ value, onChange }) {
  return (
    <div>
      <label className="input-label">Tipo de Taxa</label>
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TAXA_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange('tipoTaxa', opt.value)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              value === opt.value
                ? 'bg-white text-brand-primary shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
