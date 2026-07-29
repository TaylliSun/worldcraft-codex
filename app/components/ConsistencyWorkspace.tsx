"use client";

import {
  Ban,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Cpu,
  ExternalLink,
  FileJson,
  FileText,
  Info,
  LoaderCircle,
  RefreshCw,
  ScanSearch,
  Settings2,
  ShieldAlert,
  Sparkles,
  TriangleAlert
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  consistencyRules,
  isSupportedModelEndpoint
} from "../consistency";
import type {
  ConsistencyCategory,
  ConsistencyFinding,
  ConsistencyModelSettings,
  ConsistencyRule,
  ConsistencyScan,
  ConsistencySettings,
  ConsistencySeverity,
  ConsistencyStatus,
  ConsistencyTarget
} from "../consistency";

type ConsistencyMode = "findings" | "rules" | "model";

const severityMeta: Record<
  ConsistencySeverity,
  { label: string; icon: typeof ShieldAlert }
> = {
  critical: { label: "严重", icon: ShieldAlert },
  major: { label: "重要", icon: TriangleAlert },
  minor: { label: "提示", icon: Info }
};

const statusMeta: Record<ConsistencyStatus, { label: string; icon: typeof CircleDot }> = {
  open: { label: "待处理", icon: CircleDot },
  ignored: { label: "已忽略", icon: Ban },
  resolved: { label: "已修复", icon: CheckCircle2 }
};

const categoryLabels: Record<ConsistencyCategory, string> = {
  identity: "身份与命名",
  references: "链接与引用",
  templates: "模板完整度",
  privacy: "秘密与权限",
  quests: "任务依赖",
  story: "剧情场景",
  manuscript: "长篇文稿",
  maps: "地图与路线",
  timeline: "时间线",
  relations: "显式关系"
};

const targetLabels: Record<ConsistencyTarget["type"], string> = {
  world: "世界",
  entity: "条目",
  quest: "任务",
  scene: "剧情场景",
  variable: "剧情变量",
  map: "地图",
  marker: "地图标记",
  route: "地图路线",
  track: "时间轨道",
  timeline: "时间点",
  relation: "关系",
  asset: "资源",
  "manuscript-book": "书稿",
  "manuscript-chapter": "章节",
  "manuscript-scene": "文稿场景",
  "manuscript-clue": "伏笔线索",
  "manuscript-knowledge": "人物知情状态"
};

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
}

function formatDate(value: string) {
  if (!value) return "尚未扫描";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function ConsistencyWorkspace({
  findings,
  modelBusyFindingId,
  modelMessage,
  modelSettings,
  onBatchCreateIssues,
  onExplainFinding,
  onExportJson,
  onExportMarkdown,
  onOpenTarget,
  onCancelScan,
  onRunScan,
  onSelectFinding,
  onToggleRule,
  onUpdateFindingStatus,
  onUpdateModelSettings,
  onUpdateSettings,
  scans,
  scanRunning,
  selectedFindingId,
  settings
}: {
  findings: ConsistencyFinding[];
  modelBusyFindingId: string;
  modelMessage: string;
  modelSettings: ConsistencyModelSettings;
  onBatchCreateIssues: (findingIds: string[]) => void;
  onExplainFinding: (findingId: string) => void | Promise<void>;
  onExportJson: () => void;
  onExportMarkdown: () => void;
  onOpenTarget: (target: ConsistencyTarget) => void;
  onCancelScan: () => void;
  onRunScan: () => void;
  onSelectFinding: (findingId: string) => void;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onUpdateFindingStatus: (
    findingId: string,
    status: ConsistencyStatus,
    reason: string
  ) => void;
  onUpdateModelSettings: (patch: Partial<ConsistencyModelSettings>) => void;
  onUpdateSettings: (patch: Partial<ConsistencySettings>) => void;
  scans: ConsistencyScan[];
  scanRunning: boolean;
  selectedFindingId: string;
  settings: ConsistencySettings;
}) {
  const [mode, setMode] = useState<ConsistencyMode>("findings");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ConsistencyCategory | "all">("all");
  const [severity, setSeverity] = useState<ConsistencySeverity | "all">("all");
  const [status, setStatus] = useState<ConsistencyStatus | "all">("open");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [ignoreReason, setIgnoreReason] = useState("");
  const [findingVisibleLimit, setFindingVisibleLimit] = useState(200);

  const orderedScans = useMemo(
    () => [...scans].sort((left, right) => right.completedAt.localeCompare(left.completedAt)),
    [scans]
  );
  const latestScan = orderedScans[0] ?? null;
  const previousScan = orderedScans[1] ?? null;
  const activeFindings = findings.filter((finding) => finding.detected);
  const visibleFindings = useMemo(() => {
    const normalizedQuery = normalize(query);
    return findings.filter((finding) => {
      const matchesStatus = status === "all" || finding.status === status;
      const matchesCategory = category === "all" || finding.category === category;
      const matchesSeverity = severity === "all" || finding.severity === severity;
      const matchesQuery =
        !normalizedQuery ||
        normalize(
          [
            finding.title,
            finding.detail,
            finding.ruleId,
            finding.primaryTarget.label,
            ...finding.evidence.flatMap((item) => [item.label, item.value])
          ].join(" ")
        ).includes(normalizedQuery);
      return matchesStatus && matchesCategory && matchesSeverity && matchesQuery;
    });
  }, [category, findings, query, severity, status]);
  const selectedFinding =
    findings.find((finding) => finding.id === selectedFindingId) ??
    visibleFindings[0] ??
    null;
  const displayedFindings = visibleFindings.slice(0, findingVisibleLimit);
  const selectedOpenIds = selectedIds.filter((id) =>
    findings.some((finding) => finding.id === id && finding.status === "open")
  );
  const modelEndpointValid = isSupportedModelEndpoint(
    modelSettings.endpoint,
    modelSettings.provider
  );

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => findings.some((finding) => finding.id === id))
    );
  }, [findings]);

  useEffect(() => {
    setIgnoreReason(selectedFinding?.statusReason ?? "");
  }, [selectedFinding?.id, selectedFinding?.statusReason]);

  useEffect(() => {
    setFindingVisibleLimit(200);
  }, [category, query, severity, status]);

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function selectVisibleOpenFindings() {
    const ids = visibleFindings
      .filter((finding) => finding.status === "open")
      .map((finding) => finding.id);
    setSelectedIds(ids);
  }

  return (
    <section className="consistency-workspace">
      <header className="panel consistency-toolbar">
        <div>
          <span className="consistency-eyebrow">
            <ScanSearch size={15} />
            完全离线 · 可复现扫描
          </span>
          <h2>叙事一致性中心</h2>
          <p>跨条目、任务、剧情、地图与时间线核对证据，不自动改写内容。</p>
        </div>
        <div className="consistency-toolbar-actions">
          <button type="button" title="导出 JSON 报告" onClick={onExportJson}>
            <FileJson size={17} />
            <span>JSON</span>
          </button>
          <button type="button" title="导出 Markdown 报告" onClick={onExportMarkdown}>
            <FileText size={17} />
            <span>Markdown</span>
          </button>
          <button
            className="consistency-scan-action"
            type="button"
            onClick={scanRunning ? onCancelScan : onRunScan}
          >
            {scanRunning ? (
              <LoaderCircle className="is-spinning" size={17} />
            ) : (
              <RefreshCw size={17} />
            )}
            <span>{scanRunning ? "取消扫描" : "重新扫描"}</span>
          </button>
        </div>
      </header>

      {scanRunning ? (
        <div aria-live="polite" className="consistency-scan-progress" role="status">
          <span>正在后台核对项目快照，完成前不会改动现有结果</span>
          <i />
        </div>
      ) : null}

      <div className="consistency-summary-grid">
        <SummaryMetric
          icon={ShieldAlert}
          label="严重"
          tone="critical"
          value={activeFindings.filter((finding) => finding.severity === "critical").length}
        />
        <SummaryMetric
          icon={TriangleAlert}
          label="重要"
          tone="major"
          value={activeFindings.filter((finding) => finding.severity === "major").length}
        />
        <SummaryMetric
          icon={Info}
          label="提示"
          tone="minor"
          value={activeFindings.filter((finding) => finding.severity === "minor").length}
        />
        <SummaryMetric
          icon={CircleDot}
          label="待处理"
          tone="open"
          value={activeFindings.filter((finding) => finding.status === "open").length}
        />
        <SummaryMetric
          icon={Sparkles}
          label="本次新增"
          tone="new"
          value={latestScan?.newFindingIds.length ?? 0}
        />
        <SummaryMetric
          icon={CheckCircle2}
          label="本次消失"
          tone="resolved"
          value={latestScan?.resolvedFindingIds.length ?? 0}
        />
      </div>

      <div className="consistency-mode-switch" role="group" aria-label="一致性中心视图">
        <button
          className={mode === "findings" ? "is-active" : ""}
          type="button"
          onClick={() => setMode("findings")}
        >
          <ScanSearch size={16} />
          <span>扫描发现</span>
        </button>
        <button
          className={mode === "rules" ? "is-active" : ""}
          type="button"
          onClick={() => setMode("rules")}
        >
          <Settings2 size={16} />
          <span>规则设置</span>
        </button>
        <button
          className={mode === "model" ? "is-active" : ""}
          type="button"
          onClick={() => setMode("model")}
        >
          <Cpu size={16} />
          <span>AI 模型</span>
        </button>
      </div>

      {mode === "findings" ? (
        <div className="consistency-findings-layout">
          <aside className="panel consistency-filter-panel">
            <div className="consistency-section-heading">
              <div>
                <h2>筛选</h2>
                <p>{visibleFindings.length} 项符合条件</p>
              </div>
              <ScanSearch size={20} />
            </div>
            <label className="consistency-search">
              <ScanSearch size={16} />
              <input
                aria-label="搜索一致性发现"
                placeholder="规则、对象或证据"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <FilterField label="状态">
              <select
                aria-label="发现状态"
                value={status}
                onChange={(event) => setStatus(event.target.value as ConsistencyStatus | "all")}
              >
                <option value="open">待处理</option>
                <option value="ignored">已忽略</option>
                <option value="resolved">已修复</option>
                <option value="all">全部状态</option>
              </select>
            </FilterField>
            <FilterField label="严重程度">
              <select
                aria-label="发现严重程度"
                value={severity}
                onChange={(event) =>
                  setSeverity(event.target.value as ConsistencySeverity | "all")
                }
              >
                <option value="all">全部程度</option>
                <option value="critical">严重</option>
                <option value="major">重要</option>
                <option value="minor">提示</option>
              </select>
            </FilterField>
            <FilterField label="类别">
              <select
                aria-label="发现类别"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ConsistencyCategory | "all")
                }
              >
                <option value="all">全部类别</option>
                {(Object.keys(categoryLabels) as ConsistencyCategory[]).map((item) => (
                  <option key={item} value={item}>
                    {categoryLabels[item]}
                  </option>
                ))}
              </select>
            </FilterField>

            <div className="consistency-scan-comparison">
              <strong>扫描对比</strong>
              {latestScan ? (
                <>
                  <span>最近：{formatDate(latestScan.completedAt)}</span>
                  <span>新增 {latestScan.newFindingIds.length}</span>
                  <span>消失 {latestScan.resolvedFindingIds.length}</span>
                  <span>重开 {latestScan.reopenedFindingIds.length}</span>
                  <small>
                    {previousScan
                      ? `上次 ${formatDate(previousScan.completedAt)} · ${previousScan.totalDetected} 项`
                      : "这是第一份扫描快照"}
                  </small>
                </>
              ) : (
                <p className="muted-text">尚未运行一致性扫描</p>
              )}
            </div>
          </aside>

          <section className="panel consistency-finding-panel">
            <div className="consistency-list-toolbar">
              <div>
                <button type="button" onClick={selectVisibleOpenFindings}>
                  选择当前待处理项
                </button>
                {selectedIds.length ? (
                  <button type="button" onClick={() => setSelectedIds([])}>
                    清除选择
                  </button>
                ) : null}
              </div>
              <button
                className="consistency-batch-action"
                disabled={!selectedOpenIds.length}
                type="button"
                onClick={() => {
                  onBatchCreateIssues(selectedOpenIds);
                  setSelectedIds([]);
                }}
              >
                <TriangleAlert size={16} />
                <span>转为审阅问题 {selectedOpenIds.length || ""}</span>
              </button>
            </div>
            <div className="consistency-finding-list">
              {visibleFindings.length ? (
                displayedFindings.map((finding) => {
                  const SeverityIcon = severityMeta[finding.severity].icon;
                  return (
                    <div
                      className={`consistency-finding-row severity-${finding.severity} ${
                        finding.id === selectedFinding?.id ? "is-active" : ""
                      }`}
                      key={finding.id}
                    >
                      <label title="选择发现">
                        <input
                          aria-label={`选择 ${finding.title}`}
                          checked={selectedIds.includes(finding.id)}
                          type="checkbox"
                          onChange={() => toggleSelected(finding.id)}
                        />
                      </label>
                      <button type="button" onClick={() => onSelectFinding(finding.id)}>
                        <span className="consistency-finding-icon">
                          <SeverityIcon size={17} />
                        </span>
                        <span className="consistency-finding-copy">
                          <span>
                            <strong>{finding.title}</strong>
                            <small>{finding.ruleId}</small>
                          </span>
                          <span>{finding.detail}</span>
                          <small>
                            {categoryLabels[finding.category]} · {finding.primaryTarget.label} ·{" "}
                            {statusMeta[finding.status].label}
                          </small>
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="consistency-empty-state">
                  <CheckCircle2 size={30} />
                  <strong>当前筛选下没有发现</strong>
                  <span>调整筛选，或重新扫描项目。</span>
                </div>
              )}
              {displayedFindings.length < visibleFindings.length ? (
                <button
                  className="consistency-load-more"
                  type="button"
                  onClick={() => setFindingVisibleLimit((current) => current + 200)}
                >
                  再显示 {Math.min(200, visibleFindings.length - displayedFindings.length)} 项
                </button>
              ) : null}
            </div>
          </section>

          <aside className="panel consistency-inspector">
            {selectedFinding ? (
              <FindingInspector
                finding={selectedFinding}
                ignoreReason={ignoreReason}
                modelBusy={modelBusyFindingId === selectedFinding.id}
                modelEnabled={
                  modelSettings.enabled && modelEndpointValid && Boolean(modelSettings.model)
                }
                modelMessage={modelMessage}
                onExplain={() => void onExplainFinding(selectedFinding.id)}
                onIgnoreReasonChange={setIgnoreReason}
                onOpenTarget={onOpenTarget}
                onStatusChange={(nextStatus, reason) =>
                  onUpdateFindingStatus(selectedFinding.id, nextStatus, reason)
                }
              />
            ) : (
              <div className="consistency-empty-state">
                <ScanSearch size={30} />
                <strong>选择一条发现查看证据</strong>
              </div>
            )}
          </aside>
        </div>
      ) : null}

      {mode === "rules" ? (
        <div className="consistency-settings-layout">
          <section className="panel consistency-rule-panel">
            <div className="consistency-section-heading">
              <div>
                <h2>扫描规则</h2>
                <p>{consistencyRules.length} 条内置规则</p>
              </div>
              <Settings2 size={20} />
            </div>
            <div className="consistency-rule-list">
              {consistencyRules.map((rule) => (
                <RuleToggle
                  enabled={!settings.disabledRuleIds.includes(rule.id)}
                  key={rule.id}
                  rule={rule}
                  onChange={(enabled) => onToggleRule(rule.id, enabled)}
                />
              ))}
            </div>
          </section>
          <aside className="panel consistency-settings-panel">
            <div className="consistency-section-heading">
              <div>
                <h2>规则行为</h2>
                <p>按世界保存</p>
              </div>
              <Settings2 size={20} />
            </div>
            <label className="consistency-setting-toggle">
              <input
                checked={settings.requireTemplateFields}
                type="checkbox"
                onChange={(event) =>
                  onUpdateSettings({ requireTemplateFields: event.target.checked })
                }
              />
              <span>
                <strong>检查关键模板字段</strong>
                <small>仅检查各条目类型的最小生产字段</small>
              </span>
            </label>
            <label className="consistency-setting-number">
              <span>
                <strong>允许缺失模板字段</strong>
                <small>单个条目超过此数量才生成提示</small>
              </span>
              <input
                aria-label="允许缺失模板字段数"
                max={20}
                min={0}
                step={1}
                type="number"
                value={settings.maxMissingTemplateFields}
                onChange={(event) =>
                  onUpdateSettings({ maxMissingTemplateFields: Number(event.target.value) })
                }
              />
            </label>
            <label className="consistency-setting-toggle">
              <input
                checked={settings.detectRouteRevisits}
                type="checkbox"
                onChange={(event) =>
                  onUpdateSettings({ detectRouteRevisits: event.target.checked })
                }
              />
              <span>
                <strong>提示路线折返</strong>
                <small>同一标记多次进入路线时生成提示</small>
              </span>
            </label>
            <label className="consistency-setting-number">
              <span>
                <strong>单一标记最大访问次数</strong>
                <small>路线超过此次数才视为异常折返</small>
              </span>
              <input
                aria-label="路线标记最大访问次数"
                max={10}
                min={1}
                step={1}
                type="number"
                value={settings.maxRouteMarkerVisits}
                onChange={(event) =>
                  onUpdateSettings({ maxRouteMarkerVisits: Number(event.target.value) })
                }
              />
            </label>
            <div className="consistency-rule-note">
              <Info size={17} />
              <p>关闭规则只影响后续扫描。已有发现会在下一次扫描后自动结案，并保留历史记录。</p>
            </div>
          </aside>
        </div>
      ) : null}

      {mode === "model" ? (
        <div className="consistency-model-layout">
          <section className="panel consistency-model-panel">
            <div className="consistency-section-heading">
              <div>
                <h2>AI 辅助解释</h2>
                <p>与 AI 工具共享当前世界的连接设置</p>
              </div>
              <Cpu size={21} />
            </div>
            <label className="consistency-setting-toggle">
              <input
                checked={modelSettings.enabled}
                type="checkbox"
                onChange={(event) => onUpdateModelSettings({ enabled: event.target.checked })}
              />
              <span>
                <strong>允许手动调用 AI 模型</strong>
                <small>只有点击“生成补充解释”时才发送当前发现的证据</small>
              </span>
            </label>
            <FilterField label="提供商">
              <select
                aria-label="AI 提供商"
                value={modelSettings.provider}
                onChange={(event) =>
                  onUpdateModelSettings({
                    provider: event.target.value as ConsistencyModelSettings["provider"]
                  })
                }
              >
                <option value="local">本地模型</option>
                <option value="openai-compatible">第三方 OpenAI-compatible</option>
              </select>
            </FilterField>
            <FilterField label="OpenAI-compatible 地址">
              <input
                aria-label="AI 模型地址"
                spellCheck={false}
                value={modelSettings.endpoint}
                onChange={(event) => onUpdateModelSettings({ endpoint: event.target.value })}
              />
            </FilterField>
            <FilterField label="模型名称">
              <input
                aria-label="AI 模型名称"
                placeholder="填写服务提供的模型 ID"
                value={modelSettings.model}
                onChange={(event) => onUpdateModelSettings({ model: event.target.value })}
              />
            </FilterField>
            <FilterField label={`温度 ${modelSettings.temperature.toFixed(1)}`}>
              <input
                aria-label="AI 模型温度"
                max="1"
                min="0"
                step="0.1"
                type="range"
                value={modelSettings.temperature}
                onChange={(event) =>
                  onUpdateModelSettings({ temperature: Number(event.target.value) })
                }
              />
            </FilterField>
            {!modelEndpointValid ? (
              <div className="consistency-model-warning">
                <ShieldAlert size={18} />
                <span>{modelSettings.provider === "local" ? "本地模型地址必须使用回环主机。" : "第三方模型必须使用 HTTPS 地址。"}</span>
              </div>
            ) : null}
          </section>
          <aside className="panel consistency-model-privacy">
            <ShieldAlert size={26} />
            <h2>发送边界</h2>
            <p>不会后台运行，也不会发送整个项目。</p>
            <ul>
              <li>只发送当前选中发现的标题、详情与可见证据</li>
              <li>第三方 API Key 由系统加密并在主进程添加</li>
              <li>模型输出仅作为解释，不进入自动修复</li>
              <li>关闭开关后所有模型按钮立即禁用</li>
            </ul>
            {modelMessage ? <div className="consistency-model-message">{modelMessage}</div> : null}
          </aside>
        </div>
      ) : null}
    </section>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  tone,
  value
}: {
  icon: typeof ShieldAlert;
  label: string;
  tone: string;
  value: number;
}) {
  return (
    <div className={`panel consistency-summary-metric tone-${tone}`}>
      <Icon size={19} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FilterField({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="consistency-filter-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function RuleToggle({
  enabled,
  onChange,
  rule
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  rule: ConsistencyRule;
}) {
  const Icon = severityMeta[rule.severity].icon;
  return (
    <label className={`consistency-rule-row severity-${rule.severity}`}>
      <input checked={enabled} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <span className="consistency-rule-icon">
        <Icon size={17} />
      </span>
      <span>
        <span>
          <strong>{rule.label}</strong>
          <small>{rule.id}</small>
        </span>
        <span>{rule.description}</span>
        <small>{categoryLabels[rule.category]} · {severityMeta[rule.severity].label}</small>
      </span>
    </label>
  );
}

function FindingInspector({
  finding,
  ignoreReason,
  modelBusy,
  modelEnabled,
  modelMessage,
  onExplain,
  onIgnoreReasonChange,
  onOpenTarget,
  onStatusChange
}: {
  finding: ConsistencyFinding;
  ignoreReason: string;
  modelBusy: boolean;
  modelEnabled: boolean;
  modelMessage: string;
  onExplain: () => void;
  onIgnoreReasonChange: (value: string) => void;
  onOpenTarget: (target: ConsistencyTarget) => void;
  onStatusChange: (status: ConsistencyStatus, reason: string) => void;
}) {
  const SeverityIcon = severityMeta[finding.severity].icon;
  const StatusIcon = statusMeta[finding.status].icon;
  return (
    <>
      <div className="consistency-inspector-heading">
        <span className={`consistency-severity-badge severity-${finding.severity}`}>
          <SeverityIcon size={15} />
          {severityMeta[finding.severity].label}
        </span>
        <span className={`consistency-status-badge status-${finding.status}`}>
          <StatusIcon size={15} />
          {statusMeta[finding.status].label}
        </span>
      </div>
      <div className="consistency-inspector-title">
        <span>{finding.ruleId} · {categoryLabels[finding.category]}</span>
        <h2>{finding.title}</h2>
        <p>{finding.detail}</p>
      </div>
      <button
        className="consistency-primary-target"
        type="button"
        onClick={() => onOpenTarget(finding.primaryTarget)}
      >
        <span>
          <small>{targetLabels[finding.primaryTarget.type]}</small>
          <strong>{finding.primaryTarget.label}</strong>
        </span>
        <ExternalLink size={17} />
      </button>
      <div className="consistency-suggestion">
        <strong>最小修复建议</strong>
        <p>{finding.suggestion}</p>
      </div>
      <div className="consistency-evidence-section">
        <div>
          <strong>证据</strong>
          <span>{finding.evidence.length}</span>
        </div>
        {finding.evidence.map((item, index) =>
          item.target ? (
            <button
              key={`${item.label}:${index}`}
              type="button"
              onClick={() => item.target && onOpenTarget(item.target)}
            >
              <span>
                <strong>{item.label}</strong>
                <small>{item.field}</small>
              </span>
              <p>{item.value}</p>
              <ExternalLink size={15} />
            </button>
          ) : (
            <div key={`${item.label}:${index}`}>
              <span>
                <strong>{item.label}</strong>
                <small>{item.field}</small>
              </span>
              <p>{item.value}</p>
            </div>
          )
        )}
      </div>
      <div className="consistency-status-actions">
        <button type="button" onClick={() => onStatusChange("resolved", "手动标记为已修复") }>
          <CheckCircle2 size={16} />
          <span>标记已修复</span>
        </button>
        <button type="button" onClick={() => onStatusChange("open", "") }>
          <RefreshCw size={16} />
          <span>重新打开</span>
        </button>
      </div>
      <div className="consistency-ignore-editor">
        <label>
          <span>忽略原因</span>
          <textarea
            rows={3}
            value={ignoreReason}
            onChange={(event) => onIgnoreReasonChange(event.target.value)}
          />
        </label>
        <button
          disabled={!ignoreReason.trim()}
          type="button"
          onClick={() => onStatusChange("ignored", ignoreReason)}
        >
          <Ban size={16} />
          <span>保存忽略记录</span>
        </button>
      </div>
      <div className="consistency-model-explanation">
        <div>
          <strong>AI 模型补充解释</strong>
          <Cpu size={17} />
        </div>
        {finding.explanation?.text ? (
          <p>{finding.explanation.text}</p>
        ) : (
          <p className="muted-text">尚未生成。规则结果本身不依赖模型。</p>
        )}
        <button disabled={!modelEnabled || modelBusy} type="button" onClick={onExplain}>
          {modelBusy ? <LoaderCircle className="is-spinning" size={16} /> : <Sparkles size={16} />}
          <span>{modelBusy ? "正在生成" : "生成补充解释"}</span>
        </button>
        {modelMessage ? <small>{modelMessage}</small> : null}
      </div>
    </>
  );
}
