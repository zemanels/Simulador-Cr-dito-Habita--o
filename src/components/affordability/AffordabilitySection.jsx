import { useState } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import AffordabilityForm from './AffordabilityForm';
import AffordabilityResult from './AffordabilityResult';

export default function AffordabilitySection() {
  const { state } = useSimulator();
  const [open, setOpen] = useState(false);

  if (!state.simulationResult) return null;

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h3 className="text-sm font-bold text-gray-800">Taxa de Esforço</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Calcule a sua capacidade de financiamento (regras BdP)
          </p>
        </div>
        <span className={`text-gray-400 text-base transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <AffordabilityForm />
          {state.affordabilityResult && (
            <AffordabilityResult result={state.affordabilityResult} />
          )}
        </div>
      )}
    </div>
  );
}
