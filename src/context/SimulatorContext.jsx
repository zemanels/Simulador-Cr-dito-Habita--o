import { createContext, useContext, useReducer } from 'react';
import { DEFAULT_FORM, DEFAULT_AFFORDABILITY, DEFAULT_MODIFICATION } from '../constants/defaults';
import { calcMortgage, calcModification } from '../utils/mortgageCalculations';
import { calcAffordability } from '../utils/affordabilityCalculations';

const SimulatorContext = createContext(null);

const makeScenario = (id) => ({
  id,
  label: `Cenário ${id}`,
  formData: { ...DEFAULT_FORM },
  result: null,
});

const initialState = {
  mode: 'simulation',
  formData: { ...DEFAULT_FORM },
  simulationResult: null,
  affordabilityData: { ...DEFAULT_AFFORDABILITY },
  affordabilityResult: null,
  scenarios: [makeScenario(1), makeScenario(2), makeScenario(3)],
  modificationData: { ...DEFAULT_MODIFICATION },
  modificationResult: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };

    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
        simulationResult: null,
        affordabilityResult: null,
      };

    case 'RUN_SIMULATION': {
      const result = calcMortgage(state.formData);
      return { ...state, simulationResult: result, affordabilityResult: null };
    }

    case 'UPDATE_AFFORDABILITY_FIELD':
      return {
        ...state,
        affordabilityData: { ...state.affordabilityData, [action.field]: action.value },
        affordabilityResult: null,
      };

    case 'RUN_AFFORDABILITY': {
      const affordResult = calcAffordability(
        state.affordabilityData,
        state.simulationResult,
        state.formData
      );
      return { ...state, affordabilityResult: affordResult };
    }

    case 'UPDATE_SCENARIO_FIELD': {
      const scenarios = state.scenarios.map(s =>
        s.id === action.scenarioId
          ? { ...s, formData: { ...s.formData, [action.field]: action.value }, result: null }
          : s
      );
      return { ...state, scenarios };
    }

    case 'RUN_SCENARIO': {
      const scenarios = state.scenarios.map(s =>
        s.id === action.scenarioId
          ? { ...s, result: calcMortgage(s.formData) }
          : s
      );
      return { ...state, scenarios };
    }

    case 'UPDATE_SCENARIO_LABEL': {
      const scenarios = state.scenarios.map(s =>
        s.id === action.scenarioId ? { ...s, label: action.label } : s
      );
      return { ...state, scenarios };
    }

    case 'UPDATE_MODIFICATION_FIELD':
      return {
        ...state,
        modificationData: { ...state.modificationData, [action.field]: action.value },
        modificationResult: null,
      };

    case 'RUN_MODIFICATION': {
      const modResult = calcModification(state.modificationData);
      return { ...state, modificationResult: modResult };
    }

    case 'RESET_MODIFICATION':
      return {
        ...state,
        modificationData: { ...DEFAULT_MODIFICATION },
        modificationResult: null,
      };

    case 'RESET_ALL':
      return {
        ...initialState,
        scenarios: [makeScenario(1), makeScenario(2), makeScenario(3)],
        modificationData: { ...DEFAULT_MODIFICATION },
        modificationResult: null,
      };

    default:
      return state;
  }
}

export function SimulatorProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <SimulatorContext.Provider value={{ state, dispatch }}>
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error('useSimulator must be used within SimulatorProvider');
  return ctx;
}
