import { deletionBlocker, isEquipmentActive } from '../../shared/equipment.js';

export const date = (value) =>
  value
    ? new Date(value.length === 10 ? value + 'T12:00:00' : value).toLocaleDateString('pt-BR')
    : 'Não informada';
export const activeMove = (data, id) => data.moves.find((m) => m.eid === id && !m.returned);
export const equipmentStatus = (data, e) =>
  activeMove(data, e.id)
    ? 'Retirado'
    : !isEquipmentActive(e)
      ? 'Desativado'
      : e.state || 'Disponível';
export function daysUntil(e, now = new Date()) {
  if (!e.due) return null;
  const [year, month, day] = e.due.split('-').map(Number);
  return Math.round(
    (Date.UTC(year, month - 1, day) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) /
      86400000,
  );
}
export const overdue = (m) =>
  !m.returned && m.expected && new Date(m.expected + 'T23:59:59') < new Date();
export function calibrationStatus(e) {
  const days = daysUntil(e);
  if (days === null) return { label: 'Sem prazo cadastrado', tone: 'neutral' };
  if (days < 0) return { label: `Vencida há ${-days} dias`, tone: 'bad' };
  return { label: days === 0 ? 'Vence hoje' : `Em ${days} dias`, tone: days <= 60 ? 'warn' : '' };
}

export function applyChange(
  data,
  kind,
  id,
  values,
  { uuid = () => crypto.randomUUID(), now = () => new Date().toISOString() } = {},
) {
  const next = structuredClone(data);
  const e = next.equipment.find((item) => item.id === id);
  if (kind === 'equipment') {
    values = { ...values, code: values.code.trim(), name: values.name.trim() };
    if (!values.code || !values.name) throw Error('Informe identificação e nome.');
    if (
      next.equipment.some(
        (item) => item.id !== id && item.code.trim().toLowerCase() === values.code.toLowerCase(),
      )
    )
      throw Error('Essa identificação já está cadastrada.');
    if (id && !e) throw Error('O equipamento não existe mais. Reabra o cadastro.');
    if (e) Object.assign(e, values);
    else next.equipment.push({ ...values, id: uuid(), calibrations: [] });
  } else if (kind === 'deactivate' || kind === 'reactivate') {
    if (!e) throw Error('Equipamento não encontrado.');
    if (kind === 'deactivate' && activeMove(next, id))
      throw Error('Registre a devolução antes de desativar o equipamento.');
    e.active = kind === 'reactivate';
    e.inactive = !e.active;
    if (e.active) delete e.deactivatedAt;
    else e.deactivatedAt = now();
  } else if (kind === 'delete') {
    if (!e) throw Error('Equipamento não encontrado.');
    const reason = deletionBlocker(next, e);
    if (reason) throw Error(reason);
    if (values.confirmCode !== e.code)
      throw Error('Digite a identificação exata para confirmar a exclusão.');
    next.equipment = next.equipment.filter((item) => item.id !== id);
  } else if (kind === 'checkout') {
    const selected = next.equipment.find((item) => item.id === values.eid);
    if (!selected || equipmentStatus(next, selected) !== 'Disponível')
      throw Error('Equipamento indisponível para retirada.');
    if (!values.person.trim() || !values.destination.trim())
      throw Error('Informe responsável e destino.');
    next.moves.push({
      ...values,
      person: values.person.trim(),
      destination: values.destination.trim(),
      id: uuid(),
      out: now(),
    });
  } else if (kind === 'return') {
    const move = next.moves.find((item) => item.id === id);
    if (!move || move.returned) throw Error('Essa retirada já foi encerrada ou não existe.');
    if (!values.receiver.trim()) throw Error('Informe quem recebeu o equipamento.');
    Object.assign(move, values, { receiver: values.receiver.trim(), returned: now() });
    if (values.condition !== 'Em bom estado')
      next.equipment.find((item) => item.id === move.eid).state = 'Em manutenção';
  } else if (kind === 'calibration') {
    if (!e) throw Error('Equipamento não encontrado.');
    if (!values.caldate || !values.due || values.due < values.caldate)
      throw Error('Confira as datas da calibração.');
    const pdf = values.pdf || e.pdf || null;
    e.calibrations = [...(e.calibrations || []), { ...values, pdf, registered: now() }];
    Object.assign(e, values, { pdf });
  } else throw Error('Operação inválida.');
  return next;
}
