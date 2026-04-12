import { useState } from 'react';
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
  const [reportPeriod, setReportPeriod] = useState('all');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportSort, setReportSort] = useState({ key: 'data', direction: 'desc' });
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    humor: 3, sono: 8, produtividade: 3, energia: 3, exercicio: false, agua: 2.0, observacoes: '', peso: '', altura: ''
  });
  const reportPeriodOptions = [
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: '90d', label: '90 dias' },
    { key: 'all', label: 'Tudo' }
  ];
  const reportSortLabels = {
    data: 'data',
    humor: 'humor',
    energia: 'energia',
    produtividade: 'produtividade',
    agua: 'água',
    sono: 'sono',
    treino: 'treino',
    peso: 'biometria',
    imc: 'IMC',
    observacoes: 'observações'
  };

  const getDateKey = (value) => String(value ?? '').split('T')[0];
  const weekdayShortNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const toDateInputValue = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const formatDisplayDate = (value) => new Date(`${getDateKey(value)}T00:00:00`).toLocaleDateString('pt-BR');
  const toLocalDate = (value) => {
    const date = new Date(`${getDateKey(value)}T00:00:00`);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const formatDateObject = (value) => value.toLocaleDateString('pt-BR');
  const todayReportDate = toDateInputValue();
  const normalizeReportDateValue = (value) => {
    if (!value) return '';
    return value > todayReportDate ? todayReportDate : value;
  };
  const formatMetric = (value, digits = 1) => {
    if (value === null || value === undefined || value === '') return '—';

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return String(value);

    return numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: Number.isInteger(numericValue) ? 0 : digits,
      maximumFractionDigits: digits
    });
  };
  const getWeekdayShortLabel = (value) => weekdayShortNames[toLocalDate(value).getDay()];
  const isWeekendDate = (value) => {
    const weekDay = toLocalDate(value).getDay();
    return weekDay === 0 || weekDay === 6;
  };
  const getAverageForMetric = (items, metric) => {
    const resolveValue = typeof metric === 'function'
      ? metric
      : (item) => Number(item[metric] || 0);

    return items.reduce((acc, item) => acc + resolveValue(item), 0) / items.length;
  };
  const getMetricTrend = (items, metric, options = {}) => {
    const { digits = 1, threshold = 0.2, unit = '', label = 'este indicador' } = options;
    const resolveValue = typeof metric === 'function'
      ? metric
      : (item) => Number(item[metric] || 0);

    if (items.length < 2) {
      return {
        tone: 'neutral',
        value: 'Estável',
        meta: `Ainda não há histórico suficiente para resumir ${label}.`,
        trendArrow: '→',
        trendPercent: '0%'
      };
    }

    const orderedItems = [...items].sort((a, b) => toLocalDate(a.data) - toLocalDate(b.data));
    const windowSize = Math.max(1, Math.floor(orderedItems.length / 2));
    const firstWindow = orderedItems.slice(0, windowSize);
    const lastWindow = orderedItems.slice(-windowSize);
    const firstAverage = getAverageForMetric(firstWindow, resolveValue);
    const lastAverage = getAverageForMetric(lastWindow, resolveValue);
    const delta = lastAverage - firstAverage;
    const absDelta = Math.abs(delta);

    if (absDelta < threshold) {
      return {
        tone: 'neutral',
        value: 'Estável',
        meta: `Média atual ${formatMetric(lastAverage, digits)}${unit}.`,
        trendArrow: '→',
        trendPercent: '0%'
      };
    }

    const isUp = delta > 0;
    const percentBase = Math.max(Math.abs(firstAverage), 0.1);
    const relativePercent = Math.max(1, Math.round((absDelta / percentBase) * 100));

    return {
      tone: isUp ? 'positive' : 'negative',
      value: isUp ? 'Em alta' : 'Em queda',
      meta: `Média atual ${formatMetric(lastAverage, digits)}${unit}.`,
      trendArrow: isUp ? '↑' : '↓',
      trendPercent: `${relativePercent}%`
    };
  };

  const findBiometriaByDate = (date) => biometria.find((item) => getDateKey(item.data) === getDateKey(date));
  const biometriaPorData = biometria.reduce((acc, item) => {
    acc[getDateKey(item.data)] = item;
    return acc;
  }, {});
  const historicoCompleto = registros.map((registro) => {
    const medida = biometriaPorData[getDateKey(registro.data)];

    return {
      ...registro,
      peso: medida?.peso ?? null,
      altura: medida?.altura ?? null,
      imc: medida?.imc ?? null,
      imcClassificacao: medida?.imcClassificacao ?? '',
      imcCor: medida?.imcCor ?? 'var(--text-main)'
    };
  });
  const getPeriodStartDate = (period) => {
    const daysByPeriod = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysByPeriod[period];

    if (!days) return null;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (days - 1));
    return startDate;
  };
  const reportPeriodStart = getPeriodStartDate(reportPeriod);
  const safeReportStartDate = normalizeReportDateValue(reportStartDate);
  const safeReportEndDate = normalizeReportDateValue(reportEndDate);
  const reportStartMaxDate = safeReportEndDate && safeReportEndDate < todayReportDate ? safeReportEndDate : todayReportDate;
  const customRangeStart = safeReportStartDate ? toLocalDate(safeReportStartDate) : null;
  const customRangeEnd = safeReportEndDate ? toLocalDate(safeReportEndDate) : null;
  const hasCustomReportRange = Boolean(customRangeStart || customRangeEnd);
  let effectiveReportStart = hasCustomReportRange ? customRangeStart : reportPeriodStart;
  let effectiveReportEnd = hasCustomReportRange ? customRangeEnd : null;

  if (hasCustomReportRange && effectiveReportStart && effectiveReportEnd && effectiveReportStart > effectiveReportEnd) {
    [effectiveReportStart, effectiveReportEnd] = [effectiveReportEnd, effectiveReportStart];
  }

  const customRangeLabel = (() => {
    if (!hasCustomReportRange) return '';
    if (effectiveReportStart && effectiveReportEnd) {
      return effectiveReportStart.getTime() === effectiveReportEnd.getTime()
        ? formatDateObject(effectiveReportStart)
        : `${formatDateObject(effectiveReportStart)} até ${formatDateObject(effectiveReportEnd)}`;
    }

    if (effectiveReportStart) return `A partir de ${formatDateObject(effectiveReportStart)}`;
    if (effectiveReportEnd) return `Até ${formatDateObject(effectiveReportEnd)}`;

    return '';
  })();

  const historicoFiltrado = historicoCompleto.filter((registro) => {
    const recordDate = toLocalDate(registro.data);
    const matchesStart = !effectiveReportStart || recordDate >= effectiveReportStart;
    const matchesEnd = !effectiveReportEnd || recordDate <= effectiveReportEnd;

    return matchesStart && matchesEnd;
  });
  const getReportSortValue = (registro, key) => {
    switch (key) {
      case 'data':
        return toLocalDate(registro.data).getTime();
      case 'humor':
      case 'energia':
      case 'produtividade':
      case 'agua':
      case 'sono':
      case 'peso':
      case 'imc':
        return registro[key] ?? null;
      case 'treino':
        return registro.exercicio ? 1 : 0;
      case 'observacoes':
        return (registro.observacoes || '').toLowerCase();
      default:
        return registro[key];
    }
  };
  const historicoOrdenado = [...historicoFiltrado].sort((a, b) => {
    const aValue = getReportSortValue(a, reportSort.key);
    const bValue = getReportSortValue(b, reportSort.key);
    const directionFactor = reportSort.direction === 'asc' ? 1 : -1;
    const aIsEmpty = aValue === null || aValue === undefined || aValue === '';
    const bIsEmpty = bValue === null || bValue === undefined || bValue === '';

    if (aIsEmpty && bIsEmpty) return 0;
    if (aIsEmpty) return 1;
    if (bIsEmpty) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue, 'pt-BR') * directionFactor;
    }

    if (aValue === bValue) return 0;

    return (aValue > bValue ? 1 : -1) * directionFactor;
  });
  const toggleReportSort = (key) => {
    setReportSort((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }

      return { key, direction: key === 'data' ? 'desc' : 'asc' };
    });
  };
  const getSortIndicator = (key) => {
    if (reportSort.key !== key) return '↕';
    return reportSort.direction === 'asc' ? '↑' : '↓';
  };
  const getAriaSort = (key) => {
    if (reportSort.key !== key) return 'none';
    return reportSort.direction === 'asc' ? 'ascending' : 'descending';
  };
  const currentSortSummary = `Ordenado por ${reportSortLabels[reportSort.key] || reportSort.key}, ${reportSort.direction === 'asc' ? 'crescente' : 'decrescente'}.`;
  const bemEstarTrend = getMetricTrend(
    historicoFiltrado,
    (item) => (Number(item.humor) + Number(item.energia) + Number(item.produtividade)) / 3,
    { digits: 1, threshold: 0.15, unit: '/5', label: 'Bem-estar' }
  );
  const reportSummary = (() => {
    if (historicoFiltrado.length === 0) {
      return {
        totalDias: 0,
        periodoLabel: hasCustomReportRange
          ? `Nenhum registro em ${customRangeLabel || 'intervalo customizado'}`
          : 'Ajuste os filtros para explorar o histórico.',
        avgBemEstar: '0',
        avgSono: '0',
        avgAgua: '0',
        treinoDias: 0,
        treinoPercent: 0,
        pesoLabel: 'Sem biometria',
        corpoLabel: 'Sem IMC no período filtrado'
      };
    }

    const ordenadoCrescente = [...historicoFiltrado].sort((a, b) => new Date(`${getDateKey(a.data)}T00:00:00`) - new Date(`${getDateKey(b.data)}T00:00:00`));
    const primeiroRegistro = ordenadoCrescente[0];
    const ultimoRegistro = ordenadoCrescente[ordenadoCrescente.length - 1];
    const treinoDias = historicoFiltrado.filter(item => item.exercicio).length;
    const biometriaComPeso = ordenadoCrescente.filter(item => item.peso !== null && item.peso !== undefined);
    const ultimaBiometria = biometriaComPeso[biometriaComPeso.length - 1];

    let pesoLabel = 'Sem biometria';
    let corpoLabel = 'Registre peso e altura para acompanhar sua evolução.';

    if (ultimaBiometria) {
      pesoLabel = `${formatMetric(ultimaBiometria.peso)} kg`;
      corpoLabel = ultimaBiometria.imc
        ? `IMC atual ${formatMetric(ultimaBiometria.imc)} (${ultimaBiometria.imcClassificacao})`
        : `Última biometria em ${formatDisplayDate(ultimaBiometria.data)}`;
    }

    return {
      totalDias: historicoFiltrado.length,
      periodoLabel: getDateKey(primeiroRegistro.data) === getDateKey(ultimoRegistro.data)
        ? formatDisplayDate(primeiroRegistro.data)
        : `${formatDisplayDate(primeiroRegistro.data)} até ${formatDisplayDate(ultimoRegistro.data)}`,
      avgBemEstar: formatMetric(getAverageForMetric(historicoFiltrado, (item) => (Number(item.humor) + Number(item.energia) + Number(item.produtividade)) / 3)),
      avgSono: formatMetric(historicoFiltrado.reduce((acc, item) => acc + Number(item.sono || 0), 0) / historicoFiltrado.length),
      avgAgua: formatMetric(historicoFiltrado.reduce((acc, item) => acc + Number(item.agua || 0), 0) / historicoFiltrado.length),
      treinoDias,
      treinoPercent: Math.round((treinoDias / historicoFiltrado.length) * 100),
      pesoLabel,
      corpoLabel
    };
  })();
  const reportSummaryCards = [
    {
      label: 'Cobertura',
      value: `${reportSummary.totalDias} dia${reportSummary.totalDias === 1 ? '' : 's'}`,
      meta: reportSummary.periodoLabel,
      tone: 'default'
    },
    {
      label: 'Bem-estar',
      value: bemEstarTrend.value,
      secondaryValue: `${reportSummary.avgBemEstar}/5`,
      trendArrow: bemEstarTrend.trendArrow,
      trendPercent: bemEstarTrend.trendPercent,
      meta: 'Humor, energia e produtividade',
      tone: bemEstarTrend.tone
    },
    {
      label: 'Treino',
      value: `${reportSummary.treinoPercent}% dos dias`,
      meta: `${reportSummary.treinoDias} de ${reportSummary.totalDias} registro${reportSummary.totalDias === 1 ? '' : 's'} com treino`,
      tone: 'default'
    },
    {
      label: 'Recuperação',
      value: `${reportSummary.avgSono} h de sono`,
      meta: `Água média ${reportSummary.avgAgua} L`,
      tone: 'default'
    },
    {
      label: 'Corpo',
      value: reportSummary.pesoLabel,
      meta: reportSummary.corpoLabel,
      tone: 'default'
    }
  ];

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

      const biometriaDoDia = findBiometriaByDate(formData.data);
      const alturaParaBiometria = formData.altura || biometriaDoDia?.altura || biometria[0]?.altura;

      if (formData.peso && alturaParaBiometria) {
        await apiClient.post('/biometria', { 
          usuarioId: user.id, 
          peso: parseFloat(formData.peso), 
          altura: parseInt(alturaParaBiometria, 10),
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
    const biometriaDoDia = findBiometriaByDate(registro.data);
    const {
      id,
      data,
      humor,
      sono,
      produtividade,
      energia,
      exercicio,
      agua,
      observacoes
    } = registro;

    setEditandoId(id);
    setFormData({
      data,
      humor,
      sono,
      produtividade,
      energia,
      exercicio,
      agua,
      observacoes: observacoes || '',
      peso: biometriaDoDia?.peso?.toString() || '',
      altura: biometriaDoDia?.altura?.toString() || biometria[0]?.altura?.toString() || ''
    });
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
    if (historicoOrdenado.length === 0) {
      alert('Não há dados filtrados para exportar.');
      return;
    }

    const headers = ["Data", "Humor", "Energia", "Produtividade", "Agua", "Sono", "Exercicio", "Peso", "Altura", "IMC", "ClassificacaoIMC", "Observacoes"];
    const csvContent = [
      headers.join(","),
      ...historicoOrdenado.map(r => [
        r.data,
        r.humor,
        r.energia,
        r.produtividade,
        r.agua,
        r.sono,
        r.exercicio ? "Sim" : "Nao",
        r.peso ?? "",
        r.altura ?? "",
        r.imc ?? "",
        `"${(r.imcClassificacao || "").replace(/"/g, '""')}"`,
        `"${(r.observacoes || "").replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ritmo_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportXLSX = async () => {
    if (historicoOrdenado.length === 0) {
      alert('Não há dados filtrados para exportar.');
      return;
    }

    try {
      setIsExportingExcel(true);
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      const wsDiary = XLSX.utils.json_to_sheet(historicoOrdenado.map(r => ({
        "Data": r.data,
        "Humor": r.humor,
        "Energia": r.energia,
        "Produtividade": r.produtividade,
        "Água": r.agua,
        "Sono": r.sono,
        "Exercício": r.exercicio ? "Sim" : "Não",
        "Peso (kg)": r.peso ?? "",
        "Altura (cm)": r.altura ?? "",
        "IMC": r.imc ?? "",
        "Classificação IMC": r.imcClassificacao || "",
        "Observações": r.observacoes || ""
      })));
      XLSX.utils.book_append_sheet(wb, wsDiary, "Diário de Hábitos");
      XLSX.writeFile(wb, `Ritmo_Analitico_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      alert("Erro ao gerar Excel. Tente novamente.");
    } finally {
      setIsExportingExcel(false);
    }
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
    let total = 0;
    const cat = meta.categoria.toLowerCase();
    const clampPercent = (value) => Math.max(0, Math.min(Math.round(value), 100));

    if (cat === 'peso') {
      const medidasOrdenadas = [...biometria]
        .filter(item => item.peso)
        .sort((a, b) => new Date(a.data) - new Date(b.data));

      if (medidasOrdenadas.length === 0) {
        return {
          percent: 0,
          current: 0,
          status: 'atrasado',
          unit: 'kg',
          currentLabel: 'Peso atual',
          targetLabel: `${Number(meta.valorAlvo).toFixed(1)} kg`,
          detailText: 'Sem biometria suficiente para comparar com a meta.',
          secondaryText: 'Registre seu peso para ativar este acompanhamento.'
        };
      }

      const dataInicioMeta = new Date(`${meta.dataInicio}T00:00:00`);
      const medidasDesdeInicio = medidasOrdenadas.filter(item => new Date(item.data) >= dataInicioMeta);
      const baseline = medidasDesdeInicio[0] || medidasOrdenadas[0];
      const atual = medidasOrdenadas[medidasOrdenadas.length - 1];

      const pesoInicial = Number(baseline.peso);
      const pesoAtual = Number(atual.peso);
      const pesoMeta = Number(meta.valorAlvo);
      const tolerancia = 0.5;

      let progresso = 0;
      let status = 'atrasado';
      let detailText = '';
      let secondaryText = '';
      let targetLabel = `${pesoMeta.toFixed(1)} kg`;

      if (Math.abs(pesoInicial - pesoMeta) <= tolerancia) {
        const distanciaAtual = Math.abs(pesoAtual - pesoMeta);
        progresso = distanciaAtual <= tolerancia ? 100 : 0;
        status = distanciaAtual <= tolerancia ? 'concluido' : distanciaAtual <= 2 ? 'em_dia' : 'atrasado';
        detailText = distanciaAtual <= tolerancia
          ? 'Meta mantida na faixa do alvo'
          : pesoAtual > pesoMeta
            ? `${distanciaAtual.toFixed(1)} kg acima da faixa alvo`
            : `${distanciaAtual.toFixed(1)} kg abaixo da faixa alvo`;
        secondaryText = distanciaAtual <= tolerancia
          ? `Objetivo de manutenção em torno de ${pesoMeta.toFixed(1)} kg`
          : `Objetivo é voltar para perto de ${pesoMeta.toFixed(1)} kg`;
      } else if (pesoInicial > pesoMeta) {
        const distanciaInicial = pesoInicial - pesoMeta;
        const distanciaAtual = Math.max(0, pesoAtual - pesoMeta);
        progresso = distanciaInicial === 0 ? 100 : ((distanciaInicial - distanciaAtual) / distanciaInicial) * 100;
        status = pesoAtual <= pesoMeta ? 'concluido' : distanciaAtual <= 2 ? 'em_dia' : 'atrasado';
        targetLabel = `${pesoMeta.toFixed(1)} kg ou menos`;
        detailText = pesoAtual <= pesoMeta
          ? `Meta atingida, ${(pesoMeta - pesoAtual).toFixed(1)} kg abaixo da meta`
          : `${distanciaAtual.toFixed(1)} kg acima da meta`;
        secondaryText = pesoAtual <= pesoMeta
          ? `Objetivo era chegar em ${pesoMeta.toFixed(1)} kg ou menos`
          : `${clampPercent(progresso)}% do caminho até ${pesoMeta.toFixed(1)} kg ou menos`;
      } else {
        const distanciaInicial = pesoMeta - pesoInicial;
        const distanciaAtual = Math.max(0, pesoMeta - pesoAtual);
        progresso = distanciaInicial === 0 ? 100 : ((distanciaInicial - distanciaAtual) / distanciaInicial) * 100;
        status = pesoAtual >= pesoMeta ? 'concluido' : distanciaAtual <= 2 ? 'em_dia' : 'atrasado';
        targetLabel = `${pesoMeta.toFixed(1)} kg ou mais`;
        detailText = pesoAtual >= pesoMeta
          ? `Meta atingida, ${(pesoAtual - pesoMeta).toFixed(1)} kg acima da meta`
          : `${distanciaAtual.toFixed(1)} kg abaixo da meta`;
        secondaryText = pesoAtual >= pesoMeta
          ? `Objetivo era chegar em ${pesoMeta.toFixed(1)} kg ou mais`
          : `${clampPercent(progresso)}% do caminho até ${pesoMeta.toFixed(1)} kg ou mais`;
      }

      return {
        percent: clampPercent(progresso),
        current: pesoAtual.toFixed(1),
        status,
        unit: 'kg',
        currentLabel: 'Peso atual',
        targetLabel,
        detailText,
        secondaryText
      };
    }

    if (registrosRecentes.length === 0) {
      return { percent: 0, current: 0, status: 'atrasado', unit: cat === 'treino' ? 'dias' : '', currentLabel: 'Sua média (7d)' };
    }

    if (cat === 'treino') {
      total = registrosRecentes.filter(r => r.exercicio).length;
    } else {
      total = registrosRecentes.reduce((acc, r) => acc + (r[cat] || 0), 0) / registrosRecentes.length;
    }

    const progresso = (total / meta.valorAlvo) * 100;
    return {
      percent: clampPercent(progresso),
      current: total.toFixed(1),
      status: progresso >= 100 ? 'concluido' : progresso >= 50 ? 'em_dia' : 'atrasado',
      unit: cat === 'treino' ? 'dias' : '',
      currentLabel: 'Sua média (7d)'
    };
  };

  const renderSortableHeader = (label, key) => (
    <button
      type="button"
      className={`history-sort-btn ${reportSort.key === key ? 'active' : ''}`}
      onClick={() => toggleReportSort(key)}
    >
      <span>{label}</span>
      <span className="history-sort-indicator" aria-hidden="true">{getSortIndicator(key)}</span>
    </button>
  );

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
                    <button className="btn-secondary" onClick={handleExportXLSX} style={{ color: '#2ecc71' }} disabled={isExportingExcel}>
                      <Download size={18} /> {isExportingExcel ? 'Gerando...' : 'Excel'}
                    </button>
                  </div>
                </div>
                <div className="glass-panel reports-toolbar">
                  <div className="reports-toolbar-row">
                    <div className="reports-filter-block">
                      <span className="reports-filter-label">Período</span>
                      <div className="reports-chip-group">
                        {reportPeriodOptions.map(option => (
                          <button
                            key={option.key}
                            type="button"
                            className={`reports-chip ${!hasCustomReportRange && reportPeriod === option.key ? 'active' : ''}`}
                            onClick={() => {
                              setReportPeriod(option.key);
                              setReportStartDate('');
                              setReportEndDate('');
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="reports-filter-block">
                      <span className="reports-filter-label">Intervalo customizado</span>
                      <div className="reports-date-grid">
                        <label className="reports-date-inline-field">
                          <span className="reports-inline-label">De</span>
                          <input
                            type="date"
                            className="input-field reports-date-input"
                            value={safeReportStartDate}
                            max={reportStartMaxDate}
                            onChange={(e) => setReportStartDate(normalizeReportDateValue(e.target.value))}
                            aria-label="Data inicial do relatório"
                          />
                        </label>
                        <label className="reports-date-inline-field">
                          <span className="reports-inline-label">Até</span>
                          <input
                            type="date"
                            className="input-field reports-date-input"
                            value={safeReportEndDate}
                            min={safeReportStartDate || undefined}
                            max={todayReportDate}
                            onChange={(e) => setReportEndDate(normalizeReportDateValue(e.target.value))}
                            aria-label="Data final do relatório"
                          />
                        </label>
                        {(safeReportStartDate || safeReportEndDate) && (
                          <button
                            type="button"
                            className="btn-secondary reports-clear-btn"
                            onClick={() => {
                              setReportStartDate('');
                              setReportEndDate('');
                            }}
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="reports-toolbar-caption">
                    Exibindo {historicoFiltrado.length} de {historicoCompleto.length} registro{historicoCompleto.length === 1 ? '' : 's'}.
                    {hasCustomReportRange ? ` Intervalo ativo: ${customRangeLabel}.` : ''} {currentSortSummary}
                  </p>
                </div>
                <div className="report-summary-grid">
                  {reportSummaryCards.map(card => (
                    <div key={card.label} className={`glass-panel report-summary-card ${card.tone || 'default'}`}>
                      <span className="report-summary-label">{card.label}</span>
                      {card.secondaryValue ? (
                        <div className="report-summary-value-row">
                          <strong className={`report-summary-value ${card.tone || 'default'}`}>{card.value}</strong>
                          <strong className="report-summary-secondary-value">{card.secondaryValue}</strong>
                          {card.trendPercent ? (
                            <span className={`report-summary-trend ${card.tone || 'default'}`}>
                              <span>{card.trendArrow}</span>
                              <span>{card.trendPercent}</span>
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <strong className={`report-summary-value ${card.tone || 'default'}`}>{card.value}</strong>
                      )}
                      <span className="report-summary-meta">{card.meta}</span>
                    </div>
                  ))}
                </div>
                <div className="glass-panel" style={{ overflowX: 'auto' }}>
                  {historicoFiltrado.length === 0 ? (
                    <div className="history-empty-state">
                      <strong>Nenhum registro encontrado</strong>
                      <p>Experimente ampliar o período rápido ou limpar o intervalo customizado para recuperar mais informações.</p>
                    </div>
                  ) : (
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th aria-sort={getAriaSort('data')}>{renderSortableHeader('Data', 'data')}</th>
                          <th aria-sort={getAriaSort('humor')}>{renderSortableHeader('Humor', 'humor')}</th>
                          <th aria-sort={getAriaSort('energia')}>{renderSortableHeader('Energia', 'energia')}</th>
                          <th aria-sort={getAriaSort('produtividade')}>{renderSortableHeader('Produtiv.', 'produtividade')}</th>
                          <th aria-sort={getAriaSort('agua')}>{renderSortableHeader('Água', 'agua')}</th>
                          <th aria-sort={getAriaSort('sono')}>{renderSortableHeader('Sono', 'sono')}</th>
                          <th aria-sort={getAriaSort('treino')}>{renderSortableHeader('Treino', 'treino')}</th>
                          <th aria-sort={getAriaSort('peso')}>{renderSortableHeader('Biometria', 'peso')}</th>
                          <th aria-sort={getAriaSort('imc')}>{renderSortableHeader('IMC', 'imc')}</th>
                          <th aria-sort={getAriaSort('observacoes')}>{renderSortableHeader('Observações', 'observacoes')}</th>
                          <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicoOrdenado.map(r => (
                          <tr key={r.id} className={`history-row ${isWeekendDate(r.data) ? 'weekend' : ''}`}>
                            <td>
                              <div className="history-cell-stack">
                                <strong>{formatDisplayDate(r.data)}</strong>
                                <span className={`history-day-badge ${isWeekendDate(r.data) ? 'weekend' : ''}`}>
                                  {getWeekdayShortLabel(r.data)}
                                </span>
                              </div>
                            </td>
                            <td>{r.humor}/5</td>
                            <td>{r.energia}/5</td>
                            <td>{r.produtividade}/5</td>
                            <td>{formatMetric(r.agua)} L</td>
                            <td>{formatMetric(r.sono)} h</td>
                            <td>
                              <span className={`history-pill ${r.exercicio ? 'success' : 'neutral'}`}>
                                {r.exercicio ? 'Fez treino' : 'Sem treino'}
                              </span>
                            </td>
                            <td>
                              <div className="history-cell-stack">
                                <strong>{r.peso ? `${formatMetric(r.peso)} kg` : 'Sem peso'}</strong>
                                <span>{r.altura ? `${r.altura} cm` : 'Sem altura'}</span>
                              </div>
                            </td>
                            <td>
                              {r.imc ? (
                                <div className="history-cell-stack">
                                  <strong>{formatMetric(r.imc)}</strong>
                                  <span style={{ color: r.imcCor }}>{r.imcClassificacao}</span>
                                </div>
                              ) : (
                                <span className="history-muted">Sem IMC</span>
                              )}
                            </td>
                            <td className="history-observacoes" title={r.observacoes || 'Sem observações'}>
                              {r.observacoes || 'Sem observações'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="action-btn edit" onClick={() => handleEditar(r)}><Pencil size={18} /></button>
                              <button className="action-btn delete" onClick={() => handleExcluir(r.id)}><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
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
                      const isPeso = meta.categoria.toLowerCase() === 'peso';
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
                              <span>{prog.currentLabel}: <strong>{prog.current}{prog.unit ? ` ${prog.unit}` : ''}</strong></span>
                              <span>Meta: {isPeso ? prog.targetLabel : `${meta.valorAlvo}${isTreino ? ` ${prog.unit}` : ''}`}</span>
                            </div>
                            <div className="progress-track">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${prog.percent}%`, backgroundColor: color, color: color }}
                              ></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: color }}>
                                {isPeso
                                  ? prog.detailText
                                  : `${prog.percent}% ${prog.percent >= 100 ? 'CONCLUÍDO!' : 'EM ANDAMENTO'}`}
                              </span>
                              <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                {isPeso ? prog.secondaryText : 'Atualizado agora'}
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
