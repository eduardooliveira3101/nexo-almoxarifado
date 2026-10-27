import { useState } from 'react';
import Modal from './Modal.jsx';
import { applyChange, daysUntil, equipmentStatus } from '../domain/inventory.js';
import { readPdf } from '../services/api.js';

function Field({ label, name, value = '', type = 'text', required = false, maxLength = 500 }) {
  return (
    <label>
      {label}
      {required ? ' *' : ''}
      <input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        maxLength={maxLength}
      />
    </label>
  );
}
const titles = {
  equipment: 'Equipamento',
  checkout: 'Registrar retirada',
  return: 'Registrar devolução',
  calibration: 'Registrar calibração',
};
export default function RecordForm({ kind, id, data, commit, onClose, saving }) {
  const [error, setError] = useState(''),
    [processing, setProcessing] = useState(false);
  const equipment = data.equipment.find((e) => e.id === id) || {};
  const available = data.equipment.filter((e) => equipmentStatus(data, e) === 'Disponível');
  async function submit(ev) {
    ev.preventDefault();
    setError('');
    setProcessing(true);
    const values = Object.fromEntries(new FormData(ev.currentTarget));
    try {
      if (kind === 'calibration') {
        values.pdf = await readPdf(values.file);
        delete values.file;
      }
      await commit((previous) => applyChange(previous, kind, id, values));
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  }
  const busy = saving || processing;
  return (
    <Modal
      title={`${titles[kind]}${equipment.code ? ' · ' + equipment.code : ''}`}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <div className="fields">
            {kind === 'equipment' && (
              <>
                <Field
                  label="Identificação"
                  name="code"
                  value={equipment.code}
                  required
                  maxLength={200}
                />
                <Field
                  label="Nome do equipamento"
                  name="name"
                  value={equipment.name}
                  required
                  maxLength={300}
                />
                <Field label="Marca" name="brand" value={equipment.brand} />
                <Field label="Modelo" name="model" value={equipment.model} />
                <Field label="Número de série" name="serial" value={equipment.serial} />
                <Field label="Localização de origem" name="location" value={equipment.location} />
                <label>
                  Situação
                  <select name="state" defaultValue={equipment.state || 'Disponível'}>
                    {['Disponível', 'Em manutenção', 'Em calibração'].map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Observações
                  <textarea name="notes" defaultValue={equipment.notes || ''} maxLength={10000} />
                </label>
              </>
            )}
            {kind === 'checkout' && (
              <>
                <label className="full">
                  Equipamento *
                  <select name="eid" defaultValue={id || available[0]?.id} required>
                    {available.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.code} — {e.name}
                        {daysUntil(e) !== null && daysUntil(e) < 0 ? ' · CALIBRAÇÃO VENCIDA' : ''}
                      </option>
                    ))}
                  </select>
                </label>
                {!available.length && (
                  <p className="notice full">Nenhum equipamento disponível para retirada.</p>
                )}
                <Field label="Quem retirou" name="person" required />
                <Field label="Obra / destino" name="destination" required />
                <Field label="Previsão de devolução" name="expected" type="date" />
                <label>
                  Observações
                  <textarea name="notes" maxLength={10000} />
                </label>
                <p className="notice full">
                  Confira o prazo de calibração antes de liberar o equipamento.
                </p>
              </>
            )}
            {kind === 'return' && (
              <>
                <Field label="Recebido por" name="receiver" required />
                <label>
                  Condição no recebimento
                  <select name="condition">
                    {['Em bom estado', 'Com avaria', 'Precisa de manutenção'].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label className="full">
                  Observações
                  <textarea name="returnNotes" maxLength={10000} />
                </label>
              </>
            )}
            {kind === 'calibration' && (
              <>
                <Field
                  label="Data da calibração"
                  name="caldate"
                  value={equipment.caldate}
                  type="date"
                  required
                />
                <Field
                  label="Próxima calibração prevista"
                  name="due"
                  value={equipment.due}
                  type="date"
                  required
                />
                <Field label="Laboratório responsável" name="lab" value={equipment.lab} />
                <Field
                  label="Número do certificado"
                  name="certnumber"
                  value={equipment.certnumber}
                />
                <label className="full">
                  Certificado PDF (até 2 MB)
                  <input name="file" type="file" accept="application/pdf" />
                  {equipment.pdf && (
                    <small>
                      O certificado atual será mantido se nenhum arquivo for selecionado.
                    </small>
                  )}
                </label>
              </>
            )}
          </div>
        </fieldset>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button type="button" className="subtle" disabled={busy} onClick={onClose}>
            Cancelar
          </button>
          <button disabled={busy || (kind === 'checkout' && !available.length)}>
            {busy ? 'Salvando…' : 'Salvar registro'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
