import { X } from 'lucide-react';
import { DateField } from './DateField';

export function DataFormModal({ isOpen, onClose, onSubmit, formData, setFormData, editandoId, ultimaAltura }) {
  if (!isOpen) return null;

  const alturaBase = formData.altura || ultimaAltura?.toString() || '';
  const precisaAlturaManual = formData.registrouPesoHoje && (!alturaBase || formData.atualizarAltura);
  const helperText = editandoId
    ? 'A data do registro já existente fica travada para preservar o histórico.'
    : undefined;

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
          <DateField
            label="Data"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            disabled={!!editandoId}
            max={new Date().toISOString().split('T')[0]}
            required
            helperText={helperText}
          />

          <div className="modal-two-columns">
            <div>
              <label className="input-label">Humor (1-5)</label>
              <input type="number" min="1" max="5" className="input-field" value={formData.humor} onChange={(e) => setFormData({...formData, humor: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Água (L)</label>
              <input type="number" step="0.1" min="0" max="25" className="input-field" value={formData.agua} onChange={(e) => setFormData({...formData, agua: e.target.value})} />
            </div>
          </div>

          <div className="modal-two-columns">
            <div>
              <label className="input-label">Sono (h)</label>
              <input type="number" step="0.5" min="0" max="24" className="input-field" value={formData.sono} onChange={(e) => setFormData({...formData, sono: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Produt. (1-5)</label>
              <input type="number" min="1" max="5" className="input-field" value={formData.produtividade} onChange={(e) => setFormData({...formData, produtividade: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="input-label">Energia: <span style={{color:'var(--text-light)'}}>{formData.energia}</span> / 5</label>
            <input type="range" min="1" max="5" style={{width: '100%', marginTop: '8px'}} value={formData.energia} onChange={(e) => setFormData({...formData, energia: e.target.value})} />
          </div>

          <div className="biometria-panel">
            <div className="biometria-panel-header">
              <div>
                <span className="input-label biometria-panel-label">Biometria do dia</span>
                <p className="biometria-panel-copy">
                  Se você se pesou hoje, pode registrar aqui. Sua altura fica guardada para não precisar preencher isso sempre.
                </p>
              </div>
              <label className="biometria-toggle">
                <input
                  type="checkbox"
                  checked={formData.registrouPesoHoje}
                  onChange={(e) => setFormData({
                    ...formData,
                    registrouPesoHoje: e.target.checked,
                    atualizarAltura: e.target.checked ? formData.atualizarAltura : false
                  })}
                />
                <span>{formData.registrouPesoHoje ? 'Me pesei hoje' : 'Sem pesagem hoje'}</span>
              </label>
            </div>

            {formData.registrouPesoHoje ? (
              <div className="modal-two-columns biometria-grid">
                <div>
                  <label className="input-label">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="600"
                    className="input-field"
                    value={formData.peso}
                    onChange={(e) => setFormData({...formData, peso: e.target.value})}
                    placeholder="Ex: 75.5"
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Altura</label>
                  {alturaBase && !formData.atualizarAltura ? (
                    <div className="biometria-height-card">
                      <div>
                        <strong>{alturaBase} cm</strong>
                        <span>Vamos usar sua altura já salva.</span>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary biometria-height-btn"
                        onClick={() => setFormData({ ...formData, atualizarAltura: true })}
                      >
                        Atualizar
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="number"
                        min="50"
                        max="280"
                        className="input-field"
                        value={formData.altura}
                        onChange={(e) => setFormData({...formData, altura: e.target.value})}
                        placeholder="Ex: 175"
                        required={precisaAlturaManual}
                      />
                      <p className="biometria-helper">
                        {ultimaAltura
                          ? 'Só precisa mexer aqui se quiser corrigir sua altura.'
                          : 'Na primeira vez, precisamos da sua altura para calcular tudo certinho.'}
                      </p>
                      {ultimaAltura && (
                        <button
                          type="button"
                          className="biometria-link-btn"
                          onClick={() => setFormData({
                            ...formData,
                            altura: ultimaAltura.toString(),
                            atualizarAltura: false
                          })}
                        >
                          Manter altura salva ({ultimaAltura} cm)
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className="biometria-helper biometria-helper-relaxed">
                Se hoje foi só rotina, tudo bem. Você pode salvar só os hábitos do dia.
              </p>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', marginTop: '0.25rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={formData.exercicio} onChange={(e) => setFormData({...formData, exercicio: e.target.checked})} />
            Engajei Físicamente Hoje
          </label>

          <div>
            <label className="input-label">Observações</label>
            <textarea
              className="input-field textarea-field"
              rows="3"
              maxLength="400"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Se quiser, anote algo importante sobre o seu dia."
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            {editandoId ? 'Atualizar Histórico' : 'Computar Dados'}
          </button>
        </form>

      </div>
    </div>
  );
}
