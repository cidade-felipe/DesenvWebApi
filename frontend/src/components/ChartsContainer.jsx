import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart
} from 'recharts';

export function ChartsContainer({ type, data, radarData, weightDataForChart }) {
  if (type === 'panorama') {
    return (
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', width: '100%', textAlign: 'left' }}>Polígono de Habilidades</h4>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-main)', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
              <Radar name="Suas Médias" dataKey="value" stroke="var(--accent-purple)" fill="var(--accent-purple)" fillOpacity={0.5} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--accent-purple)', borderRadius: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass-panel" style={{ height: '400px' }}>
          <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Tendência de Curto Prazo</h4>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={data.slice().reverse().slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="data" stroke="var(--text-main)" fontSize={11} tickFormatter={(v) => v.split('-').reverse().slice(0, 2).join('/')} />
              <YAxis stroke="var(--text-main)" fontSize={11} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ height: '500px' }}>
          <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Evolução de Peso e Zona Metabólica</h4>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={weightDataForChart}>
              <defs>
                <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="data" stroke="var(--text-main)" />
              <YAxis domain={['dataMin - 3', 'dataMax + 3']} stroke="var(--text-main)" />
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--accent-cyan)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="peso" stroke="var(--accent-cyan)" strokeWidth={4} fillOpacity={1} fill="url(#colorPeso)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ height: '500px' }}>
          <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Correlação: Humor vs Sono vs Energia</h4>
          <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={data.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="data" stroke="var(--text-main)" tickFormatter={(v) => v.split('-').reverse().slice(0, 2).join('/')} />
              <YAxis stroke="var(--text-main)" />
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="sono" fill="var(--accent-cyan-dim)" fillOpacity={0.1} stroke="var(--accent-cyan-dim)" strokeWidth={2} />
              <Line type="monotone" dataKey="humor" stroke="var(--accent-purple)" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="energia" stroke="#f1c40f" strokeWidth={2} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return null;
}
