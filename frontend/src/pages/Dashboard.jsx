import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Pencil, Trash2, LayoutDashboard, ClipboardList, Download, BarChart3, Activity, RefreshCw, X, TrendingUp } from 'lucide-react';

import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardHeader } from '../components/DashboardHeader';
import { StatsCards } from '../components/StatsCards';
import { DataFormModal } from '../components/DataFormModal';
import { ChartsContainer } from '../components/ChartsContainer';
import { MetaFormModal } from '../components/MetaFormModal'; // Novo Import
import apiClient from '../api/apiClient';

export default function Dashboard() {
  const {
    loading, registros, config, insights, user, biometria, metas,
    loadDashboard, handleMarcarInsightLido
  } = useDashboardData();

  const [activeTab, setActiveTab] = useState('panorama'); // 'panorama', 'analise', 'relatorios'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    humor: 3, sono: 8, produtividade: 3, energia: 3, exercicio: false, agua: 2.0, observacoes: '', peso: '', altura: ''
  });

  // --- Handlers de Ações ---
  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, usuarioId: user.id };
      if (editandoId) {
        await apiClient.put(`/registrosdiarios/${editandoId}`, payload);
      } else {
        await apiClient.post('/registrosdiarios', payload);
      }

      if (formData.peso && formData.altura) {
        await apiClient.post('/biometria', { 
          usuarioId: user.id, 
          peso: parseFloat(formData.peso), 
          altura: parseInt(formData.altura),
          data: formData.data 
        });
      }

      setIsModalOpen(false);
      await loadDashboard();
    } catch (err) {
      alert("Erro ao salvar: " + (err.response?.data?.mensagem || err.message));
    }
  };

  const handleEditar = (registro) => {
    setEditandoId(registro.id);
    setFormData({ ...registro, observacoes: registro.observacoes || '' });
    setIsModalOpen(true);
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar permanentemente os dados deste dia?")) {
      try {
        await apiClient.delete(`/registrosdiarios/${id}`);
        await loadDashboard();
      } catch (err) {
        alert("Erro ao excluir");
      }
    }
  };


  // --- Exportações ---
  const handleExportCSV = () => {
    const headers = ["Data", "Humor", "Sono", "Agua", "Produtividade", "Energia", "Exercicio", "Peso", "Observacoes"];
    const csvContent = [
      headers.join(","),
      ...registros.map(r => [r.data, r.humor, r.sono, r.agua, r.produtividade, r.energia, r.exercicio ? "Sim" : "Nao", r.peso || "", `"${(r.observacoes || "").replace(/"/g, '""')}"`].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ritmo_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportXLSX = () => {
    const wb = XLSX.utils.book_new();
    const wsDiary = XLSX.utils.json_to_sheet(registros.map(r => ({ "Data": r.data, "Humor": r.humor, "Sono": r.sono, "Água": r.agua, "Exercício": r.exercicio ? "Sim" : "Não" })));
    XLSX.utils.book_append_sheet(wb, wsDiary, "Diário de Hábitos");
    XLSX.writeFile(wb, `Ritmo_Analitico_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- Cálculos de Estatísticas ---
  const calculaIMC = () => {
    if (biometria.length === 0) return null;
    return biometria[0].imc;
  };

  const imcAtual = calculaIMC();
  
  // Pegamos a classificação e cor mastigadas enviadas pela API
  const imcMeta = {
    label: biometria.length > 0 && imcAtual ? biometria[0].imcClassificacao : 'Aguardando Dados',
    color: biometria.length > 0 && imcAtual ? biometria[0].imcCor : 'gray'
  };
  const avgHumor = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.humor, 0) / registros.length).toFixed(1) : '0';
  const avgAgua = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.agua, 0) / registros.length).toFixed(1) : '0';
  const avgSono = registros.length > 0 ? (registros.reduce((acc, r) => acc + r.sono, 0) / registros.length).toFixed(1) : '0';

  // Faixa de peso ideal: IMC saudável (18.5 a 24.9) aplicado à altura atual
  const calcPesoIdeal = () => {
    const altura = biometria[0]?.altura;
    if (!altura) return null;
    const alturaM = altura / 100;
    return {
      min: (18.5 * alturaM * alturaM).toFixed(1),
      max: (24.9 * alturaM * alturaM).toFixed(1),
    };
  };
  const pesoIdeal = calcPesoIdeal();

  const radarData = registros.length > 0 ? [
    { metric: 'Humor', value: Number(avgHumor) },
    { metric: 'Energia', value: Number((registros.reduce((acc, r) => acc + r.energia, 0) / registros.length).toFixed(1)) },
    { metric: 'Produtividade', value: Number((registros.reduce((acc, r) => acc + r.produtividade, 0) / registros.length).toFixed(1)) },
    { metric: 'Ação Física', value: Number(((registros.filter(r => r.exercicio).length / registros.length) * 5).toFixed(1)) }
  ] : [];

  const weightDataForChart = [];
  const datasVistas = new Set();
  
  for (const p of biometria) {
    const fullDate = p.data.split('T')[0];
    const [year, month, day] = fullDate.split('-');
    const dataFormatada = `${day}/${month}/${year.slice(-2)}`;
    if (!datasVistas.has(dataFormatada)) {
      datasVistas.add(dataFormatada);
      weightDataForChart.push({ data: dataFormatada, fullDate, peso: p.peso });
    }
  }
  weightDataForChart.reverse(); // Inverte para ordem cronológica no gráfico

  // --- Lógica de Metas ---
  const handleExcluirMeta = async (id) => {
    if (window.confirm("Deseja realmente remover esta meta?")) {
      try {
        await apiClient.delete(`/metas/${id}`);
        await loadDashboard();
      } catch (err) {
        alert("Erro ao excluir meta");
      }
    }
  };

  const getMetaProgress = (meta) => {
    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 7);

    const registrosRecentes = registros.filter(r => new Date(r.data) >= seteDiasAtras);
    if (registrosRecentes.length === 0) return { percent: 0, current: 0, status: 'atrasado' };

    let total = 0;
    const cat = meta.categoria.toLowerCase();

    if (cat === 'treino') {
      total = registrosRecentes.filter(r => r.exercicio).length;
    } else {
      total = registrosRecentes.reduce((acc, r) => acc + (r[cat] || 0), 0) / registrosRecentes.length;
    }

    const progresso = (total / meta.valorAlvo) * 100;
    return {
      percent: Math.min(Math.round(progresso), 120),
      current: total.toFixed(1),
      status: progresso >= 100 ? 'concluido' : progresso >= 50 ? 'em_dia' : 'atrasado'
    };
  };

  if (loading) return <div className="center-wrapper"><RefreshCw className="animate-spin" size={32} color="var(--accent-cyan)" /></div>;

  return (
    <div className="container">
      <DashboardHeader user={user} config={config} insights={insights} onMarkAsRead={handleMarcarInsightLido} />

      <div className="content-divider" style={{ display: 'block' }}>
        <DataFormModal 
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSalvar} 
          formData={formData} setFormData={setFormData} editandoId={editandoId} 
          ultimaAltura={biometria[0]?.altura}
        />

        <main className="main-content" style={{ width: '100%' }}>
          <div className="tabs-wrapper animate-fade-up">
            <button className={`tab-btn ${activeTab === 'panorama' ? 'active' : ''}`} onClick={() => setActiveTab('panorama')}><LayoutDashboard size={18} /> Panorama</button>
            <button className={`tab-btn ${activeTab === 'analise' ? 'active' : ''}`} onClick={() => setActiveTab('analise')}><BarChart3 size={18} /> Análise</button>
            <button className={`tab-btn ${activeTab === 'metas' ? 'active' : ''}`} onClick={() => setActiveTab('metas')}><TrendingUp size={18} /> Metas</button>
            <button className={`tab-btn ${activeTab === 'relatorios' ? 'active' : ''}`} onClick={() => setActiveTab('relatorios')}><ClipboardList size={18} /> Relatórios</button>
          </div>

          <div className="tab-content">
            {activeTab === 'panorama' && (
              <>
                <StatsCards imc={imcAtual} imcMeta={imcMeta} pesoAtual={biometria[0]?.peso} pesoAnterior={biometria[1]?.peso} pesoIdeal={pesoIdeal} avgHumor={avgHumor} avgSono={avgSono} avgAgua={avgAgua} />
                <ChartsContainer type="panorama" data={registros} radarData={radarData} />
              </>
            )}

            {activeTab === 'analise' && <ChartsContainer type="analise" data={registros} weightDataForChart={weightDataForChart} />}

            {activeTab === 'relatorios' && (
              <div className="animate-fade-up">
                <div className="chart-header">
                  <h3 style={{ color: 'var(--text-light)' }}>Histórico</h3>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button className="btn-secondary" onClick={handleExportCSV}><Download size={18} /> CSV</button>
                    <button className="btn-secondary" onClick={handleExportXLSX} style={{ color: '#2ecc71' }}><Download size={18} /> Excel</button>
                  </div>
                </div>
                <div className="glass-panel" style={{ overflowX: 'auto' }}>
                  <table className="history-table">
                    <thead><tr><th>Data</th><th>Água</th><th>Sono</th><th>Humor</th><th>Físico</th><th style={{ textAlign: 'right' }}>Ações</th></tr></thead>
                    <tbody>
                      {registros.map(r => (
                        <tr key={r.id}>
                          <td>{r.data.split('-').reverse().join('/')}</td>
                          <td>{r.agua}L</td><td>{r.sono}h</td><td>{r.humor}/5</td><td>{r.exercicio ? "✅" : "❌"}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="action-btn edit" onClick={() => handleEditar(r)}><Pencil size={18} /></button>
                            <button className="action-btn delete" onClick={() => handleExcluir(r.id)}><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === 'metas' && (
              <div className="animate-fade-up">
                <div className="chart-header">
                  <h3 style={{ color: 'var(--text-light)' }}>Seus Desafios</h3>
                  <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setIsMetaModalOpen(true)}>
                    <TrendingUp size={18} /> Nova Meta
                  </button>
                </div>

                {metas.length === 0 ? (
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: 'var(--text-main)' }}>Você ainda não definiu nenhuma meta.</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Metas ajudam você a manter a consistência e o foco!</p>
                  </div>
                ) : (
                  <div className="goals-grid">
                    {metas.map(meta => {
                      const prog = getMetaProgress(meta);
                      const isTreino = meta.categoria.toLowerCase() === 'treino';
                      const color = prog.status === 'concluido' ? '#2ecc71' : prog.status === 'em_dia' ? 'var(--accent-cyan)' : '#f1c40f';
                      
                      return (
                        <div key={meta.id} className="glass-panel goal-card">
                          <div className="goal-header">
                            <div>
                              <span className="goal-title">{meta.categoria}</span>
                              <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '4px 0 0 0' }}>{meta.descricao || 'Sem descrição'}</p>
                            </div>
                            <button 
                              className="action-btn delete" 
                              onClick={() => handleExcluirMeta(meta.id)}
                              style={{ padding: '4px' }}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="goal-progress-wrapper">
                            <div className="progress-info">
                              <span>Sua média (7d): <strong>{prog.current}{isTreino ? ' dias' : ''}</strong></span>
                              <span>Meta: {meta.valorAlvo}{isTreino ? ' dias' : ''}</span>
                            </div>
                            <div className="progress-track">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${prog.percent}%`, backgroundColor: color, color: color }}
                              ></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: color }}>
                                {prog.percent}% {prog.percent >= 100 ? 'CONCLUÍDO!' : 'EM ANDAMENTO'}
                              </span>
                              <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                Atualizado agora
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <button className="fab-btn animate-fade-up" onClick={() => { setEditandoId(null); setIsModalOpen(true); }}><Activity size={32} /></button>

      {/* Novo Modal de Gestão de Metas */}
      <MetaFormModal 
        isOpen={isMetaModalOpen} 
        onClose={() => setIsMetaModalOpen(false)} 
        onSave={loadDashboard} 
        user={user} 
      />
    </div>
  );
}
