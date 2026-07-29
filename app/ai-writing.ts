export type AiMemoryCategory = "canon" | "character" | "plot" | "rule" | "open-loop";
export type AiMemoryState = "draft" | "confirmed" | "superseded";
export type AiMemorySourceKind = "manual" | "project" | "ai-draft" | "imported";
export type AiMemoryRelationKind =
  | "supports"
  | "contradicts"
  | "depends-on"
  | "supersedes"
  | "related";
export type AiWritingRoundKind = "plan" | "draft" | "review" | "checkpoint";

export type AiMemoryFact = {
  subject: string;
  property: string;
  value: string;
  temporalScope: string;
};

export type AiMemorySource = {
  id: string;
  kind: AiMemorySourceKind;
  contextId: string;
  contextLabel: string;
  writingSessionId: string;
  excerpt: string;
  capturedAt: string;
};

export type AiMemoryRelation = {
  id: string;
  kind: AiMemoryRelationKind;
  targetMemoryId: string;
  note: string;
  createdAt: string;
};

export type AiMemoryItem = {
  id: string;
  worldId: string;
  category: AiMemoryCategory;
  state: AiMemoryState;
  title: string;
  content: string;
  sourceContextId: string;
  fact: AiMemoryFact;
  sources: AiMemorySource[];
  relations: AiMemoryRelation[];
  tags: string[];
  ignoredConflictIds: string[];
  excludedContextIds: string[];
  pinned: boolean;
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type AiMemoryConflict = {
  id: string;
  kind: "fact-value" | "declared";
  severity: "important" | "normal";
  leftMemoryId: string;
  rightMemoryId: string;
  summary: string;
  factKey: string;
};

export type AiMemoryRetrieval = {
  memory: AiMemoryItem;
  score: number;
  semanticSimilarity: number;
  authority: "pinned" | "confirmed" | "draft";
  sourceLabel: string;
  reasons: string[];
};

export type AiEditSuggestion = {
  id: string;
  quote: string;
  replacement: string;
  reason: string;
  severity: "important" | "normal";
  status: "open" | "applied" | "dismissed";
};

export type AiWritingRound = {
  id: string;
  kind: AiWritingRoundKind;
  model: string;
  content: string;
  memorySnapshot: string;
  createdAt: string;
};

export type AiInlineEditRecord = {
  fieldPath: string;
  fieldLabel: string;
  action: string;
  instruction: string;
  selectionStart: number;
  selectionEnd: number;
  baseText: string;
  resultText: string;
  appliedText: string;
  storedBaseText: string;
  storedAppliedText: string;
  consistencyBeforeCount: number;
  consistencyAfterCount: number;
  introducedConsistencyIssues: Array<{
    fingerprint: string;
    severity: "critical" | "major";
    title: string;
    detail: string;
    suggestion: string;
  }>;
  sourceContextIds: string[];
  memoryIds: string[];
  newCreation: boolean;
  status: "draft" | "applied" | "reverted";
  appliedAt: string;
  revertedAt: string;
};

export type AiWritingSession = {
  id: string;
  worldId: string;
  title: string;
  targetContextId: string;
  goal: string;
  style: string;
  constraints: string;
  outline: string;
  draft: string;
  reviewSummary: string;
  status: "planning" | "drafting" | "reviewed";
  rounds: AiWritingRound[];
  suggestions: AiEditSuggestion[];
  semanticRecallEnabled: boolean;
  inlineEdit?: AiInlineEditRecord;
  createdAt: string;
  updatedAt: string;
};

export type AiReviewPayload = {
  summary: string;
  suggestions: Omit<AiEditSuggestion, "id" | "status">[];
  memories: Array<{
    category: AiMemoryCategory;
    title: string;
    content: string;
    subject: string;
    property: string;
    value: string;
    temporalScope: string;
    sourceQuote: string;
    tags: string[];
  }>;
};

const memoryCategories = new Set<AiMemoryCategory>([
  "canon",
  "character",
  "plot",
  "rule",
  "open-loop"
]);
const memorySourceKinds = new Set<AiMemorySourceKind>([
  "manual",
  "project",
  "ai-draft",
  "imported"
]);
const memoryRelationKinds = new Set<AiMemoryRelationKind>([
  "supports",
  "contradicts",
  "depends-on",
  "supersedes",
  "related"
]);

function timestamp() {
  return new Date().toISOString();
}

export function createAiWritingId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createAiWritingSession(
  worldId: string,
  targetContextId: string,
  title = "新剧情写作"
): AiWritingSession {
  const now = timestamp();
  return {
    id: createAiWritingId("ai-writing"),
    worldId,
    title,
    targetContextId,
    goal: "",
    style: "游戏叙事文档，清晰、具体、保持既有设定",
    constraints: "不改写已确认设定；缺少信息时保留待确认项",
    outline: "",
    draft: "",
    reviewSummary: "",
    status: "planning",
    rounds: [],
    suggestions: [],
    semanticRecallEnabled: true,
    createdAt: now,
    updatedAt: now
  };
}

export function normalizeAiMemoryItem(
  input: Partial<AiMemoryItem>,
  worldId: string,
  index = 0
): AiMemoryItem {
  const now = timestamp();
  const id = String(input.id || `ai-memory-${worldId}-${index + 1}`);
  const sourceContextId = String(input.sourceContextId || "").slice(0, 300);
  const createdAt = input.createdAt || now;
  const factInput = input.fact || ({} as Partial<AiMemoryFact>);
  const sources = Array.isArray(input.sources)
    ? input.sources.slice(0, 20).map((source, sourceIndex) => ({
        id: String(source.id || `ai-source-${id}-${sourceIndex + 1}`).slice(0, 300),
        kind: memorySourceKinds.has(source.kind as AiMemorySourceKind)
          ? (source.kind as AiMemorySourceKind)
          : "imported",
        contextId: String(source.contextId || sourceContextId).slice(0, 300),
        contextLabel: String(source.contextLabel || "项目来源").trim().slice(0, 300),
        writingSessionId: String(source.writingSessionId || "").slice(0, 300),
        excerpt: String(source.excerpt || "").trim().slice(0, 4000),
        capturedAt: source.capturedAt || createdAt
      }))
    : sourceContextId
      ? [{
          id: `ai-source-${id}-legacy`,
          kind: "imported" as const,
          contextId: sourceContextId,
          contextLabel: "旧版项目来源",
          writingSessionId: "",
          excerpt: "",
          capturedAt: createdAt
        }]
      : [];
  return {
    id,
    worldId,
    category: memoryCategories.has(input.category as AiMemoryCategory)
      ? (input.category as AiMemoryCategory)
      : "canon",
    state: ["confirmed", "superseded"].includes(input.state || "")
      ? (input.state as AiMemoryState)
      : "draft",
    title: String(input.title || `未命名记忆 ${index + 1}`).trim().slice(0, 200),
    content: String(input.content || "").trim().slice(0, 12000),
    sourceContextId,
    fact: {
      subject: String(factInput.subject || "").trim().slice(0, 300),
      property: String(factInput.property || "").trim().slice(0, 200),
      value: String(factInput.value || "").trim().slice(0, 2000),
      temporalScope: String(factInput.temporalScope || "").trim().slice(0, 300)
    },
    sources,
    relations: Array.isArray(input.relations)
      ? input.relations.slice(0, 60).map((relation, relationIndex) => ({
          id: String(relation.id || `ai-relation-${id}-${relationIndex + 1}`).slice(0, 300),
          kind: memoryRelationKinds.has(relation.kind as AiMemoryRelationKind)
            ? (relation.kind as AiMemoryRelationKind)
            : "related",
          targetMemoryId: String(relation.targetMemoryId || "").slice(0, 300),
          note: String(relation.note || "").trim().slice(0, 1000),
          createdAt: relation.createdAt || createdAt
        })).filter((relation) => relation.targetMemoryId && relation.targetMemoryId !== id)
      : [],
    tags: Array.isArray(input.tags)
      ? Array.from(new Set(input.tags.map((tag) => String(tag).trim().slice(0, 80)).filter(Boolean))).slice(0, 30)
      : [],
    ignoredConflictIds: Array.isArray(input.ignoredConflictIds)
      ? Array.from(new Set(input.ignoredConflictIds.map(String))).slice(0, 200)
      : [],
    excludedContextIds: Array.isArray(input.excludedContextIds)
      ? Array.from(new Set(input.excludedContextIds.map(String).filter(Boolean))).slice(0, 200)
      : [],
    pinned: input.pinned === true,
    lastVerifiedAt: String(input.lastVerifiedAt || "").slice(0, 40),
    createdAt,
    updatedAt: input.updatedAt || now
  };
}

export function normalizeAiWritingSession(
  input: Partial<AiWritingSession>,
  worldId: string,
  index = 0
): AiWritingSession {
  const fallback = createAiWritingSession(
    worldId,
    String(input.targetContextId || `world:${worldId}`),
    String(input.title || `写作会话 ${index + 1}`)
  );
  return {
    ...fallback,
    ...input,
    id: String(input.id || `ai-writing-${worldId}-${index + 1}`),
    worldId,
    title: String(input.title || fallback.title).trim().slice(0, 200),
    targetContextId: String(input.targetContextId || fallback.targetContextId).slice(0, 300),
    goal: String(input.goal || "").slice(0, 12000),
    style: String(input.style || fallback.style).slice(0, 4000),
    constraints: String(input.constraints || fallback.constraints).slice(0, 8000),
    outline: String(input.outline || "").slice(0, 120000),
    draft: String(input.draft || "").slice(0, 240000),
    reviewSummary: String(input.reviewSummary || "").slice(0, 24000),
    status: ["planning", "drafting", "reviewed"].includes(input.status || "")
      ? (input.status as AiWritingSession["status"])
      : "planning",
    rounds: Array.isArray(input.rounds)
      ? input.rounds.slice(-40).map((round, roundIndex) => ({
          id: String(round.id || `ai-round-${roundIndex + 1}`),
          kind: ["plan", "draft", "review", "checkpoint"].includes(round.kind)
            ? round.kind
            : "checkpoint",
          model: String(round.model || "manual").slice(0, 200),
          content: String(round.content || "").slice(0, 240000),
          memorySnapshot: String(round.memorySnapshot || "").slice(0, 64000),
          createdAt: round.createdAt || timestamp()
        }))
      : [],
    suggestions: Array.isArray(input.suggestions)
      ? input.suggestions.slice(0, 100).map((suggestion, suggestionIndex) => ({
          id: String(suggestion.id || `ai-suggestion-${suggestionIndex + 1}`),
          quote: String(suggestion.quote || "").slice(0, 4000),
          replacement: String(suggestion.replacement || "").slice(0, 8000),
          reason: String(suggestion.reason || "").slice(0, 2000),
          severity: suggestion.severity === "important" ? "important" : "normal",
          status: ["open", "applied", "dismissed"].includes(suggestion.status)
            ? suggestion.status
            : "open"
        }))
      : [],
    semanticRecallEnabled: input.semanticRecallEnabled !== false,
    inlineEdit: input.inlineEdit
      ? {
          fieldPath: String(input.inlineEdit.fieldPath || "").slice(0, 500),
          fieldLabel: String(input.inlineEdit.fieldLabel || "").slice(0, 300),
          action: String(input.inlineEdit.action || "rewrite").slice(0, 80),
          instruction: String(input.inlineEdit.instruction || "").slice(0, 4000),
          selectionStart: Math.max(0, Number(input.inlineEdit.selectionStart) || 0),
          selectionEnd: Math.max(0, Number(input.inlineEdit.selectionEnd) || 0),
          baseText: String(input.inlineEdit.baseText || "").slice(0, 240000),
          resultText: String(input.inlineEdit.resultText || "").slice(0, 240000),
          appliedText: String(input.inlineEdit.appliedText || "").slice(0, 240000),
          storedBaseText: String(
            input.inlineEdit.storedBaseText ?? input.inlineEdit.baseText ?? ""
          ).slice(0, 480000),
          storedAppliedText: String(
            input.inlineEdit.storedAppliedText ?? input.inlineEdit.appliedText ?? ""
          ).slice(0, 480000),
          consistencyBeforeCount: Math.max(
            0,
            Number(input.inlineEdit.consistencyBeforeCount) || 0
          ),
          consistencyAfterCount: Math.max(
            0,
            Number(input.inlineEdit.consistencyAfterCount) || 0
          ),
          introducedConsistencyIssues: Array.isArray(input.inlineEdit.introducedConsistencyIssues)
            ? input.inlineEdit.introducedConsistencyIssues.slice(0, 30).map((issue) => ({
                fingerprint: String(issue.fingerprint || "").slice(0, 500),
                severity: issue.severity === "critical" ? ("critical" as const) : ("major" as const),
                title: String(issue.title || "").slice(0, 500),
                detail: String(issue.detail || "").slice(0, 4000),
                suggestion: String(issue.suggestion || "").slice(0, 4000)
              })).filter((issue) => issue.fingerprint && issue.title)
            : [],
          sourceContextIds: Array.isArray(input.inlineEdit.sourceContextIds)
            ? Array.from(new Set(input.inlineEdit.sourceContextIds.map(String))).slice(0, 60)
            : [],
          memoryIds: Array.isArray(input.inlineEdit.memoryIds)
            ? Array.from(new Set(input.inlineEdit.memoryIds.map(String))).slice(0, 60)
            : [],
          newCreation: input.inlineEdit.newCreation === true,
          status: ["draft", "applied", "reverted"].includes(input.inlineEdit.status)
            ? input.inlineEdit.status
            : "draft",
          appliedAt: String(input.inlineEdit.appliedAt || "").slice(0, 40),
          revertedAt: String(input.inlineEdit.revertedAt || "").slice(0, 40)
        }
      : undefined,
    createdAt: input.createdAt || fallback.createdAt,
    updatedAt: input.updatedAt || fallback.updatedAt
  };
}

function searchTokens(value: string) {
  const normalized = value.normalize("NFKC").toLocaleLowerCase("zh-CN");
  const tokens = new Set(normalized.match(/[a-z0-9_-]{2,}|[\u3400-\u9fff]{2,}/g) ?? []);
  for (const sequence of normalized.match(/[\u3400-\u9fff]+/g) ?? []) {
    for (let index = 0; index + 2 <= sequence.length; index += 1) {
      tokens.add(sequence.slice(index, index + 2));
    }
  }
  return tokens;
}

const semanticConcepts = [
  ["死亡", "死去", "去世", "牺牲", "阵亡"],
  ["位置", "地点", "位于", "身处", "前往", "抵达"],
  ["目标", "目的", "动机", "希望", "想要", "寻找"],
  ["敌人", "敌对", "仇敌", "对手", "冲突"],
  ["亲属", "家人", "哥哥", "兄长", "妹妹", "父亲", "母亲"],
  ["秘密", "隐瞒", "真相", "谜团", "线索", "伏笔"],
  ["持有", "拥有", "所有", "归属", "物品"],
  ["知道", "知情", "发现", "得知", "了解"],
  ["规则", "禁止", "必须", "不能", "约束"],
  ["时间", "之前", "之后", "过去", "未来", "现在"]
] as const;

function semanticFeatures(value: string) {
  const normalized = value.normalize("NFKC").toLocaleLowerCase("zh-CN");
  const features = new Map<string, number>();
  searchTokens(normalized).forEach((token) => features.set(`token:${token}`, 1));
  semanticConcepts.forEach((aliases, index) => {
    if (aliases.some((alias) => normalized.includes(alias))) {
      features.set(`concept:${index}`, 2.5);
    }
  });
  for (const sequence of normalized.match(/[\u3400-\u9fff]{3,}/g) ?? []) {
    for (let index = 0; index + 3 <= sequence.length; index += 1) {
      const feature = `tri:${sequence.slice(index, index + 3)}`;
      features.set(feature, .45);
    }
  }
  return features;
}

function semanticCosine(left: Map<string, number>, right: Map<string, number>) {
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

export function rankAiMemories(
  query: string,
  memories: AiMemoryItem[],
  targetContextId: string,
  limit = 12
) {
  return rankAiMemoryMatches(query, memories, targetContextId, limit).map((item) => item.memory);
}

export function rankAiMemoryMatches(
  query: string,
  memories: AiMemoryItem[],
  targetContextId: string,
  limit = 12,
  options: { semantic?: boolean } = {}
): AiMemoryRetrieval[] {
  const tokens = searchTokens(query);
  const querySemanticFeatures = options.semantic === false ? new Map<string, number>() : semanticFeatures(query);
  return memories
    .filter((memory) =>
      memory.state !== "superseded" &&
      !memory.excludedContextIds.includes(targetContextId)
    )
    .map((memory) => {
      const haystack = `${memory.title}\n${memory.content}\n${memory.fact.subject}\n${memory.fact.property}\n${memory.fact.value}\n${memory.fact.temporalScope}\n${memory.tags.join(" ")}`.normalize("NFKC").toLocaleLowerCase("zh-CN");
      let score = memory.pinned ? 80 : 0;
      const reasons: string[] = [];
      const authority = memory.pinned
        ? "pinned" as const
        : memory.state === "confirmed"
          ? "confirmed" as const
          : "draft" as const;
      const contextualSource = memory.sources.find((source) => source.contextId === targetContextId);
      const sourceLabel = contextualSource?.contextLabel || memory.sources[0]?.contextLabel || "作者记忆库";
      if (memory.pinned) reasons.push("作者置顶");
      if (memory.state === "confirmed") {
        score += 30;
        reasons.push("作者确认");
      }
      if (
        memory.sourceContextId === targetContextId ||
        memory.sources.some((source) => source.contextId === targetContextId)
      ) {
        score += 45;
        reasons.push("同一项目目标");
      }
      let tokenHits = 0;
      for (const token of tokens) {
        if (!haystack.includes(token)) continue;
        score += token.length > 2 ? 5 : 2;
        tokenHits += 1;
      }
      if (tokenHits) reasons.push(`内容匹配 ${tokenHits} 项`);
      if (memory.fact.subject && tokens.has(memory.fact.subject.toLocaleLowerCase("zh-CN"))) {
        score += 12;
        reasons.push("事实主体匹配");
      }
      const semanticSimilarity = options.semantic === false
        ? 0
        : semanticCosine(querySemanticFeatures, semanticFeatures(haystack));
      if (semanticSimilarity >= .08) {
        const semanticPercent = Math.round(semanticSimilarity * 100);
        score += Math.round(semanticSimilarity * 50);
        reasons.push(`语义相近 ${semanticPercent}%`);
      }
      return { memory, score, semanticSimilarity, authority, sourceLabel, reasons };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || right.memory.updatedAt.localeCompare(left.memory.updatedAt))
    .slice(0, Math.max(1, Math.min(30, limit)));
}

export function buildMemorySnapshot(memories: AiMemoryItem[]) {
  return memories
    .filter((memory) => memory.state !== "superseded")
    .map(
      (memory) => {
        const fact = memory.fact.subject && memory.fact.property && memory.fact.value
          ? `\n  结构化事实：${memory.fact.subject} · ${memory.fact.property} = ${memory.fact.value}${memory.fact.temporalScope ? `（${memory.fact.temporalScope}）` : ""}`
          : "";
        const source = memory.sources.find((item) => item.excerpt) || memory.sources[0];
        const sourceText = source
          ? `\n  来源：${source.contextLabel || source.contextId}${source.excerpt ? `「${source.excerpt.slice(0, 500)}」` : ""}`
          : "";
        return `- [${memory.state === "confirmed" ? "作者确认" : "草稿记忆"}/${memory.category}${memory.pinned ? "/置顶" : ""}] ${memory.title}：${memory.content}${fact}${sourceText}`;
      }
    )
    .join("\n")
    .slice(0, 60000);
}

export function parseAiReviewPayload(value: string, draft: string): AiReviewPayload {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || value.slice(value.indexOf("{"), value.lastIndexOf("}") + 1);
  try {
    const parsed = JSON.parse(candidate);
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .map((item: Record<string, unknown>) => ({
            quote: String(item.quote || "").trim().slice(0, 4000),
            replacement: String(item.replacement || "").trim().slice(0, 8000),
            reason: String(item.reason || "").trim().slice(0, 2000),
            severity: item.severity === "important" ? ("important" as const) : ("normal" as const)
          }))
          .filter((item: { quote: string; replacement: string }) => item.quote && item.replacement && draft.includes(item.quote))
          .slice(0, 30)
      : [];
    const memories = Array.isArray(parsed.memories)
      ? parsed.memories
          .map((item: Record<string, unknown>) => ({
            category: memoryCategories.has(item.category as AiMemoryCategory)
              ? (item.category as AiMemoryCategory)
              : ("canon" as const),
            title: String(item.title || "").trim().slice(0, 200),
            content: String(item.content || "").trim().slice(0, 12000),
            subject: String(item.subject || "").trim().slice(0, 300),
            property: String(item.property || "").trim().slice(0, 200),
            value: String(item.value || "").trim().slice(0, 2000),
            temporalScope: String(item.temporalScope || "").trim().slice(0, 300),
            sourceQuote: draft.includes(String(item.sourceQuote || "").trim())
              ? String(item.sourceQuote || "").trim().slice(0, 4000)
              : "",
            tags: Array.isArray(item.tags)
              ? Array.from(new Set(item.tags.map((tag) => String(tag).trim().slice(0, 80)).filter(Boolean))).slice(0, 30)
              : []
          }))
          .filter((item: { title: string; content: string }) => item.title && item.content)
          .slice(0, 30)
      : [];
    return { summary: String(parsed.summary || "").trim().slice(0, 24000), suggestions, memories };
  } catch {
    return { summary: value.trim().slice(0, 24000), suggestions: [], memories: [] };
  }
}

function normalizedFactPart(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").replace(/[\s，。！？、：；,.!?;:（）()【】[\]"'“”‘’]/g, "");
}

function conflictId(kind: AiMemoryConflict["kind"], leftId: string, rightId: string) {
  const [left, right] = [leftId, rightId].sort();
  return `ai-conflict:${kind}:${left}:${right}`;
}

export function detectAiMemoryConflicts(memories: AiMemoryItem[]): AiMemoryConflict[] {
  const active = memories.filter((memory) => memory.state !== "superseded");
  const byId = new Map(active.map((memory) => [memory.id, memory]));
  const conflicts = new Map<string, AiMemoryConflict>();

  for (const memory of active) {
    for (const relation of memory.relations) {
      if (relation.kind !== "contradicts") continue;
      const target = byId.get(relation.targetMemoryId);
      if (!target) continue;
      const id = conflictId("declared", memory.id, target.id);
      if (memory.ignoredConflictIds.includes(id) || target.ignoredConflictIds.includes(id)) continue;
      conflicts.set(id, {
        id,
        kind: "declared",
        severity: memory.state === "confirmed" && target.state === "confirmed" ? "important" : "normal",
        leftMemoryId: memory.id,
        rightMemoryId: target.id,
        summary: relation.note || `“${memory.title}”与“${target.title}”被标记为互相矛盾`,
        factKey: "作者声明的矛盾关系"
      });
    }
  }

  const factGroups = new Map<string, AiMemoryItem[]>();
  for (const memory of active) {
    if (memory.category === "open-loop") continue;
    const subject = normalizedFactPart(memory.fact.subject);
    const property = normalizedFactPart(memory.fact.property);
    const temporalScope = normalizedFactPart(memory.fact.temporalScope || "持续有效");
    if (!subject || !property || !normalizedFactPart(memory.fact.value)) continue;
    const key = `${subject}|${property}|${temporalScope}`;
    factGroups.set(key, [...(factGroups.get(key) || []), memory]);
  }

  for (const group of factGroups.values()) {
    for (let leftIndex = 0; leftIndex < group.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < group.length; rightIndex += 1) {
        const left = group[leftIndex];
        const right = group[rightIndex];
        if (normalizedFactPart(left.fact.value) === normalizedFactPart(right.fact.value)) continue;
        const id = conflictId("fact-value", left.id, right.id);
        if (left.ignoredConflictIds.includes(id) || right.ignoredConflictIds.includes(id)) continue;
        conflicts.set(id, {
          id,
          kind: "fact-value",
          severity: left.state === "confirmed" && right.state === "confirmed" ? "important" : "normal",
          leftMemoryId: left.id,
          rightMemoryId: right.id,
          summary: `${left.fact.subject}的“${left.fact.property}”同时记录为“${left.fact.value}”和“${right.fact.value}”`,
          factKey: `${left.fact.subject} · ${left.fact.property}${left.fact.temporalScope ? ` · ${left.fact.temporalScope}` : ""}`
        });
      }
    }
  }

  return Array.from(conflicts.values()).sort((left, right) =>
    left.severity === right.severity ? left.summary.localeCompare(right.summary, "zh-CN") : left.severity === "important" ? -1 : 1
  );
}

export function applyAiEditSuggestion(draft: string, suggestion: AiEditSuggestion) {
  const index = draft.indexOf(suggestion.quote);
  if (index < 0) return null;
  return `${draft.slice(0, index)}${suggestion.replacement}${draft.slice(index + suggestion.quote.length)}`;
}
