"use client";

import {
  Flag,
  GitBranch,
  MapPin,
  Route,
  Sparkles,
  UserRound,
  UsersRound,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDialogFocus } from "./useDialogFocus";

export type QuestVisualCategory = "main" | "side" | "character";

export type QuestVisualStep = {
  id: string;
  title: string;
  objective: string;
  condition: string;
  branch: string;
  failure: string;
  reward: string;
};

export type QuestVisualQuest = {
  id: string;
  title: string;
  category: QuestVisualCategory;
  status: string;
  summary: string;
  trigger: string;
  prerequisiteQuestIds: string[];
  participantIds: string[];
  steps: QuestVisualStep[];
};

export type QuestParticipationRow = {
  entity: {
    id: string;
    title: string;
    type: "character" | "location";
    summary: string;
  };
  quests: Array<{
    id: string;
    title: string;
    category: QuestVisualCategory;
  }>;
};

const categoryMeta: Record<
  QuestVisualCategory,
  { label: string; shortLabel: string }
> = {
  main: { label: "主线任务", shortLabel: "主线" },
  side: { label: "支线任务", shortLabel: "支线" },
  character: { label: "角色任务", shortLabel: "角色" }
};

export function QuestVisualFullscreen({
  children,
  onClose,
  subtitle,
  title
}: {
  children: ReactNode;
  onClose: () => void;
  subtitle: string;
  title: string;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useDialogFocus({
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
    onClose,
    open: true
  });

  useEffect(() => {
    document.body.classList.add("quest-visual-fullscreen-open");
    return () => document.body.classList.remove("quest-visual-fullscreen-open");
  }, []);

  return createPortal(
    <div
      className="quest-visual-fullscreen-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        aria-modal="true"
        aria-labelledby="quest-visual-fullscreen-title"
        className="quest-visual-fullscreen"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header>
          <div>
            <h2 id="quest-visual-fullscreen-title">{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button
            aria-label="退出全屏查看"
            className="icon-button"
            ref={closeButtonRef}
            title="退出全屏查看"
            type="button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        <div className="quest-visual-fullscreen-content">{children}</div>
      </section>
    </div>,
    document.body
  );
}

function getQuestDepth(
  quest: QuestVisualQuest,
  questsById: Map<string, QuestVisualQuest>,
  memo: Map<string, number>,
  visiting: Set<string>,
  cycleIds: Set<string>
): number {
  const memoized = memo.get(quest.id);
  if (memoized !== undefined) {
    return memoized;
  }

  if (visiting.has(quest.id)) {
    cycleIds.add(quest.id);
    return 0;
  }

  visiting.add(quest.id);
  const prerequisiteDepths = quest.prerequisiteQuestIds
    .map((id) => questsById.get(id))
    .filter((item): item is QuestVisualQuest => Boolean(item))
    .map((item) => getQuestDepth(item, questsById, memo, visiting, cycleIds));
  visiting.delete(quest.id);

  const depth = prerequisiteDepths.length ? Math.max(...prerequisiteDepths) + 1 : 0;
  memo.set(quest.id, depth);
  return depth;
}

export function QuestDependencyGraph({
  entitiesById,
  onSelectQuest,
  quests,
  selectedQuestId
}: {
  entitiesById: Record<string, string>;
  onSelectQuest: (questId: string) => void;
  quests: QuestVisualQuest[];
  selectedQuestId: string;
}) {
  const graph = useMemo(() => {
    const questsById = new Map(quests.map((quest) => [quest.id, quest]));
    const depthMemo = new Map<string, number>();
    const cycleIds = new Set<string>();
    const columns = new Map<number, QuestVisualQuest[]>();

    quests.forEach((quest) => {
      const depth = getQuestDepth(quest, questsById, depthMemo, new Set(), cycleIds);
      columns.set(depth, [...(columns.get(depth) ?? []), quest]);
    });

    const nodeWidth = 228;
    const nodeHeight = 126;
    const gapX = 92;
    const gapY = 34;
    const padding = 26;
    const positions = new Map<string, { x: number; y: number }>();

    Array.from(columns.entries())
      .sort(([left], [right]) => left - right)
      .forEach(([depth, column]) => {
        column
          .sort((left, right) => left.category.localeCompare(right.category) || left.title.localeCompare(right.title, "zh-CN"))
          .forEach((quest, index) => {
            positions.set(quest.id, {
              x: padding + depth * (nodeWidth + gapX),
              y: padding + index * (nodeHeight + gapY)
            });
          });
      });

    const maxDepth = Math.max(0, ...Array.from(depthMemo.values()));
    const maxRows = Math.max(1, ...Array.from(columns.values()).map((column) => column.length));
    return {
      cycleIds,
      height: padding * 2 + maxRows * nodeHeight + Math.max(0, maxRows - 1) * gapY,
      nodeHeight,
      nodeWidth,
      positions,
      width: padding * 2 + (maxDepth + 1) * nodeWidth + maxDepth * gapX
    };
  }, [quests]);

  if (!quests.length) {
    return (
      <div className="quest-visual-empty">
        <GitBranch size={30} />
        <strong>还没有可绘制的任务</strong>
      </div>
    );
  }

  return (
    <div className="dependency-scroll">
      <div
        className="dependency-canvas"
        style={{ height: graph.height, minWidth: graph.width }}
      >
        <svg
          aria-hidden="true"
          className="dependency-lines"
          height={graph.height}
          viewBox={`0 0 ${graph.width} ${graph.height}`}
          width={graph.width}
        >
          <defs>
            <marker
              id="quest-arrow"
              markerHeight="8"
              markerWidth="8"
              orient="auto-start-reverse"
              refX="7"
              refY="4"
            >
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#8fa49a" />
            </marker>
          </defs>
          {quests.flatMap((quest) =>
            quest.prerequisiteQuestIds.map((prerequisiteId) => {
              const from = graph.positions.get(prerequisiteId);
              const to = graph.positions.get(quest.id);
              if (!from || !to) {
                return null;
              }

              const startX = from.x + graph.nodeWidth;
              const startY = from.y + graph.nodeHeight / 2;
              const endX = to.x;
              const endY = to.y + graph.nodeHeight / 2;
              const bend = Math.max(34, (endX - startX) / 2);
              return (
                <path
                  className="dependency-path"
                  d={`M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`}
                  key={`${prerequisiteId}-${quest.id}`}
                  markerEnd="url(#quest-arrow)"
                />
              );
            })
          )}
        </svg>

        {quests.map((quest) => {
          const position = graph.positions.get(quest.id);
          if (!position) {
            return null;
          }

          const participantNames = quest.participantIds
            .map((id) => entitiesById[id])
            .filter(Boolean)
            .slice(0, 2);
          return (
            <button
              className={`dependency-node category-${quest.category} ${
                quest.id === selectedQuestId ? "is-selected" : ""
              } ${graph.cycleIds.has(quest.id) ? "has-cycle" : ""}`}
              key={quest.id}
              style={{
                height: graph.nodeHeight,
                left: position.x,
                top: position.y,
                width: graph.nodeWidth
              }}
              type="button"
              onClick={() => onSelectQuest(quest.id)}
            >
              <span className="dependency-node-meta">
                <span>{categoryMeta[quest.category].label}</span>
                <small>{quest.status}</small>
              </span>
              <strong>{quest.title}</strong>
              <span className="dependency-node-stats">
                {quest.steps.length} 步 · {quest.prerequisiteQuestIds.length} 个前置
              </span>
              <span className="dependency-node-people">
                <UsersRound size={13} />
                {participantNames.length ? participantNames.join("、") : "暂无参与条目"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function QuestBranchTree({ quest }: { quest: QuestVisualQuest }) {
  return (
    <div className="branch-tree">
      <div className="branch-root">
        <span>触发</span>
        <strong>{quest.trigger || "未设置触发条件"}</strong>
      </div>

      {quest.steps.map((step, index) => (
        <div className="branch-stage" key={step.id}>
          <div className="branch-trunk" />
          <div className="branch-stage-grid">
            <div className="branch-outcome branch-optional">
              <span>剧情分支</span>
              <p>{step.branch || "未设置可选分支"}</p>
            </div>
            <div className="branch-main-node">
              <span>步骤 {index + 1}</span>
              <strong>{step.title || `步骤 ${index + 1}`}</strong>
              <p>{step.objective || "未设置任务目标"}</p>
              <small>条件：{step.condition || "无"}</small>
              <small>奖励：{step.reward || "无"}</small>
            </div>
            <div className="branch-outcome branch-failure">
              <span>失败走向</span>
              <p>{step.failure || "未设置失败分支"}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="branch-trunk" />
      <div className="branch-end">
        <Flag size={16} />
        <strong>任务收束</strong>
      </div>
    </div>
  );
}

export function QuestParticipationBoard({
  onOpenEntity,
  onSelectQuest,
  rows
}: {
  onOpenEntity: (entityId: string) => void;
  onSelectQuest: (questId: string) => void;
  rows: QuestParticipationRow[];
}) {
  const [filter, setFilter] = useState<"all" | "character" | "location">("all");
  const filteredRows = rows.filter((row) => filter === "all" || row.entity.type === filter);

  return (
    <div className="participation-board">
      <div className="participation-toolbar" role="group" aria-label="参与条目类型">
        <button
          className={filter === "all" ? "is-active" : ""}
          type="button"
          onClick={() => setFilter("all")}
        >
          全部
        </button>
        <button
          className={filter === "character" ? "is-active" : ""}
          type="button"
          onClick={() => setFilter("character")}
        >
          <UserRound size={15} />
          角色
        </button>
        <button
          className={filter === "location" ? "is-active" : ""}
          type="button"
          onClick={() => setFilter("location")}
        >
          <MapPin size={15} />
          地点
        </button>
      </div>

      <div className="participation-list">
        {filteredRows.map((row) => {
          const Icon = row.entity.type === "character" ? UserRound : MapPin;
          return (
            <div className="participation-row" key={row.entity.id}>
              <button
                className="participation-entity"
                type="button"
                onClick={() => onOpenEntity(row.entity.id)}
              >
                <span className={`participation-icon type-${row.entity.type}`}>
                  <Icon size={18} />
                </span>
                <span>
                  <strong>{row.entity.title}</strong>
                  <small>{row.entity.summary}</small>
                </span>
              </button>
              <div className="participation-count">
                <strong>{row.quests.length}</strong>
                <span>条任务</span>
              </div>
              <div className="participation-quests">
                {row.quests.length ? (
                  row.quests.map((quest) => (
                    <button
                      className={`category-${quest.category}`}
                      key={quest.id}
                      type="button"
                      onClick={() => onSelectQuest(quest.id)}
                    >
                      <Route size={14} />
                      <span>{quest.title}</span>
                      <small>{categoryMeta[quest.category].shortLabel}</small>
                    </button>
                  ))
                ) : (
                  <span className="participation-none">
                    <Sparkles size={14} />
                    尚未参与任务
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
