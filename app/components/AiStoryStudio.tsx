"use client";

import {
  AlignLeft,
  AlertTriangle,
  Archive,
  ArrowUpRight,
  BookOpenCheck,
  Brain,
  Check,
  CircleDot,
  CircleStop,
  Eye,
  EyeOff,
  FileClock,
  Flag,
  History,
  ListChecks,
  LoaderCircle,
  Link2,
  LocateFixed,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Quote,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  Trash2,
  WandSparkles
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyAiEditSuggestion,
  createAiWritingId,
  createAiWritingSession,
  detectAiMemoryConflicts,
  normalizeAiMemoryItem,
  parseAiReviewPayload,
  type AiMemoryCategory,
  type AiMemoryConflict,
  type AiMemoryItem,
  type AiMemoryRelationKind,
  type AiWritingRound,
  type AiWritingSession
} from "../ai-writing";
import { buildHybridMemoryBundle } from "../ai-hybrid-memory";
import type { ConsistencyModelSettings } from "../consistency";
import type { AiContext } from "./AiWorkspace";

type AiResult = {
  ok: boolean;
  text?: string;
  model?: string;
  error?: string;
  cancelled?: boolean;
};
type AiRequest = { systemPrompt: string; prompt: string; maxTokens: number };

const memoryCategoryLabels: Record<AiMemoryCategory, string> = {
  canon: "世界事实",
  character: "角色状态",
  plot: "剧情进展",
  rule: "创作规则",
  "open-loop": "未解线索"
};
const memoryRelationLabels: Record<AiMemoryRelationKind, string> = {
  supports: "支持",
  contradicts: "矛盾",
  "depends-on": "依赖",
  supersedes: "取代",
  related: "相关"
};
const memorySourceLabels = {
  manual: "作者录入",
  project: "项目内容",
  "ai-draft": "AI 写作正文",
  imported: "旧版或导入"
};
const memoryAuthorityLabels = {
  pinned: "置顶事实",
  confirmed: "作者确认",
  draft: "草稿记忆"
};
const inlineActionLabels: Record<string, string> = {
  continue: "续写",
  rewrite: "改写",
  shorten: "缩短",
  expand: "扩写",
  tone: "调整语气",
  consistency: "一致性修正",
  fix: "定点修复"
};

function round(
  kind: AiWritingRound["kind"],
  model: string,
  content: string,
  memorySnapshot: string
): AiWritingRound {
  return {
    id: createAiWritingId("ai-round"),
    kind,
    model,
    content,
    memorySnapshot,
    createdAt: new Date().toISOString()
  };
}

export function AiStoryStudio({
  contexts,
  initialContextId,
  memories,
  sessions,
  settings,
  onAddMemories,
  onApplyDraft,
  onCancelCompletion,
  onComplete,
  onCompleteStream,
  onCreateSession,
  onDeleteMemory,
  onDeleteSession,
  onOpenTarget,
  onUndoInlineEdit,
  onUpdateMemory,
  onUpdateSession
}: {
  contexts: AiContext[];
  initialContextId: string;
  memories: AiMemoryItem[];
  sessions: AiWritingSession[];
  settings: ConsistencyModelSettings;
  onAddMemories: (items: AiMemoryItem[]) => void;
  onApplyDraft: (context: AiContext, draft: string) => Promise<{ ok: boolean; error?: string }>;
  onCancelCompletion: (requestId: string) => Promise<{ ok: boolean; error?: string }>;
  onComplete: (request: AiRequest) => Promise<AiResult>;
  onCompleteStream: (
    request: AiRequest,
    requestId: string,
    onDelta: (delta: string) => void
  ) => Promise<AiResult>;
  onCreateSession: (session: AiWritingSession) => void;
  onDeleteMemory: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onOpenTarget: (context: AiContext) => void;
  onUndoInlineEdit: (sessionId: string) => Promise<{ ok: boolean; error?: string }>;
  onUpdateMemory: (id: string, patch: Partial<AiMemoryItem>) => void;
  onUpdateSession: (id: string, patch: Partial<AiWritingSession>) => void;
}) {
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id || "");
  const [libraryMode, setLibraryMode] = useState<"sessions" | "memory">("sessions");
  const [sessionPanel, setSessionPanel] = useState<"draft" | "review" | "history">("draft");
  const [memoryPanel, setMemoryPanel] = useState<"fact" | "sources" | "relations" | "conflicts">("fact");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [busy, setBusy] = useState<"plan" | "write" | "review" | "deep" | "undo" | "apply" | "">("");
  const [message, setMessage] = useState("");
  const [selectedMemoryId, setSelectedMemoryId] = useState(memories[0]?.id || "");
  const [relationKind, setRelationKind] = useState<AiMemoryRelationKind>("related");
  const [relationTargetId, setRelationTargetId] = useState("");
  const [relationNote, setRelationNote] = useState("");
  const [pendingLocateQuote, setPendingLocateQuote] = useState("");
  const [activeStreamId, setActiveStreamId] = useState("");
  const [activeStreamSessionId, setActiveStreamSessionId] = useState("");
  const [streamingDraft, setStreamingDraft] = useState("");
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const activeStreamIdRef = useRef("");

  useEffect(() => {
    if (!sessions.length && !memories.length) return;
    if (window.matchMedia("(max-width: 700px)").matches) setLibraryOpen(false);
  }, []);
  const session = sessions.find((item) => item.id === selectedSessionId) ?? sessions[0] ?? null;
  const context = contexts.find((item) => item.id === session?.targetContextId) ?? contexts[0] ?? null;
  const selectedMemory = memories.find((item) => item.id === selectedMemoryId) ?? memories[0] ?? null;
  const retrievalQuery = session
    ? `${session.title}\n${session.goal}\n${session.outline}\n${context?.text || ""}`
    : "";
  const hybridMemory = useMemo(
    () => session
      ? buildHybridMemoryBundle({
          query: retrievalQuery,
          memories,
          sources: contexts,
          targetContextId: session.targetContextId,
          semantic: session.semanticRecallEnabled
        })
      : { memories: [], projectSources: [], snapshot: "", characters: 0 },
    [contexts, memories, retrievalQuery, session?.semanticRecallEnabled, session?.targetContextId]
  );
  const relevantMemoryMatches = hybridMemory.memories;
  const relevantProjectSources = hybridMemory.projectSources;
  const memoryConflicts = useMemo(() => detectAiMemoryConflicts(memories), [memories]);
  const selectedMemoryConflicts = useMemo(
    () => selectedMemory
      ? memoryConflicts.filter(
          (item) => item.leftMemoryId === selectedMemory.id || item.rightMemoryId === selectedMemory.id
        )
      : [],
    [memoryConflicts, selectedMemory]
  );
  const filteredSessions = useMemo(() => {
    const query = libraryQuery.trim().toLocaleLowerCase("zh-CN");
    return query
      ? sessions.filter((item) => `${item.title}\n${item.goal}`.toLocaleLowerCase("zh-CN").includes(query))
      : sessions;
  }, [libraryQuery, sessions]);
  const filteredMemories = useMemo(() => {
    const query = libraryQuery.trim().toLocaleLowerCase("zh-CN");
    return query
      ? memories.filter((item) => `${item.title}\n${item.content}\n${item.tags.join(" ")}`.toLocaleLowerCase("zh-CN").includes(query))
      : memories;
  }, [libraryQuery, memories]);

  useEffect(() => {
    if (session) setSelectedSessionId(session.id);
  }, [session?.id]);

  useEffect(() => {
    activeStreamIdRef.current = activeStreamId;
  }, [activeStreamId]);

  useEffect(
    () => () => {
      if (activeStreamIdRef.current) {
        void onCancelCompletion(activeStreamIdRef.current);
      }
    },
    [onCancelCompletion]
  );

  useEffect(() => {
    if (sessionPanel !== "draft" || !pendingLocateQuote || !session || !draftRef.current) return;
    const index = session.draft.indexOf(pendingLocateQuote);
    if (index < 0) {
      setMessage("原句已被修改，无法精确定位");
      setPendingLocateQuote("");
      return;
    }
    draftRef.current.focus();
    draftRef.current.setSelectionRange(index, index + pendingLocateQuote.length);
    const ratio = index / Math.max(1, session.draft.length);
    draftRef.current.scrollTop = ratio * draftRef.current.scrollHeight;
    setMessage(`已定位第 ${index + 1} 个字符附近`);
    setPendingLocateQuote("");
  }, [pendingLocateQuote, session, sessionPanel]);

  function createSession() {
    const next = createAiWritingSession(
      contexts[0]?.id.split(":")[1] || "",
      initialContextId || contexts[0]?.id || "",
      `剧情写作 ${sessions.length + 1}`
    );
    onCreateSession(next);
    setSelectedSessionId(next.id);
    setLibraryMode("sessions");
    setSessionPanel("draft");
  }

  function createMemory() {
    const worldId = session?.worldId || contexts[0]?.id.split(":")[1] || "";
    const next = normalizeAiMemoryItem(
      {
        id: createAiWritingId("ai-memory"),
        title: `新记忆 ${memories.length + 1}`,
        content: "",
        state: "confirmed",
        pinned: true,
        sourceContextId: session?.targetContextId || initialContextId,
        sources: [{
          id: createAiWritingId("ai-source"),
          kind: "manual",
          contextId: session?.targetContextId || initialContextId,
          contextLabel: context?.label || "作者手动录入",
          writingSessionId: session?.id || "",
          excerpt: "",
          capturedAt: new Date().toISOString()
        }],
        lastVerifiedAt: new Date().toISOString()
      },
      worldId
    );
    onAddMemories([next]);
    setSelectedMemoryId(next.id);
    setLibraryMode("memory");
    setMemoryPanel("fact");
  }

  function memorySnapshot() {
    return hybridMemory.snapshot;
  }

  async function generatePlan(baseSession = session) {
    if (!baseSession || !context) return null;
    const snapshot = memorySnapshot();
    setMessage("正在策划情节与连续性约束...");
    const result = await onComplete({
      systemPrompt:
        "你是资深游戏叙事总监。先做结构规划，不写完整正文。必须遵守作者确认记忆；草稿记忆若冲突，以作者确认为准。",
      prompt: `写作目标：${baseSession.goal || "根据当前上下文推进剧情"}\n风格：${baseSession.style}\n硬约束：${baseSession.constraints}\n\n混合记忆与相关项目原文：\n${snapshot || "- 暂无相关记忆或原文"}\n\n当前目标内容：\n${context.text.slice(0, 22000)}\n\n输出中文提纲，包含：场景目标、冲突升级、人物动机、节拍、伏笔回收、不能违背的事实、仍需作者确认的问题。`,
      maxTokens: 2400
    });
    if (!result.ok || !result.text) {
      setMessage(result.error || "策划阶段没有返回内容");
      return null;
    }
    onUpdateSession(baseSession.id, {
      outline: result.text,
      status: "drafting",
      rounds: [...baseSession.rounds, round("plan", result.model || settings.model, result.text, snapshot)]
    });
    return { outline: result.text, snapshot, model: result.model || settings.model };
  }

  async function generateDraft(baseSession = session, plannedOutline?: string, snapshotOverride?: string) {
    if (!baseSession || !context) return null;
    const snapshot = snapshotOverride ?? memorySnapshot();
    const outline = plannedOutline ?? baseSession.outline;
    const requestId = createAiWritingId("ai-stream");
    let streamed = "";
    setStreamingDraft("");
    setActiveStreamId(requestId);
    setActiveStreamSessionId(baseSession.id);
    setMessage("正在依据提纲、作者确认事实和未闭合线索流式写作...");
    let result: AiResult;
    try {
      result = await onCompleteStream(
        {
          systemPrompt:
            "你是高水平游戏剧情作者。持续检查人物动机、时间顺序、因果关系和伏笔。作者确认事实的优先级最高，不得擅自改变。只输出可直接编辑的完整正文，不要解释写作过程。",
          prompt: `写作目标：${baseSession.goal || "推进当前剧情"}\n风格：${baseSession.style}\n硬约束：${baseSession.constraints}\n\n混合记忆与相关项目原文：\n${snapshot || "- 暂无相关记忆或原文"}\n\n已确认提纲：\n${outline.slice(0, 10000)}\n\n项目上下文：\n${context.text.slice(0, 32000)}\n\n现有草稿（若有，请在完整输出中保留应继续存在的内容）：\n${baseSession.draft.slice(-18000) || "- 无"}`,
          maxTokens: 8192
        },
        requestId,
        (delta) => {
          streamed += delta;
          setStreamingDraft(streamed);
        }
      );
    } finally {
      setActiveStreamId("");
      setActiveStreamSessionId("");
    }
    const generated = result.text || streamed;
    if (!result.ok || !generated) {
      if (generated) {
        const partialRounds = [
          ...baseSession.rounds,
          round("draft", result.model || settings.model, generated, snapshot)
        ];
        onUpdateSession(baseSession.id, {
          outline,
          draft: generated,
          status: "drafting",
          rounds: partialRounds
        });
        setMessage(result.cancelled ? "生成已停止，当前正文已保留" : "连接中断，已保留生成到的正文");
      } else {
        setMessage(result.error || "写作阶段没有返回内容");
      }
      return null;
    }
    const rounds = [
      ...baseSession.rounds,
      ...(plannedOutline && !baseSession.rounds.some((item) => item.content === plannedOutline)
        ? [round("plan", result.model || settings.model, plannedOutline, snapshot)]
        : []),
      round("draft", result.model || settings.model, generated, snapshot)
    ];
    onUpdateSession(baseSession.id, { outline, draft: generated, status: "drafting", rounds });
    setStreamingDraft("");
    return { draft: generated, snapshot, model: result.model || settings.model, rounds };
  }

  async function reviewDraft(baseSession = session, draftOverride?: string, roundsOverride?: AiWritingRound[]) {
    if (!baseSession || !context) return null;
    const draft = draftOverride ?? baseSession.draft;
    if (!draft.trim()) {
      setMessage("请先生成或填写正文");
      return null;
    }
    const snapshot = memorySnapshot();
    setMessage("正在审校连续性并定位可修改原句...");
    const result = await onComplete({
      systemPrompt:
        "你是严格的游戏叙事主编和连续性审校员。只输出有效 JSON，不使用 Markdown。每条 quote 必须逐字复制自正文，确保编辑器可以精确定位。",
      prompt: `对正文进行连续性、人物动机、节奏、信息揭示和语言审校。\n\n混合记忆与相关项目原文：\n${snapshot || "- 暂无"}\n\n作者约束：\n${baseSession.constraints}\n\n正文：\n${draft.slice(0, 36000)}\n\n提取的每条记忆都要尽量拆成可核验的主语、属性和值。sourceQuote 必须逐字来自正文；无法定位时返回空字符串。\n\n严格输出：{"summary":"总体审校结论","suggestions":[{"quote":"正文中的精确原句","replacement":"建议替换文本","reason":"修改原因","severity":"important或normal"}],"memories":[{"category":"canon|character|plot|rule|open-loop","title":"记忆标题","content":"本轮新产生且后续必须记住的事实","subject":"事实主体","property":"关系|状态|位置|所有权|知情|事件|规则等具体属性","value":"事实值","temporalScope":"生效章节、时间点或持续有效","sourceQuote":"正文中的精确来源原句","tags":["人物或地点关键词"]}]}`,
      maxTokens: 3000
    });
    if (!result.ok || !result.text) {
      setMessage(result.error || "审校阶段没有返回内容");
      return null;
    }
    const parsed = parseAiReviewPayload(result.text, draft);
    const suggestions = parsed.suggestions.map((item) => ({
      ...item,
      id: createAiWritingId("ai-suggestion"),
      status: "open" as const
    }));
    const newMemories = parsed.memories.map((item) =>
      normalizeAiMemoryItem(
        {
          category: item.category,
          title: item.title,
          content: item.content,
          id: createAiWritingId("ai-memory"),
          state: "draft",
          sourceContextId: baseSession.targetContextId,
          fact: {
            subject: item.subject,
            property: item.property,
            value: item.value,
            temporalScope: item.temporalScope
          },
          tags: item.tags,
          sources: [{
            id: createAiWritingId("ai-source"),
            kind: "ai-draft",
            contextId: baseSession.targetContextId,
            contextLabel: context.label,
            writingSessionId: baseSession.id,
            excerpt: item.sourceQuote,
            capturedAt: new Date().toISOString()
          }]
        },
        baseSession.worldId
      )
    );
    if (newMemories.length) onAddMemories(newMemories);
    onUpdateSession(baseSession.id, {
      draft,
      reviewSummary: parsed.summary,
      suggestions,
      status: "reviewed",
      rounds: [
        ...(roundsOverride ?? baseSession.rounds),
        round("review", result.model || settings.model, result.text, snapshot)
      ]
    });
    setMessage(`审校完成 · 定位 ${suggestions.length} 处 · 新增记忆 ${newMemories.length} 条`);
    setSessionPanel("review");
    return parsed;
  }

  async function runDeepWriting() {
    if (!session || !context) return;
    setBusy("deep");
    try {
      const plan = await generatePlan(session);
      if (!plan) return;
      const drafted = await generateDraft(session, plan.outline, plan.snapshot);
      if (!drafted) return;
      await reviewDraft(session, drafted.draft, drafted.rounds);
    } finally {
      setBusy("");
    }
  }

  async function cancelActiveGeneration() {
    if (!activeStreamId) return;
    setMessage("正在停止生成，已收到的正文会保留...");
    const result = await onCancelCompletion(activeStreamId);
    if (!result.ok) setMessage(result.error || "停止生成失败");
  }

  function checkpoint() {
    if (!session?.draft.trim()) return;
    onUpdateSession(session.id, {
      rounds: [
        ...session.rounds,
        round("checkpoint", "manual", session.draft, memorySnapshot())
      ]
    });
    setMessage("已保存手动检查点");
  }

  async function applyDraftToProject() {
    if (!session?.draft.trim() || !context || context.kind === "world" || busy) return;
    setBusy("apply");
    setMessage("正在创建检查点并写入项目目标...");
    const result = await onApplyDraft(context, session.draft);
    if (!result.ok) setMessage(result.error || "AI 草稿写入失败");
    setBusy("");
  }

  async function undoInlineEdit() {
    if (!session?.inlineEdit || session.inlineEdit.status !== "applied") return;
    setBusy("undo");
    setMessage("正在核对字段并创建撤销检查点...");
    const result = await onUndoInlineEdit(session.id);
    setMessage(result.ok ? "字段已恢复到 AI 修改前的版本" : result.error || "撤销失败");
    setBusy("");
  }

  function locateSuggestion(quote: string) {
    if (!session) return;
    setPendingLocateQuote(quote);
    setSessionPanel("draft");
  }

  function applySuggestion(suggestionId: string) {
    if (!session) return;
    const suggestion = session.suggestions.find((item) => item.id === suggestionId);
    if (!suggestion) return;
    const nextDraft = applyAiEditSuggestion(session.draft, suggestion);
    if (nextDraft == null) return setMessage("原句已变化，请重新审校后再应用");
    onUpdateSession(session.id, {
      draft: nextDraft,
      suggestions: session.suggestions.map((item) =>
        item.id === suggestionId ? { ...item, status: "applied" } : item
      )
    });
    setMessage("建议已应用，旧版本仍保留在写作轮次中");
    setSessionPanel("draft");
  }

  function setMemoryState(state: AiMemoryItem["state"]) {
    if (!selectedMemory) return;
    onUpdateMemory(selectedMemory.id, {
      state,
      lastVerifiedAt: state === "confirmed" ? new Date().toISOString() : selectedMemory.lastVerifiedAt
    });
  }

  function addMemoryRelation() {
    if (!selectedMemory || !relationTargetId || relationTargetId === selectedMemory.id) return;
    onUpdateMemory(selectedMemory.id, {
      relations: [
        ...selectedMemory.relations,
        {
          id: createAiWritingId("ai-relation"),
          kind: relationKind,
          targetMemoryId: relationTargetId,
          note: relationNote.trim(),
          createdAt: new Date().toISOString()
        }
      ]
    });
    setRelationNote("");
    setMessage("记忆关系已建立");
  }

  function resolveConflict(conflict: AiMemoryConflict, winnerId: string) {
    const loserId = conflict.leftMemoryId === winnerId ? conflict.rightMemoryId : conflict.leftMemoryId;
    const winner = memories.find((item) => item.id === winnerId);
    if (!winner) return;
    const alreadyLinked = winner.relations.some(
      (relation) => relation.kind === "supersedes" && relation.targetMemoryId === loserId
    );
    onUpdateMemory(winnerId, {
      state: "confirmed",
      lastVerifiedAt: new Date().toISOString(),
      relations: alreadyLinked
        ? winner.relations
        : [...winner.relations, {
            id: createAiWritingId("ai-relation"),
            kind: "supersedes",
            targetMemoryId: loserId,
            note: `解决冲突：${conflict.summary}`,
            createdAt: new Date().toISOString()
          }]
    });
    onUpdateMemory(loserId, { state: "superseded" });
    setSelectedMemoryId(winnerId);
    setLibraryMode("memory");
    setMessage("冲突已解决，保留项已确认，另一项已停用");
  }

  function ignoreConflict(conflict: AiMemoryConflict) {
    const memory = memories.find((item) => item.id === conflict.leftMemoryId);
    if (!memory) return;
    onUpdateMemory(memory.id, {
      ignoredConflictIds: [...memory.ignoredConflictIds, conflict.id]
    });
    setMessage("本组差异已忽略，后续不会重复提示");
  }

  return (
    <div className={`ai-story-layout ${libraryOpen ? "is-library-open" : "is-library-closed"}`}>
      {libraryOpen ? <aside className="ai-story-library">
        <div className="ai-story-library-heading">
        <div className="ai-story-library-tabs" role="group" aria-label="AI 写作资料">
          <button className={libraryMode === "sessions" ? "is-active" : ""} type="button" onClick={() => { setLibraryMode("sessions"); setLibraryQuery(""); setMessage(""); }}><FileClock size={15} />写作</button>
          <button className={libraryMode === "memory" ? "is-active" : ""} type="button" onClick={() => { setLibraryMode("memory"); setLibraryQuery(""); setMessage(""); }}><Brain size={15} />记忆{memoryConflicts.length ? <small>{memoryConflicts.length}</small> : null}</button>
        </div>
        <button className="ai-story-library-close" aria-label="收起写作资料" title="收起写作资料" type="button" onClick={() => setLibraryOpen(false)}><PanelLeftClose size={16} /></button>
        </div>
        <button className="ai-story-new" type="button" onClick={libraryMode === "sessions" ? createSession : createMemory}><Plus size={16} /><span>{libraryMode === "sessions" ? "新建写作" : "添加记忆"}</span></button>
        <label className="ai-story-library-search"><Search size={14} /><input aria-label={libraryMode === "sessions" ? "搜索写作会话" : "搜索长期记忆"} placeholder="搜索" value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} /></label>
        {libraryMode === "sessions" ? (
          <div className="ai-story-list">
            {filteredSessions.map((item) => <button className={item.id === session?.id ? "is-active" : ""} key={item.id} type="button" onClick={() => { setSelectedSessionId(item.id); setSessionPanel("draft"); }}><strong>{item.title}</strong><span>{item.inlineEdit ? item.inlineEdit.status === "reverted" ? "字段已撤销" : item.inlineEdit.status === "applied" ? "字段已应用" : "字段草稿" : item.status === "reviewed" ? "已审校" : item.status === "drafting" ? "写作中" : "策划中"} · {item.rounds.length} 版</span></button>)}
            {!filteredSessions.length ? <div className="ai-story-empty"><FileClock size={24} /><span>{sessions.length ? "没有匹配会话" : "尚无写作会话"}</span></div> : null}
          </div>
        ) : (
          <div className="ai-story-list">
            {filteredMemories.map((item) => {
              const conflicts = memoryConflicts.filter((conflict) => conflict.leftMemoryId === item.id || conflict.rightMemoryId === item.id).length;
              return <button className={item.id === selectedMemory?.id ? "is-active" : ""} key={item.id} type="button" onClick={() => { setSelectedMemoryId(item.id); setMemoryPanel("fact"); }}><strong>{item.title}</strong><span>{item.state === "confirmed" ? "已确认" : item.state === "superseded" ? "已停用" : "草稿"} · {memoryCategoryLabels[item.category]}{conflicts ? ` · ${conflicts} 个冲突` : ""}</span></button>;
            })}
            {!filteredMemories.length ? <div className="ai-story-empty"><Brain size={24} /><span>{memories.length ? "没有匹配记忆" : "审校后会自动积累记忆"}</span></div> : null}
          </div>
        )}
      </aside> : null}

      <main className="ai-story-main">
        {libraryMode === "sessions" ? session ? (
          <>
            <header className="ai-story-page-header">
              <div><input aria-label="写作会话标题" value={session.title} onChange={(event) => onUpdateSession(session.id, { title: event.target.value })} /><span>{context?.label || "未选择项目目标"}</span></div>
              <div>{!libraryOpen ? <button title="展开写作资料" aria-label="展开写作资料" type="button" onClick={() => setLibraryOpen(true)}><PanelLeftOpen size={16} /></button> : null}<button title="打开项目目标" aria-label="打开项目目标" type="button" onClick={() => context && onOpenTarget(context)}><ArrowUpRight size={16} /></button><button aria-label="删除写作会话" title={session.inlineEdit?.status === "applied" ? "请先撤销字段修改" : "删除写作会话"} disabled={session.inlineEdit?.status === "applied"} type="button" onClick={() => onDeleteSession(session.id)}><Trash2 size={16} /></button></div>
            </header>
            <div className={`ai-story-commandbar ${session.inlineEdit ? "is-inline-record" : ""}`}>
              {session.inlineEdit ? (
                <>
                  <div className={`ai-inline-record-state is-${session.inlineEdit.status}`}><ShieldCheck size={16} /><span>{session.inlineEdit.status === "reverted" ? "这次字段修改已经撤销" : "这是编辑器内 AI 的可追溯修改记录"}</span></div>
                  {message ? <span className="ai-story-command-message">{message}</span> : null}
                </>
              ) : (
                <>
                  {activeStreamId ? <button className="ai-story-deep is-cancel" type="button" onClick={() => void cancelActiveGeneration()}><CircleStop size={16} /><span>停止生成</span></button> : <button className="ai-story-deep" disabled={!settings.enabled || Boolean(busy)} type="button" onClick={() => void runDeepWriting()}>{busy === "deep" ? <LoaderCircle className="is-spinning" size={16} /> : <Sparkles size={16} />}<span>策划 → 写作 → 审校</span></button>}
                  <div className="ai-story-stage-buttons"><button title="仅重新策划" disabled={Boolean(busy)} type="button" onClick={() => { setBusy("plan"); void generatePlan().finally(() => setBusy("")); }}><MapPin size={15} />策划</button><button title="仅重新写作" disabled={Boolean(busy)} type="button" onClick={() => { setBusy("write"); void generateDraft().finally(() => setBusy("")); }}><WandSparkles size={15} />写作</button><button title="审校当前正文" disabled={!session.draft.trim() || Boolean(busy)} type="button" onClick={() => { setBusy("review"); void reviewDraft().finally(() => setBusy("")); }}><BookOpenCheck size={15} />审校</button></div>
                  {message ? <span className="ai-story-command-message">{message}</span> : null}
                </>
              )}
            </div>
            <nav className="ai-story-view-tabs" aria-label="写作工作区">
              <button className={sessionPanel === "draft" ? "is-active" : ""} type="button" onClick={() => setSessionPanel("draft")}>{session.inlineEdit ? <ShieldCheck size={15} /> : <AlignLeft size={15} />}{session.inlineEdit ? "修改记录" : "文稿"}</button>
              {!session.inlineEdit ? <button className={sessionPanel === "review" ? "is-active" : ""} type="button" onClick={() => setSessionPanel("review")}><ListChecks size={15} />审校{session.suggestions.length ? <small>{session.suggestions.filter((item) => item.status === "open").length}</small> : null}</button> : null}
              <button className={sessionPanel === "history" ? "is-active" : ""} type="button" onClick={() => setSessionPanel("history")}><History size={15} />版本<small>{session.rounds.length}</small></button>
            </nav>

            {sessionPanel === "draft" ? (
              session.inlineEdit ? (
                <section className="ai-story-workarea ai-inline-record-workarea">
                  <div className="ai-inline-record-heading">
                    <div><strong>{session.inlineEdit.fieldLabel}</strong><span>{inlineActionLabels[session.inlineEdit.action] || session.inlineEdit.action}</span></div>
                    <time>{new Date(session.inlineEdit.appliedAt).toLocaleString("zh-CN")}</time>
                  </div>
                  {session.inlineEdit.instruction ? <p className="ai-inline-record-instruction">作者要求：{session.inlineEdit.instruction}</p> : null}
                  <div className="ai-inline-record-diff">
                    <section><span>修改前</span><pre>{session.inlineEdit.baseText || "（空字段）"}</pre></section>
                    <section><span>修改后</span><pre>{session.inlineEdit.appliedText || "（空字段）"}</pre></section>
                  </div>
                  <div className={`ai-inline-record-consistency ${session.inlineEdit.introducedConsistencyIssues.length ? "has-warning" : "is-clear"}`}>
                    <div>{session.inlineEdit.introducedConsistencyIssues.length ? <AlertTriangle size={15} /> : <ShieldCheck size={15} />}<strong>一致性检查</strong><span>{session.inlineEdit.consistencyBeforeCount} → {session.inlineEdit.consistencyAfterCount} 项</span></div>
                    {session.inlineEdit.introducedConsistencyIssues.map((issue) => <article key={issue.fingerprint}><strong>{issue.severity === "critical" ? "严重" : "主要"} · {issue.title}</strong><p>{issue.detail}</p><small>{issue.suggestion}</small></article>)}
                    {!session.inlineEdit.introducedConsistencyIssues.length ? <p>这次修改没有新增严重或主要一致性问题。</p> : null}
                  </div>
                  <div className="ai-inline-record-provenance">
                    <div><strong>实际使用来源</strong><span>{session.inlineEdit.newCreation ? "包含无既有来源的新创作" : "内容有项目依据"}</span></div>
                    <div className="ai-inline-record-source-list">
                      {session.inlineEdit.sourceContextIds.map((sourceId) => {
                        const sourceContext = contexts.find((item) => item.id === sourceId);
                        return sourceContext ? <button key={sourceId} type="button" onClick={() => onOpenTarget(sourceContext)}><ArrowUpRight size={14} />{sourceContext.label}</button> : <span key={sourceId}>{sourceId}</span>;
                      })}
                      {session.inlineEdit.memoryIds.map((memoryId) => {
                        const usedMemory = memories.find((item) => item.id === memoryId);
                        return usedMemory ? <button key={memoryId} type="button" onClick={() => { setSelectedMemoryId(memoryId); setLibraryMode("memory"); setMemoryPanel("fact"); }}><Brain size={14} />{usedMemory.title}</button> : null;
                      })}
                      {!session.inlineEdit.sourceContextIds.length && !session.inlineEdit.memoryIds.length ? <span>未使用既有来源</span> : null}
                    </div>
                  </div>
                  <div className="ai-inline-record-actions">
                    <button className="ai-inline-record-undo" disabled={session.inlineEdit.status !== "applied" || busy === "undo"} type="button" onClick={() => void undoInlineEdit()}>{busy === "undo" ? <LoaderCircle className="is-spinning" size={15} /> : <RotateCcw size={15} />}<span>{session.inlineEdit.status === "reverted" ? "已撤销" : "撤销这次字段修改"}</span></button>
                    <small>仅当字段没有被作者继续修改时才会恢复</small>
                  </div>
                </section>
              ) : (
              <section className="ai-story-workarea">
                <details className="ai-story-disclosure" open={!session.goal.trim()}>
                  <summary>创作设定</summary>
                  <div className="ai-story-brief-grid">
                    <label><span>写入目标</span><select aria-label="剧情写作目标" value={session.targetContextId} onChange={(event) => onUpdateSession(session.id, { targetContextId: event.target.value })}>{contexts.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.detail}</option>)}</select></label>
                    <label><span>写作目标</span><textarea aria-label="剧情写作要求" rows={3} value={session.goal} onChange={(event) => onUpdateSession(session.id, { goal: event.target.value })} /></label>
                    <label><span>文风</span><input aria-label="剧情文风" value={session.style} onChange={(event) => onUpdateSession(session.id, { style: event.target.value })} /></label>
                    <label><span>硬约束</span><textarea aria-label="剧情硬约束" rows={2} value={session.constraints} onChange={(event) => onUpdateSession(session.id, { constraints: event.target.value })} /></label>
                  </div>
                </details>
                <details className="ai-story-disclosure" open={!session.draft.trim()}>
                  <summary><span>策划提纲</span><small>{session.outline.length.toLocaleString("zh-CN")} 字符</small></summary>
                  <textarea aria-label="AI 剧情提纲" className="ai-story-outline" rows={8} value={session.outline} onChange={(event) => onUpdateSession(session.id, { outline: event.target.value })} />
                </details>
                <div className="ai-story-draft-heading"><strong>剧情正文</strong><span>{(activeStreamSessionId === session.id ? streamingDraft : session.draft).length.toLocaleString("zh-CN")} 字符</span></div>
                <textarea ref={draftRef} aria-label="AI 剧情正文" className="ai-story-draft" rows={22} readOnly={activeStreamSessionId === session.id} value={activeStreamSessionId === session.id ? streamingDraft : session.draft} onChange={(event) => onUpdateSession(session.id, { draft: event.target.value, status: "drafting" })} />
                <div className="ai-story-editor-actions"><button type="button" onClick={checkpoint} disabled={!session.draft.trim() || Boolean(activeStreamId)}><Save size={15} /><span>保存检查点</span></button><button type="button" onClick={() => void applyDraftToProject()} disabled={!session.draft.trim() || context?.kind === "world" || Boolean(activeStreamId) || busy === "apply"}>{busy === "apply" ? <LoaderCircle className="is-spinning" size={15} /> : <Archive size={15} />}<span>追加到项目目标</span></button></div>
                <details className="ai-story-disclosure ai-story-memory-disclosure">
                  <summary><span>本轮召回的上下文</span><small>{relevantMemoryMatches.length + relevantProjectSources.length}</small></summary>
                  <div className="ai-memory-recall-controls">
                    <label title="根据近义表达和概念关联补充检索结果">
                      <input
                        type="checkbox"
                        checked={session.semanticRecallEnabled}
                        onChange={(event) => onUpdateSession(session.id, { semanticRecallEnabled: event.target.checked })}
                      />
                      <span>语义联想</span>
                    </label>
                    <small>同时检索作者记忆与相关项目原文</small>
                  </div>
                  <div className="ai-memory-recall-list">
                    {relevantMemoryMatches.map((item) => (
                      <article key={item.memory.id}>
                        <button className="ai-memory-recall-open" type="button" onClick={() => { setSelectedMemoryId(item.memory.id); setLibraryMode("memory"); setMemoryPanel("fact"); }}>
                          <strong>{item.memory.title}</strong>
                          <span>{item.reasons.join(" · ")}</span>
                          <small>{item.sourceLabel} · {memoryAuthorityLabels[item.authority]} · 相关度 {item.score}</small>
                        </button>
                        <button
                          className="ai-memory-recall-exclude"
                          type="button"
                          title="不再用于当前写作目标"
                          aria-label={`从当前写作目标排除记忆 ${item.memory.title}`}
                          onClick={() => onUpdateMemory(item.memory.id, {
                            excludedContextIds: Array.from(new Set([...item.memory.excludedContextIds, session.targetContextId]))
                          })}
                        >
                          <EyeOff size={14} />
                        </button>
                      </article>
                    ))}
                    {relevantProjectSources.map((item) => {
                      const sourceContext = contexts.find((candidate) => candidate.id === item.source.id);
                      return (
                        <article className="is-project-source" key={item.source.id}>
                          <button
                            className="ai-memory-recall-open"
                            type="button"
                            onClick={() => sourceContext && onOpenTarget(sourceContext)}
                          >
                            <strong>{item.source.label}</strong>
                            <span>{item.reasons.join(" · ")}</span>
                            <small>{item.source.detail} · 项目原文 · 相关度 {Math.round(item.score)}</small>
                          </button>
                        </article>
                      );
                    })}
                    {!relevantMemoryMatches.length && !relevantProjectSources.length ? <div className="ai-memory-recall-empty">当前目标没有匹配的记忆或项目原文</div> : null}
                  </div>
                </details>
              </section>
              )
            ) : sessionPanel === "review" ? (
              <section className="ai-story-workarea">
                <div className="ai-story-panel-heading"><div><ListChecks size={18} /><strong>审校建议</strong></div><span>{session.suggestions.filter((item) => item.status === "open").length} 项待处理</span></div>
                {session.reviewSummary ? <div className="ai-story-review-summary">{session.reviewSummary}</div> : null}
                <div className="ai-suggestion-list">
                  {session.suggestions.map((suggestion) => <article className={suggestion.status !== "open" ? "is-resolved" : ""} key={suggestion.id}><div><CircleDot size={14} /><strong>{suggestion.severity === "important" ? "重要" : "建议"}</strong><span>{suggestion.status === "applied" ? "已应用" : suggestion.status === "dismissed" ? "已忽略" : "待处理"}</span></div><blockquote>{suggestion.quote}</blockquote><p>{suggestion.reason}</p><div><button disabled={suggestion.status !== "open"} type="button" onClick={() => locateSuggestion(suggestion.quote)}><LocateFixed size={14} />定位</button><button disabled={suggestion.status !== "open"} type="button" onClick={() => applySuggestion(suggestion.id)}><Check size={14} />应用</button><button disabled={suggestion.status !== "open"} type="button" onClick={() => onUpdateSession(session.id, { suggestions: session.suggestions.map((item) => item.id === suggestion.id ? { ...item, status: "dismissed" } : item) })}>忽略</button></div></article>)}
                  {!session.suggestions.length ? <div className="ai-story-empty"><LocateFixed size={24} /><span>运行审校后在这里处理精确修改</span></div> : null}
                </div>
              </section>
            ) : (
              <section className="ai-story-workarea">
                <div className="ai-story-panel-heading"><div><History size={18} /><strong>写作版本</strong></div><span>{session.rounds.length} 个版本</span></div>
                <div className="ai-round-list">{[...session.rounds].reverse().map((item) => <button key={item.id} type="button" onClick={() => onUpdateSession(session.id, item.kind === "plan" ? { outline: item.content } : item.kind === "review" ? { reviewSummary: item.content } : { draft: item.content })}><RotateCcw size={15} /><span><strong>{item.kind === "plan" ? "策划" : item.kind === "draft" ? "正文" : item.kind === "review" ? "审校" : "检查点"}</strong><small>{new Date(item.createdAt).toLocaleString("zh-CN")} · {item.model}</small></span></button>)}</div>
              </section>
            )}
          </>
        ) : <div className="ai-story-empty">{!libraryOpen ? <button className="ai-story-empty-library-button" type="button" onClick={() => setLibraryOpen(true)}><PanelLeftOpen size={16} />展开写作资料</button> : null}<Sparkles size={30} /><strong>新建写作会话开始剧情创作</strong></div> : selectedMemory ? (
          <>
            <header className="ai-story-page-header ai-memory-page-header">
              <div><input aria-label="记忆标题" value={selectedMemory.title} onChange={(event) => onUpdateMemory(selectedMemory.id, { title: event.target.value })} /><span>{memoryCategoryLabels[selectedMemory.category]}</span></div>
              <div>{!libraryOpen ? <button title="展开写作资料" aria-label="展开写作资料" type="button" onClick={() => setLibraryOpen(true)}><PanelLeftOpen size={16} /></button> : null}<select aria-label="记忆事实状态" value={selectedMemory.state} onChange={(event) => setMemoryState(event.target.value as AiMemoryItem["state"])}><option value="draft">草稿</option><option value="confirmed">作者确认</option><option value="superseded">已停用</option></select><button className={selectedMemory.pinned ? "is-active" : ""} aria-label={selectedMemory.pinned ? "取消置顶" : "置顶记忆"} title={selectedMemory.pinned ? "取消置顶" : "置顶记忆"} type="button" onClick={() => onUpdateMemory(selectedMemory.id, { pinned: !selectedMemory.pinned })}><Flag size={16} /></button><button aria-label="删除记忆" title="删除记忆" type="button" onClick={() => onDeleteMemory(selectedMemory.id)}><Trash2 size={16} /></button></div>
            </header>
            {message ? <div className="ai-story-inline-message">{message}</div> : null}
            <nav className="ai-story-view-tabs" aria-label="记忆工作区">
              <button className={memoryPanel === "fact" ? "is-active" : ""} type="button" onClick={() => setMemoryPanel("fact")}><Brain size={15} />事实</button>
              <button className={memoryPanel === "sources" ? "is-active" : ""} type="button" onClick={() => setMemoryPanel("sources")}><Quote size={15} />来源<small>{selectedMemory.sources.length}</small></button>
              <button className={memoryPanel === "relations" ? "is-active" : ""} type="button" onClick={() => setMemoryPanel("relations")}><Link2 size={15} />关系<small>{selectedMemory.relations.length}</small></button>
              <button className={memoryPanel === "conflicts" ? "is-active" : selectedMemoryConflicts.length ? "has-alert" : ""} type="button" onClick={() => setMemoryPanel("conflicts")}><AlertTriangle size={15} />冲突<small>{selectedMemoryConflicts.length}</small></button>
            </nav>

            {memoryPanel === "fact" ? (
              <section className="ai-story-workarea ai-memory-fact-panel">
                {selectedMemoryConflicts.length ? <button className="ai-memory-conflict-banner" type="button" onClick={() => setMemoryPanel("conflicts")}><AlertTriangle size={16} /><span>检测到 {selectedMemoryConflicts.length} 个事实冲突</span><ArrowUpRight size={15} /></button> : null}
                <label className="ai-memory-field"><span>事实说明</span><textarea aria-label="记忆内容" rows={6} value={selectedMemory.content} onChange={(event) => onUpdateMemory(selectedMemory.id, { content: event.target.value })} /></label>
                <div className="ai-story-panel-heading"><div><Brain size={18} /><strong>结构化事实</strong></div></div>
                <div className="ai-memory-fact-sentence">
                  <label><span>主体</span><input aria-label="记忆事实主体" placeholder="艾琳" value={selectedMemory.fact.subject} onChange={(event) => onUpdateMemory(selectedMemory.id, { fact: { ...selectedMemory.fact, subject: event.target.value } })} /></label>
                  <i>的</i>
                  <label><span>属性</span><input aria-label="记忆事实属性" placeholder="当前位置" value={selectedMemory.fact.property} onChange={(event) => onUpdateMemory(selectedMemory.id, { fact: { ...selectedMemory.fact, property: event.target.value } })} /></label>
                  <i>是</i>
                  <label><span>值</span><input aria-label="记忆事实值" placeholder="雾鸦堡" value={selectedMemory.fact.value} onChange={(event) => onUpdateMemory(selectedMemory.id, { fact: { ...selectedMemory.fact, value: event.target.value } })} /></label>
                </div>
                <div className="ai-memory-fact-meta">
                  <label><span>分类</span><select aria-label="记忆分类" value={selectedMemory.category} onChange={(event) => onUpdateMemory(selectedMemory.id, { category: event.target.value as AiMemoryCategory })}>{Object.entries(memoryCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label><span>生效范围</span><input aria-label="记忆时间范围" placeholder="序章结束时" value={selectedMemory.fact.temporalScope} onChange={(event) => onUpdateMemory(selectedMemory.id, { fact: { ...selectedMemory.fact, temporalScope: event.target.value } })} /></label>
                  <label><span>标签</span><div className="ai-memory-tag-input"><Tags size={14} /><input aria-label="记忆标签" placeholder="人物, 地点, 伏笔" value={selectedMemory.tags.join(", ")} onChange={(event) => onUpdateMemory(selectedMemory.id, { tags: event.target.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) })} /></div></label>
                </div>
                <div className="ai-memory-fact-footer"><ShieldCheck size={14} /><span>{selectedMemory.lastVerifiedAt ? `最近确认 ${new Date(selectedMemory.lastVerifiedAt).toLocaleString("zh-CN")}` : "尚未由作者确认"}</span></div>
                {selectedMemory.excludedContextIds.length ? (
                  <div className="ai-memory-exclusion-list">
                    <div><EyeOff size={14} /><strong>已排除的写作目标</strong></div>
                    <div>
                      {selectedMemory.excludedContextIds.map((contextId) => {
                        const excludedContext = contexts.find((item) => item.id === contextId);
                        return (
                          <button
                            key={contextId}
                            type="button"
                            title="恢复用于这个写作目标"
                            onClick={() => onUpdateMemory(selectedMemory.id, {
                              excludedContextIds: selectedMemory.excludedContextIds.filter((item) => item !== contextId)
                            })}
                          >
                            <span>{excludedContext?.label || contextId}</span>
                            <Eye size={13} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : memoryPanel === "sources" ? (
              <section className="ai-story-workarea">
                <div className="ai-story-panel-heading"><div><Quote size={18} /><strong>来源证据</strong></div><span>{selectedMemory.sources.length} 个来源</span></div>
                <div className="ai-memory-source-list">{selectedMemory.sources.map((source) => {
                  const sourceContext = contexts.find((item) => item.id === source.contextId);
                  return <article key={source.id}><div><strong>{source.contextLabel || sourceContext?.label || "项目来源"}</strong><span>{memorySourceLabels[source.kind]}</span>{sourceContext ? <button title="打开来源" aria-label="打开记忆来源" type="button" onClick={() => onOpenTarget(sourceContext)}><ArrowUpRight size={14} /></button> : null}</div>{source.excerpt ? <blockquote>{source.excerpt}</blockquote> : <p>此来源没有保存原文摘录。</p>}<time>{new Date(source.capturedAt).toLocaleString("zh-CN")}</time></article>;
                })}{!selectedMemory.sources.length ? <div className="ai-story-empty"><Quote size={24} /><span>暂无可追溯来源</span></div> : null}</div>
              </section>
            ) : memoryPanel === "relations" ? (
              <section className="ai-story-workarea">
                <div className="ai-story-panel-heading"><div><Link2 size={18} /><strong>记忆关系</strong></div><span>{selectedMemory.relations.length} 条关系</span></div>
                <div className="ai-memory-relation-builder"><select aria-label="记忆关系类型" value={relationKind} onChange={(event) => setRelationKind(event.target.value as AiMemoryRelationKind)}>{Object.entries(memoryRelationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select aria-label="关联记忆" value={relationTargetId} onChange={(event) => setRelationTargetId(event.target.value)}><option value="">选择另一条记忆</option>{memories.filter((item) => item.id !== selectedMemory.id).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><input aria-label="记忆关系说明" placeholder="关系说明，可留空" value={relationNote} onChange={(event) => setRelationNote(event.target.value)} /><button title="建立关系" aria-label="建立记忆关系" disabled={!relationTargetId} type="button" onClick={addMemoryRelation}><Plus size={15} /></button></div>
                <div className="ai-memory-relation-list">{selectedMemory.relations.map((relation) => <div key={relation.id}><span>{memoryRelationLabels[relation.kind]}</span><strong>{memories.find((item) => item.id === relation.targetMemoryId)?.title || "已删除记忆"}</strong><small>{relation.note}</small><button aria-label="删除记忆关系" title="删除关系" type="button" onClick={() => onUpdateMemory(selectedMemory.id, { relations: selectedMemory.relations.filter((item) => item.id !== relation.id) })}><Trash2 size={13} /></button></div>)}</div>
                {!selectedMemory.relations.length ? <div className="ai-story-empty"><Link2 size={24} /><span>尚未建立记忆关系</span></div> : null}
              </section>
            ) : (
              <section className="ai-story-workarea">
                <div className="ai-story-panel-heading"><div><AlertTriangle size={18} /><strong>事实冲突</strong></div><span>{selectedMemoryConflicts.length} 个待处理</span></div>
                <div className="ai-memory-conflict-list">{selectedMemoryConflicts.map((conflict) => {
                  const left = memories.find((item) => item.id === conflict.leftMemoryId);
                  const right = memories.find((item) => item.id === conflict.rightMemoryId);
                  if (!left || !right) return null;
                  return <article className={conflict.severity === "important" ? "is-important" : ""} key={conflict.id}><div><AlertTriangle size={14} /><strong>{conflict.severity === "important" ? "已确认事实冲突" : "待核验差异"}</strong></div><p>{conflict.summary}</p><small>{conflict.factKey}</small><div><button type="button" onClick={() => resolveConflict(conflict, left.id)}>保留“{left.fact.value || left.title}”</button><button type="button" onClick={() => resolveConflict(conflict, right.id)}>保留“{right.fact.value || right.title}”</button><button type="button" onClick={() => ignoreConflict(conflict)}>忽略差异</button></div></article>;
                })}{!selectedMemoryConflicts.length ? <div className="ai-story-empty"><ShieldCheck size={28} /><strong>此记忆没有事实冲突</strong><span>已停用记忆不会进入 AI 上下文</span></div> : null}</div>
              </section>
            )}
          </>
        ) : <div className="ai-story-empty">{!libraryOpen ? <button className="ai-story-empty-library-button" type="button" onClick={() => setLibraryOpen(true)}><PanelLeftOpen size={16} />展开写作资料</button> : null}<Brain size={30} /><strong>添加记忆后开始整理设定</strong></div>}
      </main>
    </div>
  );
}
