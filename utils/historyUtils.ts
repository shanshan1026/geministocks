// Pure filter/sort logic for the analysis-history panel.
// Extracted from components/AnalysisHistory.tsx so it can be unit-tested.

export interface DisplayHistoryItem {
  id: number; // Date.now() at creation — doubles as recency
  text: string;
  score?: number; // investment attractiveness score (1-100)
  gapScore?: number; // information gap score (1-100)
}

export type SortMode = 'newest' | 'score' | 'gapScore';

/** Case-insensitive substring filter; tolerates malformed entries without text. */
export function filterHistory(history: DisplayHistoryItem[], searchTerm: string): DisplayHistoryItem[] {
  const term = searchTerm.toLowerCase();
  return history.filter(
    (entry) => typeof entry.text === 'string' && entry.text.toLowerCase().includes(term)
  );
}

/**
 * Sort without mutating the input. Entries missing the sorted score rank last
 * (treated as -1 so a real score of 0 still outranks "no score").
 */
export function sortHistory(history: DisplayHistoryItem[], sortMode: SortMode): DisplayHistoryItem[] {
  return [...history].sort((a, b) => {
    if (sortMode === 'score') return (b.score ?? -1) - (a.score ?? -1);
    if (sortMode === 'gapScore') return (b.gapScore ?? -1) - (a.gapScore ?? -1);
    return b.id - a.id; // newest first
  });
}
