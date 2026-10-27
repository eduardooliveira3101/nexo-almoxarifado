import { useState } from 'react';
import { api } from '../services/api.js';
export default function Login({ onLogin, configured }) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(ev) {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(ev.currentTarget));
    setBusy(true);
    setError('');
    try {
      await api.login(data);
      await onLogin();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-layout">
      <aside className="login-brand">
        <strong className="demo-brand">NEXO<span>ALMOXARIFADO</span></strong>
        <div>
          <span className="eyebrow">GESTÃO DO ALMOXARIFADO</span>
          <h1>
            Seu almoxarifado,
            <br />
            sempre sob controle.
          </h1>
          <p>Equipamentos, movimentações e calibrações reunidos em um só lugar.</p>
        </div>
        <small>NEXO · Tecnologia e engenharia</small>
      </aside>
      <main className="login-main">
        <section>
          <span className="eyebrow">ACESSO DO RESPONSÁVEL</span>
          <h2>Bem-vindo de volta</h2>
          <p>Entre para acessar o almoxarifado.</p>
          {!configured && (
            <p className="notice">
              O administrador precisa configurar o acesso no servidor antes do primeiro login.
            </p>
          )}
          <form onSubmit={submit}>
            <fieldset disabled={busy || !configured}>
              <label>
                E-mail
                <input
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="seu@email.com"
                  required
                />
              </label>
              <label>
                Senha
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={1024}
                />
              </label>
              <button>{busy ? 'Entrando…' : 'Entrar no sistema'}</button>
            </fieldset>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </form>
          <small>
            Acesso restrito ao responsável autorizado. Para recuperar o acesso, procure o
            administrador.
          </small>
        </section>
      </main>
    </div>
  );
}

