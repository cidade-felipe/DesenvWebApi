import { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart
} from 'recharts';

const formatAxisDate = (value) => {
  if (!value || typeof value !== 'string') return '';

  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return String(value);
  return `${day}/${month}/${year.slice(-2)}`;
};

const formatTooltipDate = (value) => {
  if (!value) return '';

  const normalizedValue = String(value);

  if (normalizedValue.includes(' até ') || normalizedValue.includes(' a ')) {
    return normalizedValue;
  }

  if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(normalizedValue)) {
    const [year, month, day] = normalizedValue.split('T')[0].split('-');
    if (!year || !month || !day) return normalizedValue;
    return `${day}/${month}/${year}`;
  }

  if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(normalizedValue)) {
    const [day, month, year] = normalizedValue.split('/');
    if (!day || !month || !year) return normalizedValue;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${day}/${month}/${fullYear}`;
  }

  if (!normalizedValue.includes('/')) {
    return normalizedValue;
  }

  return normalizedValue;
};

export function ChartsContainer({
  type,
  data,
  radarData,
  weightDataForChart,
  analysisHabitsSubtitle,
  analysisWeightSubtitle
}) {
  const [isChartReady, setIsChartReady] = useState(false);
  const analysisChartMargin = { top: 12, right: 18, left: 0, bottom: 28 };
  const analysisXAxisProps = {
    stroke: 'var(--text-main)',
    tickFormatter: formatAxisDate,
    tickMargin: 10,
    minTickGap: 18,
    padding: { left: 12, right: 12 }
  };

  useEffect(() => {
    setIsChartReady(false);

    const frame = requestAnimationFrame(() => {
      setIsChartReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [type]);

  if (!isChartReady) {
    return (
      <div className="glass-panel" style={{ minHeight: '320px', width: '100%' }} />
    );
  }

  if (type === 'panorama') {
    return (
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '1.5rem', minWidth: 0 }}>
        <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', width: '100%', textAlign: 'left' }}>Polígono de Habilidades</h4>
          <ResponsiveContainer width="100%" height={320} minWidth={0}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-main)', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
              <Radar name="Suas Médias" dataKey="value" stroke="var(--accent-purple)" fill="var(--accent-purple)" fillOpacity={0.5} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--accent-purple)', borderRadius: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass-panel" style={{ height: '400px', minWidth: 0 }}>
          <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Tendência de Curto Prazo</h4>
          <ResponsiveContainer width="100%" height={300} minWidth={0}>
            <LineChart data={data.slice().reverse().slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="data" stroke="var(--text-main)" fontSize={11} tickFormatter={formatAxisDate} />
              <YAxis stroke="var(--text-main)" fontSize={11} />
              <RechartsTooltip
                labelFormatter={formatTooltipDate}
                contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
              />
              <Line type="step" dataKey="humor" stroke="var(--accent-purple)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="energia" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === 'analise') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
        <div className="glass-panel" style={{ height: '500px', minWidth: 0 }}>
          <div className="chart-panel-header">
            <div>
              <h4 style={{ color: 'var(--text-main)' }}>Evolução de Peso por Período</h4>
              <p className="chart-panel-subtitle">{analysisWeightSubtitle}</p>
            </div>
          </div>
          {weightDataForChart.length === 0 ? (
            <div className="chart-empty-state">
              <strong>Sem biometria suficiente nesse recorte</strong>
              <p>Registre peso no intervalo escolhido para acompanhar a evolução por período.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420} minWidth={0}>
              <AreaChart data={weightDataForChart} margin={analysisChartMargin}>
                <defs>
                  <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="data" {...analysisXAxisProps} />
                <YAxis domain={['dataMin - 3', 'dataMax + 3']} stroke="var(--text-main)" />
                <RechartsTooltip
                  labelFormatter={(label, payload) => formatTooltipDate(payload?.[0]?.payload?.fullDate ?? label)}
                  contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--accent-cyan)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="peso" stroke="var(--accent-cyan)" strokeWidth={4} fillOpacity={1} fill="url(#colorPeso)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-panel" style={{ height: '500px', minWidth: 0 }}>
          <div className="chart-panel-header">
            <div>
              <h4 style={{ color: 'var(--text-main)' }}>Humor, Sono e Energia por Período</h4>
              <p className="chart-panel-subtitle">{analysisHabitsSubtitle}</p>
            </div>
          </div>
          {data.length === 0 ? (
            <div className="chart-empty-state">
              <strong>Sem registros suficientes nesse recorte</strong>
              <p>Ajuste o período ou registre novos dias para ver a correlação entre os indicadores.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420} minWidth={0}>
              <ComposedChart data={data} margin={analysisChartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="data" {...analysisXAxisProps} />
                <YAxis stroke="var(--text-main)" />
                <RechartsTooltip
                  labelFormatter={(label, payload) => formatTooltipDate(payload?.[0]?.payload?.fullDate ?? label)}
                  contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="sono" fill="var(--accent-cyan-dim)" fillOpacity={0.1} stroke="var(--accent-cyan-dim)" strokeWidth={2} />
                <Line type="monotone" dataKey="humor" stroke="var(--accent-purple)" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="energia" stroke="#f1c40f" strokeWidth={2} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  return null;
}
