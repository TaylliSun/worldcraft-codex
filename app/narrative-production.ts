export type NarrativeMilestoneStatus =
  | "planned"
  | "drafting"
  | "ready"
  | "blocked"
  | "done";

export type NarrativeMilestonePriority = "critical" | "high" | "normal" | "low";

export type NarrativeMilestone = {
  id: string;
  worldId: string;
  title: string;
  summary: string;
  act: string;
  status: NarrativeMilestoneStatus;
  priority: NarrativeMilestonePriority;
  order: number;
  targetDate: string;
  blockedReason: string;
  developerNotes: string;
  manuscriptBody: string;
  dependencyIds: string[];
  linkedQuestIds: string[];
  linkedSceneIds: string[];
  linkedEntityIds: string[];
  linkedTimelineEventIds: string[];
  linkedMapMarkerIds: string[];
  linkedReviewIssueIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type NarrativeReferenceCatalog = {
  questIds: Set<string>;
  sceneIds: Set<string>;
  entityIds: Set<string>;
  timelineEventIds: Set<string>;
  mapMarkerIds: Set<string>;
  reviewIssueIds: Set<string>;
};

export type NarrativeMilestoneIssue = {
  code:
    | "duplicate-id"
    | "missing-title"
    | "self-dependency"
    | "missing-dependency"
    | "dependency-cycle"
    | "broken-reference"
    | "blocked-without-reason"
    | "ready-without-content";
  severity: "error" | "warning";
  milestoneId: string;
  title: string;
  detail: string;
  missingIds?: string[];
};

export type NarrativeCoverage = {
  total: number;
  completed: number;
  blocked: number;
  completionPercent: number;
  linkedQuestCount: number;
  linkedSceneCount: number;
  unlinkedQuestIds: string[];
  unlinkedSceneIds: string[];
};

export const narrativeStatusOrder: NarrativeMilestoneStatus[] = [
  "planned",
  "drafting",
  "ready",
  "blocked",
  "done"
];

export const narrativePriorityOrder: NarrativeMilestonePriority[] = [
  "critical",
  "high",
  "normal",
  "low"
];

export const narrativeStatusLabels: Record<NarrativeMilestoneStatus, string> = {
  planned: "待规划",
  drafting: "制作中",
  ready: "待确认",
  blocked: "已阻塞",
  done: "已完成"
};

export const narrativePriorityLabels: Record<NarrativeMilestonePriority, string> = {
  critical: "关键",
  high: "高",
  normal: "普通",
  low: "低"
};

const arrayFields = [
  "dependencyIds",
  "linkedQuestIds",
  "linkedSceneIds",
  "linkedEntityIds",
  "linkedTimelineEventIds",
  "linkedMapMarkerIds",
  "linkedReviewIssueIds"
] as const;

function createMilestoneId() {
  const random = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `milestone-${random}`;
}

function uniqueStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))
  );
}

export function createNarrativeMilestone(
  worldId: string,
  index: number,
  title = "新的叙事里程碑",
  timestamp = new Date().toISOString(),
  id = createMilestoneId()
): NarrativeMilestone {
  return {
    id,
    worldId,
    title,
    summary: "",
    act: "未分幕",
    status: "planned",
    priority: "normal",
    order: Math.max(0, index),
    targetDate: "",
    blockedReason: "",
    developerNotes: "",
    manuscriptBody: "",
    dependencyIds: [],
    linkedQuestIds: [],
    linkedSceneIds: [],
    linkedEntityIds: [],
    linkedTimelineEventIds: [],
    linkedMapMarkerIds: [],
    linkedReviewIssueIds: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function normalizeNarrativeMilestone(
  input: Partial<NarrativeMilestone>,
  worldId: string,
  index: number
): NarrativeMilestone {
  const timestamp = input.updatedAt || input.createdAt || new Date().toISOString();
  const base = createNarrativeMilestone(
    worldId,
    index,
    input.title?.trim() || "未命名里程碑",
    timestamp,
    input.id || createMilestoneId()
  );
  const status = narrativeStatusOrder.includes(input.status as NarrativeMilestoneStatus)
    ? (input.status as NarrativeMilestoneStatus)
    : "planned";
  const priority = narrativePriorityOrder.includes(
    input.priority as NarrativeMilestonePriority
  )
    ? (input.priority as NarrativeMilestonePriority)
    : "normal";
  const order = Number(input.order);
  const result: NarrativeMilestone = {
    ...base,
    ...input,
    id: input.id?.trim() || base.id,
    worldId,
    title: input.title?.trim() || "未命名里程碑",
    summary: input.summary ?? "",
    act: input.act?.trim() || "未分幕",
    status,
    priority,
    order: Number.isFinite(order) ? Math.max(0, order) : Math.max(0, index),
    targetDate: input.targetDate ?? "",
    blockedReason: input.blockedReason ?? "",
    developerNotes: input.developerNotes ?? "",
    manuscriptBody: input.manuscriptBody ?? "",
    createdAt: input.createdAt || timestamp,
    updatedAt: timestamp
  };
  for (const field of arrayFields) result[field] = uniqueStrings(input[field]);
  return result;
}

export function sortNarrativeMilestones(milestones: NarrativeMilestone[]) {
  return [...milestones].sort(
    (left, right) =>
      left.order - right.order ||
      narrativePriorityOrder.indexOf(left.priority) -
        narrativePriorityOrder.indexOf(right.priority) ||
      left.title.localeCompare(right.title, "zh-CN") ||
      left.id.localeCompare(right.id)
  );
}

export function resequenceNarrativeMilestones(
  milestones: NarrativeMilestone[],
  orderedIds?: string[]
) {
  const byId = new Map(milestones.map((milestone) => [milestone.id, milestone]));
  const ordered = orderedIds?.length
    ? [
        ...orderedIds
          .map((id) => byId.get(id))
          .filter((milestone): milestone is NarrativeMilestone => Boolean(milestone)),
        ...sortNarrativeMilestones(milestones).filter(
          (milestone) => !orderedIds.includes(milestone.id)
        )
      ]
    : sortNarrativeMilestones(milestones);
  return ordered.map((milestone, index) => ({ ...milestone, order: index }));
}

export function moveNarrativeMilestone(
  milestones: NarrativeMilestone[],
  milestoneId: string,
  status: NarrativeMilestoneStatus,
  beforeId?: string
) {
  const ordered = sortNarrativeMilestones(milestones);
  const current = ordered.find((milestone) => milestone.id === milestoneId);
  if (!current) return milestones;
  const moved = { ...current, status };
  const remaining = ordered.filter((milestone) => milestone.id !== milestoneId);
  let insertionIndex = beforeId
    ? remaining.findIndex((milestone) => milestone.id === beforeId)
    : -1;
  if (insertionIndex < 0) {
    const lastStatusIndex = remaining.reduce(
      (last, milestone, index) => (milestone.status === status ? index : last),
      -1
    );
    insertionIndex = lastStatusIndex >= 0 ? lastStatusIndex + 1 : remaining.length;
  }
  remaining.splice(insertionIndex, 0, moved);
  return resequenceNarrativeMilestones(remaining, remaining.map((milestone) => milestone.id));
}

function canonicalCycle(cycle: string[]) {
  const body = cycle.slice(0, -1);
  const rotations = body.map((_, index) => [
    ...body.slice(index),
    ...body.slice(0, index)
  ]);
  rotations.sort((left, right) => left.join("\u0000").localeCompare(right.join("\u0000")));
  return [...rotations[0], rotations[0][0]];
}

export function findNarrativeDependencyCycles(milestones: NarrativeMilestone[]) {
  const byId = new Map(milestones.map((milestone) => [milestone.id, milestone]));
  const state = new Map<string, 0 | 1 | 2>();
  const stack: string[] = [];
  const cycles = new Map<string, string[]>();

  function visit(id: string) {
    state.set(id, 1);
    stack.push(id);
    for (const dependencyId of byId.get(id)?.dependencyIds ?? []) {
      if (!byId.has(dependencyId)) continue;
      if (state.get(dependencyId) === 1) {
        const start = stack.indexOf(dependencyId);
        const cycle = canonicalCycle([...stack.slice(start), dependencyId]);
        cycles.set(cycle.slice(0, -1).join("\u0000"), cycle);
      } else if (!state.get(dependencyId)) {
        visit(dependencyId);
      }
    }
    stack.pop();
    state.set(id, 2);
  }

  for (const milestone of milestones) {
    if (!state.get(milestone.id)) visit(milestone.id);
  }
  return Array.from(cycles.values());
}

export function findNarrativeCriticalPath(milestones: NarrativeMilestone[]) {
  if (!milestones.length || findNarrativeDependencyCycles(milestones).length) return [];
  const byId = new Map(milestones.map((milestone) => [milestone.id, milestone]));
  const indegree = new Map(milestones.map((milestone) => [milestone.id, 0]));
  const outgoing = new Map<string, string[]>();
  for (const milestone of milestones) {
    for (const dependencyId of milestone.dependencyIds) {
      if (!byId.has(dependencyId)) continue;
      indegree.set(milestone.id, (indegree.get(milestone.id) ?? 0) + 1);
      outgoing.set(dependencyId, [...(outgoing.get(dependencyId) ?? []), milestone.id]);
    }
  }
  const queue = sortNarrativeMilestones(
    milestones.filter((milestone) => indegree.get(milestone.id) === 0)
  ).map((milestone) => milestone.id);
  const paths = new Map(queue.map((id) => [id, [id]]));
  while (queue.length) {
    const id = queue.shift() as string;
    for (const nextId of outgoing.get(id) ?? []) {
      const candidate = [...(paths.get(id) ?? [id]), nextId];
      if (candidate.length > (paths.get(nextId)?.length ?? 0)) paths.set(nextId, candidate);
      indegree.set(nextId, (indegree.get(nextId) ?? 1) - 1);
      if (indegree.get(nextId) === 0) queue.push(nextId);
    }
  }
  return Array.from(paths.values()).sort(
    (left, right) => right.length - left.length || left.join().localeCompare(right.join())
  )[0] ?? [];
}

export function validateNarrativeMilestones(
  milestones: NarrativeMilestone[],
  references: NarrativeReferenceCatalog
) {
  const issues: NarrativeMilestoneIssue[] = [];
  const ids = new Set<string>();
  const milestoneIds = new Set(milestones.map((milestone) => milestone.id));
  const referenceFields: Array<{
    field: keyof NarrativeMilestone;
    label: string;
    validIds: Set<string>;
  }> = [
    { field: "linkedQuestIds", label: "任务", validIds: references.questIds },
    { field: "linkedSceneIds", label: "剧情场景", validIds: references.sceneIds },
    { field: "linkedEntityIds", label: "条目", validIds: references.entityIds },
    {
      field: "linkedTimelineEventIds",
      label: "时间点",
      validIds: references.timelineEventIds
    },
    { field: "linkedMapMarkerIds", label: "地图标记", validIds: references.mapMarkerIds },
    {
      field: "linkedReviewIssueIds",
      label: "审阅问题",
      validIds: references.reviewIssueIds
    }
  ];

  for (const milestone of milestones) {
    if (ids.has(milestone.id)) {
      issues.push({
        code: "duplicate-id",
        severity: "error",
        milestoneId: milestone.id,
        title: "叙事里程碑存在重复 ID",
        detail: milestone.id
      });
    }
    ids.add(milestone.id);
    if (!milestone.title.trim()) {
      issues.push({
        code: "missing-title",
        severity: "error",
        milestoneId: milestone.id,
        title: "叙事里程碑缺少标题",
        detail: milestone.act
      });
    }
    if (milestone.dependencyIds.includes(milestone.id)) {
      issues.push({
        code: "self-dependency",
        severity: "error",
        milestoneId: milestone.id,
        title: `${milestone.title}依赖了自身`,
        detail: "移除自身依赖后才能继续编排"
      });
    }
    const missingDependencies = milestone.dependencyIds.filter((id) => !milestoneIds.has(id));
    if (missingDependencies.length) {
      issues.push({
        code: "missing-dependency",
        severity: "error",
        milestoneId: milestone.id,
        title: `${milestone.title}包含失效依赖`,
        detail: missingDependencies.join("、"),
        missingIds: missingDependencies
      });
    }
    for (const reference of referenceFields) {
      const missingIds = (milestone[reference.field] as string[]).filter(
        (id) => !reference.validIds.has(id)
      );
      if (!missingIds.length) continue;
      issues.push({
        code: "broken-reference",
        severity: "error",
        milestoneId: milestone.id,
        title: `${milestone.title}包含失效${reference.label}引用`,
        detail: missingIds.join("、"),
        missingIds
      });
    }
    if (milestone.status === "blocked" && !milestone.blockedReason.trim()) {
      issues.push({
        code: "blocked-without-reason",
        severity: "warning",
        milestoneId: milestone.id,
        title: `${milestone.title}已阻塞但没有原因`,
        detail: "记录阻塞原因，便于安排下一步制作"
      });
    }
    const manuscriptText = milestone.manuscriptBody
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|\s/g, "");
    if (
      ["ready", "done"].includes(milestone.status) &&
      milestone.linkedQuestIds.length + milestone.linkedSceneIds.length === 0 &&
      !manuscriptText
    ) {
      issues.push({
        code: "ready-without-content",
        severity: "warning",
        milestoneId: milestone.id,
        title: `${milestone.title}尚未关联任务或剧情场景`,
        detail: "已确认的里程碑应至少连接一项可制作内容"
      });
    }
  }

  for (const cycle of findNarrativeDependencyCycles(milestones)) {
    issues.push({
      code: "dependency-cycle",
      severity: "error",
      milestoneId: cycle[0],
      title: "叙事里程碑存在依赖循环",
      detail: cycle.join(" → ")
    });
  }
  return issues;
}

export function getNarrativeCoverage(
  milestones: NarrativeMilestone[],
  questIds: string[],
  sceneIds: string[]
): NarrativeCoverage {
  const linkedQuestIds = new Set(milestones.flatMap((milestone) => milestone.linkedQuestIds));
  const linkedSceneIds = new Set(milestones.flatMap((milestone) => milestone.linkedSceneIds));
  const completed = milestones.filter((milestone) => milestone.status === "done").length;
  return {
    total: milestones.length,
    completed,
    blocked: milestones.filter((milestone) => milestone.status === "blocked").length,
    completionPercent: milestones.length ? Math.round((completed / milestones.length) * 100) : 0,
    linkedQuestCount: questIds.filter((id) => linkedQuestIds.has(id)).length,
    linkedSceneCount: sceneIds.filter((id) => linkedSceneIds.has(id)).length,
    unlinkedQuestIds: questIds.filter((id) => !linkedQuestIds.has(id)),
    unlinkedSceneIds: sceneIds.filter((id) => !linkedSceneIds.has(id))
  };
}
