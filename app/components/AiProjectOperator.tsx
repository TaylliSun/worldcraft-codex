"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  DatabaseBackup,
  LoaderCircle,
  Play,
  ShieldCheck,
  Undo2,
  XCircle
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  aiOperationSystemPrompt,
  aiOperationTargetLabels,
  parseAiOperationPlan,
  type AiOperationChange,
  type AiOperationContext,
  type AiOperationPlan,
  type AiOperationRun
} from "../ai-operations";

type AiResult = { ok: boolean; text?: string; model?: string; error?: string };
type OperationResult = { ok: boolean; run?: AiOperationRun; error?: string };

const actionLabels = {
  create: "新建",
  update: "更新",
  delete: "删除"
} as const;

const statusLabels: Record<AiOperationRun["status"], string> = {
  applied: "可撤销",
  undone: "已撤销",
  archived: "已归档"
};

function formatRunTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "时间未知";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function AiProjectOperator({
  canRun,
  context,
  modelName,
  runs,
  onComplete,
  onExecutePlan,
  onOpenChange,
  onUndoRun
}: {
  canRun: boolean;
  context: AiOperationContext;
  modelName: string;
  runs: AiOperationRun[];
  onComplete: (request: {
    systemPrompt: string;
    prompt: string;
    maxTokens: number;
  }) => Promise<AiResult>;
  onExecutePlan: (
    plan: AiOperationPlan,
    instruction: string,
    model: string
  ) => Promise<OperationResult>;
  onOpenChange: (change: AiOperationChange) => void;
  onUndoRun: (runId: string) => Promise<OperationResult>;
}) {
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState<"execute" | "undo" | "">("");
  const [busyRunId, setBusyRunId] = useState("");
  const [message, setMessage] = useState("");
  const recentRuns = useMemo(
    () => [...runs].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 30),
    [runs]
  );
  const moduleCounts = [
    ["项目", context.counts.worlds + context.counts.codexCategories + context.counts.entityTemplates + context.counts.assets + context.counts.members],
    ["条目", context.counts.entities],
    ["任务", context.counts.quests],
    ["剧情", context.counts.storyVariables + context.counts.storyScenes],
    ["测试", context.counts.storyTestPresets + context.counts.storyReviewIssues],
    ["关系", context.counts.relations],
    ["地图", context.counts.maps + context.counts.mapLayers + context.counts.mapMarkerGroups + context.counts.mapMarkers + context.counts.mapRoutes],
    ["制作", context.counts.narrativeMilestones],
    ["正文", context.counts.manuscriptBooks + context.counts.manuscriptVolumes + context.counts.manuscriptChapters + context.counts.manuscriptScenes],
    ["时间线", context.counts.timelineTracks + context.counts.timelineEvents]
  ] as const;

  async function executeInstruction() {
    const request = instruction.trim();
    if (!request || !canRun || busy) return;
    setBusy("execute");
    setMessage("正在理解任务并生成项目操作...");
    try {
      const completion = await onComplete({
        systemPrompt: aiOperationSystemPrompt,
        prompt: `用户目标：${request}\n\n当前 Worldcraft Codex 项目上下文：\n${context.text}`,
        maxTokens: 4096
      });
      if (!completion.ok || !completion.text) {
        setMessage(completion.error || "模型没有返回项目操作");
        return;
      }
      const parsed = parseAiOperationPlan(completion.text);
      if (!parsed.ok) {
        setMessage(parsed.error);
        return;
      }
      setMessage("正在校验、创建检查点并写入项目...");
      const executed = await onExecutePlan(
        parsed.plan,
        request,
        completion.model || modelName
      );
      if (!executed.ok) {
        setMessage(executed.error || "项目操作执行失败");
        return;
      }
      setInstruction("");
      setMessage(`已直接执行 ${executed.run?.changes.length ?? parsed.plan.operations.length} 个操作`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 项目操作失败");
    } finally {
      setBusy("");
    }
  }

  async function undoRun(runId: string) {
    if (busy) return;
    setBusy("undo");
    setBusyRunId(runId);
    setMessage("正在校验并撤销这次操作...");
    try {
      const result = await onUndoRun(runId);
      setMessage(result.ok ? "这次 AI 操作已完整撤销" : result.error || "撤销失败");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "撤销失败");
    } finally {
      setBusy("");
      setBusyRunId("");
    }
  }

  return (
    <div className="ai-operator-layout">
      <main className="ai-operator-command">
        <div className="ai-operator-status" aria-label="AI 项目操作保护状态">
          <span><ShieldCheck size={15} />自动执行已开启</span>
          <span><DatabaseBackup size={15} />执行前检查点</span>
          <span><Undo2 size={15} />完整撤销</span>
        </div>

        <label className="ai-operator-input">
          <span>项目任务</span>
          <textarea
            aria-label="AI 项目任务"
            placeholder="例如：新建调查分类、角色、任务、地图路线与第一卷正文结构，并把黑塔线索写进第一章摘要。"
            rows={7}
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
          />
        </label>

        <div className="ai-operator-submit-row">
          <div className="ai-operator-context-counts" aria-label="AI 已读取的项目对象">
            {moduleCounts.map(([label, count]) => (
              <span key={label}><strong>{count}</strong>{label}</span>
            ))}
          </div>
          <button
            className="ai-operator-run"
            disabled={!canRun || !instruction.trim() || Boolean(busy)}
            type="button"
            onClick={() => void executeInstruction()}
          >
            {busy === "execute" ? <LoaderCircle className="is-spinning" size={17} /> : <Play size={17} />}
            <span>执行项目任务</span>
          </button>
        </div>
        <div className="ai-operator-context-note">
          <ShieldCheck size={14} />
          <span>{context.characters.toLocaleString("zh-CN")} 字符上下文，不包含秘密模板字段、本地资源路径、成员账号或制作备注</span>
        </div>
        {message ? <div className="ai-operator-message" role="status">{message}</div> : null}
      </main>

      <aside className="ai-operator-history">
        <header>
          <div>
            <Clock3 size={17} />
            <strong>最近操作</strong>
          </div>
          <span>{recentRuns.length}</span>
        </header>
        <div className="ai-operator-run-list">
          {recentRuns.length ? recentRuns.map((run) => (
            <article className={`is-${run.status}`} key={run.id}>
              <div className="ai-operator-run-heading">
                {run.status === "applied" ? <CheckCircle2 size={16} /> : run.status === "undone" ? <Undo2 size={16} /> : <XCircle size={16} />}
                <strong>{run.summary || "AI 项目操作"}</strong>
                <span>{statusLabels[run.status]}</span>
              </div>
              <p>{run.instruction}</p>
              <div className="ai-operator-change-list">
                {run.changes.map((change) => (
                  <button
                    key={change.id}
                    title={`打开${aiOperationTargetLabels[change.target]}：${change.label}`}
                    type="button"
                    onClick={() => onOpenChange(change)}
                  >
                    <span>{actionLabels[change.action]} {aiOperationTargetLabels[change.target]}</span>
                    <strong>{change.label}</strong>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
              <footer>
                <span>{formatRunTime(run.createdAt)} · {run.model || "未知模型"}</span>
                {run.status === "applied" ? (
                  <button
                    aria-label={`撤销：${run.summary}`}
                    disabled={Boolean(busy)}
                    title="撤销这次 AI 操作"
                    type="button"
                    onClick={() => void undoRun(run.id)}
                  >
                    {busy === "undo" && busyRunId === run.id ? <LoaderCircle className="is-spinning" size={15} /> : <Undo2 size={15} />}
                  </button>
                ) : null}
              </footer>
            </article>
          )) : (
            <div className="ai-operator-empty">
              <Clock3 size={22} />
              <span>还没有 AI 项目操作</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
