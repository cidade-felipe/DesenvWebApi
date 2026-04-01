import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, Droplets, Moon, Brain, RefreshCw, Pencil, Trash2, Bell, X } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import apiClient from '../api/apiClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // States nativos
  const [registros, setRegistros] = useState([]);
  const [config, setConfig] = useState(null);
  const [insights, setInsights] = useState([]);
  const [user, setUser] = useState(null);

  // States de UI
  const [showInsights, setShowInsights] = useState(false);
  const panelRef = useRef(null);

  // Estados do Formulário (CRUD do Registro)
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    humor: 3,
    sono: 8,
    estudo: 0,
    produtividade: 3,
    energia: 3,
    exercicio: false,
    agua: 2.0,
    observacoes: ''
  });

  const loadDashboard = async () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) return navigate('/login');
    setUser(usuarioLogado);

    try {
      // 1. Histórico
      const registrosFetch = await apiClient.get(`/registrosdiarios/usuario/${usuarioLogado.id}`);
      setRegistros(registrosFetch);

      // 2. Configuração Pessoal (O Elo 1:1)
      const configFetch = await apiClient.get(`/configuracoesperfil/usuario/${usuarioLogado.id}`);
      setConfig(configFetch);

      // 3. Notificações Inteligentes
      const insightsFetch = await apiClient.get(`/insights/usuario/${usuarioLogado.id}?apenasNaoLidos=true`);
      setInsights(insightsFetch);

    } catch (err) {
      console.error("Falha ao puxar os dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // Fechar painel de notificação ao clicar fora
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowInsights(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Handler de Novo Registro ou Edição
  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        usuarioId: user.id,
        humor: Number(formData.humor),
        sono: Number(formData.sono),
        estudo: Number(formData.estudo),
        produtividade: Number(formData.produtividade),
        energia: Number(formData.energia),
        agua: Number(formData.agua)
      };

      if (editandoId) {
        payload.id = editandoId;
        await apiClient.put(`/registrosdiarios/${editandoId}`, payload);
      } else {
        await apiClient.post('/registrosdiarios', payload);
      }

      setEditandoId(null);
      setFormData({
        data: new Date().toISOString().split('T')[0],
        humor: 3, sono: 8, estudo: 0, produtividade: 3, energia: 3, exercicio: false, agua: 2.0, observacoes: ''
      });
      await loadDashboard();
    } catch (err) {
      alert("Erro ao salvar: " + (err.response?.data?.mensagem || err.message));
    }
  };

  const handleEditar = (registro) => {
    setEditandoId(registro.id);
    setFormData({ ...registro, observacoes: registro.observacoes || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar permanentemente os dados deste dia?")) {
      try {
        await apiClient.delete(`/registrosdiarios/${id}`);
        await loadDashboard();
      } catch (err) {
        alert("Erro ao excluir: " + (err.response?.data?.mensagem || err.message));
      }
    }
  };

  // Handler de leitura do Sino (Insights)
  const handleMarcarLido = async (insightId) => {
    try {
      await apiClient.patch(`/insights/${insightId}/marcar-lido`);
      // Remove localmente do array visual para transição rápida
      setInsights(insights.filter(i => i.id !== insightId));
    } catch (err) {
      console.error("Falha ao atualizar insight", err);
    }
  };

  if (loading) {
    return <div className="center-wrapper"><RefreshCw className="animate-spin" size={32} color="var(--accent-cyan)" /></div>;
  }

  const avgHumor = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.humor, 0) / registros.length).toFixed(1) : '0';
  const totalAgua = registros.reduce((acc, r) => acc + r.agua, 0).toFixed(1);
  const avgSono = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.sono, 0) / registros.length).toFixed(1) : '0';

  // O Polígono de Radar mapeando as estatísticas vitais convertidas para uma escala de 5 pontos
  const radarData = registros.length > 0 ? [
    { metric: 'Humor', value: Number((registros.reduce((acc, r) => acc + r.humor, 0) / registros.length).toFixed(1)) },
    { metric: 'Energia', value: Number((registros.reduce((acc, r) => acc + r.energia, 0) / registros.length).toFixed(1)) },
    { metric: 'Produtividade', value: Number((registros.reduce((acc, r) => acc + r.produtividade, 0) / registros.length).toFixed(1)) },
    { metric: 'Sono', value: Number(((registros.reduce((acc, r) => acc + r.sono, 0) / registros.length) / 8 * 5).toFixed(1)) }, // Assumindo base 8h como Teto Perfeito 5
    { metric: 'Água', value: Number(((registros.reduce((acc, r) => acc + r.agua, 0) / registros.length) / 3 * 5).toFixed(1)) }  // Assumindo 3L de Água como Teto Perfeito 5
  ] : [];

  return (
    <div className="container">
      {/* Navegação Topo */}
      <nav className="top-nav animate-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Activity size={32} color="var(--accent-cyan)" />
          <div className="logo">Ritmo Analytics</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {config?.idioma && <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Idioma: {config.idioma}</span>}
          
          {/* Sino e Painel Suspenso */}
          <div ref={panelRef} style={{ position: 'relative' }}>
            <button className="notification-bell" onClick={() => setShowInsights(!showInsights)}>
              <Bell size={24} />
              {insights.length > 0 && <span className="notification-badge">{insights.length}</span>}
            </button>
            
            {showInsights && (
              <div className="insights-panel">
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-light)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                  Avisos Analíticos
                </h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {insights.length === 0 ? (
                    <p style={{ color: 'var(--text-main)', fontSize: '0.85rem', margin: '0.5rem 0' }}>Você está em dia com a sua saúde. Nenhum alerta pendente!</p>
                  ) : (
                    insights.map(insight => (
                      <div key={insight.id} className="insight-item">
                        <div style={{ flex: 1 }}>
                          <span style={{ display: 'block', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>{insight.categoria.toUpperCase()}</span>
                          {insight.mensagem}
                        </div>
                        <button className="insight-close-btn" onClick={() => handleMarcarLido(insight.id)} title="Marcar como Lido">
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontWeight: '500' }}
            onClick={() => { localStorage.clear(); navigate('/login'); }}
          >
            Sair <LogOut size={18} />
          </button>
        </div>
      </nav>

      <div className="content-divider">
        {/* Formulário Fixo na Esquerda */}
        <aside className="form-sidebar glass-panel animate-fade-up delay-1">
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-light)' }}>
            {editandoId ? 'Refinando o Dia' : 'Injetar Novo Registro'}
          </h3>
          <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="input-label">Data</label>
              <input type="date" className="input-field" disabled={!!editandoId} value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label">Humor (1-5)</label>
                <input type="number" min="1" max="5" className="input-field" value={formData.humor} onChange={(e) => setFormData({...formData, humor: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Produt. (1-5)</label>
                <input type="number" min="1" max="5" className="input-field" value={formData.produtividade} onChange={(e) => setFormData({...formData, produtividade: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label">Água (L)</label>
                <input type="number" step="0.1" className="input-field" value={formData.agua} onChange={(e) => setFormData({...formData, agua: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Sono (h)</label>
                <input type="number" step="0.5" className="input-field" value={formData.sono} onChange={(e) => setFormData({...formData, sono: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="input-label">Energia: <span style={{color:'var(--text-light)'}}>{formData.energia}</span> / 5</label>
              <input type="range" min="1" max="5" style={{width: '100%'}} value={formData.energia} onChange={(e) => setFormData({...formData, energia: e.target.value})} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', marginTop: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.exercicio} onChange={(e) => setFormData({...formData, exercicio: e.target.checked})} />
              Engajei Físicamente Hoje
            </label>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
              {editandoId ? 'Atualizar Histórico' : 'Computar Dados'}
            </button>

            {editandoId && (
              <button type="button" onClick={() => {
                setEditandoId(null);
                setFormData({...formData, data: new Date().toISOString().split('T')[0]}); 
              }} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                Abortar Edição
              </button>
            )}
          </form>
        </aside>

        {/* Dashboard de Visualização Nativa (Direita) */}
        <main className="main-content">
          <div className="dashboard-grid animate-fade-up delay-2" style={{ marginBottom: '2.5rem' }}>
            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Média de Humor</h3>
                 <Brain size={24} color="var(--accent-purple)" />
              </div>
              <div className="stat-value" style={{ marginTop: '1rem' }}>{avgHumor} <span style={{fontSize: '1rem'}}>/ 5</span></div>
            </div>

            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Tempo de Sono</h3>
                 <Moon size={24} color="var(--accent-cyan-dim)" />
              </div>
              <div className="stat-value" style={{ marginTop: '1rem' }}>{avgSono} <span style={{fontSize: '1rem'}}>h</span></div>
            </div>

            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Hidratação Global</h3>
                 <Droplets size={24} color="#3498db" />
              </div>
              <div className="stat-value" style={{ marginTop: '1rem' }}>{totalAgua} <span style={{fontSize: '1rem'}}>L</span></div>
            </div>
          </div>

          {registros.length === 0 ? (
             <div className="glass-panel animate-fade-up delay-3" style={{ textAlign: 'center', padding: '3rem' }}>
                Comece preenchendo o lado esquerdo com a sua quantidade de água e horas de sono para as engrenagens ganharem vida!
             </div>
          ) : (
            <>
              {/* Malha Inferior de Gráficos Cruzados */}
              <div className="dashboard-grid animate-fade-up delay-3" style={{ marginBottom: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                
                {/* O Radar Poligonal (Atributos Gerais) */}
                <div className="glass-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', width: '100%', textAlign: 'left' }}>Polígono de Habilidades (Status Diário)</h4>
                  <ResponsiveContainer width="100%" height="90%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-main)', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'rgba(255,255,255,0.2)' }} axisLine={false} />
                      <Radar name="Suas Médias" dataKey="value" stroke="var(--accent-purple)" fill="var(--accent-purple)" fillOpacity={0.5} />
                      <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--accent-purple)', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Área Estético: Sono Acumulado */}
                <div className="glass-panel" style={{ height: '350px' }}>
                  <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Curva Físico-Recuperativa</h4>
                  <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={registros.slice().reverse()}>
                      <defs>
                        <linearGradient id="colorSono" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="data" stroke="var(--text-main)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-main)" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--accent-cyan)', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="sono" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorSono)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Histórico Limpo de Manipulação */}
              <div className="glass-panel animate-fade-up delay-4" style={{ overflowX: 'auto' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Linha do Tempo (Registros Base)</h3>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Registrado em</th>
                      <th>Água</th>
                      <th>Descanso</th>
                      <th>Humor Geral</th>
                      <th>Movimentação Física</th>
                      <th style={{ textAlign: 'right' }}>Ações de Revisão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: '500', color: 'var(--text-light)' }}>
                          {r.data.split('-').reverse().join('/')}
                        </td>
                        <td>{r.agua} Litros</td>
                        <td>{r.sono} Horas</td>
                        <td>{r.humor} Pontos</td>
                        <td>{r.exercicio ? <span style={{color: 'var(--accent-cyan)'}}>✅ Concluído</span> : <span style={{color: '#ff6b6b'}}>❌ Pendente</span>}</td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button className="action-btn edit" title="Remodelar os dados (Editar)" onClick={() => handleEditar(r)}>
                            <Pencil size={18} />
                          </button>
                          <button className="action-btn delete" title="Extinguir do Banco (Apagar)" onClick={() => handleExcluir(r.id)}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
