export default function FormField({
  label,
  name,
  type = 'number',
  value,
  onChange,
  error,
  placeholder,
  min,
  max,
  step,
  suffix,
  hint,
  required = false,
}) {
  return (
    <div>
      <label className="input-label" htmlFor={name}>
        {label}
        {required && <span className="text-brand-accent ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`input-field ${suffix ? 'pr-12' : ''} ${error ? 'border-red-400 focus:ring-red-400 bg-red-50/30' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-[11px] text-red-600 font-medium">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${name}-hint`} className="mt-1 text-[11px] text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}
