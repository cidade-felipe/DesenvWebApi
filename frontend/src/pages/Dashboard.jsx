import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, Droplets, Moon, Brain, RefreshCw, Pencil, Trash2, Bell, X, Scale, Ruler, TrendingUp } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Bar
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
  const [pesos, setPesos] = useState([]);
  const [altura, setAltura] = useState('');
  const [novoPeso, setNovoPeso] = useState('');

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
    observacoes: '',
    peso: ''
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

      // 4. Biometria (Pesos e Altura)
      const pesosFetch = await apiClient.get(`/pesos/usuario/${usuarioLogado.id}`);
      setPesos(pesosFetch);
      
      const userRefreshed = await apiClient.get(`/usuarios/${usuarioLogado.id}`);
      setAltura(userRefreshed.altura || '');
      setUser(userRefreshed);

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

      // Se informou o peso, registra também!
      if (formData.peso) {
         await apiClient.post('/pesos', { usuarioId: user.id, valor: parseFloat(formData.peso) });
      }

      setEditandoId(null);
      setFormData({
        data: new Date().toISOString().split('T')[0],
        humor: 3, sono: 8, estudo: 0, produtividade: 3, energia: 3, exercicio: false, agua: 2.0, observacoes: '', peso: ''
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

  // Handlers Biométricos
  const handleSalvarAltura = async () => {
    try {
      await apiClient.patch(`/usuarios/${user.id}/altura`, parseInt(altura), {
        headers: { 'Content-Type': 'application/json' }
      });
      alert("Altura atualizada com sucesso!");
      await loadDashboard();
    } catch (err) {
      alert("Erro ao atualizar altura");
    }
  };

  const handleSalvarPeso = async (e) => {
    e.preventDefault();
    if (!novoPeso) return;
    try {
      await apiClient.post('/pesos', { usuarioId: user.id, valor: parseFloat(novoPeso) });
      setNovoPeso('');
      await loadDashboard();
    } catch (err) {
      alert("Erro ao registrar peso");
    }
  };

  const handleExcluirPeso = async (id) => {
    if (window.confirm("Excluir este registro de peso?")) {
      try {
        await apiClient.delete(`/pesos/${id}`);
        await loadDashboard();
      } catch (err) {
        alert("Erro ao excluir peso");
      }
    }
  };

  // Helper de IMC
  const calculaIMC = () => {
    if (!altura || pesos.length === 0) return null;
    const pesoAtual = pesos[0].valor;
    const alturaMeters = altura / 100;
    return (pesoAtual / (alturaMeters * alturaMeters)).toFixed(1);
  };

  const getIMCCategory = (imc) => {
    if (!imc) return { label: 'Aguardando Altura/Peso', color: 'gray' };
    const val = parseFloat(imc);
    if (val < 18.5) return { label: 'Abaixo do Peso', color: '#f1c40f' };
    if (val < 25) return { label: 'Normal', color: '#2ecc71' };
    if (val < 30) return { label: 'Sobrepeso', color: '#e67e22' };
    return { label: 'Obeso', color: '#e74c3c' };
  };

  const calculaPesoIdeal = () => {
    if (!altura) return null;
    const h = altura / 100;
    return {
      min: (18.5 * h * h).toFixed(1),
      max: (24.9 * h * h).toFixed(1)
    };
  };

  if (loading) {
    return <div className="center-wrapper"><RefreshCw className="animate-spin" size={32} color="var(--accent-cyan)" /></div>;
  }

  const avgHumor = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.humor, 0) / registros.length).toFixed(1) : '0';
  const totalAgua = registros.reduce((acc, r) => acc + r.agua, 0).toFixed(1);
  const avgSono = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.sono, 0) / registros.length).toFixed(1) : '0';

  // O Polígono de Radar mapeando apenas métricas que operam nativamente na escala de 1 a 5 (ou % de consistência)
  const radarData = registros.length > 0 ? [
    { metric: 'Humor', value: Number((registros.reduce((acc, r) => acc + r.humor, 0) / registros.length).toFixed(1)) },
    { metric: 'Energia', value: Number((registros.reduce((acc, r) => acc + r.energia, 0) / registros.length).toFixed(1)) },
    { metric: 'Produtividade', value: Number((registros.reduce((acc, r) => acc + r.produtividade, 0) / registros.length).toFixed(1)) },
    { metric: 'Ação Física', value: Number(((registros.filter(r => r.exercicio).length / registros.length) * 5).toFixed(1)) } // Consistência de treino em peso 5
  ] : [];

  const imcAtual = calculaIMC();
  const imcMeta = getIMCCategory(imcAtual);
  const pesoIdeal = calculaPesoIdeal();

  // Inverter pesos para o gráfico (cronológico)
  const weightDataForChart = pesos.slice().reverse().map(p => ({
    data: p.data.split('T')[0].split('-').reverse().slice(0, 2).join('/'),
    peso: p.valor
  }));

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
                <label className="input-label">Peso Hoje (kg)</label>
                <input type="number" step="0.1" className="input-field" value={formData.peso} onChange={(e) => setFormData({...formData, peso: e.target.value})} placeholder="Ex: 75.5" />
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label">Produt. (1-5)</label>
                <input type="number" min="1" max="5" className="input-field" value={formData.produtividade} onChange={(e) => setFormData({...formData, produtividade: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Energia: <span style={{color:'var(--text-light)'}}>{formData.energia}</span> / 5</label>
                <input type="range" min="1" max="5" style={{width: '100%', marginTop: '8px'}} value={formData.energia} onChange={(e) => setFormData({...formData, energia: e.target.value})} />
              </div>
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

          {/* Perfil Físico Fixo */}
          <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              <Scale size={16} /> Meu Corpo
            </h4>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label" style={{ fontSize: '0.65rem' }}>Altura Fixa (cm)</label>
                <input type="number" className="input-field" style={{ padding: '6px 10px', fontSize: '0.9rem' }} value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="175" />
              </div>
              <button onClick={handleSalvarAltura} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.9rem', width: 'auto' }}>
                <Ruler size={16} style={{ marginRight: '4px' }}/> Ajustar
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'gray', marginTop: '0.5rem', lineHeight: 1.2 }}>
              A altura é necessária apenas para os cálculos de Zona Saudável e IMC. O seu peso da balança você informa lá nos dados diários acima!
            </p>
          </div>
        </aside>

        {/* Dashboard de Visualização Nativa (Direita) */}
        <main className="main-content">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>Panorama Físico e Mental</h3>
          <div className="dashboard-grid animate-fade-up delay-2" style={{ marginBottom: '2.5rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            
            {/* Seu IMC */}
            <div className="glass-panel" style={{ borderLeft: `4px solid ${imcMeta.color !== 'gray' ? imcMeta.color : 'var(--glass-border)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div>
                   <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Seu IMC</h3>
                   <div className="stat-value" style={{ marginTop: '0.5rem', color: imcMeta.color !== 'gray' ? imcMeta.color : 'var(--accent-cyan)' }}>
                     {imcAtual || '--'}
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
                {pesos[0]?.valor || '--'} <span style={{fontSize: '1rem'}}>kg</span>
              </div>
              {pesos.length > 1 && (
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '4px' }}>
                   Anterior: {pesos[1].valor} kg
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

            {/* Média de Humor */}
            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Média de Humor</h3>
                 <Brain size={24} color="var(--accent-purple)" />
              </div>
              <div className="stat-value" style={{ marginTop: '1rem' }}>{avgHumor} <span style={{fontSize: '1rem'}}>/ 5</span></div>
            </div>

            {/* Tempo de Sono */}
            <div className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Tempo de Sono</h3>
                 <Moon size={24} color="var(--accent-cyan-dim)" />
              </div>
              <div className="stat-value" style={{ marginTop: '1rem' }}>{avgSono} <span style={{fontSize: '1rem'}}>h</span></div>
            </div>

            {/* Hidratação */}
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
              <div className="dashboard-grid animate-fade-up delay-3" style={{ marginBottom: '2.5rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                
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

                {/* Gráfico de Evolução de Peso */}
                <div className="glass-panel" style={{ height: '350px' }}>
                  <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Histórico de Peso (kg)</h4>
                  <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={weightDataForChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="data" stroke="var(--text-main)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="var(--text-main)" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--accent-cyan)', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="peso" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-cyan)' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Hábitos Vitais (Água e Sono com Escalas Duplas) */}
                <div className="glass-panel" style={{ height: '350px' }}>
                  <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Hábitos Vitais</h4>
                  <ResponsiveContainer width="100%" height="80%">
                    <ComposedChart data={registros.slice().reverse()} margin={{ top: 10, right: 30, bottom: 0, left: 20 }}>
                      <defs>
                        <linearGradient id="colorSono" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-cyan-dim)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--accent-cyan-dim)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAgua" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3498db" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2980b9" stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="data" stroke="var(--text-main)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').reverse().slice(0, 2).join('/')} />
                      
                      <YAxis yAxisId="left" stroke="var(--accent-cyan-dim)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 'dataMax + 2']} label={{ value: 'Sono (h)', angle: -90, position: 'insideLeft', offset: -15, fill: 'var(--accent-cyan-dim)', fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#3498db" fontSize={12} tickLine={false} axisLine={false} domain={[0, 'dataMax + 1']} label={{ value: 'Água (L)', angle: 90, position: 'insideRight', offset: -15, fill: '#3498db', fontSize: 11 }} />
                      
                      <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                      
                      <Bar yAxisId="right" dataKey="agua" name="Água (L)" fill="url(#colorAgua)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Area yAxisId="left" type="monotone" dataKey="sono" name="Sono (h)" stroke="var(--accent-cyan-dim)" strokeWidth={2} fillOpacity={1} fill="url(#colorSono)" />
                    </ComposedChart>
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
