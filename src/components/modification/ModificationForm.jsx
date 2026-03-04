import { useState } from 'react';
import { useSimulator } from '../../context/SimulatorContext';
import { validateModificationForm } from '../../utils/validators';
import { MODIFICATION_TYPES } from '../../constants/defaults';
import FormField from '../inputs/FormField';
import RateTypeSelector from '../inputs/RateTypeSelector';
import EuriborSelector from '../inputs/EuriborSelector';

function SpreadFields({ data, errors, onChange }) {
  return (
    <div className="space-y-3">
      <EuriborSelector value={data.euriborPeriodoNovo} onChange={(_, v) => onChange('euriborPeriodoNovo', v)} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Novo valor Euribor" name="euriborValueNova" value={data.euriborValueNova} onChange={onChange} error={errors?.euriborValueNova} placeholder="2.659" suffix="%" step={0.001} required />
        <FormField label="Novo spread" name="spreadNovo" value={data.spreadNovo} onChange={onChange} error={errors?.spreadNovo} placeholder="0.9" suffix="%" step={0.01} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Seguro de vida (novo)" name="seguroVidaNovo" value={data.seguroVidaNovo} onChange={onChange} placeholder="Em branco = manter" suffix="€/mês" step={1} />
        <FormField label="Seguro multirriscos (novo)" name="seguroMultirriscosNovo" value={data.seguroMultirriscosNovo} onChange={onChange} placeholder="Em branco = manter" suffix="€/mês" step={1} />
      </div>
    </div>
  );
}

function TransferenciaFields({ data, errors, onChange }) {
  const showEuribor = data.tipoTaxaNova === 'variavel' || data.tipoTaxaNova === 'mista';
  const showFixa = data.tipoTaxaNova === 'fixa' || data.tipoTaxaNova === 'mista';

  return (
    <div className="space-y-3">
      <RateTypeSelector value={data.tipoTaxaNova} onChange={(_, v) => onChange('tipoTaxaNova', v)} />
      {showEuribor && (
        <>
          <EuriborSelector value={data.euriborPeriodoNovo} onChange={(_, v) => onChange('euriborPeriodoNovo', v)} />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Euribor (novo banco)" name="euriborValueNova" value={data.euriborValueNova} onChange={onChange} error={errors?.euriborValueNova} placeholder="2.659" suffix="%" step={0.001} required />
            <FormField label="Spread (novo banco)" name="spreadNovo" value={data.spreadNovo} onChange={onChange} error={errors?.spreadNovo} placeholder="0.8" suffix="%" step={0.01} required />
          </div>
        </>
      )}
      {showFixa && (
        <div className={data.tipoTaxaNova === 'mista' ? 'grid grid-cols-2 gap-3' : ''}>
          <FormField label="Taxa fixa (novo banco)" name="taxaFixaNova" value={data.taxaFixaNova} onChange={onChange} error={errors?.taxaFixaNova} placeholder="3.2" suffix="%" step={0.01} required />
          {data.tipoTaxaNova === 'mista' && (
            <FormField label="Período fixo" name="periodoFixoNovo" value={data.periodoFixoNovo} onChange={onChange} error={errors?.periodoFixoNovo} placeholder="60" suffix="meses" step={1} required />
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Seguro de vida (novo)" name="seguroVidaNovo" value={data.seguroVidaNovo} onChange={onChange} placeholder="Em branco = manter" suffix="€/mês" step={1} />
        <FormField label="Seguro multirriscos (novo)" name="seguroMultirriscosNovo" value={data.seguroMultirriscosNovo} onChange={onChange} placeholder="Em branco = manter" suffix="€/mês" step={1} />
      </div>
      <FormField
        label="Custos de transferência"
        name="custosTransferencia"
        value={data.custosTransferencia}
        onChange={onChange}
        error={errors?.custosTransferencia}
        placeholder="2500"
        suffix="€"
        step={100}
        hint="Escritura, registo predial, comissão de abertura, etc."
      />
    </div>
  );
}

function AmortizacaoFields({ data, errors, onChange }) {
  return (
    <div className="space-y-3">
      <FormField
        label="Montante a amortizar"
        name="montanteAmortizacao"
        value={data.montanteAmortizacao}
        onChange={onChange}
        error={errors?.montanteAmortizacao}
        placeholder="10 000"
        suffix="€"
        step={1}
        required
      />
      <FormField
        label="Comissão de amortização"
        name="comissaoAmortizacao"
        value={data.comissaoAmortizacao}
        onChange={onChange}
        error={errors?.comissaoAmortizacao}
        suffix="%"
        step={0.1}
        hint="0.5% (taxa variável) · 2% (taxa fixa) — limites legais BdP"
      />
      <div>
        <label className="input-label">Objetivo da amortização</label>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { value: 'prestacao', label: 'Reduzir prestação', hint: 'Manter prazo' },
            { value: 'prazo', label: 'Reduzir prazo', hint: 'Manter prestação' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('opcaoAmortizacao', opt.value)}
              className={`flex-1 py-2.5 px-2 rounded-lg text-center transition-all duration-200 ${
                data.opcaoAmortizacao === opt.value
                  ? 'bg-white text-bpi-primary shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <p className="text-xs font-semibold">{opt.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{opt.hint}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrazoFields({ data, errors, onChange }) {
  const meses = parseInt(data.novoPrazoMeses);
  return (
    <FormField
      label="Novo prazo restante"
      name="novoPrazoMeses"
      value={data.novoPrazoMeses}
      onChange={onChange}
      error={errors?.novoPrazoMeses}
      placeholder="180"
      suffix="meses"
      step={1}
      hint={meses && !isNaN(meses) ? `≈ ${(meses / 12).toFixed(1)} anos · Pode reduzir ou alargar` : 'Pode reduzir ou alargar o prazo atual'}
      required
    />
  );
}

export default function ModificationForm() {
  const { state, dispatch } = useSimulator();
  const [errors, setErrors] = useState({});
  const data = state.modificationData;

  const onChange = (field, value) => {
    dispatch({ type: 'UPDATE_MODIFICATION_FIELD', field, value });
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateModificationForm(data);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    dispatch({ type: 'RUN_MODIFICATION' });
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-base font-bold text-gray-800 mb-4">Tipo de Modificação</h2>

      {/* Seletor 2×2 */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {MODIFICATION_TYPES.map(type => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange('tipoModificacao', type.value)}
            className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
              data.tipoModificacao === type.value
                ? 'border-bpi-medium bg-bpi-light'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="text-lg mb-1">{type.icon}</div>
            <p className={`text-xs font-bold leading-tight ${data.tipoModificacao === type.value ? 'text-bpi-primary' : 'text-gray-700'}`}>
              {type.label}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{type.desc}</p>
          </button>
        ))}
      </div>

      {/* Campos específicos */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        {data.tipoModificacao === 'spread' && <SpreadFields data={data} errors={errors} onChange={onChange} />}
        {data.tipoModificacao === 'transferencia' && <TransferenciaFields data={data} errors={errors} onChange={onChange} />}
        {data.tipoModificacao === 'amortizacao' && <AmortizacaoFields data={data} errors={errors} onChange={onChange} />}
        {data.tipoModificacao === 'prazo' && <PrazoFields data={data} errors={errors} onChange={onChange} />}
      </div>

      <button type="submit" className="btn-primary w-full mt-5">
        Calcular Modificação
      </button>
    </form>
  );
}
