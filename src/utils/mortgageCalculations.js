import { addMonths } from './formatters';

/**
 * Calcula a prestação mensal usando amortização francesa.
 * @param {number} principal - Capital em dívida
 * @param {number} annualRatePct - Taxa anual em percentagem (ex: 4.5 para 4.5%)
 * @param {number} totalMonths - Número total de meses
 */
export function calcMonthlyPayment(principal, annualRatePct, totalMonths) {
  if (totalMonths <= 0 || principal <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) return principal / totalMonths;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));
}

/**
 * Constrói tabela de amortização para taxa variável ou fixa.
 */
function buildStandardTable(principal, annualRatePct, totalMonths, startDate) {
  const monthlyRate = annualRatePct / 100 / 12;
  const payment = calcMonthlyPayment(principal, annualRatePct, totalMonths);
  let balance = principal;
  const rows = [];

  for (let month = 1; month <= totalMonths; month++) {
    const interest = balance * monthlyRate;
    const amortization = payment - interest;
    balance = Math.max(0, balance - amortization);
    rows.push({
      month,
      date: addMonths(startDate, month - 1),
      payment: Math.round(payment * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      amortization: Math.round(amortization * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }
  return rows;
}

/**
 * Constrói tabela de amortização para taxa mista (2 fases).
 */
function buildMixedTable(principal, fixedRatePct, variableRatePct, fixedMonths, totalMonths, startDate) {
  const fixedMonthlyRate = fixedRatePct / 100 / 12;
  const varMonthlyRate = variableRatePct / 100 / 12;
  const paymentPhase1 = calcMonthlyPayment(principal, fixedRatePct, totalMonths);

  let balance = principal;
  const rows = [];

  // Fase 1 — taxa fixa
  for (let month = 1; month <= fixedMonths && month <= totalMonths; month++) {
    const interest = balance * fixedMonthlyRate;
    const amortization = paymentPhase1 - interest;
    balance = Math.max(0, balance - amortization);
    rows.push({
      month,
      date: addMonths(startDate, month - 1),
      payment: Math.round(paymentPhase1 * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      amortization: Math.round(amortization * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      fase: 1,
    });
  }

  if (fixedMonths >= totalMonths) return rows;

  // Fase 2 — taxa variável, recalcula prestação
  const remainingMonths = totalMonths - fixedMonths;
  const paymentPhase2 = calcMonthlyPayment(balance, variableRatePct, remainingMonths);

  for (let i = 1; i <= remainingMonths; i++) {
    const month = fixedMonths + i;
    const interest = balance * varMonthlyRate;
    const amortization = paymentPhase2 - interest;
    balance = Math.max(0, balance - amortization);
    rows.push({
      month,
      date: addMonths(startDate, month - 1),
      payment: Math.round(paymentPhase2 * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      amortization: Math.round(amortization * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      fase: 2,
    });
  }

  return rows;
}

/**
 * Calcula TAEG aproximada usando Newton-Raphson.
 * Inclui seguros nos cash flows.
 */
export function calcTAEG(principal, monthlyPayment, monthlyInsurances, totalMonths) {
  const totalMonthly = monthlyPayment + monthlyInsurances;
  if (totalMonthly <= 0 || principal <= 0) return 0;

  let r = 0.004; // estimativa inicial ~4.8% ao ano
  for (let i = 0; i < 2000; i++) {
    const pow = Math.pow(1 + r, -totalMonths);
    const f = totalMonthly * (1 - pow) / r - principal;
    const df = totalMonthly * (
      (-totalMonths * Math.pow(1 + r, -totalMonths - 1) * r - (1 - pow)) / (r * r)
    );
    if (Math.abs(df) < 1e-15) break;
    const rNew = r - f / df;
    if (Math.abs(rNew - r) < 1e-12) { r = rNew; break; }
    r = Math.max(rNew, 0.0001);
  }

  return (Math.pow(1 + r, 12) - 1) * 100;
}

/**
 * Calcula o novo prazo em meses para manter a mesma prestação após amortização.
 * Fórmula inversa da amortização francesa.
 */
function solveTermForPayment(principal, annualRatePct, targetPayment) {
  const r = annualRatePct / 100 / 12;
  if (r === 0) return Math.ceil(principal / targetPayment);
  const arg = 1 - (principal * r) / targetPayment;
  if (arg <= 0) return null; // prestação não cobre os juros
  return Math.ceil(-Math.log(arg) / Math.log(1 + r));
}

/**
 * Reconstrói estado atual a partir dos dados originais do crédito.
 * Conta meses decorridos desde dataInicioOriginal até hoje.
 */
function deriveCurrentLoanState(data) {
  const originalFormData = {
    capital: data.capitalOriginal,
    valorImovel: '',
    prazo: String(parseFloat(data.capitalOriginal) > 0 ? 480 : 0),
    tipoTaxa: data.tipoTaxaOriginal,
    euriborValue: data.euriborValueOriginal,
    spread: data.spreadOriginal,
    taxaFixa: data.taxaFixaOriginal,
    periodoFixo: data.periodoFixoOriginal,
    seguroVida: data.seguroVidaOriginal,
    seguroMultirriscos: data.seguroMultirriscosOriginal,
    dataInicio: data.dataInicioOriginal,
  };

  // Sem prazo original, usamos 480 meses (40 anos) como máximo
  const maxPrazoMeses = 480;
  originalFormData.prazo = String(maxPrazoMeses);

  const fullResult = calcMortgage(originalFormData);
  if (!fullResult) return null;

  const [oy, om] = data.dataInicioOriginal.split('-').map(Number);
  const now = new Date();
  const elapsedMonths = (now.getFullYear() - oy) * 12 + (now.getMonth() + 1 - om);
  const clamped = Math.max(0, Math.min(elapsedMonths, fullResult.totalMonths - 1));

  const row = fullResult.amortizationTable[clamped];
  return {
    capitalEmDivida: row ? row.balance : parseFloat(data.capitalOriginal),
    prazoRestanteMeses: fullResult.totalMonths - clamped,
  };
}

/**
 * Constrói formData para calcMortgage a partir do estado atual do crédito.
 * Aceita prazo em meses inteiros (não múltiplos de 12).
 */
function buildFormDataFromMonths(capital, totalMonths, rateFields, startDate) {
  return {
    capital: String(capital),
    valorImovel: '',
    prazo: String(totalMonths),
    tipoTaxa: rateFields.tipoTaxa,
    euriborValue: rateFields.euriborValue,
    spread: rateFields.spread,
    taxaFixa: rateFields.taxaFixa,
    periodoFixo: rateFields.periodoFixo,
    seguroVida: rateFields.seguroVida,
    seguroMultirriscos: rateFields.seguroMultirriscos,
    dataInicio: startDate || new Date().toISOString().slice(0, 7),
  };
}

/**
 * Função principal: calcula tudo para uma simulação.
 */
export function calcMortgage(formData) {
  const {
    capital, valorImovel, prazo, tipoTaxa,
    euriborValue, spread, taxaFixa, periodoFixo,
    seguroVida, seguroMultirriscos, dataInicio,
  } = formData;

  const principal = parseFloat(capital) || 0;
  const imovel = parseFloat(valorImovel) || 0;
  // prazo é agora sempre em meses; _totalMonths mantém compatibilidade interna
  const totalMonths = formData._totalMonths ? parseInt(formData._totalMonths) : parseInt(prazo);
  const segMensal = (parseFloat(seguroVida) || 0) + (parseFloat(seguroMultirriscos) || 0);

  if (principal <= 0 || totalMonths <= 0) return null;

  let amortizationTable = [];
  let annualRate = 0;
  let annualRatePhase2 = 0;

  if (tipoTaxa === 'variavel') {
    annualRate = (parseFloat(euriborValue) || 0) + (parseFloat(spread) || 0);
    amortizationTable = buildStandardTable(principal, annualRate, totalMonths, dataInicio);
  } else if (tipoTaxa === 'fixa') {
    annualRate = parseFloat(taxaFixa) || 0;
    amortizationTable = buildStandardTable(principal, annualRate, totalMonths, dataInicio);
  } else if (tipoTaxa === 'mista') {
    const fixedRate = parseFloat(taxaFixa) || 0;
    const varRate = (parseFloat(euriborValue) || 0) + (parseFloat(spread) || 0);
    const fixedMos = parseInt(periodoFixo) || 0;
    annualRate = fixedRate;
    annualRatePhase2 = varRate;
    amortizationTable = buildMixedTable(principal, fixedRate, varRate, fixedMos, totalMonths, dataInicio);
  }

  if (amortizationTable.length === 0) return null;

  const totalPaid = amortizationTable.reduce((sum, r) => sum + r.payment, 0);
  const totalInterest = amortizationTable.reduce((sum, r) => sum + r.interest, 0);
  const firstPayment = amortizationTable[0]?.payment || 0;
  const totalMensal = firstPayment + segMensal;
  const totalPaidComSeguros = totalPaid + segMensal * totalMonths;
  const taeg = calcTAEG(principal, firstPayment, segMensal, totalMonths);
  const ltv = imovel > 0 ? (principal / imovel) * 100 : null;

  // Prestação na fase 2 (taxa mista)
  const secondPhasePayment = tipoTaxa === 'mista'
    ? amortizationTable.find(r => r.fase === 2)?.payment || null
    : null;

  return {
    prestacaoMensal: Math.round(firstPayment * 100) / 100,
    prestacaoFase2: secondPhasePayment ? Math.round(secondPhasePayment * 100) / 100 : null,
    totalMensal: Math.round(totalMensal * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPaidComSeguros: Math.round(totalPaidComSeguros * 100) / 100,
    segurosMensais: Math.round(segMensal * 100) / 100,
    taeg: Math.round(taeg * 1000) / 1000,
    ltv: ltv ? Math.round(ltv * 10) / 10 : null,
    annualRate,
    annualRatePhase2: annualRatePhase2 || null,
    amortizationTable,
    capital: principal,
    totalMonths,
  };
}

/**
 * Calcula o impacto de uma modificação a um crédito existente.
 */
export function calcModification(data) {
  const today = new Date().toISOString().slice(0, 7);

  // Passo 1 — Resolver estado atual
  let capitalEmDivida, prazoRestanteMeses;
  if (data.inputMethod === 'original') {
    const derived = deriveCurrentLoanState(data);
    if (!derived) return null;
    capitalEmDivida = derived.capitalEmDivida;
    prazoRestanteMeses = derived.prazoRestanteMeses;
  } else {
    capitalEmDivida = parseFloat(data.capitalEmDivida) || 0;
    prazoRestanteMeses = parseInt(data.prazoRestanteMeses) || 0;
  }

  if (capitalEmDivida <= 0 || prazoRestanteMeses <= 0) return null;

  const currentRateFields = {
    tipoTaxa: data.tipoTaxaOriginal,
    euriborValue: data.euriborValueOriginal,
    spread: data.spreadOriginal,
    taxaFixa: data.taxaFixaOriginal,
    periodoFixo: data.periodoFixoOriginal,
    seguroVida: data.seguroVidaOriginal,
    seguroMultirriscos: data.seguroMultirriscosOriginal,
  };

  // Passo 2 — Cenário atual
  const currentFormData = buildFormDataFromMonths(capitalEmDivida, prazoRestanteMeses, currentRateFields, today);
  const currentResult = calcMortgage(currentFormData);
  if (!currentResult) return null;

  // Passo 3 — Cenário modificado
  let newResult = null;
  let breakEvenMonths = null;
  let penalty = 0;
  let montanteAmortizacao = 0;

  const { tipoModificacao } = data;

  if (tipoModificacao === 'spread') {
    const newRate = {
      tipoTaxa: 'variavel',
      euriborValue: data.euriborValueNova,
      spread: data.spreadNovo,
      taxaFixa: '',
      periodoFixo: '',
      seguroVida: data.seguroVidaNovo || data.seguroVidaOriginal,
      seguroMultirriscos: data.seguroMultirriscosNovo || data.seguroMultirriscosOriginal,
    };
    newResult = calcMortgage(buildFormDataFromMonths(capitalEmDivida, prazoRestanteMeses, newRate, today));

  } else if (tipoModificacao === 'transferencia') {
    const newRate = {
      tipoTaxa: data.tipoTaxaNova,
      euriborValue: data.euriborValueNova,
      spread: data.spreadNovo,
      taxaFixa: data.taxaFixaNova,
      periodoFixo: data.periodoFixoNovo,
      seguroVida: data.seguroVidaNovo || data.seguroVidaOriginal,
      seguroMultirriscos: data.seguroMultirriscosNovo || data.seguroMultirriscosOriginal,
    };
    newResult = calcMortgage(buildFormDataFromMonths(capitalEmDivida, prazoRestanteMeses, newRate, today));
    if (newResult) {
      const custos = parseFloat(data.custosTransferencia) || 0;
      const poupancaMensal = currentResult.totalMensal - newResult.totalMensal;
      breakEvenMonths = poupancaMensal > 0 ? custos / poupancaMensal : null;
    }

  } else if (tipoModificacao === 'amortizacao') {
    montanteAmortizacao = parseFloat(data.montanteAmortizacao) || 0;
    const comissao = parseFloat(data.comissaoAmortizacao) || 0;
    const newCapital = capitalEmDivida - montanteAmortizacao;
    if (newCapital <= 0) return null;

    // Comissão aplica-se ao montante amortizado
    penalty = Math.round(montanteAmortizacao * (comissao / 100) * 100) / 100;

    if (data.opcaoAmortizacao === 'prestacao') {
      // Mesmo prazo, menor prestação
      newResult = calcMortgage(buildFormDataFromMonths(newCapital, prazoRestanteMeses, currentRateFields, today));
    } else {
      // Mesmo pagamento, menor prazo — calcular novo prazo
      const currentAnnualRate = currentResult.annualRate;
      const newTermMonths = solveTermForPayment(newCapital, currentAnnualRate, currentResult.prestacaoMensal);
      if (!newTermMonths || newTermMonths <= 0) return null;
      newResult = calcMortgage(buildFormDataFromMonths(newCapital, newTermMonths, currentRateFields, today));
    }

    if (newResult) {
      const poupancaMensal = currentResult.totalMensal - newResult.totalMensal;
      const custosOperacao = montanteAmortizacao + penalty;
      breakEvenMonths = poupancaMensal > 0 ? custosOperacao / poupancaMensal : null;
    }

  } else if (tipoModificacao === 'prazo') {
    const novoPrazoMeses = parseInt(data.novoPrazoMeses) || 0;
    if (novoPrazoMeses <= 0) return null;
    newResult = calcMortgage(buildFormDataFromMonths(capitalEmDivida, novoPrazoMeses, currentRateFields, today));
  }

  if (!newResult) return null;

  // Passo 4 — Poupanças
  const poupancaJuros = Math.round((currentResult.totalInterest - newResult.totalInterest) * 100) / 100;
  const poupancaTotal = Math.round((currentResult.totalPaidComSeguros - newResult.totalPaidComSeguros) * 100) / 100;
  const diferencaPrestacao = Math.round((currentResult.prestacaoMensal - newResult.prestacaoMensal) * 100) / 100;

  return {
    currentResult,
    newResult,
    poupancaJuros,
    poupancaTotal,
    diferencaPrestacao,
    breakEvenMonths: breakEvenMonths ? Math.ceil(breakEvenMonths) : null,
    tipoModificacao,
    capitalEmDivida,
    prazoRestanteMeses,
    montanteAmortizacao: Math.round(montanteAmortizacao * 100) / 100,
    penalty,
  };
}
