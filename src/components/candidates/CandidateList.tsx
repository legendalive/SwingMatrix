import { useSimulationStore } from '../../store/simulationStore';
import { SEAT_LABELS } from '../../constants/kenya';
import { CandidateCard } from './CandidateCard';

const styles = `
.cands { display: flex; flex-direction: column; gap: var(--sp-3); }
.cands__head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: var(--sp-3);
}
.cands__title { font-size: var(--fs-md); font-weight: 600; }
.cands__sub { font-size: var(--fs-xs); color: var(--text-muted); }
.cands__actions {
  display: flex; gap: var(--sp-2); align-items: center;
}
.cands__note {
  margin-top: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--accent-primary);
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}
.btn {
  font-size: var(--fs-xs); font-weight: 500;
  padding: 6px 12px; border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--bg-surface); color: var(--text-primary);
  transition: border-color var(--dur-fast) var(--ease-out),
              background var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out);
}
.btn:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
.btn--primary {
  background: var(--accent-primary); border-color: var(--accent-primary);
  color: var(--text-inverse);
}
.btn--primary:hover { background: var(--accent-primary-hover); color: var(--text-inverse); }
`;

export function CandidateList() {
  const candidates = useSimulationStore(s => s.candidates);
  const selectedSeat = useSimulationStore(s => s.selectedSeat);
  const addCandidate = useSimulationStore(s => s.addCandidate);
  const canRemove = candidates.length > 2;

  return (
    <>
      <style>{styles}</style>
      <section aria-labelledby="cands-title">
        <header className="cands__head">
          <div>
            <h2 id="cands-title" className="cands__title">
              {SEAT_LABELS[selectedSeat]} candidates
            </h2>
            <span className="cands__sub">
              {candidates.length} candidate{candidates.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="cands__actions">
            <button type="button" className="btn btn--primary" onClick={addCandidate}>
              + Add candidate
            </button>
          </div>
        </header>

        {!canRemove && (
          <p className="cands__note">
            At least two candidates are required to run a simulation. Add a
            third candidate to enable removal.
          </p>
        )}

        <div className="cands" style={{ marginTop: 'var(--sp-3)' }}>
          {candidates.map(c => (
            <CandidateCard
              key={c.id}
              candidate={c}
              seat={selectedSeat}
              canRemove={canRemove}
            />
          ))}
        </div>
      </section>
    </>
  );
}
