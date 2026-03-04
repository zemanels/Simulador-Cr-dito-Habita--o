import { useState } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { validateMortgageForm } from '../../utils/validators';
import MortgageFormFields from './MortgageFormFields';

export default function ScenarioForm({ scenarioId }) {
  const { state, dispatch } = useSimulator();
  const [errors, setErrors] = useState({});

  const scenario = state.scenarios.find(s => s.id === scenarioId);
  if (!scenario) return null;

  const handleChange = (field, value) => {
    dispatch({ type: 'UPDATE_SCENARIO_FIELD', scenarioId, field, value });
    if (errors[field]) {
      setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateMortgageForm(scenario.formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    dispatch({ type: 'RUN_SCENARIO', scenarioId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MortgageFormFields
        formData={scenario.formData}
        errors={errors}
        onChange={handleChange}
      />
      <button type="submit" className="btn-primary w-full">
        Calcular
      </button>
    </form>
  );
}
