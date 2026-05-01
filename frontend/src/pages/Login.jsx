import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';
import apiClient from '../api/apiClient';
import { saveAuthSession } from '../auth/authStorage';
import { DateField } from '../components/DateField';

const initialFieldErrors = {
  nome: '',
  email: '',
  senha: '',
  dataNascimento: '',
  sexo: ''
};

const backendFieldMap = {
  nome: 'nome',
  email: 'email',
  senha: 'senha',
  datanascimento: 'dataNascimento',
  sexo: 'sexo'
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeBackendErrors = (errors) => {
  const nextErrors = { ...initialFieldErrors };

  if (!errors || typeof errors !== 'object') {
    return nextErrors;
  }

  Object.entries(errors).forEach(([key, messages]) => {
    const normalizedKey = String(key)
      .split('.')
      .pop()
      ?.replace(/[^a-zA-Z]/g, '')
      .toLowerCase();
    const targetField = normalizedKey ? backendFieldMap[normalizedKey] : null;

    if (!targetField) {
      return;
    }

    nextErrors[targetField] = Array.isArray(messages)
      ? String(messages[0] || '')
      : String(messages || '');
  });

  return nextErrors;
};

export default function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    dataNascimento: '',
    sexo: 'M'
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const todayDate = new Date().toISOString().split('T')[0];

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));

    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      return {
        ...current,
        [field]: ''
      };
    });

    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const nextErrors = { ...initialFieldErrors };
    const nome = formData.nome.trim();
    const email = formData.email.trim();
    const senha = formData.senha;

    if (isRegistering) {
      if (nome.length < 3) {
        nextErrors.nome = 'Nome deve ter pelo menos 3 caracteres.';
      }

      if (!formData.dataNascimento) {
        nextErrors.dataNascimento = 'Data de nascimento é obrigatória.';
      } else if (formData.dataNascimento > todayDate) {
        nextErrors.dataNascimento = 'Data de nascimento não pode estar no futuro.';
      }

      if (!['M', 'F'].includes(formData.sexo)) {
        nextErrors.sexo = 'Selecione um sexo válido.';
      }
    }

    if (!email) {
      nextErrors.email = 'Email é obrigatório.';
    } else if (!emailPattern.test(email)) {
      nextErrors.email = 'Informe um email válido.';
    }

    if (!senha) {
      nextErrors.senha = 'Senha é obrigatória.';
    } else if (senha.length < 8 || senha.length > 128) {
      nextErrors.senha = 'Senha deve ter entre 8 e 128 caracteres.';
    }

    setFieldErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const handleModeToggle = () => {
    setIsRegistering((current) => !current);
    setIsPasswordVisible(false);
    setError(null);
    setFieldErrors(initialFieldErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors(initialFieldErrors);

    if (!validateForm()) {
      setError(isRegistering
        ? 'Revise os campos destacados para concluir o cadastro.'
        : 'Confira email e senha antes de continuar.');
      return;
    }

    try {
      if (isRegistering) {
        // POST /api/usuarios — cria novo usuário
        const response = await apiClient.post('/usuarios', {
          ...formData,
          nome: formData.nome.trim(),
          email: formData.email.trim()
        });
        saveAuthSession(response);
        navigate('/dashboard');
      } else {
        // POST /api/usuarios/login — valida email e senha no banco
        const response = await apiClient.post('/usuarios/login', {
          email: formData.email.trim(),
          senha: formData.senha
        });
        saveAuthSession(response);
        navigate('/dashboard');
      }
    } catch (err) {
      const backendErrors = normalizeBackendErrors(err.response?.data?.erros);
      const hasFieldErrors = Object.values(backendErrors).some(Boolean);

      if (hasFieldErrors) {
        setFieldErrors(backendErrors);
      }

      setError(
        hasFieldErrors
          ? 'Revise os campos destacados para concluir o cadastro.'
          : err.response?.data?.mensagem || 'Falha ao comunicar com o servidor. O backend está rodando?'
      );
    }
  };

  return (
    <div className="center-wrapper">
      <div className={`glass-panel auth-panel ${isRegistering ? 'auth-panel-register' : ''}`.trim()}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Activity size={48} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 className="logo" style={{ marginBottom: '0.5rem' }}>Ritmo</h2>
          <p style={{ color: 'var(--text-main)' }}>Seu painel analítico pessoal</p>
        </div>

        {error && (
          <div className="auth-form-feedback error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {isRegistering && (
            <>
              <div className="input-group">
                <label className="input-label">Nome Completo</label>
                <input 
                  type="text" 
                  className={`input-field ${fieldErrors.nome ? 'input-field-error' : ''}`.trim()}
                  placeholder="Ex: Matheus Catanêo"
                  value={formData.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  required={isRegistering}
                  minLength={3}
                  maxLength={120}
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.nome)}
                />
                {fieldErrors.nome ? <div className="field-error-text">{fieldErrors.nome}</div> : null}
              </div>
              <div className="input-group auth-register-row">
                <div className="auth-register-date">
                  <DateField
                    label="Data de Nascimento"
                    value={formData.dataNascimento}
                    onChange={(e) => updateField('dataNascimento', e.target.value)}
                    required={isRegistering}
                    max={todayDate}
                    allowManualInput
                    inputClassName={fieldErrors.dataNascimento ? 'input-field-error' : ''}
                    buttonMode="icon"
                    buttonClassName="auth-register-date-picker-btn"
                    buttonAriaLabel="Abrir calendário da data de nascimento"
                  />
                  {fieldErrors.dataNascimento ? <div className="field-error-text">{fieldErrors.dataNascimento}</div> : null}
                </div>
                <div className="auth-register-sex">
                  <label className="input-label">Sexo Biológico</label>
                  <select 
                    className={`input-field auth-select ${fieldErrors.sexo ? 'input-field-error' : ''}`.trim()}
                    value={formData.sexo}
                    onChange={(e) => updateField('sexo', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.sexo)}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                  {fieldErrors.sexo ? <div className="field-error-text">{fieldErrors.sexo}</div> : null}
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              className={`input-field ${fieldErrors.email ? 'input-field-error' : ''}`.trim()}
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
              maxLength={160}
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email ? <div className="field-error-text">{fieldErrors.email}</div> : null}
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label">Senha</label>
            <div className="password-field">
              <input 
                type={isPasswordVisible ? 'text' : 'password'}
                className={`input-field password-input ${fieldErrors.senha ? 'input-field-error' : ''}`.trim()}
                placeholder="••••••••"
                value={formData.senha}
                onChange={(e) => updateField('senha', e.target.value)}
                required
                minLength={8}
                maxLength={128}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                aria-invalid={Boolean(fieldErrors.senha)}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                title={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setIsPasswordVisible((current) => !current)}
              >
                {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.senha ? <div className="field-error-text">{fieldErrors.senha}</div> : null}
          </div>

          <button type="submit" className="btn-primary">
            {isRegistering ? 'Criar Conta' : 'Acessar Meu Painel'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-main)' }}>
            {isRegistering ? 'Já tem uma conta? ' : 'Ainda não começou? '}
          </span>
          <button 
            type="button" 
            onClick={handleModeToggle}
            style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Faça login' : 'Registre-se'}
          </button>
        </div>
      </div>
    </div>
  );
}
