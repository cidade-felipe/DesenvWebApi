import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const noticeConfig = {
  success: { icon: CheckCircle2, title: 'Tudo certo' },
  warning: { icon: AlertTriangle, title: 'Atenção' },
  error: { icon: XCircle, title: 'Algo deu errado' },
  info: { icon: Info, title: 'Aviso' }
};

export function NoticeBanner({ notice, onClose }) {
  if (!notice) return null;

  const { icon: Icon, title: fallbackTitle } = noticeConfig[notice.tone] || noticeConfig.info;

  return (
    <div className={`notice-banner ${notice.tone || 'info'}`} role="status" aria-live="polite">
      <div className="notice-banner-main">
        <Icon size={18} />
        <div className="notice-banner-copy">
          <strong>{notice.title || fallbackTitle}</strong>
          {notice.message ? <span>{notice.message}</span> : null}
        </div>
      </div>
      <button type="button" className="notice-banner-close" onClick={onClose} aria-label="Fechar aviso">
        <X size={16} />
      </button>
    </div>
  );
}
