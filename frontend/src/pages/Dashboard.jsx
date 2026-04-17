import { useEffect, useRef, useState } from 'react';
import { Pencil, Trash2, LayoutDashboard, ClipboardList, Download, BarChart3, Activity, RefreshCw, X, TrendingUp } from 'lucide-react';

import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardHeader } from '../components/DashboardHeader';
import { StatsCards } from '../components/StatsCards';
import { DataFormModal } from '../components/DataFormModal';
import { ChartsContainer } from '../components/ChartsContainer';
import { MetaFormModal } from '../components/MetaFormModal'; // Novo Import
import { NoticeBanner } from '../components/NoticeBanner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DateField } from '../components/DateField';
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
  const [reportFocus, setReportFocus] = useState('all');
  const [analysisPeriod, setAnalysisPeriod] = useState('all');
  const [analysisStartDate, setAnalysisStartDate] = useState('');
  const [analysisEndDate, setAnalysisEndDate] = useState('');
  const [analysisGrouping, setAnalysisGrouping] = useState('daily');
  const [reportSort, setReportSort] = useState({ key: 'data', direction: 'desc' });
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isTabsDocked, setIsTabsDocked] = useState(false);
  const topTabsRef = useRef(null);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    humor: 3,
    sono: 8,
    produtividade: 3,
    energia: 3,
    exercicio: false,
    agua: 2.0,
    observacoes: '',
    peso: '',
    altura: '',
    registrouPesoHoje: false,
    atualizarAltura: false
  });
  const reportPeriodOptions = [
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: '90d', label: '90 dias' },
    { key: 'all', label: 'Tudo' }
  ];
  const analysisGroupingOptions = [
    { key: 'daily', label: 'Diário' },
    { key: 'weekly', label: 'Semanal' },
    { key: 'biweekly', label: 'Quinzenal' },
    { key: 'monthly', label: 'Mensal' }
  ];
  const analysisGroupingMinimumDays = {
    daily: 1,
    weekly: 8,
    biweekly: 15,
    monthly: 30
  };
  const reportFocusOptions = [
    { key: 'all', label: 'Todos' },
    { key: 'training', label: 'Treino' },
    { key: 'biometric', label: 'Biometria' },
    { key: 'notes', label: 'Anotações' }
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
  const showNotice = (tone, title, message = '') => setNotice({ tone, title, message, id: Date.now() });

  useEffect(() => {
    if (!notice) return undefined;

    const timeoutId = setTimeout(() => {
      setNotice(null);
    }, 4500);

    return () => clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let frameId = null;
    let dockThreshold = Number.POSITIVE_INFINITY;

    const recalculateThreshold = () => {
      if (window.innerWidth < 900 || !topTabsRef.current) {
        dockThreshold = Number.POSITIVE_INFINITY;
        setIsTabsDocked(false);
        return;
      }

      const rect = topTabsRef.current.getBoundingClientRect();
      dockThreshold = Math.max(0, window.scrollY + rect.top - 96);
    };

    const updateDockState = () => {
      frameId = null;
      setIsTabsDocked(window.innerWidth >= 900 && window.scrollY > dockThreshold);
    };

    const requestUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateDockState);
    };

    const handleResize = () => {
      recalculateThreshold();
      requestUpdate();
    };

    recalculateThreshold();
    updateDockState();

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', handleResize);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);


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
  const getLatestHeightValue = () => biometria[0]?.altura?.toString() || '';
  const getInitialFormData = () => ({
    data: toDateInputValue(),
    humor: 3,
    sono: 8,
    produtividade: 3,
    energia: 3,
    exercicio: false,
    agua: 2.0,
    observacoes: '',
    peso: '',
    altura: getLatestHeightValue(),
    registrouPesoHoje: false,
    atualizarAltura: false
  });
  const normalizeDateFilterValue = (value) => {
    if (!value) return '';
    return value > todayReportDate ? todayReportDate : value;
  };
  const normalizeReportDateValue = (value) => normalizeDateFilterValue(value);
  const normalizeAnalysisDateValue = (value) => normalizeDateFilterValue(value);
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
  const resolveDateRange = (period, startValue, endValue) => {
    const periodStart = getPeriodStartDate(period);
    const safeStartDate = normalizeDateFilterValue(startValue);
    const safeEndDate = normalizeDateFilterValue(endValue);
    const startMaxDate = safeEndDate && safeEndDate < todayReportDate ? safeEndDate : todayReportDate;
    const customStart = safeStartDate ? toLocalDate(safeStartDate) : null;
    const customEnd = safeEndDate ? toLocalDate(safeEndDate) : null;
    const hasCustomRange = Boolean(customStart || customEnd);
    let effectiveStart = hasCustomRange ? customStart : periodStart;
    let effectiveEnd = hasCustomRange ? customEnd : null;

    if (hasCustomRange && effectiveStart && effectiveEnd && effectiveStart > effectiveEnd) {
      [effectiveStart, effectiveEnd] = [effectiveEnd, effectiveStart];
    }

    const customRangeLabel = (() => {
      if (!hasCustomRange) return '';
      if (effectiveStart && effectiveEnd) {
        return effectiveStart.getTime() === effectiveEnd.getTime()
          ? formatDateObject(effectiveStart)
          : `${formatDateObject(effectiveStart)} até ${formatDateObject(effectiveEnd)}`;
      }

      if (effectiveStart) return `A partir de ${formatDateObject(effectiveStart)}`;
      if (effectiveEnd) return `Até ${formatDateObject(effectiveEnd)}`;

      return '';
    })();

    return {
      safeStartDate,
      safeEndDate,
      startMaxDate,
      hasCustomRange,
      effectiveStart,
      effectiveEnd,
      customRangeLabel
    };
  };
  const getDaySpan = (startDate, endDate) => {
    if (!startDate || !endDate) return null;

    const oneDayInMs = 24 * 60 * 60 * 1000;
    return Math.floor((endDate.getTime() - startDate.getTime()) / oneDayInMs) + 1;
  };
  const getAnalysisRangeSpanDays = (period, dateRange) => {
    const explicitStart = dateRange.effectiveStart;
    const explicitEnd = dateRange.effectiveEnd;

    if (explicitStart && explicitEnd) {
      return getDaySpan(explicitStart, explicitEnd) ?? 1;
    }

    if (explicitStart) {
      return getDaySpan(explicitStart, toLocalDate(todayReportDate)) ?? 1;
    }

    if (explicitEnd) {
      return 1;
    }

    if (period === '7d') return 7;
    if (period === '30d') return 30;
    if (period === '90d') return 90;
    if (period === 'all') return Number.POSITIVE_INFINITY;

    return Number.POSITIVE_INFINITY;
  };
  const filterItemsByDateRange = (items, dateRange, resolveDate) => items.filter((item) => {
    const itemDate = resolveDate(item);
    const matchesStart = !dateRange.effectiveStart || itemDate >= dateRange.effectiveStart;
    const matchesEnd = !dateRange.effectiveEnd || itemDate <= dateRange.effectiveEnd;

    return matchesStart && matchesEnd;
  });
  const stripTrailingDot = (value) => value.replace('.', '');
  const formatMonthShort = (date) => stripTrailingDot(date.toLocaleDateString('pt-BR', { month: 'short' }));
  const addDays = (date, days) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate;
  };
  const getWeekStart = (date) => {
    const nextDate = new Date(date);
    const weekDay = nextDate.getDay();
    const shift = weekDay === 0 ? -6 : 1 - weekDay;
    nextDate.setDate(nextDate.getDate() + shift);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate;
  };
  const getMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const getMonthEnd = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const getBiweeklyRange = (date) => {
    const isFirstHalf = date.getDate() <= 15;
    const start = new Date(date.getFullYear(), date.getMonth(), isFirstHalf ? 1 : 16);
    const end = isFirstHalf
      ? new Date(date.getFullYear(), date.getMonth(), 15)
      : getMonthEnd(date);

    return { start, end, isFirstHalf };
  };
  const getAnalysisBucketMeta = (value, grouping) => {
    const date = value instanceof Date ? new Date(value) : toLocalDate(value);
    date.setHours(0, 0, 0, 0);

    if (grouping === 'weekly') {
      const start = getWeekStart(date);
      const end = addDays(start, 6);
      return {
        key: `${toDateInputValue(start)}_weekly`,
        label: `${formatDateObject(start).slice(0, 5)} a ${formatDateObject(end).slice(0, 5)}`,
        fullLabel: `${formatDateObject(start)} até ${formatDateObject(end)}`,
        sortTime: start.getTime(),
        endTime: end.getTime()
      };
    }

    if (grouping === 'biweekly') {
      const { start, end, isFirstHalf } = getBiweeklyRange(date);
      return {
        key: `${toDateInputValue(start)}_biweekly`,
        label: `${isFirstHalf ? '1-15' : '16-fim'} ${formatMonthShort(start)}/${String(start.getFullYear()).slice(-2)}`,
        fullLabel: `${formatDateObject(start)} até ${formatDateObject(end)}`,
        sortTime: start.getTime(),
        endTime: end.getTime()
      };
    }

    if (grouping === 'monthly') {
      const start = getMonthStart(date);
      const end = getMonthEnd(date);
      return {
        key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}_monthly`,
        label: `${formatMonthShort(start)}/${String(start.getFullYear()).slice(-2)}`,
        fullLabel: `${formatDateObject(start)} até ${formatDateObject(end)}`,
        sortTime: start.getTime(),
        endTime: end.getTime()
      };
    }

    return {
      key: `${toDateInputValue(date)}_daily`,
      label: formatDateObject(date),
      fullLabel: formatDateObject(date),
      sortTime: date.getTime(),
      endTime: date.getTime()
    };
  };
  const aggregateAnalysisRecords = (items, grouping) => {
    const buckets = new Map();

    [...items]
      .sort((a, b) => toLocalDate(a.data) - toLocalDate(b.data))
      .forEach((item) => {
        const meta = getAnalysisBucketMeta(item.data, grouping);
        const currentBucket = buckets.get(meta.key) ?? {
          data: meta.label,
          fullDate: meta.fullLabel,
          sortTime: meta.sortTime,
          count: 0,
          humor: 0,
          energia: 0,
          sono: 0,
          produtividade: 0
        };

        currentBucket.count += 1;
        currentBucket.humor += Number(item.humor || 0);
        currentBucket.energia += Number(item.energia || 0);
        currentBucket.sono += Number(item.sono || 0);
        currentBucket.produtividade += Number(item.produtividade || 0);
        buckets.set(meta.key, currentBucket);
      });

    return [...buckets.values()]
      .sort((a, b) => a.sortTime - b.sortTime)
      .map((bucket) => ({
        data: bucket.data,
        fullDate: bucket.fullDate,
        humor: Number((bucket.humor / bucket.count).toFixed(1)),
        energia: Number((bucket.energia / bucket.count).toFixed(1)),
        sono: Number((bucket.sono / bucket.count).toFixed(1)),
        produtividade: Number((bucket.produtividade / bucket.count).toFixed(1)),
        bemEstar: Number((((bucket.humor + bucket.energia + bucket.produtividade) / 3) / bucket.count).toFixed(1)),
        totalRegistros: bucket.count
      }));
  };
  const aggregateAnalysisWeight = (timelineItems, filteredMeasurements, allMeasurements, grouping) => {
    const buckets = new Map();
    const addBucket = (value) => {
      const meta = getAnalysisBucketMeta(value, grouping);
      const currentBucket = buckets.get(meta.key);

      if (currentBucket) return;

      buckets.set(meta.key, {
        data: meta.label,
        fullDate: meta.fullLabel,
        sortTime: meta.sortTime,
        endTime: meta.endTime
      });
    };

    timelineItems.forEach((item) => addBucket(item.data));
    filteredMeasurements.forEach((item) => addBucket(item.data));

    const sortedMeasurements = [...allMeasurements]
      .filter((item) => item.peso !== null && item.peso !== undefined && item.peso !== '')
      .sort((a, b) => toLocalDate(a.data) - toLocalDate(b.data))
      .map((item) => ({
        peso: Number(item.peso),
        measurementTime: toLocalDate(item.data).getTime()
      }));

    let measurementIndex = 0;
    let lastKnownWeight = null;

    return [...buckets.values()]
      .sort((a, b) => a.sortTime - b.sortTime)
      .map((bucket) => {
        while (
          measurementIndex < sortedMeasurements.length &&
          sortedMeasurements[measurementIndex].measurementTime <= bucket.endTime
        ) {
          lastKnownWeight = sortedMeasurements[measurementIndex].peso;
          measurementIndex += 1;
        }

        if (lastKnownWeight === null) {
          return null;
        }

        return {
          data: bucket.data,
          fullDate: bucket.fullDate,
          peso: lastKnownWeight
        };
      })
      .filter(Boolean);
  };
  const reportDateRange = resolveDateRange(reportPeriod, reportStartDate, reportEndDate);
  const analysisDateRange = resolveDateRange(analysisPeriod, analysisStartDate, analysisEndDate);
  const safeReportStartDate = reportDateRange.safeStartDate;
  const safeReportEndDate = reportDateRange.safeEndDate;
  const reportStartMaxDate = reportDateRange.startMaxDate;
  const hasCustomReportRange = reportDateRange.hasCustomRange;
  const customRangeLabel = reportDateRange.customRangeLabel;
  const safeAnalysisStartDate = analysisDateRange.safeStartDate;
  const safeAnalysisEndDate = analysisDateRange.safeEndDate;
  const analysisStartMaxDate = analysisDateRange.startMaxDate;
  const hasCustomAnalysisRange = analysisDateRange.hasCustomRange;
  const customAnalysisRangeLabel = analysisDateRange.customRangeLabel;

  const historicoFiltradoPorData = filterItemsByDateRange(historicoCompleto, reportDateRange, (registro) => toLocalDate(registro.data));
  const availableReportFocusOptions = reportFocusOptions.filter((option) => {
    if (option.key === 'all') return true;
    if (option.key === 'training') return historicoFiltradoPorData.some((registro) => Boolean(registro.exercicio));
    if (option.key === 'biometric') return historicoFiltradoPorData.some((registro) => registro.peso !== null && registro.peso !== undefined);
    if (option.key === 'notes') return historicoFiltradoPorData.some((registro) => Boolean(String(registro.observacoes || '').trim()));

    return true;
  });
  const effectiveReportFocus = availableReportFocusOptions.some((option) => option.key === reportFocus)
    ? reportFocus
    : 'all';
  const reportFocusLabel = reportFocusOptions.find(option => option.key === effectiveReportFocus)?.label || 'Todos';
  const historicoFiltrado = historicoFiltradoPorData.filter((registro) => {
    if (effectiveReportFocus === 'training') return Boolean(registro.exercicio);
    if (effectiveReportFocus === 'biometric') return registro.peso !== null && registro.peso !== undefined;
    if (effectiveReportFocus === 'notes') return Boolean(String(registro.observacoes || '').trim());
    
    return true;
  });
  useEffect(() => {
    if (reportFocus !== effectiveReportFocus) {
      setReportFocus(effectiveReportFocus);
    }
  }, [reportFocus, effectiveReportFocus]);
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
      const isEditing = Boolean(editandoId);
      const payload = {
        usuarioId: user.id,
        data: formData.data,
        humor: formData.humor,
        sono: formData.sono,
        produtividade: formData.produtividade,
        energia: formData.energia,
        exercicio: formData.exercicio,
        agua: formData.agua,
        observacoes: formData.observacoes
      };
      if (editandoId) {
        await apiClient.put(`/registrosdiarios/${editandoId}`, payload);
      } else {
        await apiClient.post('/registrosdiarios', payload);
      }

      const biometriaDoDia = findBiometriaByDate(formData.data);
      const alturaBase = formData.atualizarAltura
        ? formData.altura
        : formData.altura || biometriaDoDia?.altura?.toString() || biometria[0]?.altura?.toString() || '';
      const alturaParaBiometria = String(alturaBase || '').trim();

      if (formData.registrouPesoHoje && formData.peso && alturaParaBiometria) {
        await apiClient.post('/biometria', { 
          usuarioId: user.id, 
          peso: parseFloat(formData.peso), 
          altura: parseInt(alturaParaBiometria, 10),
          data: formData.data 
        });
      } else if (isEditing && biometriaDoDia && !formData.registrouPesoHoje) {
        await apiClient.delete(`/biometria/${biometriaDoDia.id}`);
      }

      setIsModalOpen(false);
      setEditandoId(null);
      setFormData(getInitialFormData());
      await loadDashboard();
      showNotice(
        'success',
        isEditing ? 'Registro atualizado' : 'Registro salvo',
        isEditing
          ? 'Seu histórico do dia foi atualizado com sucesso.'
          : 'Seu novo registro já entrou para as análises da dashboard.'
      );
    } catch (err) {
      showNotice('error', 'Não foi possível salvar', err.response?.data?.mensagem || err.message);
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
    const alturaDoDia = biometriaDoDia?.altura?.toString() || biometria[0]?.altura?.toString() || '';
    const existePesoNoDia = Boolean(biometriaDoDia?.peso);

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
      altura: alturaDoDia,
      registrouPesoHoje: existePesoNoDia,
      atualizarAltura: !alturaDoDia
    });
    setIsModalOpen(true);
  };

  const handleNovoRegistro = () => {
    setEditandoId(null);
    setFormData(getInitialFormData());
    setIsModalOpen(true);
  };

  const handleExcluir = (id) => {
    setConfirmState({
      title: 'Excluir registro do dia',
      message: 'Essa ação remove permanentemente os dados desse dia do seu histórico e dos relatórios.',
      confirmLabel: 'Excluir registro',
      tone: 'danger',
      action: async () => {
        try {
          await apiClient.delete(`/registrosdiarios/${id}`);
          await loadDashboard();
          showNotice('success', 'Registro excluído', 'O dia removido não aparecerá mais no histórico.');
        } catch (err) {
          showNotice('error', 'Não foi possível excluir', err.response?.data?.mensagem || 'Tente novamente em instantes.');
        }
      }
    });
  };


  // --- Exportações ---
  const handleExportCSV = () => {
    if (historicoOrdenado.length === 0) {
      showNotice('warning', 'Nada para exportar', 'Ajuste os filtros para incluir pelo menos um registro.');
      return;
    }

    const headers = ["Data", "Humor", "Energia", "Produtividade", "Agua", "Sono", "Exercicio", "Peso", "Altura", "IMC", "ClassificacaoIMC", "Observacoes"];
    const csvContent = [
      headers.join(","),
      ...historicoOrdenado.map(r => [
        formatDisplayDate(r.data),
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
    showNotice('info', 'CSV preparado', 'O download do relatório em CSV foi iniciado.');
  };

  const handleExportXLSX = async () => {
    if (historicoOrdenado.length === 0) {
      showNotice('warning', 'Nada para exportar', 'Ajuste os filtros para incluir pelo menos um registro.');
      return;
    }

    try {
      setIsExportingExcel(true);
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      const wsDiary = XLSX.utils.json_to_sheet(historicoOrdenado.map(r => ({
        "Data": formatDisplayDate(r.data),
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
      showNotice('info', 'Excel preparado', 'O download da planilha foi iniciado.');
    } catch (err) {
      showNotice('error', 'Erro ao gerar Excel', 'Tente novamente em instantes.');
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
  const analysisRecords = filterItemsByDateRange(registros, analysisDateRange, (registro) => toLocalDate(registro.data));
  const analysisBiometria = filterItemsByDateRange(biometria, analysisDateRange, (registro) => toLocalDate(registro.data));
  const analysisRangeSpanDays = getAnalysisRangeSpanDays(analysisPeriod, analysisDateRange);
  const availableAnalysisGroupingOptions = analysisGroupingOptions.filter(
    (option) => analysisRangeSpanDays >= analysisGroupingMinimumDays[option.key]
  );
  const effectiveAnalysisGrouping = availableAnalysisGroupingOptions.some((option) => option.key === analysisGrouping)
    ? analysisGrouping
    : availableAnalysisGroupingOptions[0]?.key ?? 'daily';
  const analysisChartData = aggregateAnalysisRecords(analysisRecords, effectiveAnalysisGrouping);
  const analysisWeightData = aggregateAnalysisWeight(
    analysisRecords,
    analysisBiometria,
    biometria,
    effectiveAnalysisGrouping
  );
  const analysisGroupingCopy = {
    daily: {
      wellbeingSubtitle: 'Leitura diária de humor, energia, produtividade e bem-estar combinado.',
      sleepSubtitle: 'Horas de sono lançadas em cada dia do período filtrado.',
      weightSubtitle: 'Último peso conhecido em cada dia do intervalo.'
    },
    weekly: {
      wellbeingSubtitle: 'Médias semanais para reduzir ruído e destacar o bem-estar combinado.',
      sleepSubtitle: 'Média semanal de sono para acompanhar recuperação com menos ruído.',
      weightSubtitle: 'Último peso conhecido em cada semana do intervalo.'
    },
    biweekly: {
      wellbeingSubtitle: 'Médias quinzenais para leitura mais estável do bem-estar ao longo do mês.',
      sleepSubtitle: 'Média quinzenal de sono para comparação mais estável dentro do mês.',
      weightSubtitle: 'Último peso conhecido em cada quinzena do intervalo.'
    },
    monthly: {
      wellbeingSubtitle: 'Médias mensais para acompanhar o bem-estar em horizonte mais longo.',
      sleepSubtitle: 'Média mensal de sono para leitura de recuperação no longo prazo.',
      weightSubtitle: 'Último peso conhecido em cada mês do intervalo.'
    }
  };
  const analysisGroupingLabelMap = {
    daily: 'diária',
    weekly: 'semanal',
    biweekly: 'quinzenal',
    monthly: 'mensal'
  };
  const analysisSummaryCaption = [
    `Base da análise: ${analysisRecords.length} registro${analysisRecords.length === 1 ? '' : 's'}.`,
    `Leitura ${analysisGroupingLabelMap[effectiveAnalysisGrouping]} em ${analysisChartData.length} período${analysisChartData.length === 1 ? '' : 's'}.`,
    analysisWeightData.length > 0
      ? `Peso disponível em ${analysisWeightData.length} ponto${analysisWeightData.length === 1 ? '' : 's'} do gráfico.`
      : 'Sem biometria disponível no intervalo selecionado.',
    hasCustomAnalysisRange ? `Intervalo ativo: ${customAnalysisRangeLabel}.` : ''
  ].filter(Boolean).join(' ');
  const reportSummaryCaption = [
    `Exibindo ${historicoFiltrado.length} de ${historicoCompleto.length} registro${historicoCompleto.length === 1 ? '' : 's'}.`,
    effectiveReportFocus !== 'all' ? `Foco atual: ${reportFocusLabel.toLowerCase()}.` : '',
    hasCustomReportRange ? `Intervalo ativo: ${customRangeLabel}.` : '',
    currentSortSummary
  ].filter(Boolean).join(' ');

  useEffect(() => {
    if (analysisGrouping !== effectiveAnalysisGrouping) {
      setAnalysisGrouping(effectiveAnalysisGrouping);
    }
  }, [analysisGrouping, effectiveAnalysisGrouping]);

  // --- Lógica de Metas ---
  const handleExcluirMeta = (id) => {
    setConfirmState({
      title: 'Remover meta',
      message: 'Essa meta deixará de aparecer no seu painel de desafios e sairá do acompanhamento atual.',
      confirmLabel: 'Remover meta',
      tone: 'danger',
      action: async () => {
        try {
          await apiClient.delete(`/metas/${id}`);
          await loadDashboard();
          showNotice('success', 'Meta removida', 'Seu painel de desafios foi atualizado.');
        } catch (err) {
          showNotice('error', 'Não foi possível remover a meta', err.response?.data?.mensagem || 'Tente novamente em instantes.');
        }
      }
    });
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
  const handleConfirmAction = async () => {
    if (!confirmState?.action) return;

    try {
      setIsConfirming(true);
      await confirmState.action();
      setConfirmState(null);
    } finally {
      setIsConfirming(false);
    }
  };

  const tabItems = [
    { key: 'panorama', label: 'Panorama', Icon: LayoutDashboard },
    { key: 'analise', label: 'Análise', Icon: BarChart3 },
    { key: 'metas', label: 'Metas', Icon: TrendingUp },
    { key: 'relatorios', label: 'Relatórios', Icon: ClipboardList }
  ];

  const renderTabs = (variant) => (
    <div
      ref={variant === 'top' ? topTabsRef : undefined}
      className={[
        'tabs-wrapper',
        'animate-fade-up',
        variant === 'top' ? 'tabs-top-bar' : 'tabs-side-rail',
        variant === 'top' && isTabsDocked ? 'tabs-top-bar-hidden' : '',
        variant === 'side' && isTabsDocked ? 'tabs-side-rail-visible' : ''
      ].filter(Boolean).join(' ')}
    >
      {tabItems.map(({ key, label, Icon }) => (
        <button
          key={`${variant}-${key}`}
          className={`tab-btn ${activeTab === key ? 'active' : ''}`}
          onClick={() => setActiveTab(key)}
          aria-label={label}
          title={label}
        >
          <Icon size={18} />
          <span className="tab-btn-label">{label}</span>
        </button>
      ))}
    </div>
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

        <main className={`main-content dashboard-main-layout ${isTabsDocked ? 'dashboard-tabs-docked' : ''}`} style={{ width: '100%' }}>
          {renderTabs('top')}
          <div className={`dashboard-main-shell ${isTabsDocked ? 'dashboard-main-shell-docked' : ''}`}>
            {renderTabs('side')}
            <div className="dashboard-main-pane">
            <NoticeBanner notice={notice} onClose={() => setNotice(null)} />

            <div className="tab-content">
            {activeTab === 'panorama' && (
              <>
                <StatsCards imc={imcAtual} imcMeta={imcMeta} pesoAtual={biometria[0]?.peso} pesoAnterior={biometria[1]?.peso} pesoIdeal={pesoIdeal} avgHumor={avgHumor} avgSono={avgSono} avgAgua={avgAgua} />
                <ChartsContainer type="panorama" data={registros} radarData={radarData} />
              </>
            )}

            {activeTab === 'analise' && (
              <div className="animate-fade-up">
                <div className="glass-panel reports-toolbar analysis-toolbar">
                  <div className="reports-toolbar-row toolbar-uniform-row">
                    <div className="reports-filter-block toolbar-equal-block">
                      <span className="reports-filter-label">Período</span>
                      <select
                        className="input-field toolbar-select"
                        value={analysisPeriod}
                        onChange={(e) => {
                          setAnalysisPeriod(e.target.value);
                          setAnalysisStartDate('');
                          setAnalysisEndDate('');
                        }}
                        aria-label="Período da análise"
                      >
                        {reportPeriodOptions.map(option => (
                          <option key={`analysis-period-${option.key}`} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="reports-filter-block toolbar-equal-block">
                      <span className="reports-filter-label">Agrupamento</span>
                      <select
                        className="input-field toolbar-select"
                        value={effectiveAnalysisGrouping}
                        onChange={(e) => setAnalysisGrouping(e.target.value)}
                        aria-label="Agrupamento da análise"
                      >
                        {availableAnalysisGroupingOptions.map(option => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <DateField
                      label="De"
                      value={safeAnalysisStartDate}
                      onChange={(e) => setAnalysisStartDate(normalizeAnalysisDateValue(e.target.value))}
                      max={analysisStartMaxDate}
                      containerClassName="reports-filter-block toolbar-equal-block"
                      labelClassName="reports-filter-label"
                      inputClassName="reports-date-input reports-date-input-compact"
                      buttonClassName="reports-date-picker-btn"
                      buttonMode="icon"
                      buttonAriaLabel="Abrir calendário da data inicial da análise"
                    />
                    <DateField
                      label="Até"
                      value={safeAnalysisEndDate}
                      onChange={(e) => setAnalysisEndDate(normalizeAnalysisDateValue(e.target.value))}
                      min={safeAnalysisStartDate || undefined}
                      max={todayReportDate}
                      containerClassName="reports-filter-block toolbar-equal-block"
                      labelClassName="reports-filter-label"
                      inputClassName="reports-date-input reports-date-input-compact"
                      buttonClassName="reports-date-picker-btn"
                      buttonMode="icon"
                      buttonAriaLabel="Abrir calendário da data final da análise"
                    />
                  </div>
                  <div className="toolbar-footer">
                    <p className="reports-toolbar-caption">{analysisSummaryCaption}</p>
                    {(safeAnalysisStartDate || safeAnalysisEndDate) && (
                      <button
                        type="button"
                        className="btn-secondary toolbar-clear-btn"
                        onClick={() => {
                          setAnalysisStartDate('');
                          setAnalysisEndDate('');
                        }}
                      >
                        Limpar intervalo
                      </button>
                    )}
                  </div>
                </div>

                <ChartsContainer
                  type="analise"
                  data={analysisChartData}
                  weightDataForChart={analysisWeightData}
                  analysisHabitsSubtitle={analysisGroupingCopy[effectiveAnalysisGrouping].wellbeingSubtitle}
                  analysisSleepSubtitle={analysisGroupingCopy[effectiveAnalysisGrouping].sleepSubtitle}
                  analysisWeightSubtitle={analysisGroupingCopy[effectiveAnalysisGrouping].weightSubtitle}
                />
              </div>
            )}

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
                  <div className="reports-toolbar-row toolbar-uniform-row">
                    <div className="reports-filter-block toolbar-equal-block">
                      <span className="reports-filter-label">Período</span>
                      <select
                        className="input-field toolbar-select"
                        value={reportPeriod}
                        onChange={(e) => {
                          setReportPeriod(e.target.value);
                          setReportStartDate('');
                          setReportEndDate('');
                        }}
                        aria-label="Período do relatório"
                      >
                        {reportPeriodOptions.map(option => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="reports-filter-block toolbar-equal-block">
                      <span className="reports-filter-label">Mostrar</span>
                      <select
                        className="input-field toolbar-select"
                        value={effectiveReportFocus}
                        onChange={(e) => setReportFocus(e.target.value)}
                        aria-label="Filtro de foco do histórico"
                      >
                        {availableReportFocusOptions.map(option => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <DateField
                      label="De"
                      value={safeReportStartDate}
                      onChange={(e) => setReportStartDate(normalizeReportDateValue(e.target.value))}
                      max={reportStartMaxDate}
                      containerClassName="reports-filter-block toolbar-equal-block"
                      labelClassName="reports-filter-label"
                      inputClassName="reports-date-input reports-date-input-compact"
                      buttonClassName="reports-date-picker-btn"
                      buttonMode="icon"
                      buttonAriaLabel="Abrir calendário da data inicial do relatório"
                    />
                    <DateField
                      label="Até"
                      value={safeReportEndDate}
                      onChange={(e) => setReportEndDate(normalizeReportDateValue(e.target.value))}
                      min={safeReportStartDate || undefined}
                      max={todayReportDate}
                      containerClassName="reports-filter-block toolbar-equal-block"
                      labelClassName="reports-filter-label"
                      inputClassName="reports-date-input reports-date-input-compact"
                      buttonClassName="reports-date-picker-btn"
                      buttonMode="icon"
                      buttonAriaLabel="Abrir calendário da data final do relatório"
                    />
                  </div>
                  <div className="toolbar-footer">
                    <p className="reports-toolbar-caption">{reportSummaryCaption}</p>
                    {(safeReportStartDate || safeReportEndDate) && (
                      <button
                        type="button"
                        className="btn-secondary toolbar-clear-btn"
                        onClick={() => {
                          setReportStartDate('');
                          setReportEndDate('');
                        }}
                      >
                        Limpar intervalo
                      </button>
                    )}
                  </div>
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
                              <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '4px 0 0 0' }}>{meta.descricao || 'Sem contexto informado'}</p>
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
            </div>
          </div>
        </main>
      </div>

      <button className="fab-btn animate-fade-up" onClick={handleNovoRegistro}><Activity size={32} /></button>

      {/* Novo Modal de Gestão de Metas */}
      <MetaFormModal 
        isOpen={isMetaModalOpen} 
        onClose={() => setIsMetaModalOpen(false)} 
        onSave={loadDashboard} 
        onStatusChange={(nextNotice) => setNotice({ ...nextNotice, id: Date.now() })}
        user={user} 
      />

      <ConfirmDialog
        state={confirmState}
        onCancel={() => !isConfirming && setConfirmState(null)}
        onConfirm={handleConfirmAction}
        busy={isConfirming}
      />
    </div>
  );
}
