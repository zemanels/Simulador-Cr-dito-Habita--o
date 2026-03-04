import { useMemo } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import FormField from '../inputs/FormField';
import RateTypeSelector from '../inputs/RateTypeSelector';
import EuriborSelector from '../inputs/EuriborSelector';
import { calcMortgage } from '../../utils/mortgageCalculations';
import { formatCurrency } from '../../utils/formatters';

function RateFieldsOriginal({ formData, errors, onChange }) {
  const showEuribor = formData.tipoTaxaOriginal === 'variavel' || formData.tipoTaxaOriginal === 'mista';
  const showFixa = formData.tipoTaxaOriginal === 'fixa' || formData.tipoTaxaOriginal === 'mista';

  return (
    <div className="space-y-3">
      <RateTypeSelector
        value={formData.tipoTaxaOriginal}
        onChange={(_, v) => onChange('tipoTaxaOriginal', v)}
      />
      {showEuribor && (
        <>
          <EuriborSelector
            value={formData.euriborPeriodoOriginal}
            onChange={(_, v) => onChange('euriborPeriodoOriginal', v)}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Euribor atual"
              name="euriborValueOriginal"
              value={formData.euriborValueOriginal}
              onChange={onChange}
              error={errors?.euriborValueOriginal}
              placeholder="2.659"
              suffix="%"
              step={0.001}
            />
            <FormField
              label="Spread atual"
              name="spreadOriginal"
              value={formData.spreadOriginal}
              onChange={onChange}
              error={errors?.spreadOriginal}
              placeholder="1.5"
              suffix="%"
              step={0.01}
            />
          </div>
        </>
      )}
      {showFixa && (
        <FormField
          label={formData.tipoTaxaOriginal === 'mista' ? 'Taxa fixa (período inicial)' : 'Taxa fixa atual'}
          name="taxaFixaOriginal"
          value={formData.taxaFixaOriginal}
          onChange={onChange}
          error={errors?.taxaFixaOriginal}
          placeholder="3.5"
          suffix="%"
          step={0.01}
        />
      )}
      {formData.tipoTaxaOriginal === 'mista' && (
        <FormField
          label="Período fixo original"
          name="periodoFixoOriginal"
          value={formData.periodoFixoOriginal}
          onChange={onChange}
          error={errors?.periodoFixoOriginal}
          placeholder="60"
          suffix="meses"
          step={1}
        />
      )}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Seguro de vida"
          name="seguroVidaOriginal"
          value={formData.seguroVidaOriginal}
          onChange={onChange}
          placeholder="30"
          suffix="€/mês"
          step={1}
        />
        <FormField
          label="Seguro multirriscos"
          name="seguroMultirriscosOriginal"
          value={formData.seguroMultirriscosOriginal}
          onChange={onChange}
          placeholder="15"
          suffix="€/mês"
          step={1}
        />
      </div>
    </div>
  );
}

export default function CurrentLoanInput({ errors }) {
  const { state, dispatch } = useSimulator();
  const { modificationData: data } = state;

  const onChange = (field, value) => {
    dispatch({ type: 'UPDATE_MODIFICATION_FIELD', field, value });
  };

  const derivedState = useMemo(() => {
    if (data.inputMethod !== 'original') return null;
    if (!data.capitalOriginal || !data.dataInicioOriginal) return null;

    const [y, m] = data.dataInicioOriginal.split('-').map(Number);
    const now = new Date();
    if (y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1)) return null;

    const elapsedMonths = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
    if (elapsedMonths <= 0) return null;

    const testResult = calcMortgage({
      capital: data.capitalOriginal,
      valorImovel: '',
      prazo: '480',
      tipoTaxa: data.tipoTaxaOriginal,
      euriborValue: data.euriborValueOriginal,
      spread: data.spreadOriginal,
      taxaFixa: data.taxaFixaOriginal,
      periodoFixo: data.periodoFixoOriginal,
      seguroVida: '0',
      seguroMultirriscos: '0',
      dataInicio: data.dataInicioOriginal,
    });

    if (!testResult) return null;
    const idx = Math.min(elapsedMonths, testResult.totalMonths - 1);
    const row = testResult.amortizationTable[idx];
    return row ? { capitalEmDivida: row.balance, prazoRestante: testResult.totalMonths - idx } : null;
  }, [data.inputMethod, data.capitalOriginal, data.dataInicioOriginal, data.tipoTaxaOriginal, data.euriborValueOriginal, data.spreadOriginal, data.taxaFixaOriginal]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800">Crédito Atual</h2>
        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET_MODIFICATION' })}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
        >
          Limpar
        </button>
      </div>

      {/* Toggle método */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {[
          { value: 'direct', label: 'Introdução direta' },
          { value: 'original', label: 'A partir do original' },
        ].map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange('inputMethod', opt.value)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              data.inputMethod === opt.value
                ? 'bg-white text-bpi-primary shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {/* Método A — direto */}
        {data.inputMethod === 'direct' && (
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Capital em dívida"
              name="capitalEmDivida"
              value={data.capitalEmDivida}
              onChange={onChange}
              error={errors?.capitalEmDivida}
              placeholder="150 000"
              suffix="€"
              step={1}
              required
            />
            <FormField
              label="Prazo restante"
              name="prazoRestanteMeses"
              value={data.prazoRestanteMeses}
              onChange={onChange}
              error={errors?.prazoRestanteMeses}
              placeholder="240"
              suffix="meses"
              step={1}
              required
            />
          </div>
        )}

        {/* Método B — a partir do original */}
        {data.inputMethod === 'original' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Capital original"
                name="capitalOriginal"
                value={data.capitalOriginal}
                onChange={onChange}
                error={errors?.capitalOriginal}
                placeholder="200 000"
                suffix="€"
                step={1}
                required
              />
              <FormField
                label="Data de início"
                name="dataInicioOriginal"
                type="month"
                value={data.dataInicioOriginal}
                onChange={onChange}
                error={errors?.dataInicioOriginal}
                required
              />
            </div>
            {derivedState && (
              <div className="bg-bpi-light border border-bpi-medium/30 rounded-xl p-3 text-xs text-bpi-primary">
                <p className="font-bold mb-1">Estimativa calculada</p>
                <p>Capital em dívida: <strong>{formatCurrency(derivedState.capitalEmDivida)}</strong></p>
                <p>Prazo restante: <strong>{derivedState.prazoRestante} meses ({(derivedState.prazoRestante / 12).toFixed(1)} anos)</strong></p>
                <p className="text-bpi-primary/50 mt-1.5">Baseado em prazo de 40 anos.</p>
              </div>
            )}
          </div>
        )}

        {/* Condições atuais */}
        <div className="border-t border-gray-100 pt-3">
          <p className="section-label">Condições Atuais</p>
          <RateFieldsOriginal formData={data} errors={errors} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
