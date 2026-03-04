import FormField from './FormField';
import RateTypeSelector from './RateTypeSelector';
import EuriborSelector from './EuriborSelector';

/**
 * Campos partilhados entre SimulationForm e ScenarioForm.
 */
export default function MortgageFormFields({ formData, errors, onChange }) {
  const showEuribor = formData.tipoTaxa === 'variavel' || formData.tipoTaxa === 'mista';
  const showFixa = formData.tipoTaxa === 'fixa' || formData.tipoTaxa === 'mista';
  const showPeriodoFixo = formData.tipoTaxa === 'mista';
  const prazoMeses = parseInt(formData.prazo);

  return (
    <div className="space-y-4">
      {/* Capital e Imóvel */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Capital a financiar"
          name="capital"
          value={formData.capital}
          onChange={onChange}
          error={errors?.capital}
          placeholder="200 000"
          suffix="€"
          min={0}
          step={1}
          required
        />
        <FormField
          label="Valor do imóvel"
          name="valorImovel"
          value={formData.valorImovel}
          onChange={onChange}
          error={errors?.valorImovel}
          placeholder="250 000"
          suffix="€"
          min={0}
          step={1}
        />
      </div>

      {/* Prazo e Data */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Prazo"
          name="prazo"
          value={formData.prazo}
          onChange={onChange}
          error={errors?.prazo}
          suffix="meses"
          min={60}
          max={480}
          step={1}
          hint={prazoMeses && !isNaN(prazoMeses) ? `≈ ${(prazoMeses / 12).toFixed(1)} anos` : undefined}
          required
        />
        <FormField
          label="Data de início"
          name="dataInicio"
          type="month"
          value={formData.dataInicio}
          onChange={onChange}
          hint="Mês/ano do 1.º pagamento"
        />
      </div>

      {/* Tipo de taxa */}
      <RateTypeSelector value={formData.tipoTaxa} onChange={onChange} />

      {/* Euribor */}
      {showEuribor && (
        <>
          <EuriborSelector value={formData.euriborPeriodo} onChange={onChange} />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Euribor atual"
              name="euriborValue"
              value={formData.euriborValue}
              onChange={onChange}
              error={errors?.euriborValue}
              placeholder="2.659"
              suffix="%"
              step={0.001}
              min={-5}
              max={15}
              required
            />
            <FormField
              label="Spread do banco"
              name="spread"
              value={formData.spread}
              onChange={onChange}
              error={errors?.spread}
              placeholder="1.0"
              suffix="%"
              step={0.01}
              min={0}
              max={10}
              required
            />
          </div>
        </>
      )}

      {/* Taxa fixa */}
      {showFixa && (
        <div className={showPeriodoFixo ? 'grid grid-cols-2 gap-3' : ''}>
          <FormField
            label={formData.tipoTaxa === 'mista' ? 'Taxa fixa (inicial)' : 'Taxa fixa'}
            name="taxaFixa"
            value={formData.taxaFixa}
            onChange={onChange}
            error={errors?.taxaFixa}
            placeholder="3.5"
            suffix="%"
            step={0.01}
            min={0}
            max={20}
            required
          />
          {showPeriodoFixo && (
            <FormField
              label="Duração período fixo"
              name="periodoFixo"
              value={formData.periodoFixo}
              onChange={onChange}
              error={errors?.periodoFixo}
              placeholder="60"
              suffix="meses"
              min={1}
              step={1}
              required
            />
          )}
        </div>
      )}

      {/* Seguros */}
      <div className="border-t border-gray-100 pt-4">
        <p className="section-label">Seguros Mensais</p>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Seguro de vida"
            name="seguroVida"
            value={formData.seguroVida}
            onChange={onChange}
            placeholder="30"
            suffix="€/mês"
            min={0}
            step={1}
          />
          <FormField
            label="Seguro multirriscos"
            name="seguroMultirriscos"
            value={formData.seguroMultirriscos}
            onChange={onChange}
            placeholder="15"
            suffix="€/mês"
            min={0}
            step={1}
          />
        </div>
      </div>
    </div>
  );
}
