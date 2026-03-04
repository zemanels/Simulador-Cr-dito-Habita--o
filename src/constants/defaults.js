export const DEFAULT_FORM = {
  capital: '',
  valorImovel: '',
  prazo: 360,
  tipoTaxa: 'variavel',
  euriborPeriodo: '12m',
  euriborValue: '',
  spread: '',
  taxaFixa: '',
  periodoFixo: '',
  seguroVida: '',
  seguroMultirriscos: '',
  dataInicio: new Date().toISOString().slice(0, 7), // YYYY-MM
};

export const DEFAULT_AFFORDABILITY = {
  rendimentoTitular1: '',
  rendimentoTitular2: '',
};

export const PRAZO_MIN = 60;   // 5 anos em meses
export const PRAZO_MAX = 480;  // 40 anos em meses
export const LTV_MAX = 90;

export const EURIBOR_OPTIONS = [
  { value: '3m', label: 'Euribor 3M' },
  { value: '6m', label: 'Euribor 6M' },
  { value: '12m', label: 'Euribor 12M' },
];

export const TAXA_OPTIONS = [
  { value: 'variavel', label: 'Taxa Variável' },
  { value: 'fixa', label: 'Taxa Fixa' },
  { value: 'mista', label: 'Taxa Mista' },
];

export const STRESS_TEST_ADDON = 3; // +3pp conforme BdP
export const TAXA_ESFORCO_LIMITE = 35; // % limite recomendado BdP
export const TAXA_ESFORCO_MAXIMO = 50; // % limite máximo

export const DEFAULT_MODIFICATION = {
  inputMethod: 'direct',         // 'direct' | 'original'
  // Método A — estado atual direto
  capitalEmDivida: '',
  prazoRestanteMeses: '',
  // Método B — a partir do crédito original
  capitalOriginal: '',
  dataInicioOriginal: '',
  // Condições atuais (ambos os métodos)
  tipoTaxaOriginal: 'variavel',
  euriborPeriodoOriginal: '12m',
  euriborValueOriginal: '',
  spreadOriginal: '',
  taxaFixaOriginal: '',
  periodoFixoOriginal: '',
  seguroVidaOriginal: '',
  seguroMultirriscosOriginal: '',
  // Tipo de modificação
  tipoModificacao: 'spread',     // 'spread' | 'transferencia' | 'amortizacao' | 'prazo'
  // Novas condições (spread / transferencia)
  tipoTaxaNova: 'variavel',
  euriborPeriodoNovo: '12m',
  euriborValueNova: '',
  spreadNovo: '',
  taxaFixaNova: '',
  periodoFixoNovo: '',
  seguroVidaNovo: '',
  seguroMultirriscosNovo: '',
  // Amortização antecipada parcial
  montanteAmortizacao: '',
  opcaoAmortizacao: 'prestacao',  // 'prestacao' | 'prazo'
  comissaoAmortizacao: '0.5',
  // Transferência de banco
  custosTransferencia: '',
  // Alteração de prazo
  novoPrazoMeses: '',
};

export const MODIFICATION_TYPES = [
  {
    value: 'spread',
    label: 'Renegociação de Spread',
    icon: '📉',
    desc: 'Negociar um spread mais baixo no banco atual',
  },
  {
    value: 'transferencia',
    label: 'Transferência de Banco',
    icon: '🏦',
    desc: 'Mover o crédito para outra instituição',
  },
  {
    value: 'amortizacao',
    label: 'Amortização Antecipada',
    icon: '💰',
    desc: 'Pagar um montante extra e reduzir prazo ou prestação',
  },
  {
    value: 'prazo',
    label: 'Alteração de Prazo',
    icon: '📅',
    desc: 'Reduzir ou alargar o prazo restante',
  },
];
