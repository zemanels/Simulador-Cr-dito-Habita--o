import { PRAZO_MIN, PRAZO_MAX } from '../constants/defaults';

export function validateMortgageForm(data) {
  const errors = {};

  const capital = parseFloat(data.capital);
  if (!data.capital || isNaN(capital) || capital <= 0) {
    errors.capital = 'Capital inválido';
  }

  const valorImovel = parseFloat(data.valorImovel);
  if (data.valorImovel && !isNaN(valorImovel) && valorImovel > 0) {
    if (capital > valorImovel) {
      errors.capital = 'Capital não pode ser superior ao valor do imóvel';
    }
    const ltv = (capital / valorImovel) * 100;
    if (ltv > 90) {
      errors.valorImovel = `LTV de ${ltv.toFixed(1)}% excede o limite de 90% (máximo habitual)`;
    }
  }

  const prazo = parseInt(data.prazo);
  if (!data.prazo || isNaN(prazo) || prazo < PRAZO_MIN || prazo > PRAZO_MAX) {
    errors.prazo = `Prazo deve ser entre ${PRAZO_MIN} e ${PRAZO_MAX} meses`;
  }

  if (data.tipoTaxa === 'variavel' || data.tipoTaxa === 'mista') {
    const euribor = parseFloat(data.euriborValue);
    if (!data.euriborValue || isNaN(euribor) || euribor < -5 || euribor > 15) {
      errors.euriborValue = 'Valor Euribor inválido';
    }
    const spread = parseFloat(data.spread);
    if (!data.spread || isNaN(spread) || spread < 0 || spread > 10) {
      errors.spread = 'Spread inválido';
    }
  }

  if (data.tipoTaxa === 'fixa' || data.tipoTaxa === 'mista') {
    const taxaFixa = parseFloat(data.taxaFixa);
    if (!data.taxaFixa || isNaN(taxaFixa) || taxaFixa <= 0 || taxaFixa > 20) {
      errors.taxaFixa = 'Taxa fixa inválida';
    }
  }

  if (data.tipoTaxa === 'mista') {
    const periodoFixo = parseInt(data.periodoFixo);
    const totalMonths = parseInt(data.prazo); // prazo já em meses
    if (!data.periodoFixo || isNaN(periodoFixo) || periodoFixo <= 0 || periodoFixo >= totalMonths) {
      errors.periodoFixo = 'Período fixo inválido (deve ser inferior ao prazo total)';
    }
  }

  return errors;
}

export function isFormValid(data) {
  return Object.keys(validateMortgageForm(data)).length === 0;
}

function validateRateFields(data, prefix, errors) {
  const tipoTaxa = data[`tipoTaxa${prefix}`];
  if (tipoTaxa === 'variavel' || tipoTaxa === 'mista') {
    const euribor = parseFloat(data[`euriborValue${prefix}`]);
    if (!data[`euriborValue${prefix}`] || isNaN(euribor) || euribor < -5 || euribor > 15)
      errors[`euriborValue${prefix}`] = 'Valor Euribor inválido';
    const spread = parseFloat(data[`spread${prefix}`]);
    if (!data[`spread${prefix}`] || isNaN(spread) || spread < 0 || spread > 10)
      errors[`spread${prefix}`] = 'Spread inválido';
  }
  if (tipoTaxa === 'fixa' || tipoTaxa === 'mista') {
    const taxa = parseFloat(data[`taxaFixa${prefix}`]);
    if (!data[`taxaFixa${prefix}`] || isNaN(taxa) || taxa <= 0 || taxa > 20)
      errors[`taxaFixa${prefix}`] = 'Taxa fixa inválida';
  }
  if (tipoTaxa === 'mista') {
    const periodo = parseInt(data[`periodoFixo${prefix}`]);
    if (!data[`periodoFixo${prefix}`] || isNaN(periodo) || periodo <= 0)
      errors[`periodoFixo${prefix}`] = 'Período fixo inválido';
  }
}

export function validateModificationForm(data) {
  const errors = {};

  // Passo 1 — estado atual do crédito
  if (data.inputMethod === 'direct') {
    const capital = parseFloat(data.capitalEmDivida);
    if (!data.capitalEmDivida || isNaN(capital) || capital <= 0)
      errors.capitalEmDivida = 'Capital em dívida inválido';
    const prazo = parseInt(data.prazoRestanteMeses);
    if (!data.prazoRestanteMeses || isNaN(prazo) || prazo < 1 || prazo > 480)
      errors.prazoRestanteMeses = 'Prazo restante inválido (1–480 meses)';
  } else {
    const capital = parseFloat(data.capitalOriginal);
    if (!data.capitalOriginal || isNaN(capital) || capital <= 0)
      errors.capitalOriginal = 'Capital original inválido';
    if (!data.dataInicioOriginal) {
      errors.dataInicioOriginal = 'Data de início obrigatória';
    } else {
      const [y, m] = data.dataInicioOriginal.split('-').map(Number);
      const now = new Date();
      if (y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1))
        errors.dataInicioOriginal = 'Data deve ser anterior ao mês atual';
    }
  }

  // Condições atuais (taxa) — sempre obrigatórias
  validateRateFields(data, 'Original', errors);

  // Passo 2 — modificação
  if (data.tipoModificacao === 'spread') {
    const spread = parseFloat(data.spreadNovo);
    if (!data.spreadNovo || isNaN(spread) || spread < 0 || spread > 10)
      errors.spreadNovo = 'Novo spread inválido';
    const euribor = parseFloat(data.euriborValueNova);
    if (!data.euriborValueNova || isNaN(euribor) || euribor < -5 || euribor > 15)
      errors.euriborValueNova = 'Valor Euribor inválido';
  }

  if (data.tipoModificacao === 'transferencia') {
    validateRateFields(data, 'Nova', errors);
    const custos = parseFloat(data.custosTransferencia);
    if (data.custosTransferencia && (isNaN(custos) || custos < 0))
      errors.custosTransferencia = 'Custos de transferência inválidos';
  }

  if (data.tipoModificacao === 'amortizacao') {
    const montante = parseFloat(data.montanteAmortizacao);
    const capital = parseFloat(data.capitalEmDivida || data.capitalOriginal);
    if (!data.montanteAmortizacao || isNaN(montante) || montante <= 0)
      errors.montanteAmortizacao = 'Montante inválido';
    else if (capital > 0 && montante >= capital)
      errors.montanteAmortizacao = 'Montante deve ser inferior ao capital em dívida';
    const comissao = parseFloat(data.comissaoAmortizacao);
    if (isNaN(comissao) || comissao < 0 || comissao > 5)
      errors.comissaoAmortizacao = 'Comissão inválida (0%–5%)';
  }

  if (data.tipoModificacao === 'prazo') {
    const novoPrazo = parseInt(data.novoPrazoMeses);
    if (!data.novoPrazoMeses || isNaN(novoPrazo) || novoPrazo < 1 || novoPrazo > 480)
      errors.novoPrazoMeses = 'Novo prazo inválido (1–480 meses)';
  }

  return errors;
}
