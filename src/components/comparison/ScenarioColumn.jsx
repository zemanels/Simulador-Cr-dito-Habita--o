import { useState, useRef } from 'react';
import ScenarioForm from '../inputs/ScenarioForm';
import ResultCard from '../results/ResultCard';
import { useSimulator } from '../../context/SimulatorContext';

export default function ScenarioColumn({ scenarioId, isBest }) {
  const { state, dispatch } = useSimulator();
  const scenario = state.scenarios.find(s => s.id === scenarioId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  if (!scenario) return null;

  function startEdit() {
    setDraft(scenario.label);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== scenario.label) {
      dispatch({ type: 'UPDATE_SCENARIO_LABEL', scenarioId, label: trimmed });
    }
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false); }}
              className="text-sm font-bold text-gray-800 border-b border-brand-primary outline-none bg-transparent w-full max-w-[160px]"
              maxLength={30}
            />
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className="text-sm font-bold text-gray-800 hover:text-brand-primary transition-colors text-left truncate"
              title="Clique para editar nome"
            >
              {scenario.label}
              <span className="ml-1 text-gray-300 text-xs font-normal">✎</span>
            </button>
          )}
          {isBest && scenario.result && (
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 ml-2">
              ✓ Melhor
            </span>
          )}
        </div>
        <ScenarioForm scenarioId={scenarioId} />
      </div>

      {scenario.result && (
        <ResultCard result={scenario.result} isBest={isBest} />
      )}
    </div>
  );
}
