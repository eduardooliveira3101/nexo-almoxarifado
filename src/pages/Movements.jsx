import { useState } from 'react';
import { date, overdue } from '../domain/inventory.js';
export default function Movements({ data, open }) {
  const [query, setQuery] = useState(''),
    [onlyOpen, setOnlyOpen] = useState(false);
  const rows = data.moves
    .filter((m) => {
      const e = data.equipment.find((e) => e.id === m.eid);
      return (
        (!onlyOpen || !m.returned) &&
        `${e?.code} ${e?.name} ${m.person} ${m.destination}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    })
    .toReversed();
  return (
    <>
      <div className="toolbar">
        <label className="search">
          Buscar movimentação
          <input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="Equipamento, responsável ou destino"
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(ev) => setOnlyOpen(ev.target.checked)}
          />
          Somente em aberto
        </label>
        <button onClick={() => open('checkout')}>Registrar retirada</button>
      </div>
      <section className="panel tablewrap">
        <table>
          <caption className="sr-only">Retiradas e devoluções</caption>
          <thead>
            <tr>
              <th>Equipamento</th>
              <th>Responsável / destino</th>
              <th>Retirada</th>
              <th>Previsão</th>
              <th>Devolução</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td>{data.equipment.find((e) => e.id === m.eid)?.code}</td>
                <td>
                  {m.person}
                  <small>{m.destination}</small>
                </td>
                <td>
                  {date(m.out)}
                  <small>
                    {new Date(m.out).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </small>
                </td>
                <td>
                  {date(m.expected)}
                  {overdue(m) && <small className="error">Em atraso</small>}
                </td>
                <td>
                  {m.returned ? (
                    <>
                      {date(m.returned)}
                      <small>{m.condition}</small>
                    </>
                  ) : (
                    <span className="badge warn">Em aberto</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    {!m.returned && (
                      <button className="link" onClick={() => open('return', m.id)}>
                        Devolver
                      </button>
                    )}
                    <button className="link" onClick={() => open('history', m.eid)}>
                      Histórico
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="empty">
            <h2>Nenhuma movimentação encontrada</h2>
            <p>As retiradas e devoluções aparecerão aqui.</p>
          </div>
        )}
      </section>
    </>
  );
}

