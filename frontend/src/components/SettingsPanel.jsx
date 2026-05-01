import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, EyeOff, KeyRound, Save, Shield, Trash2, UserRound } from 'lucide-react';

import apiClient from '../api/apiClient';
import { clearAuthSession, saveAuthSession } from '../auth/authStorage';
import { DateField } from './DateField';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialProfileErrors = {
  nome: '',
  email: '',
  dataNascimento: '',
  sexo: '',
  form: ''
};

const initialPasswordErrors = {
  senhaAtual: '',
  novaSenha: '',
  confirmarSenha: '',
  form: ''
};

const initialDeleteErrors = {
  senhaAtual: '',
  form: ''
};

const profileFieldMap = {
  nome: 'nome',
  email: 'email',
  datanascimento: 'dataNascimento',
  sexo: 'sexo'
};

const passwordFieldMap = {
  senhaatual: 'senhaAtual',
  novasenha: 'novaSenha'
};

const deleteFieldMap = {
  senhaatual: 'senhaAtual'
};

const normalizeBackendErrors = (errors, fieldMap, initialState) => {
  const nextErrors = { ...initialState };

  if (!errors || typeof errors !== 'object') {
    return nextErrors;
  }

  Object.entries(errors).forEach(([key, messages]) => {
    const normalizedKey = String(key)
      .split('.')
      .pop()
      ?.replace(/[^a-zA-Z]/g, '')
      .toLowerCase();
    const targetField = normalizedKey ? fieldMap[normalizedKey] : null;

    if (!targetField) {
      return;
    }

    nextErrors[targetField] = Array.isArray(messages)
      ? String(messages[0] || '')
      : String(messages || '');
  });

  return nextErrors;
};

const getProfileFormData = (user) => ({
  nome: user?.nome || '',
  email: user?.email || '',
  dataNascimento: user?.dataNascimento || '',
  sexo: user?.sexo || 'M'
});

export function SettingsPanel({ user, onUserUpdated, onStatusChange }) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(() => getProfileFormData(user));
  const [profileErrors, setProfileErrors] = useState(initialProfileErrors);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    senhaAtual: false,
    novaSenha: false,
    confirmarSenha: false
  });
  const [passwordErrors, setPasswordErrors] = useState(initialPasswordErrors);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [deleteData, setDeleteData] = useState({ senhaAtual: '' });
  const [isDeletePasswordVisible, setIsDeletePasswordVisible] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState(initialDeleteErrors);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setProfileData(getProfileFormData(user));
  }, [user]);

  const updateProfileField = (field, value) => {
    setProfileData((current) => ({
      ...current,
      [field]: value
    }));

    setProfileErrors((current) => ({
      ...current,
      [field]: '',
      form: ''
    }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordData((current) => ({
      ...current,
      [field]: value
    }));

    setPasswordErrors((current) => ({
      ...current,
      [field]: '',
      form: ''
    }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field]
    }));
  };

  const updateDeleteField = (value) => {
    setDeleteData({ senhaAtual: value });
    setDeleteErrors((current) => ({
      ...current,
      senhaAtual: '',
      form: ''
    }));
    setIsDeleteConfirmOpen(false);
  };

  const toggleDeletePasswordVisibility = () => {
    setIsDeletePasswordVisible((current) => !current);
  };

  const validateProfile = () => {
    const nextErrors = { ...initialProfileErrors };
    const nome = profileData.nome.trim();
    const email = profileData.email.trim();

    if (nome.length < 3) {
      nextErrors.nome = 'Nome deve ter pelo menos 3 caracteres.';
    }

    if (!email) {
      nextErrors.email = 'Email é obrigatório.';
    } else if (!emailPattern.test(email)) {
      nextErrors.email = 'Informe um email válido.';
    }

    if (!profileData.dataNascimento) {
      nextErrors.dataNascimento = 'Data de nascimento é obrigatória.';
    } else if (profileData.dataNascimento > todayDate) {
      nextErrors.dataNascimento = 'Data de nascimento não pode estar no futuro.';
    }

    if (!['M', 'F'].includes(profileData.sexo)) {
      nextErrors.sexo = 'Selecione um sexo válido.';
    }

    setProfileErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const validatePassword = () => {
    const nextErrors = { ...initialPasswordErrors };

    if (!passwordData.senhaAtual) {
      nextErrors.senhaAtual = 'Senha atual é obrigatória.';
    }

    if (!passwordData.novaSenha) {
      nextErrors.novaSenha = 'Nova senha é obrigatória.';
    } else if (passwordData.novaSenha.length < 8 || passwordData.novaSenha.length > 128) {
      nextErrors.novaSenha = 'Nova senha deve ter entre 8 e 128 caracteres.';
    }

    if (passwordData.novaSenha && passwordData.novaSenha === passwordData.senhaAtual) {
      nextErrors.novaSenha = 'A nova senha deve ser diferente da atual.';
    }

    if (!passwordData.confirmarSenha) {
      nextErrors.confirmarSenha = 'Confirme a nova senha.';
    } else if (passwordData.confirmarSenha !== passwordData.novaSenha) {
      nextErrors.confirmarSenha = 'A confirmação precisa ser igual à nova senha.';
    }

    setPasswordErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const validateDelete = () => {
    const nextErrors = { ...initialDeleteErrors };

    if (!deleteData.senhaAtual) {
      nextErrors.senhaAtual = 'Informe sua senha atual para excluir a conta.';
    } else if (deleteData.senhaAtual.length < 8 || deleteData.senhaAtual.length > 128) {
      nextErrors.senhaAtual = 'Senha atual deve ter entre 8 e 128 caracteres.';
    }

    setDeleteErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setProfileErrors(initialProfileErrors);

    if (!validateProfile()) {
      return;
    }

    try {
      setIsSavingProfile(true);
      const response = await apiClient.put(`/usuarios/${user.id}/perfil`, {
        nome: profileData.nome.trim(),
        email: profileData.email.trim(),
        dataNascimento: profileData.dataNascimento,
        sexo: profileData.sexo
      });

      saveAuthSession(response);
      onUserUpdated?.(response.usuario);
      onStatusChange?.({
        tone: 'success',
        title: 'Perfil atualizado',
        message: 'Seus dados principais já foram atualizados.'
      });
    } catch (err) {
      const backendErrors = normalizeBackendErrors(err.response?.data?.erros, profileFieldMap, initialProfileErrors);
      const hasFieldErrors = Object.values(backendErrors).some(Boolean);

      if (hasFieldErrors) {
        setProfileErrors(backendErrors);
      } else {
        setProfileErrors((current) => ({
          ...current,
          form: err.response?.data?.mensagem || 'Não foi possível atualizar seu perfil.'
        }));
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (event) => {
    event.preventDefault();
    setPasswordErrors(initialPasswordErrors);

    if (!validatePassword()) {
      return;
    }

    try {
      setIsSavingPassword(true);
      await apiClient.put(`/usuarios/${user.id}/senha`, {
        senhaAtual: passwordData.senhaAtual,
        novaSenha: passwordData.novaSenha
      });

      setPasswordData({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      });
      onStatusChange?.({
        tone: 'success',
        title: 'Senha atualizada',
        message: 'Sua senha foi alterada com sucesso.'
      });
    } catch (err) {
      const backendErrors = normalizeBackendErrors(err.response?.data?.erros, passwordFieldMap, initialPasswordErrors);
      const hasFieldErrors = Object.values(backendErrors).some(Boolean);

      if (hasFieldErrors) {
        setPasswordErrors(backendErrors);
      } else {
        setPasswordErrors((current) => ({
          ...current,
          form: err.response?.data?.mensagem || 'Não foi possível atualizar sua senha.'
        }));
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteIntent = (event) => {
    event.preventDefault();
    setDeleteErrors(initialDeleteErrors);

    if (!validateDelete()) {
      return;
    }

    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      await apiClient.delete(`/usuarios/${user.id}`, {
        data: {
          senhaAtual: deleteData.senhaAtual
        }
      });

      clearAuthSession();
      navigate('/login');
    } catch (err) {
      const backendErrors = normalizeBackendErrors(err.response?.data?.erros, deleteFieldMap, initialDeleteErrors);
      const hasFieldErrors = Object.values(backendErrors).some(Boolean);

      if (hasFieldErrors) {
        setDeleteErrors(backendErrors);
      } else {
        setDeleteErrors((current) => ({
          ...current,
          form: err.response?.data?.mensagem || 'Não foi possível excluir sua conta.'
        }));
      }
      setIsDeleteConfirmOpen(false);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="settings-layout animate-fade-up">
      <div className="chart-header">
        <h3 style={{ color: 'var(--text-light)' }}>Configurações</h3>
      </div>

      <div className="glass-panel settings-card">
        <div className="settings-card-header">
          <div>
            <div className="settings-card-title">
              <UserRound size={18} />
              <span>Perfil</span>
            </div>
            <p className="settings-card-copy">Atualize seus dados principais, como nome, email e informações demográficas.</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={handleSaveProfile} noValidate>
          {profileErrors.form ? <div className="settings-form-feedback error">{profileErrors.form}</div> : null}

          <div className="settings-grid">
            <div className="input-group">
              <label className="input-label">Nome completo</label>
              <input
                type="text"
                className={`input-field ${profileErrors.nome ? 'input-field-error' : ''}`.trim()}
                value={profileData.nome}
                onChange={(e) => updateProfileField('nome', e.target.value)}
                maxLength={120}
                autoComplete="name"
              />
              {profileErrors.nome ? <div className="field-error-text">{profileErrors.nome}</div> : null}
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                className={`input-field ${profileErrors.email ? 'input-field-error' : ''}`.trim()}
                value={profileData.email}
                onChange={(e) => updateProfileField('email', e.target.value)}
                maxLength={160}
                autoComplete="email"
              />
              {profileErrors.email ? <div className="field-error-text">{profileErrors.email}</div> : null}
            </div>

            <div className="input-group">
              <DateField
                label="Data de nascimento"
                value={profileData.dataNascimento}
                onChange={(e) => updateProfileField('dataNascimento', e.target.value)}
                max={todayDate}
                allowManualInput
                inputClassName={profileErrors.dataNascimento ? 'input-field-error' : ''}
                buttonMode="icon"
                buttonClassName="settings-date-picker-btn"
                buttonAriaLabel="Abrir calendário da data de nascimento nas configurações"
              />
              {profileErrors.dataNascimento ? <div className="field-error-text">{profileErrors.dataNascimento}</div> : null}
            </div>

            <div className="input-group">
              <label className="input-label">Sexo biológico</label>
              <select
                className={`input-field auth-select ${profileErrors.sexo ? 'input-field-error' : ''}`.trim()}
                value={profileData.sexo}
                onChange={(e) => updateProfileField('sexo', e.target.value)}
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
              {profileErrors.sexo ? <div className="field-error-text">{profileErrors.sexo}</div> : null}
            </div>
          </div>

          <div className="settings-actions">
            <button type="submit" className="btn-primary settings-submit-btn" disabled={isSavingProfile}>
              <Save size={18} />
              {isSavingProfile ? 'Salvando...' : 'Salvar perfil'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel settings-card">
        <div className="settings-card-header">
          <div>
            <div className="settings-card-title">
              <Shield size={18} />
              <span>Segurança</span>
            </div>
            <p className="settings-card-copy">Troque sua senha sem alterar os demais dados da conta.</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={handleSavePassword} noValidate>
          {passwordErrors.form ? <div className="settings-form-feedback error">{passwordErrors.form}</div> : null}

          <div className="settings-grid settings-grid-security">
            <div className="input-group">
              <label className="input-label">Senha atual</label>
              <div className="password-field">
                <input
                  type={passwordVisibility.senhaAtual ? 'text' : 'password'}
                  className={`input-field password-input ${passwordErrors.senhaAtual ? 'input-field-error' : ''}`.trim()}
                  value={passwordData.senhaAtual}
                  onChange={(e) => updatePasswordField('senhaAtual', e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={passwordVisibility.senhaAtual ? 'Ocultar senha atual' : 'Mostrar senha atual'}
                  title={passwordVisibility.senhaAtual ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => togglePasswordVisibility('senhaAtual')}
                >
                  {passwordVisibility.senhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.senhaAtual ? <div className="field-error-text">{passwordErrors.senhaAtual}</div> : null}
            </div>

            <div className="input-group">
              <label className="input-label">Nova senha</label>
              <div className="password-field">
                <input
                  type={passwordVisibility.novaSenha ? 'text' : 'password'}
                  className={`input-field password-input ${passwordErrors.novaSenha ? 'input-field-error' : ''}`.trim()}
                  value={passwordData.novaSenha}
                  onChange={(e) => updatePasswordField('novaSenha', e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={passwordVisibility.novaSenha ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                  title={passwordVisibility.novaSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => togglePasswordVisibility('novaSenha')}
                >
                  {passwordVisibility.novaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.novaSenha ? <div className="field-error-text">{passwordErrors.novaSenha}</div> : null}
            </div>

            <div className="input-group">
              <label className="input-label">Confirmar nova senha</label>
              <div className="password-field">
                <input
                  type={passwordVisibility.confirmarSenha ? 'text' : 'password'}
                  className={`input-field password-input ${passwordErrors.confirmarSenha ? 'input-field-error' : ''}`.trim()}
                  value={passwordData.confirmarSenha}
                  onChange={(e) => updatePasswordField('confirmarSenha', e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={passwordVisibility.confirmarSenha ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                  title={passwordVisibility.confirmarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => togglePasswordVisibility('confirmarSenha')}
                >
                  {passwordVisibility.confirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.confirmarSenha ? <div className="field-error-text">{passwordErrors.confirmarSenha}</div> : null}
            </div>
          </div>

          <div className="settings-actions">
            <button type="submit" className="btn-primary settings-submit-btn" disabled={isSavingPassword}>
              <KeyRound size={18} />
              {isSavingPassword ? 'Atualizando...' : 'Atualizar senha'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel settings-card settings-danger-card">
        <div className="settings-card-header">
          <div>
            <div className="settings-card-title settings-card-title-danger">
              <AlertTriangle size={18} />
              <span>Zona de perigo</span>
            </div>
            <p className="settings-card-copy">Excluir a conta remove definitivamente histórico, metas, biometria e configurações associadas.</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={handleDeleteIntent} noValidate>
          {deleteErrors.form ? <div className="settings-form-feedback error">{deleteErrors.form}</div> : null}

          <div className="input-group">
            <label className="input-label">Confirme com sua senha atual</label>
            <div className="password-field">
              <input
                type={isDeletePasswordVisible ? 'text' : 'password'}
                className={`input-field password-input ${deleteErrors.senhaAtual ? 'input-field-error' : ''}`.trim()}
                value={deleteData.senhaAtual}
                onChange={(e) => updateDeleteField(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={isDeletePasswordVisible ? 'Ocultar senha atual' : 'Mostrar senha atual'}
                title={isDeletePasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={toggleDeletePasswordVisibility}
              >
                {isDeletePasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {deleteErrors.senhaAtual ? <div className="field-error-text">{deleteErrors.senhaAtual}</div> : null}
          </div>

          {isDeleteConfirmOpen ? (
            <div className="settings-delete-confirm">
              <p>Essa ação é irreversível. Todos os seus dados serão removidos.</p>
              <div className="settings-delete-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isDeletingAccount}>
                  Cancelar
                </button>
                <button type="button" className="btn-primary settings-danger-btn" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                  <Trash2 size={18} />
                  {isDeletingAccount ? 'Excluindo...' : 'Confirmar exclusão'}
                </button>
              </div>
            </div>
          ) : (
            <div className="settings-actions">
              <button type="submit" className="btn-primary settings-danger-btn" disabled={isDeletingAccount}>
                <Trash2 size={18} />
                Excluir conta
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
