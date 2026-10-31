import { SEAT_LABELS, SEATS_WITH_RUNNING_MATE } from '../../constants/kenya';
import { useSimulationStore } from '../../store/simulationStore';
import type { Seat } from '../../types/simulation';

const ORDER: Seat[] = [
  'president',
  'governor',
  'senator',
  'women_rep',
  'mp',
  'mca',
];

const styles = `
.seats {
  display: flex; flex-wrap: wrap; gap: 2px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 4px;
}
.seat {
  flex: 1 1 auto;
  padding: 8px 12px;
  font-size: var(--fs-xs);
  font-weight: 500;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px;
  transition: background var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out);
  white-space: nowrap;
}
.seat:hover { color: var(--text-primary); background: var(--bg-elevated); }
.seat[aria-pressed="true"] {
  background: var(--accent-primary);
  color: var(--text-inverse);
}
.seat[aria-pressed="true"]:hover {
  background: var(--accent-primary-hover);
  color: var(--text-inverse);
}
.seat__mate {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(255,255,255,0.14);
  color: inherit;
  font-weight: 600;
}
`;

export function SeatSelector() {
  const selectedSeat = useSimulationStore(s => s.selectedSeat);
  const setSeat = useSimulationStore(s => s.setSeat);

  return (
    <>
      <style>{styles}</style>
      <div className="seats" role="group" aria-label="Seat being simulated">
        {ORDER.map(seat => (
          <button
            key={seat}
            type="button"
            className="seat"
            aria-pressed={selectedSeat === seat}
            onClick={() => setSeat(seat)}
          >
            {SEAT_LABELS[seat]}
            {SEATS_WITH_RUNNING_MATE.has(seat) && (
              <span className="seat__mate" aria-label="has running mate">
                RM
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
