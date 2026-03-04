import { useSimulator } from '../../context/SimulatorContext';
import FormField from '../inputs/FormField';

export default function AffordabilityForm() {
  const { state, dispatch } = useSimulator();

  const handleChange = (field, value) => {
    dispatch({ type: 'UPDATE_AFFORDABILITY_FIELD', field, value });
  };

  const handleCalculate = () => {
    dispatch({ type: 'RUN_AFFORDABILITY' });
  };

  const { affordabilityData } = state;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          label="Rendimento líquido (titular)"
          name="rendimentoTitular1"
          value={affordabilityData.rendimentoTitular1}
          onChange={handleChange}
          placeholder="1 500"
          suffix="€/mês"
          min={0}
          step={50}
          hint="Salário líquido após IRS e Seg. Social"
          required
        />
        <FormField
          label="Rendimento líquido (co-titular)"
          name="rendimentoTitular2"
          value={affordabilityData.rendimentoTitular2}
          onChange={handleChange}
          placeholder="1 200"
          suffix="€/mês"
          min={0}
          step={50}
          hint="Opcional"
        />
      </div>
      <button
        type="button"
        onClick={handleCalculate}
        className="btn-secondary w-full"
        disabled={!affordabilityData.rendimentoTitular1}
      >
        Calcular Taxa de Esforço
      </button>
    </div>
  );
}
