"use client";

import {
  AlertTriangle,
  ArrowRight,
  Bug,
  Check,
  CheckCircle2,
  CircleStop,
  ClipboardCheck,
  Download,
  FileWarning,
  Flag,
  FlaskConical,
  GitBranch,
  History,
  ListChecks,
  Play,
  Plus,
  RefreshCw,
  Route,
  ScanSearch,
  Search,
  Settings2,
  Trash2,
  Variable
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { coerceStoryValue, storyConditionsPass } from "../story";
import type { StoryScene, StoryState, StoryValue, StoryVariable } from "../story";
import {
  advanceStoryManualSession,
  analyzeStoryScene,
  buildStoryTestReportMarkdown,
  createAutomaticStoryTestRun,
  createIssueFromFinding,
  createManualStoryTestRun,
  createStoryReviewIssue,
  startStoryManualSession
} from "../story-testing";
import type {
  StoryManualSession,
  StoryReviewIssue,
  StoryReviewIssueSeverity,
  StoryReviewIssueStatus,
  StoryTestAnalysis,
  StoryTestFinding,
  StoryTestPathOutcome,
  StoryTestPreset,
  StoryTestRun,
  StoryTestRunStatus
} from "../story-testing";

export type StoryTestWorkspaceMode = "analysis" | "manual" | "issues";

type EntityOption = {
  id: string;
  title: string;
  typeLabel: string;
};

type QuestOption = {
  id: string;
  title: string;
};

const issueSeverityMeta: Record<
  StoryReviewIssueSeverity,
  { label: string; helper: string }
> = {
  critical: { label: "阻断", helper: "会阻止剧情交付或让流程无法完成" },
  major: { label: "重要", helper: "明显影响体验、逻辑或内容一致性" },
  minor: { label: "轻微", helper: "可排期处理的文本或体验问题" }
};

const issueStatusLabels: Record<StoryReviewIssueStatus, string> = {
  open: "待处理",
  resolved: "已解决"
};

const runStatusMeta: Record<StoryTestRunStatus, { label: string; className: string }> = {
  passed: { label: "通过", className: "is-passed" },
  failed: { label: "失败", className: "is-failed" },
  blocked: { label: "阻断", className: "is-blocked" }
};

const pathOutcomeLabels: Record<StoryTestPathOutcome, string> = {
  ending: "结局",
  blocked: "阻断",
  "dead-end": "死路",
  loop: "循环",
  limit: "上限",
  merged: "汇入"
};

function formatDate(value: string) {
  if (!value) return "未记录";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function StoryTestWorkspace({
  entities,
  issues,
  mode,
  onCreateIssue,
  onCreatePreset,
  onDeleteIssue,
  onDeletePreset,
  onDeleteRun,
  onModeChange,
  onOpenConsistencyFinding,
  onOpenScene,
  onSaveRun,
  onSelectIssue,
  onSelectPreset,
  onUpdateIssue,
  onUpdatePreset,
  presets,
  quests,
  runs,
  scenes,
  selectedIssueId,
  selectedPresetId,
  variables,
  worldId,
  worldName
}: {
  entities: EntityOption[];
  issues: StoryReviewIssue[];
  mode: StoryTestWorkspaceMode;
  onCreateIssue: (issue: StoryReviewIssue) => void;
  onCreatePreset: () => void;
  onDeleteIssue: (issueId: string) => void | Promise<void>;
  onDeletePreset: (presetId: string) => void | Promise<void>;
  onDeleteRun: (runId: string) => void | Promise<void>;
  onModeChange: (mode: StoryTestWorkspaceMode) => void;
  onOpenConsistencyFinding: (findingId: string) => void;
  onOpenScene: (sceneId: string) => void;
  onSaveRun: (run: StoryTestRun) => void;
  onSelectIssue: (issueId: string) => void;
  onSelectPreset: (presetId: string) => void;
  onUpdateIssue: (issueId: string, patch: Partial<StoryReviewIssue>) => void;
  onUpdatePreset: (presetId: string, patch: Partial<StoryTestPreset>) => void;
  presets: StoryTestPreset[];
  quests: QuestOption[];
  runs: StoryTestRun[];
  scenes: StoryScene[];
  selectedIssueId: string;
  selectedPresetId: string;
  variables: StoryVariable[];
  worldId: string;
  worldName: string;
}) {
  const [analysis, setAnalysis] = useState<StoryTestAnalysis | null>(null);
  const [manualSession, setManualSession] = useState<StoryManualSession | null>(null);
  const [manualNotes, setManualNotes] = useState("");
  const [presetQuery, setPresetQuery] = useState("");
  const [issueQuery, setIssueQuery] = useState("");
  const [issueStatusFilter, setIssueStatusFilter] = useState<StoryReviewIssueStatus | "all">(
    "open"
  );
  const [runSavedMessage, setRunSavedMessage] = useState("");

  const selectedPreset =
    presets.find((preset) => preset.id === selectedPresetId) ?? presets[0] ?? null;
  const selectedScene =
    scenes.find((scene) => scene.id === selectedPreset?.sceneId) ?? scenes[0] ?? null;
  const selectedIssue =
    issues.find((issue) => issue.id === selectedIssueId) ?? issues[0] ?? null;
  const issueScene = scenes.find((scene) => scene.id === selectedIssue?.sceneId) ?? null;
  const currentManualNode =
    selectedScene?.nodes.find((node) => node.id === manualSession?.currentNodeId) ?? null;

  const filteredPresets = useMemo(() => {
    const query = presetQuery.trim().toLocaleLowerCase();
    return presets.filter((preset) => {
      const scene = scenes.find((item) => item.id === preset.sceneId);
      return query
        ? [preset.name, preset.description, scene?.title]
            .join(" ")
            .toLocaleLowerCase()
            .includes(query)
        : true;
    });
  }, [presetQuery, presets, scenes]);

  const filteredIssues = useMemo(() => {
    const query = issueQuery.trim().toLocaleLowerCase();
    return issues
      .filter((issue) => issueStatusFilter === "all" || issue.status === issueStatusFilter)
      .filter((issue) => {
        const scene = scenes.find((item) => item.id === issue.sceneId);
        return query
          ? [issue.title, issue.detail, scene?.title]
              .join(" ")
              .toLocaleLowerCase()
              .includes(query)
          : true;
      })
      .sort((left, right) => {
        const severityRank = { critical: 0, major: 1, minor: 2 };
        return (
          severityRank[left.severity] - severityRank[right.severity] ||
          right.updatedAt.localeCompare(left.updatedAt)
        );
      });
  }, [issueQuery, issueStatusFilter, issues, scenes]);

  const sceneRuns = useMemo(
    () =>
      runs
        .filter((run) => !selectedScene || run.sceneId === selectedScene.id)
        .sort((left, right) => right.executedAt.localeCompare(left.executedAt)),
    [runs, selectedScene]
  );

  const openIssueCount = issues.filter((issue) => issue.status === "open").length;
  const criticalIssueCount = issues.filter(
    (issue) => issue.status === "open" && issue.severity === "critical"
  ).length;

  useEffect(() => {
    setAnalysis(null);
    setManualSession(null);
    setManualNotes("");
    setRunSavedMessage("");
  }, [selectedPreset?.id, selectedPreset?.sceneId]);

  function updatePresetState(variableId: string, value: StoryValue) {
    if (!selectedPreset) return;
    onUpdatePreset(selectedPreset.id, {
      initialState: { ...selectedPreset.initialState, [variableId]: value }
    });
  }

  function runAnalysis() {
    if (!selectedScene || !selectedPreset) return;
    setAnalysis(
      analyzeStoryScene(selectedScene, variables, selectedPreset, {
        maxDepth: selectedPreset.maxDepth,
        maxPaths: selectedPreset.maxPaths
      })
    );
    setRunSavedMessage("");
  }

  function saveAutomaticRun() {
    if (!analysis) return;
    const run = createAutomaticStoryTestRun(worldId, analysis);
    onSaveRun(run);
    setRunSavedMessage(`已记录自动测试：${runStatusMeta[run.status].label}`);
  }

  function startManual() {
    if (!selectedScene || !selectedPreset) return;
    setManualSession(
      startStoryManualSession(selectedScene, variables, selectedPreset.initialState)
    );
    setManualNotes("");
    setRunSavedMessage("");
  }

  function advanceManual(choiceId = "") {
    if (!manualSession || !selectedScene) return;
    setManualSession(
      advanceStoryManualSession(manualSession, selectedScene, variables, choiceId)
    );
  }

  function saveManualRun(status: StoryTestRunStatus) {
    if (!manualSession || !selectedScene || !selectedPreset) return;
    const run = createManualStoryTestRun(
      worldId,
      selectedPreset.id,
      selectedScene,
      manualSession,
      status,
      manualNotes
    );
    onSaveRun(run);
    setRunSavedMessage(`已记录手动测试：${runStatusMeta[status].label}`);
  }

  function addFindingIssue(finding: StoryTestFinding) {
    onCreateIssue(createIssueFromFinding(worldId, finding, selectedPreset?.id));
    onModeChange("issues");
  }

  function addManualIssue() {
    const issue = createStoryReviewIssue(worldId, {
      sceneId: selectedScene?.id ?? "",
      nodeId: currentManualNode?.id ?? "",
      presetId: selectedPreset?.id ?? "",
      title: currentManualNode
        ? `${currentManualNode.label}需要审阅`
        : "新的剧情审阅问题"
    });
    onCreateIssue(issue);
    onModeChange("issues");
  }

  function exportAnalysis() {
    if (!analysis || !selectedScene || !selectedPreset) return;
    const content = buildStoryTestReportMarkdown({
      worldName,
      scene: selectedScene,
      variables,
      preset: selectedPreset,
      analysis,
      issues
    });
    downloadMarkdown(
      `${worldName.replace(/[\\/:*?"<>|]/g, "-")}-${selectedScene.title.replace(/[\\/:*?"<>|]/g, "-")}-剧情测试.md`,
      content
    );
  }

  return (
    <section className="story-test-workspace">
      <div className="story-test-toolbar">
        <div>
          <div className="eyebrow">
            <FlaskConical size={14} />
            <span>剧情验收</span>
          </div>
          <h2>测试、覆盖与审阅问题</h2>
        </div>
        <div aria-label="剧情测试模式" className="story-test-mode-switch">
          <button
            className={mode === "analysis" ? "is-active" : ""}
            type="button"
            onClick={() => onModeChange("analysis")}
          >
            <ListChecks size={16} />
            <span>自动检查</span>
          </button>
          <button
            className={mode === "manual" ? "is-active" : ""}
            type="button"
            onClick={() => onModeChange("manual")}
          >
            <Play size={16} />
            <span>手动验收</span>
          </button>
          <button
            className={mode === "issues" ? "is-active" : ""}
            type="button"
            onClick={() => onModeChange("issues")}
          >
            <Bug size={16} />
            <span>问题 {openIssueCount}</span>
          </button>
        </div>
        <button
          className="story-test-primary-button"
          type="button"
          onClick={mode === "issues" ? addManualIssue : onCreatePreset}
        >
          <Plus size={17} />
          <span>{mode === "issues" ? "新建问题" : "新建预设"}</span>
        </button>
      </div>

      {mode !== "issues" ? (
        <div className={`story-test-layout mode-${mode}`}>
          <PresetBrowser
            filteredPresets={filteredPresets}
            onCreatePreset={onCreatePreset}
            onQueryChange={setPresetQuery}
            onSelectPreset={onSelectPreset}
            presets={presets}
            query={presetQuery}
            scenes={scenes}
            selectedPresetId={selectedPreset?.id ?? ""}
          />

          {mode === "analysis" ? (
            <div className="panel story-test-main-panel">
              {selectedPreset && selectedScene ? (
                <>
                  <PresetEditor
                    onDeletePreset={onDeletePreset}
                    onRun={runAnalysis}
                    onStateChange={updatePresetState}
                    onUpdatePreset={onUpdatePreset}
                    preset={selectedPreset}
                    scenes={scenes}
                    selectedScene={selectedScene}
                    variables={variables}
                  />

                  {analysis ? (
                    <>
                      <CoverageSummary analysis={analysis} />
                      <div className="story-test-result-toolbar">
                        <div>
                          <strong>{analysis.findings.length} 项检查发现</strong>
                          <span>{analysis.exploredStates} 个状态 · {analysis.paths.length} 条路径</span>
                        </div>
                        <button type="button" onClick={saveAutomaticRun}>
                          <ClipboardCheck size={16} />
                          <span>记录结果</span>
                        </button>
                        <button type="button" onClick={exportAnalysis}>
                          <Download size={16} />
                          <span>导出报告</span>
                        </button>
                      </div>
                      {runSavedMessage ? (
                        <div className="story-test-saved-message">
                          <CheckCircle2 size={16} />
                          <span>{runSavedMessage}</span>
                        </div>
                      ) : null}
                      <FindingList
                        findings={analysis.findings}
                        onCreateIssue={addFindingIssue}
                        onOpenScene={onOpenScene}
                      />
                      <PathList analysis={analysis} scene={selectedScene} />
                    </>
                  ) : (
                    <TestEmptyState
                      actionLabel="运行自动检查"
                      icon={<FlaskConical size={34} />}
                      title="准备分析所有可行分支"
                      onAction={runAnalysis}
                    />
                  )}
                </>
              ) : (
                <TestEmptyState
                  actionLabel={presets.length ? "创建剧情场景" : "创建测试预设"}
                  icon={<FlaskConical size={34} />}
                  title={presets.length ? "预设没有有效场景" : "还没有测试预设"}
                  onAction={onCreatePreset}
                />
              )}
            </div>
          ) : (
            <ManualTestPanel
              currentNode={currentManualNode}
              manualNotes={manualNotes}
              onAddIssue={addManualIssue}
              onAdvance={advanceManual}
              onNotesChange={setManualNotes}
              onSave={saveManualRun}
              onStart={startManual}
              onStateChange={(state) =>
                setManualSession((session) => (session ? { ...session, state } : session))
              }
              runSavedMessage={runSavedMessage}
              scene={selectedScene}
              session={manualSession}
              variables={variables}
            />
          )}

          <TestInspector
            analysis={analysis}
            issues={issues}
            onDeleteRun={onDeleteRun}
            onOpenScene={onOpenScene}
            preset={selectedPreset}
            runs={sceneRuns}
            scene={selectedScene}
            variables={variables}
          />
        </div>
      ) : (
        <div className="story-issue-layout">
          <IssueBrowser
            criticalIssueCount={criticalIssueCount}
            filteredIssues={filteredIssues}
            issueQuery={issueQuery}
            issueStatusFilter={issueStatusFilter}
            onQueryChange={setIssueQuery}
            onSelectIssue={onSelectIssue}
            onStatusFilterChange={setIssueStatusFilter}
            scenes={scenes}
            selectedIssueId={selectedIssue?.id ?? ""}
          />
          <IssueEditor
            entities={entities}
            issue={selectedIssue}
            issueScene={issueScene}
            onDeleteIssue={onDeleteIssue}
            onOpenConsistencyFinding={onOpenConsistencyFinding}
            onOpenScene={onOpenScene}
            onUpdateIssue={onUpdateIssue}
            quests={quests}
            runs={runs}
            scenes={scenes}
          />
          <IssueOverview issues={issues} runs={runs} scenes={scenes} />
        </div>
      )}
    </section>
  );
}

function PresetBrowser({
  filteredPresets,
  onCreatePreset,
  onQueryChange,
  onSelectPreset,
  presets,
  query,
  scenes,
  selectedPresetId
}: {
  filteredPresets: StoryTestPreset[];
  onCreatePreset: () => void;
  onQueryChange: (value: string) => void;
  onSelectPreset: (presetId: string) => void;
  presets: StoryTestPreset[];
  query: string;
  scenes: StoryScene[];
  selectedPresetId: string;
}) {
  return (
    <div className="panel story-test-preset-panel">
      <div className="panel-heading compact">
        <div>
          <h2>测试预设</h2>
          <p>{presets.length} 组初始状态</p>
        </div>
        <button aria-label="新建测试预设" className="icon-button" type="button" onClick={onCreatePreset}>
          <Plus size={18} />
        </button>
      </div>
      <label className="search-box">
        <Search size={16} />
        <input
          placeholder="搜索预设"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <div className="story-test-preset-list">
        {filteredPresets.map((preset) => {
          const scene = scenes.find((item) => item.id === preset.sceneId);
          return (
            <button
              className={preset.id === selectedPresetId ? "is-active" : ""}
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
            >
              <span className="story-test-list-icon">
                <FlaskConical size={16} />
              </span>
              <span>
                <strong>{preset.name}</strong>
                <small>{scene?.title ?? "场景已失效"}</small>
                <em>深度 {preset.maxDepth} · 路径 {preset.maxPaths}</em>
              </span>
            </button>
          );
        })}
        {!filteredPresets.length ? (
          <div className="story-test-list-empty">没有匹配的测试预设</div>
        ) : null}
      </div>
    </div>
  );
}

function PresetEditor({
  onDeletePreset,
  onRun,
  onStateChange,
  onUpdatePreset,
  preset,
  scenes,
  selectedScene,
  variables
}: {
  onDeletePreset: (presetId: string) => void | Promise<void>;
  onRun: () => void;
  onStateChange: (variableId: string, value: StoryValue) => void;
  onUpdatePreset: (presetId: string, patch: Partial<StoryTestPreset>) => void;
  preset: StoryTestPreset;
  scenes: StoryScene[];
  selectedScene: StoryScene;
  variables: StoryVariable[];
}) {
  return (
    <div className="story-test-preset-editor">
      <div className="story-test-preset-title-row">
        <input
          aria-label="测试预设名称"
          value={preset.name}
          onChange={(event) => onUpdatePreset(preset.id, { name: event.target.value })}
        />
        <button aria-label="删除测试预设" className="danger-icon-button" type="button" onClick={() => {
          if (window.confirm(`删除测试预设“${preset.name}”？`)) void onDeletePreset(preset.id);
        }}>
          <Trash2 size={17} />
        </button>
      </div>
      <textarea
        aria-label="测试预设说明"
        rows={2}
        value={preset.description}
        onChange={(event) => onUpdatePreset(preset.id, { description: event.target.value })}
      />
      <div className="story-test-config-grid">
        <TestField label="目标场景">
          <select
            value={selectedScene.id}
            onChange={(event) => onUpdatePreset(preset.id, { sceneId: event.target.value })}
          >
            {scenes.map((scene) => (
              <option key={scene.id} value={scene.id}>{scene.title}</option>
            ))}
          </select>
        </TestField>
        <TestField label="最大深度">
          <input
            max={100}
            min={4}
            type="number"
            value={preset.maxDepth}
            onChange={(event) => onUpdatePreset(preset.id, { maxDepth: Number(event.target.value) })}
          />
        </TestField>
        <TestField label="路径上限">
          <input
            max={500}
            min={10}
            type="number"
            value={preset.maxPaths}
            onChange={(event) => onUpdatePreset(preset.id, { maxPaths: Number(event.target.value) })}
          />
        </TestField>
        <button className="story-test-run-button" type="button" onClick={onRun}>
          <RefreshCw size={17} />
          <span>运行检查</span>
        </button>
      </div>
      <div className="story-test-preset-state">
        <div className="story-test-section-heading">
          <strong>初始变量</strong>
          <span>{variables.length} 个世界状态</span>
        </div>
        <div className="story-manual-state-grid">
          {variables.map((variable) => (
            <TestField key={variable.id} label={variable.name}>
              <StoryTestValueInput
                value={preset.initialState[variable.id] ?? variable.defaultValue}
                variable={variable}
                onChange={(value) => onStateChange(variable.id, value)}
              />
            </TestField>
          ))}
          {!variables.length ? <p className="muted-text">当前世界没有剧情变量</p> : null}
        </div>
      </div>
    </div>
  );
}

function CoverageSummary({ analysis }: { analysis: StoryTestAnalysis }) {
  return (
    <div className="story-test-coverage-grid">
      <CoverageCell
        covered={analysis.coverage.coveredNodeIds.length}
        icon={<Route size={17} />}
        label="节点"
        percent={analysis.coverage.nodePercent}
        total={analysis.coverage.nodeIds.length}
      />
      <CoverageCell
        covered={analysis.coverage.coveredChoiceIds.length}
        icon={<GitBranch size={17} />}
        label="选项"
        percent={analysis.coverage.choicePercent}
        total={analysis.coverage.choiceIds.length}
      />
      <CoverageCell
        covered={analysis.coverage.coveredEndingNodeIds.length}
        icon={<Flag size={17} />}
        label="结局"
        percent={analysis.coverage.endingPercent}
        total={analysis.coverage.endingNodeIds.length}
      />
    </div>
  );
}

function CoverageCell({
  covered,
  icon,
  label,
  percent,
  total
}: {
  covered: number;
  icon: ReactNode;
  label: string;
  percent: number;
  total: number;
}) {
  return (
    <div className="story-test-coverage-cell">
      <div>
        {icon}
        <span>{label}</span>
        <strong>{percent}%</strong>
      </div>
      <div className="story-test-progress"><span style={{ width: `${percent}%` }} /></div>
      <small>{covered}/{total} 已覆盖</small>
    </div>
  );
}

function FindingList({
  findings,
  onCreateIssue,
  onOpenScene
}: {
  findings: StoryTestFinding[];
  onCreateIssue: (finding: StoryTestFinding) => void;
  onOpenScene: (sceneId: string) => void;
}) {
  return (
    <div className="story-test-section">
      <div className="story-test-section-heading">
        <strong>检查发现</strong>
        <span>{findings.length} 项</span>
      </div>
      <div className="story-test-finding-list">
        {findings.map((finding) => (
          <div className={`story-test-finding severity-${finding.severity}`} key={finding.id}>
            <span className="story-test-finding-icon">
              {finding.severity === "error" ? <FileWarning size={17} /> : <AlertTriangle size={17} />}
            </span>
            <span>
              <strong>{finding.title}</strong>
              <small>{finding.detail}</small>
            </span>
            {finding.nodeId ? (
              <button type="button" onClick={() => onOpenScene(finding.sceneId)}>定位</button>
            ) : null}
            <button type="button" onClick={() => onCreateIssue(finding)}>转为问题</button>
          </div>
        ))}
        {!findings.length ? (
          <div className="story-test-clear-state">
            <CheckCircle2 size={26} />
            <strong>当前预设没有发现问题</strong>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PathList({ analysis, scene }: { analysis: StoryTestAnalysis; scene: StoryScene }) {
  const nodeNames = new Map(scene.nodes.map((node) => [node.id, node.label]));
  return (
    <div className="story-test-section">
      <div className="story-test-section-heading">
        <strong>路径结果</strong>
        <span>{analysis.paths.length} 条</span>
      </div>
      <div className="story-test-path-list">
        {analysis.paths.map((path, index) => (
          <div className={`story-test-path outcome-${path.outcome}`} key={path.id}>
            <span>{index + 1}</span>
            <strong>{pathOutcomeLabels[path.outcome]}</strong>
            <div>
              {path.nodeIds.map((nodeId, nodeIndex) => (
                <span key={`${nodeId}-${nodeIndex}`}>
                  {nodeNames.get(nodeId) ?? nodeId}
                </span>
              ))}
            </div>
            <small>{path.detail}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManualTestPanel({
  currentNode,
  manualNotes,
  onAddIssue,
  onAdvance,
  onNotesChange,
  onSave,
  onStart,
  onStateChange,
  runSavedMessage,
  scene,
  session,
  variables
}: {
  currentNode: StoryScene["nodes"][number] | null;
  manualNotes: string;
  onAddIssue: () => void;
  onAdvance: (choiceId?: string) => void;
  onNotesChange: (value: string) => void;
  onSave: (status: StoryTestRunStatus) => void;
  onStart: () => void;
  onStateChange: (state: StoryState) => void;
  runSavedMessage: string;
  scene: StoryScene | null;
  session: StoryManualSession | null;
  variables: StoryVariable[];
}) {
  return (
    <div className="panel story-manual-panel">
      <div className="panel-heading">
        <div>
          <h2>{scene?.title ?? "手动剧情验收"}</h2>
          <p>{session ? `${session.nodeIds.length} 个经过节点` : "使用预设变量执行真实选择"}</p>
        </div>
        <button disabled={!scene} type="button" onClick={onStart}>
          <Play size={16} />
          <span>{session ? "重新开始" : "开始验收"}</span>
        </button>
      </div>

      {session?.message ? (
        <div className={`story-manual-message status-${session.status}`}>
          {session.status === "ending" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{session.message}</span>
        </div>
      ) : null}

      {currentNode && session ? (
        <div className="story-manual-stage">
          <div className="story-manual-node-meta">
            <span>{currentNode.label}</span>
            {currentNode.isEnding ? <strong><CircleStop size={14} />结局</strong> : null}
          </div>
          {currentNode.stageDirection ? <p>{currentNode.stageDirection}</p> : null}
          <blockquote>{currentNode.text || "（此节点还没有对白文本）"}</blockquote>
          {currentNode.choices.length && session.status === "running" ? (
            <div className="story-manual-choices">
              {currentNode.choices.map((choice) => {
                const available = storyConditionsPass(choice.conditions, variables, session.state);
                return (
                  <button
                    disabled={!available || !choice.targetNodeId}
                    key={choice.id}
                    type="button"
                    onClick={() => onAdvance(choice.id)}
                  >
                    <GitBranch size={16} />
                    <span>{choice.text || "未命名选项"}</span>
                    <ArrowRight size={15} />
                  </button>
                );
              })}
            </div>
          ) : currentNode.nextNodeId && session.status === "running" ? (
            <button className="story-manual-next" type="button" onClick={() => onAdvance()}>
              <span>继续</span><ArrowRight size={16} />
            </button>
          ) : null}
        </div>
      ) : (
        <TestEmptyState
          actionLabel="从入口开始"
          icon={<Play size={34} />}
          title={scene ? "准备执行手动验收" : "没有可测试的场景"}
          onAction={onStart}
        />
      )}

      {session ? (
        <>
          <div className="story-manual-state-grid">
            {variables.map((variable) => (
              <TestField key={variable.id} label={variable.name}>
                <StoryTestValueInput
                  value={session.state[variable.id] ?? variable.defaultValue}
                  variable={variable}
                  onChange={(value) => onStateChange({ ...session.state, [variable.id]: value })}
                />
              </TestField>
            ))}
          </div>
          <TestField label="测试记录">
            <textarea
              rows={3}
              placeholder="记录复现步骤、实际表现或审阅意见"
              value={manualNotes}
              onChange={(event) => onNotesChange(event.target.value)}
            />
          </TestField>
          <div className="story-manual-result-actions">
            <button disabled={session.status !== "ending"} type="button" onClick={() => onSave("passed")}>
              <Check size={16} /><span>记录通过</span>
            </button>
            <button type="button" onClick={() => onSave("failed")}>
              <FileWarning size={16} /><span>记录失败</span>
            </button>
            <button type="button" onClick={() => onSave("blocked")}>
              <CircleStop size={16} /><span>记录阻断</span>
            </button>
            <button type="button" onClick={onAddIssue}>
              <Bug size={16} /><span>新建问题</span>
            </button>
          </div>
          {runSavedMessage ? <div className="story-test-saved-message"><CheckCircle2 size={16} />{runSavedMessage}</div> : null}
        </>
      ) : null}
    </div>
  );
}

function TestInspector({
  analysis,
  issues,
  onDeleteRun,
  onOpenScene,
  preset,
  runs,
  scene,
  variables
}: {
  analysis: StoryTestAnalysis | null;
  issues: StoryReviewIssue[];
  onDeleteRun: (runId: string) => void | Promise<void>;
  onOpenScene: (sceneId: string) => void;
  preset: StoryTestPreset | null;
  runs: StoryTestRun[];
  scene: StoryScene | null;
  variables: StoryVariable[];
}) {
  const sceneIssues = issues.filter((issue) => issue.sceneId === scene?.id && issue.status === "open");
  return (
    <div className="story-test-inspector">
      <div className="panel">
        <div className="panel-heading compact"><div><h2>初始变量</h2><p>{variables.length} 个世界状态</p></div><Variable size={19} /></div>
        <div className="story-test-variable-list">
          {variables.map((variable) => (
            <div key={variable.id}>
              <span>{variable.name}</span>
              <strong>
                {String(
                  analysis?.initialState[variable.id] ??
                    preset?.initialState[variable.id] ??
                    variable.defaultValue
                )}
              </strong>
              <small>{variable.key}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="panel-heading compact"><div><h2>运行历史</h2><p>{runs.length} 条记录</p></div><History size={19} /></div>
        <div className="story-test-run-list">
          {runs.slice(0, 20).map((run) => (
            <div key={run.id}>
              <span className={runStatusMeta[run.status].className}>{runStatusMeta[run.status].label}</span>
              <span><strong>{run.mode === "automatic" ? "自动检查" : "手动验收"}</strong><small>{formatDate(run.executedAt)} · 节点 {run.coverage.nodePercent}%</small></span>
              <button aria-label="删除测试记录" type="button" onClick={() => { if (window.confirm("删除这条测试记录？")) void onDeleteRun(run.id); }}><Trash2 size={14} /></button>
            </div>
          ))}
          {!runs.length ? <p className="muted-text">还没有测试记录</p> : null}
        </div>
      </div>
      <div className="panel">
        <div className="panel-heading compact"><div><h2>场景问题</h2><p>{sceneIssues.length} 项待处理</p></div><Bug size={19} /></div>
        <div className="story-test-scene-issues">
          {sceneIssues.slice(0, 8).map((issue) => (
            <span className={`severity-${issue.severity}`} key={issue.id}>{issue.title}</span>
          ))}
          {!sceneIssues.length ? <p className="muted-text">当前场景没有待处理问题</p> : null}
        </div>
        {scene ? <button className="story-test-open-scene" type="button" onClick={() => onOpenScene(scene.id)}><Route size={15} /><span>打开场景编辑器</span></button> : null}
      </div>
    </div>
  );
}

function IssueBrowser({
  criticalIssueCount,
  filteredIssues,
  issueQuery,
  issueStatusFilter,
  onQueryChange,
  onSelectIssue,
  onStatusFilterChange,
  scenes,
  selectedIssueId
}: {
  criticalIssueCount: number;
  filteredIssues: StoryReviewIssue[];
  issueQuery: string;
  issueStatusFilter: StoryReviewIssueStatus | "all";
  onQueryChange: (value: string) => void;
  onSelectIssue: (issueId: string) => void;
  onStatusFilterChange: (value: StoryReviewIssueStatus | "all") => void;
  scenes: StoryScene[];
  selectedIssueId: string;
}) {
  return (
    <div className="panel story-issue-browser">
      <div className="panel-heading compact"><div><h2>审阅问题</h2><p>{criticalIssueCount} 个阻断项</p></div><Bug size={19} /></div>
      <label className="search-box"><Search size={16} /><input placeholder="搜索问题" value={issueQuery} onChange={(event) => onQueryChange(event.target.value)} /></label>
      <div className="story-issue-filter">
        {(["open", "resolved", "all"] as const).map((status) => (
          <button className={issueStatusFilter === status ? "is-active" : ""} key={status} type="button" onClick={() => onStatusFilterChange(status)}>{status === "all" ? "全部" : issueStatusLabels[status]}</button>
        ))}
      </div>
      <div className="story-issue-list">
        {filteredIssues.map((issue) => (
          <button className={issue.id === selectedIssueId ? "is-active" : ""} key={issue.id} type="button" onClick={() => onSelectIssue(issue.id)}>
            <span className={`issue-severity-dot severity-${issue.severity}`} />
            <span><strong>{issue.title}</strong><small>{scenes.find((scene) => scene.id === issue.sceneId)?.title ?? "未关联场景"}</small><em>{issueStatusLabels[issue.status]} · {formatDate(issue.updatedAt)}</em></span>
          </button>
        ))}
        {!filteredIssues.length ? <div className="story-test-list-empty">没有匹配的审阅问题</div> : null}
      </div>
    </div>
  );
}

function IssueEditor({
  entities,
  issue,
  issueScene,
  onDeleteIssue,
  onOpenConsistencyFinding,
  onOpenScene,
  onUpdateIssue,
  quests,
  runs,
  scenes
}: {
  entities: EntityOption[];
  issue: StoryReviewIssue | null;
  issueScene: StoryScene | null;
  onDeleteIssue: (issueId: string) => void | Promise<void>;
  onOpenConsistencyFinding: (findingId: string) => void;
  onOpenScene: (sceneId: string) => void;
  onUpdateIssue: (issueId: string, patch: Partial<StoryReviewIssue>) => void;
  quests: QuestOption[];
  runs: StoryTestRun[];
  scenes: StoryScene[];
}) {
  if (!issue) {
    return <div className="panel story-issue-editor"><TestEmptyState actionLabel="" icon={<Bug size={34} />} title="选择一个审阅问题" onAction={() => undefined} /></div>;
  }
  return (
    <div className="panel story-issue-editor">
      <div className="story-issue-title-row">
        <input aria-label="问题标题" value={issue.title} onChange={(event) => onUpdateIssue(issue.id, { title: event.target.value })} />
        <button aria-label="删除审阅问题" className="danger-icon-button" type="button" onClick={() => { if (window.confirm(`删除问题“${issue.title}”？`)) void onDeleteIssue(issue.id); }}><Trash2 size={17} /></button>
      </div>
      <div className="story-issue-meta-grid">
        <TestField label="严重程度"><select value={issue.severity} onChange={(event) => onUpdateIssue(issue.id, { severity: event.target.value as StoryReviewIssueSeverity })}>{(Object.keys(issueSeverityMeta) as StoryReviewIssueSeverity[]).map((severity) => <option key={severity} value={severity}>{issueSeverityMeta[severity].label}</option>)}</select><small>{issueSeverityMeta[issue.severity].helper}</small></TestField>
        <TestField label="状态"><select value={issue.status} onChange={(event) => { const status=event.target.value as StoryReviewIssueStatus; onUpdateIssue(issue.id, { status, resolvedAt: status === "resolved" ? new Date().toISOString() : "" }); }}>{(Object.keys(issueStatusLabels) as StoryReviewIssueStatus[]).map((status) => <option key={status} value={status}>{issueStatusLabels[status]}</option>)}</select></TestField>
      </div>
      <TestField label="问题说明"><textarea rows={7} value={issue.detail} onChange={(event) => onUpdateIssue(issue.id, { detail: event.target.value })} /></TestField>
      <div className="story-issue-links-grid">
        <TestField label="关联场景"><select value={issue.sceneId} onChange={(event) => onUpdateIssue(issue.id, { sceneId: event.target.value, nodeId: "" })}><option value="">未关联</option>{scenes.map((scene) => <option key={scene.id} value={scene.id}>{scene.title}</option>)}</select></TestField>
        <TestField label="关联节点"><select disabled={!issueScene} value={issue.nodeId} onChange={(event) => onUpdateIssue(issue.id, { nodeId: event.target.value })}><option value="">未关联</option>{issueScene?.nodes.map((node) => <option key={node.id} value={node.id}>{node.label}</option>)}</select></TestField>
        <TestField label="关联条目"><select value={issue.entityId} onChange={(event) => onUpdateIssue(issue.id, { entityId: event.target.value })}><option value="">未关联</option>{entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.typeLabel} · {entity.title}</option>)}</select></TestField>
        <TestField label="关联任务"><select value={issue.questId} onChange={(event) => onUpdateIssue(issue.id, { questId: event.target.value })}><option value="">未关联</option>{quests.map((quest) => <option key={quest.id} value={quest.id}>{quest.title}</option>)}</select></TestField>
        <TestField label="关联测试记录"><select value={issue.runId} onChange={(event) => onUpdateIssue(issue.id, { runId: event.target.value })}><option value="">未关联</option>{runs.map((run) => <option key={run.id} value={run.id}>{run.mode === "automatic" ? "自动" : "手动"} · {formatDate(run.executedAt)}</option>)}</select></TestField>
      </div>
      <div className="story-issue-footer">
        <span>来源：{issue.source === "analysis" ? `自动检查 · ${issue.sourceFindingKind}` : issue.source === "consistency" ? `一致性中心 · ${issue.consistencyRuleId}` : "手动审阅"}</span>
        {issue.source === "consistency" && issue.consistencyFindingId ? (
          <button type="button" onClick={() => onOpenConsistencyFinding(issue.consistencyFindingId)}>
            <ScanSearch size={15} />
            <span>打开原始发现</span>
          </button>
        ) : null}
        {issue.sceneId ? <button type="button" onClick={() => onOpenScene(issue.sceneId)}><Route size={15} /><span>打开关联场景</span></button> : null}
      </div>
    </div>
  );
}

function IssueOverview({ issues, runs, scenes }: { issues: StoryReviewIssue[]; runs: StoryTestRun[]; scenes: StoryScene[] }) {
  const open = issues.filter((issue) => issue.status === "open");
  const resolved = issues.length - open.length;
  const passedRuns = runs.filter((run) => run.status === "passed").length;
  const affectedSceneIds = new Set(open.map((issue) => issue.sceneId).filter(Boolean));
  return (
    <div className="story-issue-overview">
      <div className="panel">
        <div className="panel-heading compact"><div><h2>审阅概况</h2><p>本地问题台账</p></div><ClipboardCheck size={19} /></div>
        <div className="story-issue-facts">
          <div><span>待处理</span><strong>{open.length}</strong></div>
          <div><span>已解决</span><strong>{resolved}</strong></div>
          <div><span>测试通过</span><strong>{passedRuns}</strong></div>
          <div><span>受影响场景</span><strong>{affectedSceneIds.size}</strong></div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-heading compact"><div><h2>受影响场景</h2><p>{affectedSceneIds.size} 个</p></div><Route size={19} /></div>
        <div className="story-affected-scenes">
          {Array.from(affectedSceneIds).map((sceneId) => <span key={sceneId}>{scenes.find((scene) => scene.id === sceneId)?.title ?? "失效场景"}<strong>{open.filter((issue) => issue.sceneId === sceneId).length}</strong></span>)}
          {!affectedSceneIds.size ? <p className="muted-text">没有场景被待处理问题影响</p> : null}
        </div>
      </div>
    </div>
  );
}

function StoryTestValueInput({ onChange, value, variable }: { onChange: (value: StoryValue) => void; value: StoryValue; variable: StoryVariable }) {
  if (variable.type === "boolean") return <select value={String(coerceStoryValue("boolean", value))} onChange={(event) => onChange(event.target.value === "true")}><option value="false">假</option><option value="true">真</option></select>;
  if (variable.type === "number") return <input type="number" value={Number(coerceStoryValue("number", value))} onChange={(event) => onChange(Number(event.target.value))} />;
  return <input value={String(coerceStoryValue("text", value))} onChange={(event) => onChange(event.target.value)} />;
}

function TestField({ children, label }: { children: ReactNode; label: string }) {
  return <label className="story-test-field"><span>{label}</span>{children}</label>;
}

function TestEmptyState({ actionLabel, icon, onAction, title }: { actionLabel: string; icon: ReactNode; onAction: () => void; title: string }) {
  return (
    <div className="story-test-empty-state">
      <span>{icon}</span><strong>{title}</strong>
      {actionLabel ? <button type="button" onClick={onAction}><Plus size={16} /><span>{actionLabel}</span></button> : null}
    </div>
  );
}
