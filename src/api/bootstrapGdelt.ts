// ------------------------------------------------------------------
// Bootstrap layer for GDELT political news.
//
// Called once on first render of the SensitivityTable. Fetches the
// latest English-language Kenya political coverage from GDELT DOC 2.0,
// computes a "news sentiment magnitude" in [0, 1] from the volume of
// adverse coverage, and stores the result for both the UI (News pulse
// panel) and the engine (via getNewsSentimentMagnitude).
//
// Magnitude formula:
//   magnitude = (adverse articles / total articles) × volume factor
// where the volume factor saturates at 15 articles.
//
// The news shock applied to the incumbent is:
//   shock = −(NEWS_SHOCK_MAX × magnitude), with NEWS_SHOCK_MAX = 0.6.
// So a quiet news week produces near-zero shock; wall-to-wall adverse
// coverage produces the full −0.6 penalty.
// ------------------------------------------------------------------

import { create } from 'zustand';
import { fetchKenyaPoliticalNews } from './gdelt';
import type { GdeltArticle } from './gdelt';
import { useSimulationStore } from '../store/simulationStore';

const ADVERSE_PATTERN = new RegExp(
  '\\b(' +
    'corruption|graft|scandal|probe|alleg|arrest|charge|bribe|' +
    'crisis|protest|unrest|violence|chaos|' +
    'fail|collapse|shortage|blackout|' +
    'resign|sack|fired|critici[sz]e|attack|blame|' +
    'controversy|outrage|condemn|sue|lawsuit|' +
    'fraud|embezzle' +
    ')\\b',
  'i'
);

export const NEWS_SHOCK_MAX = 0.6;
export const MAX_VOLUME_ARTICLES = 15;

export interface GdeltReport {
  status: 'idle' | 'loading' | 'ok' | 'error';
  articles: GdeltArticle[];
  adverseCount: number;
  totalCount: number;
  magnitude: number; // 0–1
  fetchedAt?: number;
  error?: string;
}

interface GdeltStore {
  report: GdeltReport;
  setReport: (r: GdeltReport) => void;
}

const EMPTY: GdeltReport = {
  status: 'idle',
  articles: [],
  adverseCount: 0,
  totalCount: 0,
  magnitude: 0,
};

export const useGdeltStore = create<GdeltStore>(set => ({
  report: EMPTY,
  setReport: report => set({ report }),
}));

let started = false;

/** Synchronous read for the engine. Returns 0 if not yet loaded. */
export function getNewsSentimentMagnitude(): number {
  return useGdeltStore.getState().report.magnitude;
}

/** Classify a headline as adverse or not. Used by both fetch and UI. */
export function isAdverseHeadline(title: string): boolean {
  return ADVERSE_PATTERN.test(title);
}

/**
 * Fetch headlines and populate the store. Idempotent within a page
 * session — subsequent calls are no-ops after the first starts.
 */
export async function bootstrapGdelt(): Promise<void> {
  if (started) return;
  started = true;

  useGdeltStore.getState().setReport({
    ...EMPTY,
    status: 'loading',
  });

  try {
    const articles = await fetchKenyaPoliticalNews();
    const totalCount = articles.length;
    const adverseCount = articles.filter(a => isAdverseHeadline(a.title)).length;
    const adverseRatio = totalCount > 0 ? adverseCount / totalCount : 0;
    const volumeFactor = Math.min(1, totalCount / MAX_VOLUME_ARTICLES);
    const magnitude = adverseRatio * volumeFactor;

    useGdeltStore.getState().setReport({
      status: 'ok',
      articles,
      adverseCount,
      totalCount,
      magnitude,
      fetchedAt: Date.now(),
    });

    // If the news shock toggle is on when news finishes loading, the
    // previous computation used magnitude 0. Force one recompute so
    // the effect takes hold without requiring a further click.
    const simState = useSimulationStore.getState();
    if (simState.toggles['news_sentiment_shock']) {
      useSimulationStore.setState({ sliders: { ...simState.sliders } });
    }
  } catch (err) {
    useGdeltStore.getState().setReport({
      ...EMPTY,
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
