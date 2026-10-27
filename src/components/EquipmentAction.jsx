import { useState } from 'react';
import Modal from './Modal.jsx';
import { activeMove, applyChange } from '../domain/inventory.js';
import { deletionBlocker } from '../../shared/equipment.js';

const titles = {
  deactivate: 'Desativar equipamento',
  reactivate: 'Reativar equipamento',
  delete: 'Excluir equipamento',
};
export default function EquipmentAction({ kind, id, data, commit, saving, onClose }) {
  const [error, setError] = useState(''),
    [code, setCode] = useState('');
  const equipment = data.equipment.find((item) => item.id === id);
  if (!equipment)
    return (
      <Modal title="Equipamento não encontrado" onClose={onClose}>
        <p>O cadastro mudou. Feche esta janela e atualize a lista.</p>
      </Modal>
    );
  const reason =
    kind === 'delete'
      ? deletionBlocker(data, equipment)
      : kind === 'deactivate' && activeMove(data, id)
        ? 'Registre a devolução antes de desativar o equipamento.'
        : '';
  async function submit(ev) {
    ev.preventDefault();
    setError('');
    try {
      await commit((previous) => applyChange(previous, kind, id, { confirmCode: code }));
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <Modal title={titles[kind]} onClose={onClose} busy={saving}>
      <p>
        <strong>
          {equipment.code} · {equipment.name}
        </strong>
      </p>
      <form onSubmit={submit}>
        {kind === 'deactivate' && (
          <p>
            O equipamento continuará no cadastro com todos os históricos e certificados. Novas
            retiradas ficarão bloqueadas. Você poderá reativá-lo depois.
          </p>
        )}
        {kind === 'reactivate' && (
          <p>
            O equipamento voltará a ficar ativo. Sua situação anterior de disponibilidade,
            manutenção ou calibração será mantida.
          </p>
        )}
        {kind === 'delete' && (
          <>
            <p>
              A exclusão é permanente e remove este cadastro. Para manter os dados e apenas impedir
              o uso, escolha Desativar.
            </p>
            {!reason && (
              <label>
                Digite {equipment.code} para confirmar
                <input
                  value={code}
                  onChange={(ev) => setCode(ev.target.value)}
                  autoComplete="off"
                  required
                  disabled={saving}
                />
              </label>
            )}
          </>
        )}
        {reason && (
          <p className="notice" role="status">
            {reason}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="button" className="subtle" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            className={kind === 'delete' ? 'danger-button' : ''}
            disabled={saving || !!reason || (kind === 'delete' && code !== equipment.code)}
          >
            {saving
              ? 'Salvando…'
              : kind === 'delete'
                ? 'Excluir definitivamente'
                : kind === 'deactivate'
                  ? 'Desativar equipamento'
                  : 'Reativar equipamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
