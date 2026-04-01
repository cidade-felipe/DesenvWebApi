import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, Droplets, Moon, Brain, RefreshCw } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import apiClient from '../api/apiClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      // Garantir quem está logado (uso provisório para desenvolvimento base)
      const user = JSON.parse(localStorage.getItem('usuarioLogado'));
      if (!user) return navigate('/login');

      try {
        // Chamada principal (Histórico e Gráficos da Entidade Principal)
        const registrosFetch = await apiClient.get(`/registrosdiarios/usuario/${user.id}`);
        setRegistros(registrosFetch);

        // A Prova do Elo 1:1 construído
        const configFetch = await apiClient.get(`/configuracoesperfil/usuario/${user.id}`);
        setConfig(configFetch);
        
      } catch (err) {
        console.error("Falha ao puxar os dados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [navigate]);

  if (loading) {
    return <div className="center-wrapper"><RefreshCw className="animate-spin" size={32} color="var(--accent-cyan)" /></div>;
  }

  // Estatísticas Rápidas Isoladas (Médias e Somatórios Globais para base dos Cards)
  const avgHumor = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.humor, 0) / registros.length).toFixed(1) : '0';
  const totalAgua = registros.reduce((acc, r) => acc + r.agua, 0).toFixed(1);
  const avgSono = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.sono, 0) / registros.length).toFixed(1) : '0';

  return (
    <div className="container">
      {/* Navegação Topo */}
      <nav className="top-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Activity size={32} color="var(--accent-cyan)" />
          <div className="logo">Ritmo Analytics</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {config?.idioma && <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Idioma: {config.idioma}</span>}
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontWeight: '500' }}
            onClick={() => { localStorage.clear(); navigate('/login'); }}
          >
            Sair <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Grid de Cartões de Resumo Rápidos */}
      <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Média de Humor</h3>
            <Brain size={24} color="var(--accent-purple)" />
          </div>
          <div className="stat-value" style={{ marginTop: '1rem' }}>{avgHumor} / 5</div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Sono (Média)</h3>
            <Moon size={24} color="var(--accent-cyan-dim)" />
          </div>
          <div className="stat-value" style={{ marginTop: '1rem' }}>{avgSono} h</div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Água Ingerida</h3>
            <Droplets size={24} color="#3498db" />
          </div>
          <div className="stat-value" style={{ marginTop: '1rem' }}>{totalAgua} L</div>
        </div>
      </div>

      {/* Zona de Gráficos (Baseados na Recharts) */}
      <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem', paddingLeft: '0.5rem', marginBottom: '2rem' }}>
        Histórico Analítico
      </h2>

      {registros.length === 0 ? (
         <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            Ainda não há dados diários preenchidos.
         </div>
      ) : (
        <div className="dashboard-grid">
          {/* Gráfico Linear Dinâmico: Produtividade */}
          <div className="glass-panel" style={{ height: '350px' }}>
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Evolução de Produtividade</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registros}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="data" stroke="var(--text-main)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-main)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 5]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--accent-purple)' }} />
                <Line type="monotone" dataKey="produtividade" stroke="var(--accent-purple)" strokeWidth={3} dot={{ fill: 'var(--bg-color)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Área Dinâmico: Sono */}
          <div className="glass-panel" style={{ height: '350px' }}>
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Curva Físico-Recuperativa (Sono)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registros}>
                <defs>
                  <linearGradient id="colorSono" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="data" stroke="var(--text-main)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-main)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--accent-cyan)' }} />
                <Area type="monotone" dataKey="sono" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorSono)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
