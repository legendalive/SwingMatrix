// ------------------------------------------------------------------
// Bootstrap layer for World Bank live data.
//
// Called once on app mount. For each slider with a World Bank
// indicator code, fetches the latest observation and — if the user
// has not already touched that slider — updates its value in the
// simulation store.
//
// The fetch status for each indicator is held in a small Zustand
// store colocated with this file. DataProvenance reads from it to
// show the year of the fetched value or an error status.
//
// Failure is graceful: on any error the slider keeps its documented
// default, the error is recorded, and the app continues.
// ------------------------------------------------------------------

import { create } from 'zustand';
import { fetchWorldBankIndicator, latestValue } from './worldBank';
import { useSimulationStore } from '../store/simulationStore';
import { SLIDER_VARIABLES } from '../constants/variables';

export interface IndicatorFetchState {
  code: string;
  status: 'idle' | 'loading' | 'ok' | 'error';
  value?: number;
  year?: number;
  error?: string;
}

interface FetchStore {
  reports: Record<string, IndicatorFetchState>;
  setReport: (code: string, report: IndicatorFetchState) => void;
}

export const useFetchStore = create<FetchStore>(set => ({
  reports: {},
  setReport: (code, report) =>
    set(s => ({ reports: { ...s.reports, [code]: report } })),
}));

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Fetch all coded World Bank indicators and update untouched sliders.
 * Safe to call multiple times; the underlying client caches for 24h.
 */
export async function bootstrapWorldBank(): Promise<void> {
  const coded = SLIDER_VARIABLES.filter(
    v => v.worldBankCode !== null
  );

  await Promise.all(
    coded.map(async slider => {
      const code = slider.worldBankCode as string;

      useFetchStore.getState().setReport(code, {
        code,
        status: 'loading',
      });

      try {
        const points = await fetchWorldBankIndicator(code);
        const latest = latestValue(points);

        if (!latest) {
          useFetchStore.getState().setReport(code, {
            code,
            status: 'error',
            error: 'No observations returned',
          });
          return;
        }

        const value = clamp(latest.value, slider.min, slider.max);

        useFetchStore.getState().setReport(code, {
          code,
          status: 'ok',
          value,
          year: latest.year,
        });

        // Only update the slider if the user has not touched it.
        // If they already dragged it away from the documented default,
        // we respect their interaction and leave their value alone.
        const state = useSimulationStore.getState();
        const current = state.sliders[slider.id];
        if (Math.abs(current - slider.defaultValue) < 0.01) {
          state.setSlider(slider.id, value);
        }
      } catch (err) {
        useFetchStore.getState().setReport(code, {
          code,
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })
  );
}
