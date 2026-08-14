import pc from "picocolors";

export interface FuzzyMatch<T> {
  item: T;
  score: number;
  highlightedText: string;
}

export function fuzzySearch<T>(
  items: T[],
  query: string,
  keyExtractor: (item: T) => string
): FuzzyMatch<T>[] {
  if (!query || query.trim().length === 0) {
    return items.map((item) => ({
      item,
      score: 1,
      highlightedText: keyExtractor(item),
    }));
  }

  const q = query.toLowerCase();
  const results: FuzzyMatch<T>[] = [];

  for (const item of items) {
    const text = keyExtractor(item);
    const textLower = text.toLowerCase();

    let score = 0;
    let queryIdx = 0;
    let highlighted = "";

    // Direct substring match gets top score
    if (textLower.includes(q)) {
      score = 100 - textLower.indexOf(q);
      const start = textLower.indexOf(q);
      const end = start + q.length;
      highlighted =
        text.slice(0, start) +
        pc.bold(pc.yellow(text.slice(start, end))) +
        text.slice(end);

      results.push({ item, score, highlightedText: highlighted });
      continue;
    }

    // Subsequence fuzzy match
    for (let i = 0; i < text.length; i++) {
      if (queryIdx < q.length && textLower[i] === q[queryIdx]) {
        highlighted += pc.bold(pc.yellow(text[i]));
        queryIdx++;
        score += 5;
      } else {
        highlighted += text[i];
      }
    }

    if (queryIdx === q.length) {
      results.push({ item, score, highlightedText: highlighted });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
