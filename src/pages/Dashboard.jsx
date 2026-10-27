import { date, daysUntil, equipmentStatus, overdue } from '../domain/inventory.js';
import CalibrationBadge from '../components/CalibrationBadge.jsx';
import { isEquipmentActive } from '../../shared/equipment.js';
export default function Dashboard({ data, open, navigate }) {
  const alerts = data.equipment
    .filter((e) => isEquipmentActive(e) && daysUntil(e) !== null && daysUntil(e) <= 60)
    .sort((a, b) => a.due.localeCompare(b.due));
  const openMoves = data.moves.filter((m) => !m.returned),
    late = data.moves.filter(overdue);
  const cards = [
    ['Total de equipamentos', data.equipment.length, 'Patrimônio cadastrado'],
    [
      'Disponíveis',
      data.equipment.filter((e) => equipmentStatus(data, e) === 'Disponível').length,
      'Prontos para retirada',
    ],
    ['Em uso', openMoves.length, 'Retiradas em aberto'],
    ['Atenção à calibração', alerts.length, 'Vencidas ou até 60 dias'],
  ];
  return (
    <>
      <div className="cards">
        {cards.map(([title, count, hint]) => (
          <section className="card" key={title}>
            <span>{title}</span>
            <strong>{count}</strong>
            <small>{hint}</small>
          </section>
        ))}
      </div>
      <div className="grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Equipamentos em circulação</h2>
            <span className="badge neutral">{openMoves.length} em uso</span>
          </div>
          {!openMoves.length ? (
            <div className="empty">
              <h3>
                {data.equipment.length
                  ? 'Nenhum equipamento em circulação'
                  : 'Seu almoxarifado está pronto para começar'}
              </h3>
              <p>
                {data.equipment.length
                  ? 'Registre uma retirada para acompanhar o destino e a devolução.'
                  : 'Cadastre o primeiro equipamento para acompanhar as movimentações.'}
              </p>
              <button onClick={() => open(data.equipment.length ? 'checkout' : 'equipment')}>
                {data.equipment.length ? 'Registrar retirada' : 'Cadastrar equipamento'}
              </button>
            </div>
          ) : (
            openMoves.map((m) => (
              <div className="row" key={m.id}>
                <div>
                  <strong>{data.equipment.find((e) => e.id === m.eid)?.name}</strong>
                  <p>
                    {m.person} · {m.destination}
                    <br />
                    Previsão: {date(m.expected)}
                  </p>
                </div>
                <button className="subtle" onClick={() => open('return', m.id)}>
                  Devolver
                </button>
              </div>
            ))
          )}
        </section>
        <section className="panel">
          <h2>Prazos que merecem atenção</h2>
          {alerts.length ? (
            alerts.map((e) => (
              <div className="row" key={e.id}>
                <div>
                  <strong>
                    {e.code} · {e.name}
                  </strong>
                  <p>{date(e.due)}</p>
                </div>
                <CalibrationBadge equipment={e} />
              </div>
            ))
          ) : (
            <p>Nenhuma calibração próxima do vencimento.</p>
          )}
          {!!late.length && <p className="notice">{late.length} devolução(ões) em atraso.</p>}
        </section>
      </div>
    </>
  );
}
