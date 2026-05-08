import { useSimulator } from '../../context/SimulatorContext';

const MODES = [
  { value: 'simulation',  label: 'Simulação',   shortLabel: 'Simular',  icon: '🏠' },
  { value: 'comparison',  label: 'Comparação',  shortLabel: 'Comparar', icon: '⚖️' },
  { value: 'modification',label: 'Modificação', shortLabel: 'Modificar',icon: '🔄' },
];

export default function ModeToggle() {
  const { state, dispatch } = useSimulator();

  return (
    <nav className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-1 gap-0.5">
      {MODES.map(mode => {
        const active = state.mode === mode.value;
        return (
          <button
            key={mode.value}
            onClick={() => dispatch({ type: 'SET_MODE', payload: mode.value })}
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold
              transition-all duration-200 whitespace-nowrap
              ${active
                ? 'bg-white text-brand-primary shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <span className="hidden sm:inline text-sm leading-none">{mode.icon}</span>
            <span className="hidden md:inline">{mode.label}</span>
            <span className="md:hidden">{mode.shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}
