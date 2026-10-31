import { AppShell } from '../components/layout/AppShell';
import { SliderPanel } from '../components/controls/SliderPanel';
import { TogglePanel } from '../components/controls/TogglePanel';
import { CandidateList } from '../components/candidates/CandidateList';
import { ShareChart } from '../components/results/ShareChart';
import { SensitivityTable } from '../components/results/SensitivityTable';
import { DataProvenance } from '../components/results/DataProvenance';
import { BreadcrumbNav } from '../components/hierarchy/BreadcrumbNav';
import { SeatSelector } from '../components/hierarchy/SeatSelector';
import { CountySelector } from '../components/hierarchy/CountySelector';
import { useSimulationResults } from '../store/selectors';
import { useSimulationStore } from '../store/simulationStore';
import { SEAT_LABELS, findCounty } from '../constants/kenya';

export function SimulatorPage() {
  const results = useSimulationResults();
  const selectedSeat = useSimulationStore(s => s.selectedSeat);
  const geography = useSimulationStore(s => s.geography);

  const county = geography.countyCode ? findCounty(geography.countyCode) : null;
  const scopeLabel = county ? county.name : 'National';

  const controls = (
    <>
      <SeatSelector />
      <CountySelector />
      <SliderPanel />
      <TogglePanel />
    </>
  );

  const resultsSlot = (
    <>
      <BreadcrumbNav />
      <CandidateList />
      <ShareChart
        shares={results}
        seatLabel={SEAT_LABELS[selectedSeat]}
        scopeLabel={scopeLabel}
      />
      <SensitivityTable />
      <DataProvenance />
    </>
  );

  return <AppShell controlsSlot={controls} resultsSlot={resultsSlot} navSlot={null} />;
}
