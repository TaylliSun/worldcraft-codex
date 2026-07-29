import {
  buildMemorySnapshot,
  rankAiMemoryMatches,
  type AiMemoryItem,
  type AiMemoryRetrieval
} from "./ai-writing";

export type HybridProjectSource = {
  id: string;
  kind: string;
  label: string;
  detail: string;
  text: string;
};

export type HybridProjectRetrieval = {
  source: HybridProjectSource;
  score: number;
  semanticSimilarity: number;
  reasons: string[];
  excerpt: string;
};

export type HybridMemoryBundle = {
  memories: AiMemoryRetrieval[];
  projectSources: HybridProjectRetrieval[];
  snapshot: string;
  characters: number;
};

const sourceKindPriority: Record<string, number> = {
  entity: 10,
  quest: 9,
  scene: 9,
  milestone: 8,
  "manuscript-scene": 12,
  "manuscript-chapter": 11,
  "manuscript-volume": 4,
  "manuscript-book": 3,
  world: 1
};

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").replace(/\s+/g, " ").trim();
}

function searchTerms(value: string) {
  const text = normalize(value);
  const terms = new Set<string>();
  text.match(/[\p{L}\p{N}_-]{2,}/gu)?.forEach((item) => terms.add(item));
  const compact = text.replace(/[^\p{Script=Han}\p{L}\p{N}]/gu, "");
  for (let size = 2; size <= 3; size += 1) {
    for (let index = 0; index + size <= compact.length; index += 1) {
      terms.add(compact.slice(index, index + size));
      if (terms.size >= 800) return terms;
    }
  }
  return terms;
}

function semanticFeatures(value: string) {
  const features = new Map<string, number>();
  const text = normalize(value).slice(0, 40_000);
  for (const term of searchTerms(text)) {
    const weight = term.length >= 3 ? 1 : 0.55;
    features.set(term, Math.max(features.get(term) ?? 0, weight));
  }
  return features;
}

function cosine(left: Map<string, number>, right: Map<string, number>) {
  if (!left.size || !right.size) return 0;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  left.forEach((weight, feature) => {
    leftMagnitude += weight * weight;
    dot += weight * (right.get(feature) ?? 0);
  });
  right.forEach((weight) => {
    rightMagnitude += weight * weight;
  });
  return leftMagnitude && rightMagnitude
    ? dot / Math.sqrt(leftMagnitude * rightMagnitude)
    : 0;
}

function excerptAroundTerms(text: string, terms: Set<string>, maximum = 1500) {
  const plain = text.replace(/\r\n/g, "\n").trim();
  if (plain.length <= maximum) return plain;
  const normalized = normalize(plain);
  let index = -1;
  for (const term of [...terms].sort((left, right) => right.length - left.length)) {
    const found = normalized.indexOf(term);
    if (found >= 0 && (index < 0 || found < index)) index = found;
  }
  const start = Math.max(0, index < 0 ? 0 : index - Math.floor(maximum * 0.3));
  const end = Math.min(plain.length, start + maximum);
  return `${start ? "..." : ""}${plain.slice(start, end).trim()}${end < plain.length ? "..." : ""}`;
}

export function rankHybridProjectSources(
  query: string,
  sources: HybridProjectSource[],
  targetContextId: string,
  limit = 8,
  options: { semantic?: boolean } = {}
): HybridProjectRetrieval[] {
  const normalizedQuery = normalize(query);
  const terms = searchTerms(query);
  const queryFeatures = options.semantic === false ? new Map<string, number>() : semanticFeatures(query);
  const seenExcerpt = new Set<string>();
  const ranked = sources
    .filter((source) => source.id !== targetContextId && source.kind !== "world" && source.text.trim())
    .map((source) => {
      const label = normalize(source.label);
      const haystack = normalize(`${source.label}\n${source.detail}\n${source.text.slice(0, 40_000)}`);
      let score = sourceKindPriority[source.kind] ?? 5;
      const reasons: string[] = [];
      if (label && normalizedQuery.includes(label)) {
        score += 70;
        reasons.push("标题明确提及");
      }
      let hits = 0;
      for (const term of terms) {
        if (term.length < 2 || !haystack.includes(term)) continue;
        hits += 1;
        score += term.length >= 3 ? 2.5 : 0.7;
        if (hits >= 40) break;
      }
      if (hits) reasons.push(`原文匹配 ${hits} 项`);
      const semanticSimilarity = options.semantic === false
        ? 0
        : cosine(queryFeatures, semanticFeatures(haystack));
      if (semanticSimilarity >= 0.035) {
        score += Math.round(semanticSimilarity * 90);
        reasons.push(`语义相近 ${Math.round(semanticSimilarity * 100)}%`);
      }
      return {
        source,
        score,
        semanticSimilarity,
        reasons,
        excerpt: excerptAroundTerms(source.text, terms)
      };
    })
    .filter((item) => item.reasons.length && item.score >= 8)
    .sort(
      (left, right) =>
        right.score - left.score ||
        (sourceKindPriority[right.source.kind] ?? 0) - (sourceKindPriority[left.source.kind] ?? 0) ||
        left.source.label.localeCompare(right.source.label, "zh-CN")
    );

  const result: HybridProjectRetrieval[] = [];
  for (const item of ranked) {
    const signature = normalize(item.excerpt).slice(0, 500);
    if (signature && seenExcerpt.has(signature)) continue;
    if (signature) seenExcerpt.add(signature);
    result.push(item);
    if (result.length >= Math.max(1, Math.min(20, limit))) break;
  }
  return result;
}

export function buildHybridMemoryBundle({
  query,
  memories,
  sources,
  targetContextId,
  semantic = true,
  memoryLimit = 14,
  projectLimit = 8,
  characterBudget = 60_000
}: {
  query: string;
  memories: AiMemoryItem[];
  sources: HybridProjectSource[];
  targetContextId: string;
  semantic?: boolean;
  memoryLimit?: number;
  projectLimit?: number;
  characterBudget?: number;
}): HybridMemoryBundle {
  const memoryMatches = rankAiMemoryMatches(query, memories, targetContextId, memoryLimit, { semantic });
  const projectSources = rankHybridProjectSources(query, sources, targetContextId, projectLimit, { semantic });
  const sections: string[] = [];
  const memoryText = buildMemorySnapshot(memoryMatches.map((item) => item.memory));
  if (memoryText) {
    sections.push(`【作者长期记忆】\n${memoryText}`);
  }
  if (projectSources.length) {
    sections.push(
      `【项目原文召回】\n${projectSources
        .map(
          (item) =>
            `- [${item.source.detail}/${item.source.id}] ${item.source.label}\n${item.excerpt}`
        )
        .join("\n\n")}`
    );
  }
  const snapshot = sections.join("\n\n").slice(0, Math.max(4_000, Math.min(120_000, characterBudget)));
  return {
    memories: memoryMatches,
    projectSources,
    snapshot,
    characters: snapshot.length
  };
}
