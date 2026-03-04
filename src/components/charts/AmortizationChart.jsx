import { useMemo } from 'react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-2">Ano {label}</p>
      {payload.map(entry => (
        <p key={entry.dataKey} style={{ color: entry.fill }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function AmortizationChart({ table }) {
  // Agrega por ano para melhor legibilidade
  const data = useMemo(() => {
    if (!table?.length) return [];
    const byYear = {};
    table.forEach(row => {
      const year = Math.ceil(row.month / 12);
      if (!byYear[year]) byYear[year] = { year, amortizacao: 0, juros: 0 };
      byYear[year].amortizacao += row.amortization;
      byYear[year].juros += row.interest;
    });
    return Object.values(byYear).map(y => ({
      ...y,
      amortizacao: Math.round(y.amortizacao),
      juros: Math.round(y.juros),
    }));
  }, [table]);

  if (!data.length) return null;

  return (
    <div className="card">
      <h3 className="text-sm font-bold text-gray-800 mb-4">
        Capital vs Juros por Ano
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="year"
            tickFormatter={v => `Ano ${v}`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="square"
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="amortizacao" name="Amortização" stackId="a" fill="#003087" radius={[0, 0, 0, 0]} />
          <Bar dataKey="juros" name="Juros" stackId="a" fill="#e30613" radius={[3, 3, 0, 0]} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
