import { useEffect, useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import apiClient from '../api/apiClient';

const getInitialMetaData = () => ({
  categoria: 'Sono',
  valorAlvo: '',
  descricao: '',
  dataInicio: new Date().toISOString().split('T')[0],
  ativa: true
});

export function MetaFormModal({ isOpen, onClose, onSave, onStatusChange, user }) {
  const [metaData, setMetaData] = useState(getInitialMetaData);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMetaData(getInitialMetaData());
      setError('');
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getValidationConfig = () => {
    switch(metaData.categoria) {
      case 'Sono': return { min: 0.5, max: 24, step: 0.5, unit: 'h' };
      case 'Agua': return { min: 0.1, max: 25, step: 0.1, unit: 'L' };
      case 'Treino': return { min: 1, max: 7, step: 1, unit: 'dias' };
      case 'Peso': return { min: 10, max: 600, step: 0.1, unit: 'kg' };
      default: return { min: 1, max: 5, step: 0.1, unit: 'pontos' };
    }
  };

  const config = getValidationConfig();

  const handleCategoryChange = (e) => {
    const nextCategoria = e.target.value;

    setMetaData((currentMetaData) => ({
      ...currentMetaData,
      categoria: nextCategoria,
      valorAlvo: ''
    }));
    setError('');
  };

  const handleTargetChange = (e) => {
    setMetaData((currentMetaData) => ({
      ...currentMetaData,
      valorAlvo: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(metaData.valorAlvo);
    
    if (isNaN(val) || val < config.min || val > config.max) {
      setError(`Insira um valor entre ${config.min} e ${config.max} para ${metaData.categoria}.`);
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      const payload = {
        ...metaData,
        usuarioId: user.id,
        valorAlvo: val
      };
      const novaMeta = await apiClient.post('/metas', payload);
      await onSave?.(novaMeta);
      onStatusChange?.({
        tone: 'success',
        title: 'Meta criada',
        message: 'Seu desafio já aparece na área de metas.'
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.mensagem || err.message || 'Não foi possível salvar a meta.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content glass-panel animate-fade-up">
        <div className="modal-close-header">
          <h3 style={{ margin: 0, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={22} /> Definir Nova Meta
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error ? <div className="modal-feedback error">{error}</div> : null}

          <div>
            <label className="input-label">Categoria do Desafio</label>
            <select 
              className="input-field" 
              value={metaData.categoria} 
              onChange={handleCategoryChange}
              style={{ background: 'rgba(31, 40, 51, 0.9)' }}
            >
              <option value="Sono">Qualidade de Sono (Média h)</option>
              <option value="Agua">Hidratação Diária (L)</option>
              <option value="Humor">Bem-estar Mental (Média 1-5)</option>
              <option value="Produtividade">Foco e Entrega (Média 1-5)</option>
              <option value="Energia">Nível de Vitalidade (Média 1-5)</option>
              <option value="Peso">Peso Corporal (kg)</option>
              <option value="Treino">Consistência de Treino (Dias p/ Semana)</option>
            </select>
          </div>

          <div>
            <label className="input-label">Valor Alvo ({config.unit})</label>
            <input 
              type="number" 
              step={config.step}
              min={config.min}
              max={config.max}
              className="input-field" 
              value={metaData.valorAlvo} 
              onChange={handleTargetChange}
              placeholder={`Min: ${config.min} - Max: ${config.max}`}
            />
          </div>

          <div>
            <label className="input-label">Por que esta meta é importante?</label>
            <textarea 
              className="input-field" 
              style={{ height: '80px', paddingTop: '10px' }}
              value={metaData.descricao} 
              onChange={(e) => setMetaData({...metaData, descricao: e.target.value})} 
              placeholder="Ex: Melhorar minha disposição matinal..."
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }} disabled={isSaving}>
            {isSaving ? 'Salvando meta...' : 'Ativar Desafio'}
          </button>
        </form>
      </div>
    </div>
  );
}
