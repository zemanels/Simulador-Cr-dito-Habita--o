import { EURIBOR_OPTIONS } from '../../constants/defaults';

export default function EuriborSelector({ value, onChange }) {
  return (
    <div>
      <label className="input-label">Indexante Euribor</label>
      <div className="flex gap-1.5">
        {EURIBOR_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg border cursor-pointer text-xs font-semibold transition-all duration-200 ${
              value === opt.value
                ? 'border-brand-medium bg-brand-light text-brand-primary'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="euriborPeriodo"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange('euriborPeriodo', opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
