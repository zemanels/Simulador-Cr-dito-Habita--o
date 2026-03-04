import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">Ano {label}</p>
      {payload.map(entry => (
        <p key={entry.dataKey} style={{ color: entry.stroke }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function BalanceChart({ table, scenarios }) {
  // Modo comparação: recebe scenarios[] com { label, table }
  // Modo simulação: recebe table direto
  const data = useMemo(() => {
    if (scenarios?.length) {
      // Constrói por ano para cada cenário
      const maxMonths = Math.max(...scenarios.map(s => s.table?.length || 0));
      const years = Math.ceil(maxMonths / 12);
      return Array.from({ length: years + 1 }, (_, i) => {
        const year = i;
        const entry = { year };
        scenarios.forEach(s => {
          const monthIdx = Math.min(year * 12, (s.table?.length || 0)) - 1;
          entry[s.label] = monthIdx >= 0 ? s.table[monthIdx].balance : (s.table?.[0]?.balance + s.table?.[0]?.amortization) || 0;
        });
        return entry;
      });
    }
    if (!table?.length) return [];
    // Ponto inicial
    const initialBalance = table[0].balance + table[0].amortization;
    const byYear = [{ year: 0, capital: Math.round(initialBalance) }];
    table.forEach(row => {
      const year = Math.ceil(row.month / 12);
      if (!byYear[year]) byYear[year] = { year, capital: Math.round(row.balance) };
      else byYear[year].capital = Math.round(row.balance);
    });
    return byYear;
  }, [table, scenarios]);

  if (!data.length) return null;

  const COLORS = ['#003087', '#e30613', '#0055A5', '#16a34a'];

  if (scenarios?.length) {
    return (
      <div className="card">
        <h3 className="text-sm font-bold text-gray-800 mb-4">
          Capital em Dívida — Comparação de Cenários
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tickFormatter={v => `Ano ${v}`} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} tick={{ fontSize: 11, fill: '#9ca3af' }} width={55} />
            <Tooltip content={<CustomTooltip />} />
            {scenarios.map((s, i) => (
              <Line
                key={s.label}
                type="monotone"
                dataKey={s.label}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                name={s.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-bold text-gray-800 mb-4">
        Evolução do Capital em Dívida
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="year" tickFormatter={v => `Ano ${v}`} tick={{ fontSize: 11, fill: '#9ca3af' }} interval="preserveStartEnd" />
          <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} tick={{ fontSize: 11, fill: '#9ca3af' }} width={55} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#e5e7eb" />
          <Line type="monotone" dataKey="capital" stroke="#003087" strokeWidth={2.5} dot={false} name="Capital em dívida" activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
