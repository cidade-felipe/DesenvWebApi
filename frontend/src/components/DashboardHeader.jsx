import { Bell, LogOut, Activity, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../auth/authStorage';

export function DashboardHeader({ user, config, insights, onMarkAsRead }) {
  const navigate = useNavigate();
  const [showInsights, setShowInsights] = useState(false);
  const panelRef = useRef(null);
  const firstName = String(user?.nome || user?.name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)[0];
  const currentHour = new Date().getHours();
  const greetingPrefix = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';
  const greetingMessage = firstName ? `${greetingPrefix}, ${firstName}` : `${greetingPrefix}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowInsights(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  return (
    <nav className="top-nav animate-fade-up">
      <div className="top-nav-brand">
        <Activity size={32} color="var(--accent-cyan)" />
        <div className="top-nav-brand-copy">
          <div className="logo">Ritmo Analytics</div>
          <span className="top-nav-greeting">{greetingMessage}</span>
        </div>
      </div>
      
      <div className="top-nav-actions">
        {config?.idioma && (
          <span className="top-nav-language">
            Idioma: {config.idioma}
          </span>
        )}
        
        <div ref={panelRef} style={{ position: 'relative' }}>
          <button className="notification-bell" onClick={() => setShowInsights(!showInsights)}>
            <Bell size={24} />
            {(insights?.length || 0) > 0 && <span className="notification-badge">{insights.length}</span>}
          </button>
          
          {showInsights && (
            <div className="insights-panel">
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-light)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                Avisos Analíticos
              </h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(!insights || insights.length === 0) ? (
                  <p style={{ color: 'var(--text-main)', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                    Você está em dia com a sua saúde. Nenhum alerta pendente!
                  </p>
                ) : (
                  insights.map(insight => (
                    <div key={insight.id} className="insight-item">
                      <div style={{ flex: 1 }}>
                        <span style={{ display: 'block', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>
                          {insight.categoria.toUpperCase()}
                        </span>
                        {insight.mensagem}
                      </div>
                      <button className="insight-close-btn" onClick={() => onMarkAsRead(insight.id)} title="Marcar como Lido">
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
          className="top-nav-logout"
          onClick={handleLogout}
        >
          Sair <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
