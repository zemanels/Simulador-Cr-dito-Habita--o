import { useState } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { validateMortgageForm } from '../../utils/validators';
import MortgageFormFields from './MortgageFormFields';

export default function SimulationForm() {
  const { state, dispatch } = useSimulator();
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    dispatch({ type: 'UPDATE_FORM_FIELD', field, value });
    if (errors[field]) {
      setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateMortgageForm(state.formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    dispatch({ type: 'RUN_SIMULATION' });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_ALL' });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-800">Dados do Crédito</h2>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
        >
          Limpar
        </button>
      </div>

      <MortgageFormFields
        formData={state.formData}
        errors={errors}
        onChange={handleChange}
      />

      <button type="submit" className="btn-primary w-full mt-6">
        Calcular Simulação
      </button>
    </form>
  );
}
