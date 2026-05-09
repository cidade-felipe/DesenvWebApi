import { Scale, TrendingUp, Activity, Brain, Moon, Droplets } from 'lucide-react';

export function StatsCards({ imc, imcMeta, pesoAtual, pesoAnterior, pesoIdeal, avgBemEstar, avgSono, avgAgua, metricWindowLabel = '' }) {
  const metricWindowStyle = {
    display: 'block',
    marginTop: '0.25rem',
    color: 'var(--text-main)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    opacity: 0.72
  };

  return (
    <div className="dashboard-grid animate-fade-up" style={{ marginBottom: '2.5rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      
      {/* Seu IMC */}
      <div className="glass-panel" style={{ borderLeft: `4px solid ${imcMeta.color !== 'gray' ? imcMeta.color : 'var(--glass-border)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Seu IMC</h3>
            <div className="stat-value" style={{ marginTop: '0.5rem', color: imcMeta.color !== 'gray' ? imcMeta.color : 'var(--accent-cyan)' }}>
              {imc || '--'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: imcMeta.color, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
              {imcMeta.label}
            </div>
          </div>
          <Scale size={32} color={imcMeta.color !== 'gray' ? imcMeta.color : 'var(--text-main)'} />
        </div>
      </div>

      {/* Peso Atual */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Peso Registrado</h3>
          <TrendingUp size={24} color="var(--accent-cyan)" />
        </div>
        <div className="stat-value" style={{ marginTop: '1rem' }}>
          {pesoAtual || '--'} <span style={{fontSize: '1rem'}}>kg</span>
        </div>
        {pesoAnterior && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '4px' }}>
            Anterior: {pesoAnterior} kg
          </div>
        )}
      </div>

      {/* Faixa Ideal */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Faixa de Peso Ideal</h3>
          <Activity size={24} color="#2ecc71" />
        </div>
        <div className="stat-value" style={{ marginTop: '1rem', fontSize: '1.6rem' }}>
          {pesoIdeal ? (
            <>
              {pesoIdeal.min} <span style={{fontSize: '1rem', color: 'var(--text-main)'}}>a</span> {pesoIdeal.max} <span style={{fontSize: '1rem'}}>kg</span>
            </>
          ) : (
            <span style={{fontSize: '0.9rem', color: 'var(--text-main)'}}>Preencha a altura primeiro</span>
          )}
        </div>
      </div>

      {/* Bem-estar */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Bem-estar</h3>
            {metricWindowLabel && <span style={metricWindowStyle}>{metricWindowLabel}</span>}
          </div>
          <Brain size={24} color="var(--accent-purple)" />
        </div>
        <div className="stat-value" style={{ marginTop: '1rem' }}>{avgBemEstar} <span style={{fontSize: '1rem'}}>/ 5</span></div>
      </div>

      {/* Média de Sono */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Média de Sono</h3>
            {metricWindowLabel && <span style={metricWindowStyle}>{metricWindowLabel}</span>}
          </div>
          <Moon size={24} color="var(--accent-cyan-dim)" />
        </div>
        <div className="stat-value" style={{ marginTop: '1rem' }}>{avgSono} <span style={{fontSize: '1rem'}}>h / noite</span></div>
      </div>

      {/* Hidratação */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Média de Hidratação</h3>
            {metricWindowLabel && <span style={metricWindowStyle}>{metricWindowLabel}</span>}
          </div>
          <Droplets size={24} color="#3498db" />
        </div>
        <div className="stat-value" style={{ marginTop: '1rem' }}>{avgAgua} <span style={{fontSize: '1rem'}}>L / dia</span></div>
      </div>
    </div>
  );
}
