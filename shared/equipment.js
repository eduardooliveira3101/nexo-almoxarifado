// Old records without an `active` flag remain active.
export const isEquipmentActive = (equipment) => equipment.active !== false && equipment.inactive !== true;

export function deletionBlocker(data, equipment) {
  if (data.moves.some((move) => move.eid === equipment.id))
    return 'Este equipamento possui movimentações. Desative-o para preservar o histórico.';
  if (
    equipment.calibrations?.length ||
    equipment.caldate ||
    equipment.due ||
    equipment.pdf ||
    equipment.certnumber ||
    equipment.lab
  )
    return 'Este equipamento possui registros de calibração. Desative-o para preservar o histórico.';
  return '';
}

export function validateLifecycle(previous, next) {
  const nextById = new Map(next.equipment.map((equipment) => [equipment.id, equipment]));
  for (const equipment of previous.equipment) {
    const updated = nextById.get(equipment.id);
    if (!updated) {
      const reason = deletionBlocker(previous, equipment);
      if (reason) throw Error(reason);
    } else if (isEquipmentActive(equipment) && !isEquipmentActive(updated)) {
      if (
        [...previous.moves, ...next.moves].some(
          (move) => move.eid === equipment.id && !move.returned,
        )
      )
        throw Error('Registre a devolução antes de desativar o equipamento.');
    }
  }
  const oldMoves = new Set(previous.moves.map((move) => move.id));
  for (const move of next.moves) {
    if (!oldMoves.has(move.id) && !isEquipmentActive(nextById.get(move.eid)))
      throw Error('Equipamento desativado não pode receber novas retiradas.');
  }
}
