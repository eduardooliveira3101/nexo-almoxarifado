import { useState } from 'react';
import { date, equipmentStatus } from '../domain/inventory.js';
import CalibrationBadge from '../components/CalibrationBadge.jsx';
import { deletionBlocker, isEquipmentActive } from '../../shared/equipment.js';
export default function Equipment({ data, open, calibration = false }) {
  const [query, setQuery] = useState('');
  const [activation, setActivation] = useState('all');
  const rows = data.equipment.filter(
    (e) =>
      `${e.name} ${e.code} ${e.serial || ''}`.toLowerCase().includes(query.toLowerCase()) &&
      (activation === 'all' || isEquipmentActive(e) === (activation === 'active')),
  );
  return (
    <>
      <div className="toolbar">
        <label className="search">
          Buscar equipamento
          <input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Nome, identificação ou número de série"
          />
        </label>
        <label>
          Ativação
          <select value={activation} onChange={(ev) => setActivation(ev.target.value)}>
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Desativados</option>
          </select>
        </label>
        <span>{rows.length} equipamento(s)</span>
      </div>
      <section className="panel tablewrap">
        {!data.equipment.length ? (
          <div className="empty">
            <h2>Nenhum equipamento cadastrado</h2>
            <p>Cadastre equipamentos para acompanhar disponibilidade e calibrações.</p>
            <button onClick={() => open('equipment')}>Cadastrar primeiro equipamento</button>
          </div>
        ) : (
          <>
            <table>
              <caption className="sr-only">
                {calibration ? 'Prazos e certificados de calibração' : 'Equipamentos cadastrados'}
              </caption>
              <thead>
                <tr>
                  <th>Equipamento</th>
                  <th>{calibration ? 'Última calibração' : 'Marca / modelo'}</th>
                  <th>{calibration ? 'Próxima calibração' : 'Situação'}</th>
                  <th>Calibração</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.name}</strong>
                      <span
                        className={`badge activation-badge ${isEquipmentActive(e) ? '' : 'neutral'}`}
                      >
                        {isEquipmentActive(e) ? 'Ativo' : 'Desativado'}
                      </span>
                      <small>
                        {e.code} · Série {e.serial || '—'}
                      </small>
                    </td>
                    <td>
                      {calibration
                        ? date(e.caldate)
                        : [e.brand, e.model].filter(Boolean).join(' / ') || '—'}
                    </td>
                    <td>
                      {calibration ? (
                        date(e.due)
                      ) : (
                        <span
                          className={`badge ${!isEquipmentActive(e) ? 'neutral' : equipmentStatus(data, e) === 'Disponível' ? '' : 'warn'}`}
                        >
                          {equipmentStatus(data, e)}
                        </span>
                      )}
                    </td>
                    <td>
                      <CalibrationBadge equipment={e} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="link"
                          onClick={() => open(calibration ? 'calibration' : 'equipment', e.id)}
                        >
                          {calibration ? 'Certificado' : 'Editar'}
                        </button>
                        <button className="link" onClick={() => open('history', e.id)}>
                          Histórico
                        </button>
                        {!calibration && (
                          <>
                            <button
                              className="link"
                              onClick={() =>
                                open(isEquipmentActive(e) ? 'deactivate' : 'reactivate', e.id)
                              }
                            >
                              {isEquipmentActive(e) ? 'Desativar' : 'Reativar'}
                            </button>
                            <button
                              className="link danger-link"
                              onClick={() => open('delete', e.id)}
                              disabled={!!deletionBlocker(data, e)}
                              aria-describedby={
                                deletionBlocker(data, e) ? `delete-reason-${e.id}` : undefined
                              }
                            >
                              Excluir
                            </button>
                          </>
                        )}
                        {!calibration && equipmentStatus(data, e) === 'Disponível' && (
                          <button className="link" onClick={() => open('checkout', e.id)}>
                            Retirar
                          </button>
                        )}
                      </div>
                      {!calibration && deletionBlocker(data, e) && (
                        <small id={`delete-reason-${e.id}`} className="action-hint">
                          Exclusão bloqueada: possui histórico. Use Desativar.
                        </small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p>Nenhum equipamento encontrado.</p>}
          </>
        )}
      </section>
    </>
  );
}
