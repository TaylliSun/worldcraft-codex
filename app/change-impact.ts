import type {
  ProjectObjectKind,
  ProjectObjectRef,
  ProjectReference,
  ProjectReferenceIndex,
  ProjectReferenceRole
} from "./project-references";
import { projectObjectRefKey } from "./project-references";

export type ChangeImpactLevel = "critical" | "high" | "normal";
export type ChangeImpactDomain = "manuscript" | "story" | "quest" | "world";

export type ChangeImpactItem = {
  key: string;
  target: ProjectObjectRef;
  label: string;
  kind: ProjectObjectKind;
  level: ChangeImpactLevel;
  domain: ChangeImpactDomain;
  depth: number;
  reason: string;
  pathLabels: string[];
  references: ProjectReference[];
};

export type ChangeImpactReport = {
  target: ProjectObjectRef;
  targetLabel: string;
  total: number;
  direct: number;
  downstream: number;
  maximumDepth: number;
  counts: Record<ChangeImpactDomain, number>;
  levels: Record<ChangeImpactLevel, number>;
  items: ChangeImpactItem[];
};

const roleLabels: Record<ProjectReferenceRole, string> = {
  association: "结构关联",
  dependency: "依赖",
  mention: "正文提及",
  speaker: "角色发言",
  template: "资料字段",
  route: "路线节点"
};

const domainByKind: Partial<Record<ProjectObjectKind, ChangeImpactDomain>> = {
  "manuscript-book": "manuscript",
  "manuscript-volume": "manuscript",
  "manuscript-chapter": "manuscript",
  "manuscript-scene": "manuscript",
  scene: "story",
  milestone: "story",
  "story-variable": "story",
  "review-issue": "story",
  quest: "quest"
};

const baseLevelByKind: Partial<Record<ProjectObjectKind, ChangeImpactLevel>> = {
  "manuscript-chapter": "critical",
  "manuscript-scene": "critical",
  scene: "critical",
  quest: "high",
  milestone: "high",
  "story-variable": "high",
  "review-issue": "high",
  entity: "high"
};

const levelOrder: Record<ChangeImpactLevel, number> = {
  critical: 0,
  high: 1,
  normal: 2
};

function impactDomain(kind: ProjectObjectKind): ChangeImpactDomain {
  return domainByKind[kind] ?? "world";
}

function impactLevel(kind: ProjectObjectKind, depth: number): ChangeImpactLevel {
  const base = baseLevelByKind[kind] ?? "normal";
  if (depth <= 1) return base;
  if (base === "critical") return "high";
  return "normal";
}

function impactReason(reference: ProjectReference, count: number) {
  const location = reference.anchor.field || reference.anchor.path;
  const base = `${roleLabels[reference.role]}${location ? ` · ${location}` : ""}`;
  return count > 1 ? `${base}等 ${count} 处` : base;
}

export function buildChangeImpactReport(
  index: ProjectReferenceIndex,
  target: ProjectObjectRef,
  targetLabel: string,
  maximumDepth = 3
): ChangeImpactReport {
  const depthLimit = Math.max(1, Math.min(6, Math.floor(maximumDepth) || 1));
  const incoming = new Map<string, ProjectReference[]>();
  for (const reference of index.references) {
    const key = projectObjectRefKey(reference.target);
    incoming.set(key, [...(incoming.get(key) ?? []), reference]);
  }

  const rootKey = projectObjectRefKey(target);
  const visited = new Set([rootKey]);
  let frontier = [{ target, label: targetLabel, pathLabels: [targetLabel] }];
  const items: ChangeImpactItem[] = [];

  for (let depth = 1; depth <= depthLimit && frontier.length; depth += 1) {
    const nextFrontier: typeof frontier = [];
    const levelItems = new Map<string, ChangeImpactItem>();
    for (const node of frontier) {
      for (const reference of incoming.get(projectObjectRefKey(node.target)) ?? []) {
        const sourceKey = projectObjectRefKey(reference.source);
        const existing = levelItems.get(sourceKey);
        if (existing) {
          if (!existing.references.some((item) => item.id === reference.id)) {
            existing.references.push(reference);
            existing.reason = impactReason(existing.references[0], existing.references.length);
          }
          continue;
        }
        if (visited.has(sourceKey)) continue;
        const pathLabels = [...node.pathLabels, reference.sourceLabel];
        const item: ChangeImpactItem = {
          key: sourceKey,
          target: reference.source,
          label: reference.sourceLabel,
          kind: reference.source.kind,
          level: impactLevel(reference.source.kind, depth),
          domain: impactDomain(reference.source.kind),
          depth,
          reason: impactReason(reference, 1),
          pathLabels,
          references: [reference]
        };
        levelItems.set(sourceKey, item);
        visited.add(sourceKey);
        nextFrontier.push({
          target: reference.source,
          label: reference.sourceLabel,
          pathLabels
        });
      }
    }
    items.push(...levelItems.values());
    frontier = nextFrontier;
  }

  items.sort(
    (left, right) =>
      levelOrder[left.level] - levelOrder[right.level] ||
      left.depth - right.depth ||
      left.label.localeCompare(right.label, "zh-CN")
  );
  const counts: ChangeImpactReport["counts"] = {
    manuscript: 0,
    story: 0,
    quest: 0,
    world: 0
  };
  const levels: ChangeImpactReport["levels"] = { critical: 0, high: 0, normal: 0 };
  for (const item of items) {
    counts[item.domain] += 1;
    levels[item.level] += 1;
  }

  return {
    target,
    targetLabel,
    total: items.length,
    direct: items.filter((item) => item.depth === 1).length,
    downstream: items.filter((item) => item.depth > 1).length,
    maximumDepth: items.reduce((maximum, item) => Math.max(maximum, item.depth), 0),
    counts,
    levels,
    items
  };
}
