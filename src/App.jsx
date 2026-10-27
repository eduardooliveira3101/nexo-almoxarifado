import { useCallback, useEffect, useRef, useState } from 'react';
import { api, downloadBlob } from './services/api.js';
import { useInventory } from './hooks/useInventory.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Equipment from './pages/Equipment.jsx';
import Movements from './pages/Movements.jsx';

import RecordForm from './components/RecordForm.jsx';
import History from './components/History.jsx';
import EquipmentAction from './components/EquipmentAction.jsx';

const pages = ['Painel', 'Equipamentos', 'Retiradas e devoluções', 'Calibrações'];
const subtitles = [
  'Uma visão clara de cada equipamento e de cada prazo.',
  'Cadastre e acompanhe o patrimônio do laboratório.',
  'Saiba quem retirou, para onde foi e quando volta.',
  'Certificados e prazos em um só lugar.',

];
const icons = ['▦', '▣', '⇄', '◷'];

function Workspace({ email, onExpired }) {
  const inventory = useInventory(onExpired);
  const [page, setPage] = useState('Painel'),
    [modal, setModal] = useState(null),
    [notice, setNotice] = useState('');
  const { data, loading, saving, error, reload, commit } = inventory;
  const busy = saving;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const menuNav = useRef(null);
  function closeMenu() {
    setMenuOpen(false);
    menuButton.current?.focus();
  }
  useEffect(() => {
    if (!menuOpen) return;
    const media = window.matchMedia('(max-width: 760px)');
    menuNav.current?.querySelector('button')?.focus();
    const escape = (event) => {
      if (event.key === 'Escape') closeMenu();
      if (event.key === 'Tab' && media.matches) {
        const buttons = [menuButton.current, ...menuNav.current.querySelectorAll('button:not(:disabled)')];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const resize = () => { if (!media.matches) setMenuOpen(false); };
    const previous = document.body.style.overflow;
    if (media.matches) document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', escape);
    media.addEventListener('change', resize);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', escape); media.removeEventListener('change', resize); };
  }, [menuOpen]);
  function open(kind, id) {
    setNotice('');
    setModal({ kind, id });
  }
  function backup() {
    downloadBlob(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      `NEXO-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
  }
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <aside className={'sidebar' + (menuOpen ? ' menu-open' : '')}>
        <button className="mobile-menu-toggle" ref={menuButton} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <span aria-hidden="true">×</span> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
        </button>
        <div className="brand">
          <strong className="demo-brand">NEXO<span>ALMOXARIFADO</span></strong>
          <small>GESTÃO DO ALMOXARIFADO</small>
        </div>
        <nav id="main-navigation" ref={menuNav} aria-label="Menu principal">
          {pages.map((name, i) => (
            <button
              key={name}
              aria-current={page === name ? 'page' : undefined}
              className={page === name ? 'active' : ''}
              disabled={busy}
              onClick={() => { setPage(name); if (menuOpen) closeMenu(); }}
            >
              <span aria-hidden="true">{icons[i]}</span>
              {name}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <footer>
            Controle de equipamentos
            <br />
            <span className="account">{email}</span>
          </footer>
        </div>
      </aside>
      {menuOpen && <div className="menu-backdrop" aria-hidden="true" onClick={closeMenu} />}
      <main id="main" inert={menuOpen ? true : undefined}>
        <header>
          <div>
            <div className="eyebrow">EQUIPAMENTOS & CALIBRAÇÕES</div>
            <h1>{page}</h1>
            <p>{subtitles[pages.indexOf(page)]}</p>
          </div>
          <button disabled={!data || loading || busy} onClick={() => open('equipment')}>
            ＋ Cadastrar equipamento
          </button>
        </header>
        <div className="connection">
          <span role="status">{saving ? "Salvando dados…" : loading ? "Carregando…" : ""}</span>
          <div className="toolbar-actions">
            <button className="link" disabled={loading || busy} onClick={() => void reload()}>
              Atualizar dados
            </button>
            <button className="link" disabled={!data || loading || busy} onClick={backup}>
              Exportar backup
            </button>
          </div>
        </div>
        {(error || notice) && (
          <p className="error error-banner" role="alert">
            {notice || error}
          </p>
        )}
        {loading && (
          <section className="panel" aria-busy="true">
            <p>Carregando registros…</p>
          </section>
        )}
        {!loading && !data && (
          <section className="panel">
            <h2>Não foi possível carregar os registros</h2>
            <p>Verifique a conexão e tente novamente.</p>
            <button onClick={() => void reload()}>Reconectar</button>
          </section>
        )}
        {!loading && data && (
          <div className="page-content" inert={busy ? true : undefined}>
            {page === 'Painel' && <Dashboard data={data} open={open} navigate={setPage} />}
            {page === 'Equipamentos' && <Equipment data={data} open={open} />}
            {page === 'Calibrações' && (
              <Equipment key="calibrations" data={data} open={open} calibration />
            )}
            {page === 'Retiradas e devoluções' && <Movements data={data} open={open} />}
          </div>
        )}
        {modal &&
          data &&
          (modal.kind === 'history' ? (
            <History id={modal.id} data={data} onClose={() => setModal(null)} />
          ) : ['deactivate', 'reactivate', 'delete'].includes(modal.kind) ? (
            <EquipmentAction
              {...modal}
              data={data}
              commit={commit}
              saving={saving}
              onClose={() => setModal(null)}
            />
          ) : (
            <RecordForm
              key={`${modal.kind}-${modal.id || 'new'}`}
              {...modal}
              data={data}
              commit={commit}
              saving={saving}
              onClose={() => setModal(null)}
            />
          ))}
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null),
    [error, setError] = useState('');
  const expire = useCallback(
    () => setSession((previous) => ({ ...previous, authenticated: false })),
    [],
  );
  const checkSession = useCallback(async () => {
    setError('');
    const next = await api.session();
    if (!next || typeof next.authenticated !== 'boolean')
      throw Error('Resposta inesperada do servidor. Confira se a API está em execução.');
    setSession(next);
    return next;
  }, []);
  useEffect(() => {
    checkSession().catch((e) => setError(e.message));
  }, [checkSession]);
  if (error)
    return (
      <main className="startup">
        <h1>NEXO Almoxarifado</h1>
        <p className="error" role="alert">
          {error}
        </p>
        <button onClick={() => checkSession().catch((e) => setError(e.message))}>
          Tentar novamente
        </button>
      </main>
    );
  if (!session)
    return (
      <main className="startup" role="status">
        Carregando NEXO Almoxarifado…
      </main>
    );
  if (!session.authenticated)
    return (
      <Login
        configured={session.configured}
        onLogin={async () => {
          const next = await checkSession();
          if (!next.authenticated)
            throw Error(
              'O navegador não confirmou a sessão. Confira os cookies e o endereço de acesso.',
            );
        }}
      />
    );
  return <Workspace email={session.email} onExpired={expire} />;
}

