import { X, Scale, Activity } from 'lucide-react';

export function DataFormModal({ isOpen, onClose, onSubmit, formData, setFormData, editandoId, altura, setAltura, onSaveAltura }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content glass-panel animate-fade-up">
        <div className="modal-close-header">
          <h3 style={{ margin: 0, color: 'var(--accent-cyan)' }}>
            {editandoId ? 'Refinando o Dia' : 'Injetar Novo Registro'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label">Data</label>
            <input 
              type="date" 
              className="input-field" 
              disabled={!!editandoId} 
              max={new Date().toISOString().split('T')[0]} 
              value={formData.data} 
              onChange={(e) => setFormData({...formData, data: e.target.value})} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label">Humor (1-5)</label>
              <input type="number" min="1" max="5" className="input-field" value={formData.humor} onChange={(e) => setFormData({...formData, humor: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Peso Hoje (kg)</label>
              <input type="number" step="0.1" min="10" max="600" className="input-field" value={formData.peso} onChange={(e) => setFormData({...formData, peso: e.target.value})} placeholder="Ex: 75.5" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label">Água (L)</label>
              <input type="number" step="0.1" min="0" max="25" className="input-field" value={formData.agua} onChange={(e) => setFormData({...formData, agua: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Sono (h)</label>
              <input type="number" step="0.5" min="0" max="24" className="input-field" value={formData.sono} onChange={(e) => setFormData({...formData, sono: e.target.value})} />
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
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            <Scale size={16} /> Ajuste de Perfil (Altura)
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <input type="number" min="50" max="300" className="input-field" style={{ padding: '8px 12px', fontSize: '0.9rem' }} value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="Altura (cm)" />
            </div>
            <button onClick={onSaveAltura} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', width: 'auto' }}>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
