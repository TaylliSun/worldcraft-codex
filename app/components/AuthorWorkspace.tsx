"use client";

import {
  AlertTriangle,
  BookOpen,
  Brain,
  ChevronRight,
  CircleDot,
  Clock3,
  FilePlus2,
  FileText,
  Flag,
  Globe2,
  ListChecks,
  MessagesSquare,
  PenLine,
  Plus,
  Route,
  Sparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AuthorWritingItem = {
  id: string;
  kind: "manuscript-chapter" | "manuscript-scene";
  title: string;
  path: string;
  summary: string;
  status: string;
  words: number;
  targetWords: number;
  openAnnotations: number;
  updatedAt: string;
};

export type AuthorQueueItem = {
  id: string;
  title: string;
  detail: string;
  summary: string;
  status: string;
  tone: "planned" | "active" | "ready" | "blocked";
};

export type AuthorIssueItem = {
  id: string;
  title: string;
  detail: string;
  kind: "review" | "consistency" | "manuscript";
  severity: "critical" | "major" | "normal";
  targetKind?: AuthorWritingItem["kind"];
  targetId?: string;
};

export type AuthorOpenLoopItem = {
  id: string;
  title: string;
  content: string;
  confirmed: boolean;
  pinned: boolean;
};

export type AuthorRecentItem = {
  id: string;
  kind:
    | "entity"
    | "quest"
    | "scene"
    | "milestone"
    | "manuscript-chapter"
    | "manuscript-scene";
  title: string;
  detail: string;
  updatedAt: string;
};

export type AuthorWorkspaceStats = {
  words: number;
  chapters: number;
  entities: number;
  quests: number;
  openIssues: number;
};

type AuthorWorkspaceProps = {
  worldName: string;
  worldDescription: string;
  writingItems: AuthorWritingItem[];
  queueItems: AuthorQueueItem[];
  issueItems: AuthorIssueItem[];
  openLoops: AuthorOpenLoopItem[];
  recentItems: AuthorRecentItem[];
  stats: AuthorWorkspaceStats;
  onContinueWriting: (item: AuthorWritingItem) => void;
  onCreateChapter: () => void;
  onCreateEntity: () => void;
  onCreateQuest: () => void;
  onOpenIssue: (item: AuthorIssueItem) => void;
  onOpenLoop: (item: AuthorOpenLoopItem) => void;
  onOpenQueueItem: (item: AuthorQueueItem) => void;
  onOpenRecentItem: (item: AuthorRecentItem) => void;
  onOpenWiki: () => void;
};

const recentKindMeta: Record<AuthorRecentItem["kind"], { icon: LucideIcon; label: string }> = {
  entity: { icon: BookOpen, label: "设定" },
  quest: { icon: Route, label: "任务" },
  scene: { icon: MessagesSquare, label: "剧情" },
  milestone: { icon: Flag, label: "制作" },
  "manuscript-chapter": { icon: FileText, label: "章节" },
  "manuscript-scene": { icon: PenLine, label: "场景" }
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((dayStart - targetStart) / 86_400_000);
  if (dayDiff === 0) return `今天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  if (dayDiff === 1) return "昨天";
  if (dayDiff > 1 && dayDiff < 7) return `${dayDiff} 天前`;
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function wordProgress(item: AuthorWritingItem) {
  if (!item.targetWords) return 0;
  return Math.min(100, Math.round((item.words / item.targetWords) * 100));
}

export function AuthorWorkspace({
  worldName,
  worldDescription,
  writingItems,
  queueItems,
  issueItems,
  openLoops,
  recentItems,
  stats,
  onContinueWriting,
  onCreateChapter,
  onCreateEntity,
  onCreateQuest,
  onOpenIssue,
  onOpenLoop,
  onOpenQueueItem,
  onOpenRecentItem,
  onOpenWiki
}: AuthorWorkspaceProps) {
  const currentWriting = writingItems[0] ?? null;

  return (
    <section aria-label="作者工作台" className="author-workspace">
      <header className="author-workspace-header">
        <div className="author-workspace-heading">
          <span><PenLine size={15} /> 作者工作台</span>
          <h1>{currentWriting ? `继续写作：${currentWriting.title}` : `开始书写 ${worldName}`}</h1>
          <p>{worldDescription || "这个世界还没有简介。"}</p>
        </div>
        <div aria-label="快速创建" className="author-quick-actions" role="toolbar">
          <button type="button" onClick={onCreateChapter}><FilePlus2 size={16} /><span>新章节</span></button>
          <button type="button" onClick={onCreateEntity}><Plus size={16} /><span>新设定</span></button>
          <button type="button" onClick={onCreateQuest}><Route size={16} /><span>新任务</span></button>
          <button type="button" onClick={onOpenWiki}><Globe2 size={16} /><span>世界总览</span></button>
        </div>
      </header>

      <div className="author-stat-strip" aria-label="项目摘要">
        <div><strong>{stats.words.toLocaleString("zh-CN")}</strong><span>正文文字</span></div>
        <div><strong>{stats.chapters}</strong><span>章节</span></div>
        <div><strong>{stats.entities}</strong><span>设定条目</span></div>
        <div><strong>{stats.quests}</strong><span>任务线</span></div>
        <div className={stats.openIssues ? "has-attention" : ""}><strong>{stats.openIssues}</strong><span>待处理</span></div>
      </div>

      <div className="author-cockpit-grid">
        <section className="author-writing-pane">
          <div className="author-section-heading">
            <div><PenLine size={18} /><span><strong>继续写作</strong><small>最近编辑的正文</small></span></div>
            <span>{writingItems.length} 篇</span>
          </div>
          {currentWriting ? (
            <>
              <button
                aria-label={`继续写作 ${currentWriting.title}`}
                className="author-current-writing"
                type="button"
                onClick={() => onContinueWriting(currentWriting)}
              >
                <span className="author-writing-path">{currentWriting.path}</span>
                <strong>{currentWriting.title}</strong>
                <p>{currentWriting.summary || "尚未填写章节摘要"}</p>
                <div className="author-writing-meta">
                  <span>{currentWriting.status}</span>
                  <span>{currentWriting.words.toLocaleString("zh-CN")} 字</span>
                  <span>{formatDate(currentWriting.updatedAt)}</span>
                  {currentWriting.openAnnotations ? <span className="has-attention">{currentWriting.openAnnotations} 条批注</span> : null}
                </div>
                <div className="author-writing-progress" aria-label={`写作进度 ${wordProgress(currentWriting)}%`}>
                  <span style={{ width: `${wordProgress(currentWriting)}%` }} />
                </div>
                <span className="author-continue-command">打开编辑器 <ChevronRight size={15} /></span>
              </button>
              <div className="author-writing-list">
                {writingItems.slice(1, 5).map((item) => (
                  <button key={`${item.kind}:${item.id}`} type="button" onClick={() => onContinueWriting(item)}>
                    <FileText size={15} />
                    <span><strong>{item.title}</strong><small>{item.path}</small></span>
                    <span>{item.words.toLocaleString("zh-CN")} 字</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="author-empty-state">
              <FilePlus2 size={24} />
              <strong>还没有正文</strong>
              <button type="button" onClick={onCreateChapter}>创建第一章</button>
            </div>
          )}
        </section>

        <section className="author-queue-pane">
          <div className="author-section-heading">
            <div><ListChecks size={18} /><span><strong>制作队列</strong><small>正在推进与等待确认</small></span></div>
            <span>{queueItems.length} 项</span>
          </div>
          <div className="author-queue-list">
            {queueItems.slice(0, 7).map((item) => (
              <button className={`tone-${item.tone}`} key={item.id} type="button" onClick={() => onOpenQueueItem(item)}>
                <span className="author-queue-state"><CircleDot size={14} />{item.status}</span>
                <strong>{item.title}</strong>
                <p>{item.summary || item.detail}</p>
                <span>{item.detail}</span>
                <ChevronRight size={14} />
              </button>
            ))}
            {!queueItems.length ? (
              <div className="author-empty-line"><Flag size={17} /><span>当前没有进行中的制作项</span></div>
            ) : null}
          </div>
        </section>

        <aside className="author-focus-pane">
          <section>
            <div className="author-section-heading">
              <div><AlertTriangle size={18} /><span><strong>需要留意</strong><small>审阅与一致性</small></span></div>
              <span>{issueItems.length}</span>
            </div>
            <div className="author-issue-list">
              {issueItems.slice(0, 5).map((item) => (
                <button className={`severity-${item.severity}`} key={`${item.kind}:${item.id}`} type="button" onClick={() => onOpenIssue(item)}>
                  <AlertTriangle size={14} />
                  <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                  <ChevronRight size={14} />
                </button>
              ))}
              {!issueItems.length ? <div className="author-empty-line"><CircleDot size={15} /><span>没有重要待处理项</span></div> : null}
            </div>
          </section>

          <section>
            <div className="author-section-heading">
              <div><Brain size={18} /><span><strong>未收束线索</strong><small>AI 长期记忆</small></span></div>
              <span>{openLoops.length}</span>
            </div>
            <div className="author-loop-list">
              {openLoops.slice(0, 5).map((item) => (
                <button key={item.id} type="button" onClick={() => onOpenLoop(item)}>
                  {item.pinned ? <Sparkles size={14} /> : <CircleDot size={14} />}
                  <span><strong>{item.title}</strong><small>{item.content}</small></span>
                  <span>{item.confirmed ? "已确认" : "待确认"}</span>
                </button>
              ))}
              {!openLoops.length ? <div className="author-empty-line"><Brain size={15} /><span>没有未收束线索</span></div> : null}
            </div>
          </section>
        </aside>
      </div>

      <section className="author-recent-section">
        <div className="author-section-heading">
          <div><Clock3 size={18} /><span><strong>最近更新</strong><small>跨模块继续工作</small></span></div>
        </div>
        <div className="author-recent-list">
          {recentItems.slice(0, 10).map((item) => {
            const meta = recentKindMeta[item.kind];
            const Icon = meta.icon;
            return (
              <button key={`${item.kind}:${item.id}`} type="button" onClick={() => onOpenRecentItem(item)}>
                <Icon size={16} />
                <span className="author-recent-kind">{meta.label}</span>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
                <time dateTime={item.updatedAt}>{formatDate(item.updatedAt)}</time>
                <ChevronRight size={14} />
              </button>
            );
          })}
        </div>
      </section>
    </section>
  );
}
