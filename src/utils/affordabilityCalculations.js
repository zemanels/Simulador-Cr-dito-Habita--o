import { calcMonthlyPayment } from './mortgageCalculations';
import { STRESS_TEST_ADDON, TAXA_ESFORCO_LIMITE, TAXA_ESFORCO_MAXIMO } from '../constants/defaults';

function getSemaforo(taxaEsforco) {
  if (taxaEsforco <= TAXA_ESFORCO_LIMITE) return 'verde';
  if (taxaEsforco <= TAXA_ESFORCO_MAXIMO) return 'amarelo';
  return 'vermelho';
}

/**
 * Calcula taxa de esforço conforme regras Banco de Portugal.
 * @param {object} affordabilityData - rendimentoTitular1, rendimentoTitular2
 * @param {object} mortgageResult - resultado de calcMortgage()
 * @param {object} formData - dados do formulário (para stress test)
 */
export function calcAffordability(affordabilityData, mortgageResult, formData) {
  if (!mortgageResult) return null;

  const r1 = parseFloat(affordabilityData.rendimentoTitular1) || 0;
  const r2 = parseFloat(affordabilityData.rendimentoTitular2) || 0;
  const rendimentoTotal = r1 + r2;

  if (rendimentoTotal <= 0) return null;

  const prestacaoTotal = mortgageResult.totalMensal; // inclui seguros

  // Taxa de esforço atual
  const taxaEsforco = (prestacaoTotal / rendimentoTotal) * 100;

  // Stress test: +3pp sobre a taxa atual
  const { tipoTaxa, euriborValue, spread, taxaFixa, capital, prazo } = formData;
  const principal = parseFloat(capital) || 0;
  const totalMonths = parseInt(prazo); // prazo já em meses
  const segMensal = mortgageResult.segurosMensais;

  let taxaAtual = 0;
  if (tipoTaxa === 'variavel') {
    taxaAtual = (parseFloat(euriborValue) || 0) + (parseFloat(spread) || 0);
  } else if (tipoTaxa === 'fixa') {
    taxaAtual = parseFloat(taxaFixa) || 0;
  } else if (tipoTaxa === 'mista') {
    // stress test sobre a taxa variável da fase 2
    taxaAtual = (parseFloat(euriborValue) || 0) + (parseFloat(spread) || 0);
  }

  const taxaStress = taxaAtual + STRESS_TEST_ADDON;
  const prestacaoStress = calcMonthlyPayment(principal, taxaStress, totalMonths);
  const prestacaoTotalStress = prestacaoStress + segMensal;
  const taxaEsforcoStress = (prestacaoTotalStress / rendimentoTotal) * 100;

  // Prestação máxima admissível a 35%
  const prestacaoMaxima35pct = rendimentoTotal * (TAXA_ESFORCO_LIMITE / 100);

  // Rendimento mínimo necessário para este crédito (a 35%)
  const rendimentoMinimo = prestacaoTotal / (TAXA_ESFORCO_LIMITE / 100);

  return {
    rendimentoTotal: Math.round(rendimentoTotal * 100) / 100,
    prestacaoTotal: Math.round(prestacaoTotal * 100) / 100,
    taxaEsforco: Math.round(taxaEsforco * 10) / 10,
    taxaEsforcoStress: Math.round(taxaEsforcoStress * 10) / 10,
    prestacaoStress: Math.round(prestacaoTotalStress * 100) / 100,
    taxaStress: Math.round(taxaStress * 100) / 100,
    prestacaoMaxima35pct: Math.round(prestacaoMaxima35pct * 100) / 100,
    rendimentoMinimo: Math.round(rendimentoMinimo * 100) / 100,
    semaforo: getSemaforo(taxaEsforco),
    semaforoStress: getSemaforo(taxaEsforcoStress),
  };
}
