import ScenarioColumn from './ScenarioColumn';
import ComparisonSummary from './ComparisonSummary';
import { useSimulator } from '../../context/SimulatorContext';
import { useComparison } from '../../hooks/useComparison';

export default function ComparisonPanel() {
  const { state } = useSimulator();
  const { bestScenario } = useComparison(state.scenarios);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {state.scenarios.map(scenario => (
          <ScenarioColumn
            key={scenario.id}
            scenarioId={scenario.id}
            isBest={bestScenario?.id === scenario.id}
          />
        ))}
      </div>
      <ComparisonSummary />
    </div>
  );
}
