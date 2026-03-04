import { useSimulator } from './context/SimulatorContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SimulationForm from './components/inputs/SimulationForm';
import ResultCard from './components/results/ResultCard';
import AmortizationTable from './components/results/AmortizationTable';
import AmortizationChart from './components/charts/AmortizationChart';
import BalanceChart from './components/charts/BalanceChart';
import ComparisonPanel from './components/comparison/ComparisonPanel';
import AffordabilitySection from './components/affordability/AffordabilitySection';
import CurrentLoanInput from './components/modification/CurrentLoanInput';
import ModificationForm from './components/modification/ModificationForm';
import ModificationResult from './components/modification/ModificationResult';

function EmptyState({ icon, title, sub }) {
  return (
    <div className="card flex flex-col items-center justify-center py-24 text-center">
      <div className="text-7xl mb-6 opacity-40">{icon}</div>
      <p className="font-bold text-gray-500 text-lg">{title}</p>
      <p className="text-sm text-gray-400 mt-2">{sub}</p>
    </div>
  );
}

function SimulationView() {
  const { state } = useSimulator();
  const result = state.simulationResult;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 py-6 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr] gap-6">
        {/* Coluna esquerda - formulário com scroll próprio */}
        <div className="sidebar-sticky">
          <SimulationForm />
        </div>

        {/* Coluna direita - resultados */}
        <div className="space-y-5">
          {result ? (
            <>
              <ResultCard result={result} />
              <AffordabilitySection />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AmortizationChart table={result.amortizationTable} />
                <BalanceChart table={result.amortizationTable} />
              </div>
              <AmortizationTable table={result.amortizationTable} />
            </>
          ) : (
            <EmptyState
              icon="🏠"
              title="Preencha os dados do crédito"
              sub="e clique em «Calcular Simulação»"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonView() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Comparação de Cenários</h2>
        <p className="text-sm text-gray-400 mt-1">Compare até 3 cenários de crédito habitação lado a lado</p>
      </div>
      <ComparisonPanel />
    </div>
  );
}

function ModificationView() {
  const { state } = useSimulator();
  const result = state.modificationResult;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 xl:px-10 py-6 space-y-6">
      {/* Formulários no topo — 2 colunas lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CurrentLoanInput />
        <ModificationForm />
      </div>

      {/* Resultados — largura total */}
      {result ? (
        <ModificationResult result={result} />
      ) : (
        <EmptyState
          icon="🔄"
          title="Defina o crédito atual e a modificação"
          sub="e clique em «Calcular Modificação»"
        />
      )}
    </div>
  );
}

export default function App() {
  const { state } = useSimulator();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/80">
      <Header />
      <main className="flex-1">
        {state.mode === 'simulation' && <SimulationView />}
        {state.mode === 'comparison' && <ComparisonView />}
        {state.mode === 'modification' && <ModificationView />}
      </main>
      <Footer />
    </div>
  );
}
