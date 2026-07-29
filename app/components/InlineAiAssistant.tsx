"use client";

import {
  AlertTriangle,
  BookOpen,
  Brain,
  Check,
  ExternalLink,
  FileText,
  LoaderCircle,
  Minus,
  Pin,
  Play,
  Plus,
  RotateCcw,
  Scissors,
  ShieldCheck,
  Sparkles,
  X
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type {
  ReactNode,
  RefObject,
  TextareaHTMLAttributes
} from "react";
import type { AiMemoryItem } from "../ai-writing";
import {
  applyInlineAiResult,
  buildInlineAiContextPack,
  buildInlineAiDiff,
  buildInlineAiPrompt,
  normalizeInlineAiSelection,
  parseInlineAiResponse
} from "../inline-ai";
import { useDialogFocus } from "./useDialogFocus";
import type {
  InlineAiAction,
  InlineAiAnalysisRequest,
  InlineAiCommitRequest,
  InlineAiConsistencyPreview,
  InlineAiSelection,
  InlineAiSource,
  InlineAiSourcePreference,
  InlineAiTarget
} from "../inline-ai";

type CompletionResult = { ok: boolean; text?: string; model?: string; error?: string };
type CommitResult = { ok: boolean; error?: string };
type AnalysisResult = { ok: boolean; preview?: InlineAiConsistencyPreview; error?: string };

export type InlineAiRuntime = {
  enabled: boolean;
  model: string;
  getSources: () => InlineAiSource[];
  memories: AiMemoryItem[];
  onComplete: (request: {
    systemPrompt: string;
    prompt: string;
    maxTokens: number;
  }) => Promise<CompletionResult>;
  onAnalyze: (request: InlineAiAnalysisRequest) => Promise<AnalysisResult>;
  onCommit: (request: InlineAiCommitRequest) => Promise<CommitResult>;
  onOpenSettings: () => void;
  onOpenSource: (source: InlineAiSource) => void;
};

const InlineAiRuntimeContext = createContext<InlineAiRuntime | null>(null);

export function InlineAiProvider({
  children,
  runtime
}: {
  children: ReactNode;
  runtime: InlineAiRuntime;
}) {
  return (
    <InlineAiRuntimeContext.Provider value={runtime}>
      {children}
    </InlineAiRuntimeContext.Provider>
  );
}

const actionOptions: Array<{
  id: InlineAiAction;
  label: string;
  detail: string;
  icon: typeof Sparkles;
}> = [
  { id: "continue", label: "续写", detail: "从光标或选区后继续", icon: Play },
  { id: "rewrite", label: "改写", detail: "保持事实，重写表达", icon: Sparkles },
  { id: "shorten", label: "压缩", detail: "保留关键信息", icon: Scissors },
  { id: "expand", label: "扩展", detail: "补足动作与冲突", icon: Plus },
  { id: "tone", label: "语气", detail: "按要求调整文风", icon: FileText },
  { id: "consistency", label: "查冲突", detail: "依据来源修正冲突", icon: ShieldCheck },
  { id: "fix", label: "定点修复", detail: "只改指定问题", icon: AlertTriangle }
];

function sourcePreference(
  preferences: InlineAiSourcePreference[],
  sourceId: string
) {
  return preferences.find((item) => item.sourceId === sourceId);
}

function updatePreference(
  preferences: InlineAiSourcePreference[],
  sourceId: string,
  patch: Partial<InlineAiSourcePreference>
) {
  const current = sourcePreference(preferences, sourceId) ?? { sourceId };
  return [
    ...preferences.filter((item) => item.sourceId !== sourceId),
    { ...current, ...patch, sourceId }
  ];
}

export function InlineAiAssistant({
  getSelection,
  getStoredValue,
  getUnavailableReason,
  storedValue,
  target,
  value
}: {
  getSelection?: () => Partial<InlineAiSelection> | null;
  getStoredValue?: (after: string, responseText: string, action: InlineAiAction) => string | Promise<string>;
  getUnavailableReason?: () => string;
  storedValue?: string;
  target: InlineAiTarget;
  value: string;
}) {
  const runtime = useContext(InlineAiRuntimeContext);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<InlineAiAction>("rewrite");
  const [instruction, setInstruction] = useState("");
  const [preferences, setPreferences] = useState<InlineAiSourcePreference[]>([]);
  const [excludedMemoryIds, setExcludedMemoryIds] = useState<string[]>([]);
  const [sourceQuery, setSourceQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [selection, setSelection] = useState<InlineAiSelection>(() =>
    normalizeInlineAiSelection(value)
  );
  const [generation, setGeneration] = useState<{
    raw: string;
    model: string;
    response: ReturnType<typeof parseInlineAiResponse>;
    after: string;
  } | null>(null);
  const [preflight, setPreflight] = useState<{
    key: string;
    preview: InlineAiConsistencyPreview;
  } | null>(null);
  const sheetRef = useRef<HTMLElement>(null);
  useDialogFocus({
    containerRef: sheetRef,
    onClose: () => setOpen(false),
    open
  });

  const getSources = runtime?.getSources;
  const activeSources = useMemo(
    () => (getSources && open ? getSources() : []),
    [getSources, open]
  );

  const pack = useMemo(
    () =>
      runtime
        ? buildInlineAiContextPack({
            currentText: value,
            memories: runtime.memories.filter((memory) => !excludedMemoryIds.includes(memory.id)),
            preferences,
            selection,
            sources: activeSources,
            target
          })
        : null,
    [activeSources, excludedMemoryIds, preferences, runtime, selection, target, value]
  );

  const diff = useMemo(
    () => (generation ? buildInlineAiDiff(value, generation.after) : null),
    [generation, value]
  );

  const visibleSourceSearch = useMemo(() => {
    if (!runtime) return [];
    const query = sourceQuery.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
    if (!query) return [];
    return activeSources
      .filter((source) =>
        `${source.label}\n${source.detail}`
          .normalize("NFKC")
          .toLocaleLowerCase("zh-CN")
          .includes(query)
      )
      .slice(0, 30);
  }, [activeSources, runtime, sourceQuery]);

  useEffect(() => {
    setGeneration(null);
    setPreflight(null);
    setMessage("");
  }, [action, target.fieldPath, target.objectId]);

  function openAssistant() {
    setSelection(normalizeInlineAiSelection(value, getSelection?.()));
    setOpen(true);
    setMessage("");
  }

  async function generate() {
    if (!runtime || !pack) return;
    const unavailableReason = getUnavailableReason?.();
    if (unavailableReason) {
      setMessage(unavailableReason);
      return;
    }
    if (!runtime.enabled) {
      setMessage("先启用并连接本地或第三方 AI 模型。\n");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const prompt = buildInlineAiPrompt(action, instruction, pack);
      const result = await runtime.onComplete(prompt);
      if (!result.ok || !result.text) {
        setMessage(result.error || "AI 没有返回可用文本");
        return;
      }
      const response = parseInlineAiResponse(
        result.text,
        pack.sources.map((item) => item.source.id),
        pack.memories.map((item) => item.memory.id)
      );
      if (!response.text) {
        setMessage("AI 返回的正文为空，请调整指令后重试");
        return;
      }
      setGeneration({
        raw: result.text,
        model: result.model || runtime.model,
        response,
        after: applyInlineAiResult(value, response.text, action, selection)
      });
      setPreflight(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 生成失败");
    } finally {
      setBusy(false);
    }
  }

  async function applyGeneration() {
    if (!runtime || !pack || !generation || !diff?.changed) return;
    setBusy(true);
    setMessage("");
    try {
      const storedAfter = getStoredValue
        ? await getStoredValue(generation.after, generation.response.text, action)
        : generation.after;
      const storedBefore = storedValue ?? value;
      const preflightKey = `${target.contextId}\u0000${target.fieldPath}\u0000${storedBefore}\u0000${storedAfter}`;
      let consistencyPreview = preflight?.key === preflightKey ? preflight.preview : null;
      if (!consistencyPreview) {
        const analysis = await runtime.onAnalyze({ target, storedBefore, storedAfter });
        if (!analysis.ok || !analysis.preview) {
          setMessage(analysis.error || "一致性预检失败，修改尚未应用");
          return;
        }
        consistencyPreview = analysis.preview;
        if (consistencyPreview.introducedIssues.length) {
          setPreflight({ key: preflightKey, preview: consistencyPreview });
          setMessage(`本次修改新增 ${consistencyPreview.introducedIssues.length} 个重要一致性问题。请核对后再次点击应用。`);
          return;
        }
      }
      const result = await runtime.onCommit({
        target,
        action,
        instruction,
        selection,
        before: value,
        after: generation.after,
        storedBefore,
        storedAfter,
        response: generation.response,
        sourceSnapshot: pack.sourceSnapshot,
        memorySnapshot: pack.memorySnapshot,
        model: generation.model,
        consistencyPreview
      });
      if (!result.ok) {
        setMessage(result.error || "AI 修改未能写入项目");
        return;
      }
      setOpen(false);
      setGeneration(null);
      setPreflight(null);
      setInstruction("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 修改未能写入项目");
    } finally {
      setBusy(false);
    }
  }

  if (!runtime) return null;

  return (
    <>
      <button
        aria-label={`使用 AI 编辑${target.fieldLabel}`}
        className="inline-ai-trigger"
        title={`使用 AI 编辑${target.fieldLabel}`}
        type="button"
        onClick={openAssistant}
      >
        <Sparkles size={15} />
      </button>

      {open ? (
        <div className="inline-ai-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section
            ref={sheetRef}
            aria-label={`AI 编辑 ${target.fieldLabel}`}
            aria-modal="true"
            className="inline-ai-sheet"
            role="dialog"
            tabIndex={-1}
          >
            <header className="inline-ai-header">
              <div>
                <span><Sparkles size={15} /> 编辑器内 AI</span>
                <h2>{target.fieldLabel}</h2>
                <p>{selection.text ? `已选 ${selection.text.length} 字，只修改选区` : "当前字段"}</p>
              </div>
              <button aria-label="关闭编辑器内 AI" title="关闭" type="button" onClick={() => setOpen(false)}>
                <X size={19} />
              </button>
            </header>

            {!runtime.enabled ? (
              <div className="inline-ai-disabled">
                <AlertTriangle size={20} />
                <div>
                  <strong>AI 尚未启用</strong>
                  <span>连接本地或第三方 OpenAI-compatible 模型后即可在当前字段使用。</span>
                </div>
                <button type="button" onClick={() => { setOpen(false); runtime.onOpenSettings(); }}>
                  打开 AI 设置
                </button>
              </div>
            ) : (
              <>
                <div className="inline-ai-action-grid" role="group" aria-label="AI 编辑操作">
                  {actionOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        className={action === option.id ? "is-active" : ""}
                        key={option.id}
                        type="button"
                        onClick={() => setAction(option.id)}
                      >
                        <Icon size={15} />
                        <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                      </button>
                    );
                  })}
                </div>

                <label className="inline-ai-instruction">
                  <span>补充要求</span>
                  <textarea
                    aria-label="AI 编辑补充要求"
                    placeholder={action === "tone" ? "例如：冷峻、克制，减少形容词" : "可选，说明必须保留或修复的内容"}
                    rows={3}
                    value={instruction}
                    onChange={(event) => setInstruction(event.target.value)}
                  />
                </label>

                <details className="inline-ai-context" open={!generation}>
                  <summary>
                    <BookOpen size={15} />
                    <span>本轮上下文</span>
                    <small>{pack?.sources.length || 0} 个来源 · {pack?.memories.length || 0} 条记忆 · {(pack?.characters || 0).toLocaleString("zh-CN")} 字符</small>
                  </summary>
                  <div className="inline-ai-context-body">
                    <label className="inline-ai-source-search">
                      <span>添加来源</span>
                      <input
                        aria-label="搜索 AI 项目来源"
                        placeholder="搜索角色、任务或场景"
                        value={sourceQuery}
                        onChange={(event) => setSourceQuery(event.target.value)}
                      />
                    </label>
                    {visibleSourceSearch.length ? (
                      <div className="inline-ai-source-results">
                        {visibleSourceSearch.map((source) => (
                          <button
                            key={source.id}
                            type="button"
                            onClick={() => {
                              setPreferences((current) => updatePreference(current, source.id, { pinned: true, excluded: false }));
                              setSourceQuery("");
                            }}
                          >
                            <Plus size={14} /><span>{source.label}</span><small>{source.detail}</small>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="inline-ai-source-list">
                      {pack?.sources.map((item) => {
                        const preference = sourcePreference(preferences, item.source.id);
                        return (
                          <div key={item.source.id}>
                            <button
                              aria-label={`打开来源 ${item.source.label}`}
                              title="打开来源"
                              type="button"
                              onClick={() => runtime.onOpenSource(item.source)}
                            >
                              <ExternalLink size={14} />
                            </button>
                            <span><strong>{item.source.label}</strong><small>{item.source.detail} · {item.reasons.join("、")}</small></span>
                            <button
                              aria-label={`降低 ${item.source.label} 优先级`}
                              title="降低优先级"
                              type="button"
                              onClick={() => setPreferences((current) => updatePreference(current, item.source.id, { priority: (preference?.priority || 0) - 1 }))}
                            >
                              <Minus size={13} />
                            </button>
                            <em>{preference?.priority || 0}</em>
                            <button
                              aria-label={`提高 ${item.source.label} 优先级`}
                              title="提高优先级"
                              type="button"
                              onClick={() => setPreferences((current) => updatePreference(current, item.source.id, { priority: (preference?.priority || 0) + 1 }))}
                            >
                              <Plus size={13} />
                            </button>
                            <button
                              aria-label={item.pinned ? `取消固定 ${item.source.label}` : `固定 ${item.source.label}`}
                              className={item.pinned ? "is-active" : ""}
                              title={item.pinned ? "取消固定" : "固定来源"}
                              type="button"
                              onClick={() => setPreferences((current) => updatePreference(current, item.source.id, { pinned: !item.pinned, excluded: false }))}
                            >
                              <Pin size={14} />
                            </button>
                            <button
                              aria-label={`排除 ${item.source.label}`}
                              title="本轮排除"
                              type="button"
                              onClick={() => setPreferences((current) => updatePreference(current, item.source.id, { excluded: true, pinned: false }))}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {pack?.memories.length ? (
                      <div className="inline-ai-memory-list">
                        <span><Brain size={14} />召回记忆</span>
                        {pack.memories.map((item) => (
                          <div key={item.memory.id}>
                            <button
                              aria-label={`本轮排除记忆 ${item.memory.title}`}
                              title="本轮排除"
                              type="button"
                              onClick={() => setExcludedMemoryIds((current) => [...current, item.memory.id])}
                            ><X size={13} /></button>
                            <strong>{item.memory.title}</strong>
                            <small>{item.reasons.join("、")}</small>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </details>

                {generation && diff ? (
                  <div className="inline-ai-result">
                    <div className="inline-ai-result-meta">
                      <span>{generation.response.newCreation ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}{generation.response.newCreation ? "包含无来源的新创作" : "已标注事实来源"}</span>
                      <small>{generation.model}</small>
                    </div>
                    <div className="inline-ai-diff" aria-label="AI 修改差异">
                      <div><span>原文</span><pre>{diff.removed || "未删除内容"}</pre></div>
                      <div><span>建议</span><pre>{diff.added || "未新增内容"}</pre></div>
                    </div>
                    {generation.response.notes ? <p className="inline-ai-notes">{generation.response.notes}</p> : null}
                    <div className="inline-ai-used-sources">
                      <strong>实际依据</strong>
                      {generation.response.sourceIds.map((id) => {
                        const source = activeSources.find((item) => item.id === id);
                        return source ? <button key={id} type="button" onClick={() => runtime.onOpenSource(source)}>{source.label}<ExternalLink size={12} /></button> : null;
                      })}
                      {generation.response.memoryIds.map((id) => {
                        const memory = runtime.memories.find((item) => item.id === id);
                        return memory ? <span key={id}><Brain size={12} />{memory.title}</span> : null;
                      })}
                      {!generation.response.sourceIds.length && !generation.response.memoryIds.length ? <em>无项目来源，按新创作处理</em> : null}
                    </div>
                    {generation.response.candidateFacts.length ? (
                      <div className="inline-ai-candidate-facts">
                        <strong>候选事实 · 应用后存入草稿记忆</strong>
                        {generation.response.candidateFacts.map((fact, index) => (
                          <div key={`${fact.title}-${index}`}><span>{fact.title}</span><small>{fact.content}</small></div>
                        ))}
                      </div>
                    ) : null}
                    {preflight?.preview.introducedIssues.length ? (
                      <div className="inline-ai-consistency-warning" role="alert">
                        <div><AlertTriangle size={15} /><strong>一致性风险</strong><span>{preflight.preview.beforeCount} → {preflight.preview.afterCount} 项</span></div>
                        {preflight.preview.introducedIssues.map((issue) => (
                          <article key={issue.fingerprint}><strong>{issue.severity === "critical" ? "严重" : "主要"} · {issue.title}</strong><p>{issue.detail}</p><small>{issue.suggestion}</small></article>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {message ? <p className="inline-ai-message" role="status">{message}</p> : null}

                <footer className="inline-ai-footer">
                  {generation ? (
                    <button disabled={busy} type="button" onClick={() => void generate()}>
                      <RotateCcw size={15} /><span>重新生成</span>
                    </button>
                  ) : <span />}
                  <button className="inline-ai-primary" disabled={busy || (generation ? !diff?.changed : false)} type="button" onClick={() => void (generation ? applyGeneration() : generate())}>
                    {busy ? <LoaderCircle className="is-spinning" size={16} /> : generation ? <Check size={16} /> : <Sparkles size={16} />}
                    <span>{busy ? "处理中" : generation ? preflight?.preview.introducedIssues.length ? "仍然应用这次修改" : "应用到当前字段" : "生成建议"}</span>
                  </button>
                </footer>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

type InlineAiTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  aiTarget: InlineAiTarget;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
};

export function InlineAiTextarea({
  aiTarget,
  onChange,
  textareaRef,
  value,
  ...props
}: InlineAiTextareaProps) {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = textareaRef ?? localRef;
  return (
    <div className="inline-ai-textarea-control">
      <textarea
        {...props}
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <InlineAiAssistant
        getSelection={() => ({
          start: ref.current?.selectionStart ?? 0,
          end: ref.current?.selectionEnd ?? 0
        })}
        target={aiTarget}
        value={value}
      />
    </div>
  );
}
