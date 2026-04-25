import { useEffect, useRef, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart
} from 'recharts';

const formatAxisDate = (value) => {
  if (!value || typeof value !== 'string') return '';

  if (value.includes(' até ') || value.includes(' a ')) {
    return value;
  }

  if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) {
    const [year, month, day] = value.split('T')[0].split('-');
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year.slice(-2)}`;
  }

  if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    if (!day || !month || !year) return value;
    return `${day}/${month}/${year.slice(-2)}`;
  }

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

const tooltipSeriesConfig = {
  peso: { label: 'Peso', unit: ' kg' },
  sono: { label: 'Sono', unit: ' h' },
  humor: { label: 'Humor', suffix: '/5' },
  energia: { label: 'Energia', suffix: '/5' },
  produtividade: { label: 'Produtividade', suffix: '/5' },
  bemEstar: { label: 'Bem-estar', suffix: '/5' },
  value: { label: 'Valor' }
};

const formatTooltipNumber = (value) => {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value ?? '');
  }

  return numericValue.toLocaleString('pt-BR', {
    minimumFractionDigits: Number.isInteger(numericValue) ? 0 : 1,
    maximumFractionDigits: 1
  });
};

const formatTooltipSeriesLabel = (name) => {
  if (tooltipSeriesConfig[name]?.label) {
    return tooltipSeriesConfig[name].label;
  }

  const normalizedName = String(name ?? '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();

  if (!normalizedName) return 'Valor';

  return normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
};

const formatTooltipSeriesValue = (name, value) => {
  const config = tooltipSeriesConfig[name] || {};
  const formattedNumber = formatTooltipNumber(value);

  return `${formattedNumber}${config.unit || ''}${config.suffix || ''}`;
};

const formatTooltipEntry = (value, name) => [
  formatTooltipSeriesValue(name, value),
  formatTooltipSeriesLabel(name)
];

function useElementWidth() {
  const elementRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const updateWidth = () => {
      setWidth(Math.round(element.getBoundingClientRect().width));
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect?.width;
      if (nextWidth) {
        setWidth(Math.round(nextWidth));
      } else {
        updateWidth();
      }
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [elementRef, width];
}

export function ChartsContainer({
  type,
  data,
  radarData,
  weightDataForChart,
  analysisHabitsSubtitle,
  analysisSleepSubtitle,
  analysisWeightSubtitle
}) {
  const [chartRenderState, setChartRenderState] = useState({ type: null, ready: false });
  const [weightChartRef, weightChartWidth] = useElementWidth();
  const [wellbeingChartRef, wellbeingChartWidth] = useElementWidth();
  const [sleepChartRef, sleepChartWidth] = useElementWidth();
  const isChartReady = chartRenderState.ready && chartRenderState.type === type;
  const analysisChartMargin = { top: 12, right: 18, left: 0, bottom: 28 };
  const analysisXAxisBaseProps = {
    stroke: 'var(--text-main)',
    tickFormatter: formatAxisDate,
    tickMargin: 10,
    padding: { left: 12, right: 12 }
  };
  const getAnalysisXAxisProps = (items, chartWidth) => {
    const safeWidth = chartWidth || 720;
    const estimatedTickWidth = 64;
    const maxVisibleTicks = Math.max(2, Math.floor((safeWidth - 36) / estimatedTickWidth));
    const shouldShowAllTicks = items.length > 0 && items.length <= maxVisibleTicks;
    const interval = shouldShowAllTicks
      ? 0
      : Math.max(1, Math.ceil(items.length / maxVisibleTicks) - 1);

    return {
      ...analysisXAxisBaseProps,
      height: 42,
      interval,
      minTickGap: shouldShowAllTicks ? 0 : 12,
      tick: { fill: 'var(--text-main)', fontSize: shouldShowAllTicks ? 10 : 10 }
    };
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setChartRenderState({ type, ready: true });
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
                formatter={formatTooltipEntry}
                contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="humor" stroke="var(--accent-purple)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="energia" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="produtividade" stroke="#2ecc71" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === 'analise') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
        <div ref={weightChartRef} className="glass-panel" style={{ height: '500px', minWidth: 0 }}>
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
                <XAxis dataKey="data" {...getAnalysisXAxisProps(weightDataForChart, weightChartWidth)} />
                <YAxis domain={['dataMin - 3', 'dataMax + 3']} stroke="var(--text-main)" />
                <RechartsTooltip
                  labelFormatter={(label, payload) => formatTooltipDate(payload?.[0]?.payload?.fullDate ?? label)}
                  formatter={formatTooltipEntry}
                  contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--accent-cyan)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="peso" stroke="var(--accent-cyan)" strokeWidth={4} fillOpacity={1} fill="url(#colorPeso)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div ref={wellbeingChartRef} className="glass-panel" style={{ height: '500px', minWidth: 0 }}>
          <div className="chart-panel-header">
            <div>
              <h4 style={{ color: 'var(--text-main)' }}>Humor, Energia, Produtividade e Bem-estar</h4>
              <p className="chart-panel-subtitle">{analysisHabitsSubtitle}</p>
            </div>
          </div>
          {data.length === 0 ? (
            <div className="chart-empty-state">
              <strong>Sem registros suficientes nesse recorte</strong>
              <p>Ajuste o período ou registre novos dias para ver a evolução do bem-estar.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420} minWidth={0}>
              <ComposedChart data={data} margin={analysisChartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="data" {...getAnalysisXAxisProps(data, wellbeingChartWidth)} />
                <YAxis stroke="var(--text-main)" domain={[0, 5]} />
                <RechartsTooltip
                  labelFormatter={(label, payload) => formatTooltipDate(payload?.[0]?.payload?.fullDate ?? label)}
                  formatter={formatTooltipEntry}
                  contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="humor" stroke="var(--accent-purple)" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="energia" stroke="var(--accent-cyan)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="produtividade" stroke="#2ecc71" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="bemEstar" stroke="#f1c40f" strokeWidth={3.5} strokeDasharray="6 6" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div ref={sleepChartRef} className="glass-panel" style={{ height: '500px', minWidth: 0 }}>
          <div className="chart-panel-header">
            <div>
              <h4 style={{ color: 'var(--text-main)' }}>Sono por Período</h4>
              <p className="chart-panel-subtitle">{analysisSleepSubtitle}</p>
            </div>
          </div>
          {data.length === 0 ? (
            <div className="chart-empty-state">
              <strong>Sem registros suficientes nesse recorte</strong>
              <p>Ajuste o período ou registre novos dias para acompanhar o sono ao longo do tempo.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420} minWidth={0}>
              <AreaChart data={data} margin={analysisChartMargin}>
                <defs>
                  <linearGradient id="colorSonoAnalise" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan-dim)" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="var(--accent-cyan-dim)" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="data" {...getAnalysisXAxisProps(data, sleepChartWidth)} />
                <YAxis stroke="var(--text-main)" />
                <RechartsTooltip
                  labelFormatter={(label, payload) => formatTooltipDate(payload?.[0]?.payload?.fullDate ?? label)}
                  formatter={formatTooltipEntry}
                  contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="sono" stroke="var(--accent-cyan-dim)" strokeWidth={3} fillOpacity={1} fill="url(#colorSonoAnalise)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  return null;
}
