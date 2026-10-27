import { calibrationStatus } from '../domain/inventory.js';
export default function CalibrationBadge({ equipment }) {
  const { label, tone } = calibrationStatus(equipment);
  return <span className={`badge ${tone}`}>{label}</span>;
}
