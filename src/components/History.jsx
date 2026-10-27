import { useState } from 'react';
import Modal from './Modal.jsx';
import { date } from '../domain/inventory.js';
import { downloadCertificate } from '../services/api.js';
export default function History({ id, data, onClose }) {
  const e = data.equipment.find((item) => item.id === id),
    [error, setError] = useState('');
  if (!e) return null;
  async function download(pdf) {
    try {
      setError('');
      await downloadCertificate(pdf, e.code);
    } catch (err) {
      setError(err.message);
    }
  }
  const moves = data.moves.filter((m) => m.eid === id).toReversed();
  return (
    <Modal title={`${e.code} · ${e.name}`} onClose={onClose}>
      <p>Localização de origem: {e.location || 'Não informada'}</p>
      {e.notes && <p>{e.notes}</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <h3>Movimentações</h3>
      {!moves.length && <p>Nenhuma movimentação.</p>}
      {moves.map((m) => (
        <article className="history-item" key={m.id}>
          <strong>
            {m.person} → {m.destination}
          </strong>
          <p>
            Retirada: {date(m.out)} · Previsão: {date(m.expected)}
          </p>
          <p>
            {m.returned
              ? `Devolvido: ${date(m.returned)} · Recebido por: ${m.receiver || 'Não informado'} · ${m.condition || ''}`
              : 'Retirada em aberto'}
          </p>
          <p>
            {m.notes} {m.returnNotes}
          </p>
        </article>
      ))}
      <h3>Calibrações</h3>
      {!(e.calibrations || []).length && <p>Nenhuma calibração registrada.</p>}
      {(e.calibrations || []).map((c, i) => (
        <article className="history-item" key={`${c.registered || c.caldate}-${i}`}>
          <strong>
            {date(c.caldate)} · {c.lab || 'Laboratório não informado'}
          </strong>
          <p>
            Certificado: {c.certnumber || '—'} · Próxima: {date(c.due)}
          </p>
          {c.pdf && (
            <button className="link" onClick={() => download(c.pdf)}>
              Baixar PDF de {date(c.caldate)}
            </button>
          )}
        </article>
      ))}
      {e.pdf && (
        <button className="subtle" onClick={() => download(e.pdf)}>
          Baixar certificado atual
        </button>
      )}
      <div className="actions">
        <button onClick={onClose}>Fechar</button>
      </div>
    </Modal>
  );
}
