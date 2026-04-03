import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export function useDashboardData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [config, setConfig] = useState(null);
  const [insights, setInsights] = useState([]);
  const [metas, setMetas] = useState([]); // Novo estado de metas
  const [user, setUser] = useState(null);
  const [biometria, setBiometria] = useState([]);

  const loadDashboard = useCallback(async () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) return navigate('/login');
    setUser(usuarioLogado);

    try {
      setLoading(true);
      const [registrosFetch, configFetch, insightsFetch, metasFetch, biometriaFetch, userRefreshed] = await Promise.all([
        apiClient.get(`/registrosdiarios/usuario/${usuarioLogado.id}`),
        apiClient.get(`/configuracoesperfil/usuario/${usuarioLogado.id}`),
        apiClient.get(`/insights/usuario/${usuarioLogado.id}?apenasNaoLidos=true`),
        apiClient.get(`/metas/usuario/${usuarioLogado.id}`),
        apiClient.get(`/biometria/usuario/${usuarioLogado.id}`),
        apiClient.get(`/usuarios/${usuarioLogado.id}`)
      ]);

      setRegistros(registrosFetch);
      setConfig(configFetch);
      setInsights(insightsFetch);
      setMetas(metasFetch);
      setBiometria(biometriaFetch);
      setUser(userRefreshed);
    } catch (err) {
      console.error("Falha ao puxar os dados:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleMarcarInsightLido = async (insightId) => {
    try {
      await apiClient.patch(`/insights/${insightId}/marcar-lido`);
      setInsights(prev => prev.filter(i => i.id !== insightId));
    } catch (err) {
      console.error("Falha ao atualizar insight", err);
    }
  };

  return {
    loading,
    registros,
    config,
    insights,
    user,
    biometria,
    metas,
    loadDashboard,
    handleMarcarInsightLido,
    setInsights
  };
}
