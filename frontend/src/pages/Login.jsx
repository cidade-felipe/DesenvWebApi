import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import apiClient from '../api/apiClient';
import { saveAuthSession } from '../auth/authStorage';
import { DateField } from '../components/DateField';

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
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (isRegistering) {
        // POST /api/usuarios — cria novo usuário
        const response = await apiClient.post('/usuarios', formData);
        saveAuthSession(response);
        navigate('/dashboard');
      } else {
        // POST /api/usuarios/login — valida email e senha no banco
        const response = await apiClient.post('/usuarios/login', {
          email: formData.email,
          senha: formData.senha
        });
        saveAuthSession(response);
        navigate('/dashboard');
      }
    } catch (err) {
      // O backend retorna { mensagem: "..." } nos erros 409 e 401
      setError(err.response?.data?.mensagem || 'Falha ao comunicar com o servidor. O backend está rodando?');
    }
  };

  return (
    <div className="center-wrapper">
      <div className="glass-panel" style={{ width: '400px', maxWidth: '90%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Activity size={48} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 className="logo" style={{ marginBottom: '0.5rem' }}>Ritmo</h2>
          <p style={{ color: 'var(--text-main)' }}>Seu painel analítico pessoal</p>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', color: '#ff6b6b', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <div className="input-group">
                <label className="input-label">Nome Completo</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Felipe Cidade"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required={isRegistering}
                />
              </div>
              <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
                <DateField
                  label="Data de Nascimento"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  required={isRegistering}
                  max={new Date().toISOString().split('T')[0]}
                  containerStyle={{ flex: 1 }}
                />
                <div style={{ flex: 1 }}>
                  <label className="input-label">Sexo Biológico</label>
                  <select 
                    className="input-field"
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label">Senha</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              required
            />
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
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Faça login' : 'Registre-se'}
          </button>
        </div>
      </div>
    </div>
  );
}
