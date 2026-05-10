import { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar
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

const getChartTimestamp = (value) => {
  const normalizedValue = String(value ?? '').split('T')[0];
  const date = new Date(`${normalizedValue}T00:00:00`);
  const time = date.getTime();

  return Number.isNaN(time) ? 0 : time;
};

const tooltipSeriesConfig = {
  peso: { label: 'Peso', unit: ' kg' },
  sono: { label: 'Sono', unit: ' h' },
  agua: { label: 'Hidratação', unit: ' L' },
  treinoDias: { label: 'Treino', unit: ' dia(s)' },
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

const wellbeingSeries = [
  { key: 'humor', label: 'Humor', color: 'var(--accent-purple)', suffix: '/5' },
  { key: 'energia', label: 'Energia', color: 'var(--accent-cyan)', suffix: '/5' },
  { key: 'produtividade', label: 'Produtividade', color: '#2ecc71', suffix: '/5' },
  { key: 'bemEstar', label: 'Bem-estar', color: '#f1c40f', suffix: '/5' }
];

const wellbeingCalculationHelp = 'Bem-estar = média de humor, energia e produtividade no período. Fórmula: (humor + energia + produtividade) / 3.';

const panoramaSeries = wellbeingSeries.filter((serie) => serie.key !== 'bemEstar');

const getLatestSeriesValue = (items, key) => {
  const latestItem = [...items]
    .reverse()
    .find((item) => item?.[key] !== null && item?.[key] !== undefined && item?.[key] !== '');

  return latestItem ? latestItem[key] : null;
};

const formatLatestSeriesValue = (items, serie) => {
  const latestValue = getLatestSeriesValue(items, serie.key);

  if (latestValue === null) return '—';

  return `${formatTooltipNumber(latestValue)}${serie.suffix ?? ''}`;
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
  analysisHydrationSubtitle,
  analysisTrainingSubtitle,
  analysisWeightSubtitle,
  panoramaWindowLabel = 'Últimos 7 dias'
}) {
  const [chartRenderState, setChartRenderState] = useState({ type: null, ready: false });
  const [panoramaTrendRef, panoramaTrendWidth] = useElementWidth();
  const [weightChartRef, weightChartWidth] = useElementWidth();
  const [wellbeingChartRef, wellbeingChartWidth] = useElementWidth();
  const [sleepChartRef, sleepChartWidth] = useElementWidth();
  const [hydrationChartRef, hydrationChartWidth] = useElementWidth();
  const [trainingChartRef, trainingChartWidth] = useElementWidth();
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
  const panoramaTrendData = [...(data ?? [])].sort((left, right) => getChartTimestamp(left.data) - getChartTimestamp(right.data));
  const hasPanoramaData = panoramaTrendData.length > 0;
  const renderSeparatedMetricLanes = (items, series, options = {}) => {
    const { compact = false, chartWidth = 720 } = options;
    const laneHeight = compact ? 58 : 66;

    return (
      <div className={`metric-lanes ${compact ? 'metric-lanes-compact' : ''}`}>
        {series.map((serie, index) => {
          const isLastLane = index === series.length - 1;
          const xAxisProps = getAnalysisXAxisProps(items, chartWidth);

          return (
            <div className="metric-lane" key={serie.key} style={{ '--series-color': serie.color }}>
              <div className="metric-lane-label">
                <span className="metric-lane-dot" aria-hidden="true" />
                <span className="metric-lane-name">{serie.label}</span>
                <strong>{formatLatestSeriesValue(items, serie)}</strong>
              </div>
              <div className="metric-lane-chart" style={{ height: `${laneHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={items} margin={{ top: 8, right: 12, left: -12, bottom: isLastLane ? 4 : 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="data"
                      {...xAxisProps}
                      height={isLastLane ? 24 : 6}
                      axisLine={isLastLane}
                      tickLine={isLastLane}
                      tick={isLastLane ? xAxisProps.tick : false}
                    />
                    <YAxis
                      domain={[0, 5]}
                      ticks={[1, 3, 5]}
                      width={30}
                      stroke="var(--text-main)"
                      tick={{ fill: 'var(--text-main)', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      labelFormatter={(label, payload) => formatTooltipDate(payload?.[0]?.payload?.fullDate ?? label)}
                      formatter={formatTooltipEntry}
                      contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey={serie.key}
                      stroke={serie.color}
                      strokeWidth={compact ? 2.4 : 2.8}
                      dot={{ r: compact ? 2.4 : 3, fill: 'var(--bg-color-alt)', stroke: serie.color, strokeWidth: 2 }}
                      activeDot={{ r: compact ? 4 : 5, fill: serie.color, stroke: 'var(--bg-color-alt)', strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    );
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
          <div style={{ width: '100%', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0, color: 'var(--text-main)', textAlign: 'left' }}>Polígono de Habilidades</h4>
            <p className="chart-panel-subtitle">Leitura concentrada nos {panoramaWindowLabel.toLowerCase()}.</p>
          </div>
          {radarData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-main)', fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                <Radar name="Suas Médias" dataKey="value" stroke="var(--accent-purple)" fill="var(--accent-purple)" fillOpacity={0.5} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--accent-purple)', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty-state" style={{ minHeight: '300px' }}>
              <strong>Sem registros recentes</strong>
              <p>Cadastre pelo menos um dia nos últimos 7 dias para montar o polígono.</p>
            </div>
          )}
        </div>
        
        <div ref={panoramaTrendRef} className="glass-panel" style={{ height: '400px', minWidth: 0 }}>
          <h4 style={{ marginBottom: '0.35rem', color: 'var(--text-main)' }}>Tendência de Curto Prazo</h4>
          <p className="chart-panel-subtitle" style={{ marginBottom: '1.1rem' }}>Humor, energia e produtividade em faixas separadas nos {panoramaWindowLabel.toLowerCase()}.</p>
          {hasPanoramaData ? (
            renderSeparatedMetricLanes(panoramaTrendData, panoramaSeries, { compact: true, chartWidth: panoramaTrendWidth })
          ) : (
            <div className="chart-empty-state" style={{ minHeight: '280px' }}>
              <strong>Sem tendência recente</strong>
              <p>Registre novos dias para visualizar a evolução de curto prazo.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'analise') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
        <div ref={wellbeingChartRef} className="glass-panel" style={{ height: '500px', minWidth: 0 }}>
          <div className="chart-panel-header">
            <div>
              <div className="chart-title-row">
                <h4 style={{ color: 'var(--text-main)' }}>Humor, Energia, Produtividade e Bem-estar</h4>
                <button type="button" className="info-tooltip" aria-label={wellbeingCalculationHelp}>
                  <Info size={16} aria-hidden="true" />
                  <span className="info-tooltip-content" role="tooltip">{wellbeingCalculationHelp}</span>
                </button>
              </div>
              <p className="chart-panel-subtitle">{analysisHabitsSubtitle}</p>
            </div>
          </div>
          {data.length === 0 ? (
            <div className="chart-empty-state">
              <strong>Sem registros suficientes nesse recorte</strong>
              <p>Ajuste o período ou registre novos dias para ver a evolução do bem-estar.</p>
            </div>
          ) : (
            renderSeparatedMetricLanes(data, wellbeingSeries, { chartWidth: wellbeingChartWidth })
          )}
        </div>

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

        <div ref={hydrationChartRef} className="glass-panel" style={{ height: '500px', minWidth: 0 }}>
          <div className="chart-panel-header">
            <div>
              <h4 style={{ color: 'var(--text-main)' }}>Hidratação por Período</h4>
              <p className="chart-panel-subtitle">{analysisHydrationSubtitle}</p>
            </div>
          </div>
          {data.length === 0 ? (
            <div className="chart-empty-state">
              <strong>Sem registros suficientes nesse recorte</strong>
              <p>Ajuste o período ou registre novos dias para acompanhar sua hidratação.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420} minWidth={0}>
              <AreaChart data={data} margin={analysisChartMargin}>
                <defs>
                  <linearGradient id="colorAguaAnalise" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3498db" stopOpacity={0.38}/>
                    <stop offset="95%" stopColor="#3498db" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="data" {...getAnalysisXAxisProps(data, hydrationChartWidth)} />
                <YAxis stroke="var(--text-main)" />
                <RechartsTooltip
                  labelFormatter={(label, payload) => formatTooltipDate(payload?.[0]?.payload?.fullDate ?? label)}
                  formatter={formatTooltipEntry}
                  contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="agua" stroke="#3498db" strokeWidth={3} fillOpacity={1} fill="url(#colorAguaAnalise)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div ref={trainingChartRef} className="glass-panel" style={{ height: '500px', minWidth: 0 }}>
          <div className="chart-panel-header">
            <div>
              <h4 style={{ color: 'var(--text-main)' }}>Treinos por Período</h4>
              <p className="chart-panel-subtitle">{analysisTrainingSubtitle}</p>
            </div>
          </div>
          {data.length === 0 ? (
            <div className="chart-empty-state">
              <strong>Sem registros suficientes nesse recorte</strong>
              <p>Ajuste o período ou marque treinos no diário para acompanhar consistência.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={420} minWidth={0}>
              <BarChart data={data} margin={analysisChartMargin}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="data" {...getAnalysisXAxisProps(data, trainingChartWidth)} />
                <YAxis allowDecimals={false} stroke="var(--text-main)" />
                <RechartsTooltip
                  cursor={false}
                  labelFormatter={(label, payload) => formatTooltipDate(payload?.[0]?.payload?.fullDate ?? label)}
                  formatter={formatTooltipEntry}
                  contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Bar dataKey="treinoDias" fill="#2ecc71" radius={[10, 10, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }

  return null;
}
