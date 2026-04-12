import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({ state, onCancel, onConfirm, busy }) {
  if (!state) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && !busy && onCancel()}>
      <div className="modal-content glass-panel animate-fade-up confirm-dialog">
        <div className="modal-close-header">
          <h3 style={{ margin: 0, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={22} color={state.tone === 'danger' ? '#ff6b6b' : 'var(--accent-cyan)'} />
            {state.title}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: busy ? 'wait' : 'pointer' }}
            aria-label="Fechar confirmação"
          >
            <X size={24} />
          </button>
        </div>

        <p className="confirm-dialog-message">{state.message}</p>

        <div className="confirm-dialog-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className={`btn-primary confirm-dialog-confirm ${state.tone === 'danger' ? 'danger' : ''}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Processando...' : (state.confirmLabel || 'Confirmar')}
          </button>
        </div>
      </div>
    </div>
  );
}
