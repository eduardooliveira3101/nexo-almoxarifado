import { activeMove, date, daysUntil, equipmentStatus, overdue } from './inventory.js';
import { isEquipmentActive } from '../../shared/equipment.js';
const normalize = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
export function answerQuestion(data, question) {
  if (!data.equipment.length) return 'Ainda não há equipamentos cadastrados.';
  const text = normalize(question);
  if (text.includes('calibr') || text.includes('venc')) {
    const n = Math.min(Number(text.match(/\d+/)?.[0] || 60), 3650);
    return (
      data.equipment
        .filter((e) => isEquipmentActive(e) && daysUntil(e) !== null && daysUntil(e) <= n)
        .map((e) => `${e.code} — ${e.name}: ${date(e.due)}${daysUntil(e) < 0 ? ' (vencida)' : ''}`)
        .join('\n') || `Nenhuma calibração vencida ou prevista para os próximos ${n} dias.`
    );
  }
  if (text.includes('atras'))
    return (
      data.moves
        .filter(overdue)
        .map(
          (m) =>
            `${data.equipment.find((e) => e.id === m.eid)?.code} — ${m.person} · previsto para ${date(m.expected)}`,
        )
        .join('\n') || 'Nenhuma devolução em atraso.'
    );
  if (text.includes('dispon'))
    return (
      data.equipment
        .filter((e) => equipmentStatus(data, e) === 'Disponível')
        .map((e) => `${e.code} — ${e.name}`)
        .join('\n') || 'Nenhum equipamento disponível.'
    );
  const matches = data.equipment.filter(
    (e) => text.includes(normalize(e.code)) || text.includes(normalize(e.name)),
  );
  return (
    (matches.length ? matches : data.equipment.filter((e) => activeMove(data, e.id)))
      .map((e) => {
        const move = activeMove(data, e.id);
        return `${e.code} — ${e.name}: ${move ? `com ${move.person}, em ${move.destination}. Previsão: ${date(move.expected)}` : equipmentStatus(data, e)}`;
      })
      .join('\n') || 'Nenhuma retirada encontrada. Consulte pela identificação do equipamento.'
  );
}

