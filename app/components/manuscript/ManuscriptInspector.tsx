"use client";

import {
  BarChart3,
  FileClock,
  History,
  Lightbulb,
  ListTree,
  MessageSquareText,
  PanelRightClose,
  Plus,
  RotateCcw,
  Trash2,
  UserRoundCheck
} from "lucide-react";
import {
  manuscriptBookStatusLabels,
  type ManuscriptAnnotation,
  type ManuscriptBook,
  type ManuscriptBookStatus,
  type ManuscriptChapter,
  type ManuscriptClue,
  type ManuscriptKnowledgeLevel,
  type ManuscriptKnowledgeState,
  type ManuscriptScene,
  type ManuscriptVolume
} from "../../manuscript";
import type { ManuscriptChapterVersion } from "../ManuscriptWorkspace";
import { ManuscriptReviewPanel } from "./ManuscriptReviewPanel";
import { ManuscriptRhythmPanel } from "./ManuscriptRhythmPanel";

export type ManuscriptInspectorTab = "structure" | "review" | "rhythm" | "clues" | "knowledge" | "history";

type EntityOption = {
  id: string;
  title: string;
  type: string;
};

type UnitOption = {
  kind: "chapter" | "scene";
  id: string;
  label: string;
};

const knowledgeLabels: Record<ManuscriptKnowledgeLevel, string> = {
  unknown: "不知道",
  suspected: "有所怀疑",
  known: "已经知道"
};

function versionReasonLabel(reason: string) {
  if (reason === "schema-17-manuscript-migration") return "旧章节迁移";
  if (reason.includes("restore")) return "恢复前检查点";
  if (reason.includes("import")) return "导入项目";
  if (reason === "autosave") return "自动保存";
  return "本地版本";
}

export function ManuscriptInspector({
  bookClues,
  bookKnowledge,
  entities,
  historyLoading,
  onAddClue,
  onAcceptAnnotation,
  onAddAnnotation,
  onAddAnnotationReply,
  onAddKnowledge,
  onDeleteClue,
  onDeleteAnnotation,
  onDeleteKnowledge,
  onClose,
  onRestoreVersion,
  onSelectTab,
  onSelectVersion,
  onUpdateBook,
  onUpdateAnnotation,
  onUpdateChapter,
  onUpdateClue,
  onUpdateKnowledge,
  onUpdateScene,
  onUpdateVolume,
  selectedBook,
  selectedChapter,
  selectedScene,
  selectedTab,
  selectedUnit,
  selectedVersion,
  selectedVersionId,
  selectedVolume,
  selectedQuote,
  targetWords,
  totalWords,
  unitOptions,
  versionDiff,
  versions
}: {
  bookClues: ManuscriptClue[];
  bookKnowledge: ManuscriptKnowledgeState[];
  entities: EntityOption[];
  historyLoading: boolean;
  onAddClue: () => void;
  onAcceptAnnotation: (annotationId: string) => boolean;
  onAddAnnotation: (input: {
    comment: string;
    kind: ManuscriptAnnotation["kind"];
    quote: string;
    replacement: string;
  }) => void;
  onAddAnnotationReply: (annotationId: string, body: string) => void;
  onAddKnowledge: () => void;
  onDeleteClue: (id: string) => void;
  onDeleteAnnotation: (id: string) => void;
  onDeleteKnowledge: (id: string) => void;
  onClose: () => void;
  onRestoreVersion?: (version: ManuscriptChapterVersion) => void | Promise<void>;
  onSelectTab: (tab: ManuscriptInspectorTab) => void;
  onSelectVersion: (id: number) => void;
  onUpdateBook: (id: string, patch: Partial<ManuscriptBook>) => void;
  onUpdateAnnotation: (id: string, patch: Partial<ManuscriptAnnotation>) => void;
  onUpdateChapter: (id: string, patch: Partial<ManuscriptChapter>) => void;
  onUpdateClue: (id: string, patch: Partial<ManuscriptClue>) => void;
  onUpdateKnowledge: (id: string, patch: Partial<ManuscriptKnowledgeState>) => void;
  onUpdateScene: (id: string, patch: Partial<ManuscriptScene>) => void;
  onUpdateVolume: (id: string, patch: Partial<ManuscriptVolume>) => void;
  selectedBook: ManuscriptBook | null;
  selectedChapter: ManuscriptChapter | null;
  selectedScene: ManuscriptScene | null;
  selectedTab: ManuscriptInspectorTab;
  selectedUnit: ManuscriptChapter | ManuscriptScene | null;
  selectedVersion: ManuscriptChapterVersion | null;
  selectedVersionId: number | null;
  selectedVolume: ManuscriptVolume | null;
  selectedQuote: string;
  targetWords: number;
  totalWords: number;
  unitOptions: UnitOption[];
  versionDiff: { removed: string; added: string } | null;
  versions: ManuscriptChapterVersion[];
}) {
  const characters = entities.filter((entity) => entity.type === "character");

  return (
    <aside className="manuscript-inspector">
      <div className="manuscript-inspector-tabs" role="tablist" aria-label="文稿检查栏">
        <button aria-label="结构" className={selectedTab === "structure" ? "is-active" : ""} title="结构" type="button" onClick={() => onSelectTab("structure")}><ListTree size={16} /></button>
        <button aria-label="批注与修订" className={selectedTab === "review" ? "is-active" : ""} title="批注与修订" type="button" onClick={() => onSelectTab("review")}><MessageSquareText size={16} /></button>
        <button aria-label="写作节奏" className={selectedTab === "rhythm" ? "is-active" : ""} title="写作节奏" type="button" onClick={() => onSelectTab("rhythm")}><BarChart3 size={16} /></button>
        <button aria-label="伏笔" className={selectedTab === "clues" ? "is-active" : ""} title="伏笔" type="button" onClick={() => onSelectTab("clues")}><Lightbulb size={16} /></button>
        <button aria-label="人物知识" className={selectedTab === "knowledge" ? "is-active" : ""} title="人物知识" type="button" onClick={() => onSelectTab("knowledge")}><UserRoundCheck size={16} /></button>
        <button aria-label="章节历史" className={selectedTab === "history" ? "is-active" : ""} title="章节历史" type="button" onClick={() => onSelectTab("history")}><History size={16} /></button>
        <button className="manuscript-inspector-close" aria-label="收起文稿检查栏" title="收起文稿检查栏" type="button" onClick={onClose}><PanelRightClose size={16} /></button>
      </div>

      {selectedTab === "structure" ? (
        <div className="manuscript-inspector-body">
          <div className="manuscript-inspector-heading"><ListTree size={17} /><div><strong>结构与提要</strong><span>当前写作单元</span></div></div>
          {selectedBook ? <label><span>书名</span><input value={selectedBook.title} onChange={(event) => onUpdateBook(selectedBook.id, { title: event.target.value })} /></label> : null}
          {selectedBook ? <label><span>全书状态</span><select value={selectedBook.status} onChange={(event) => onUpdateBook(selectedBook.id, { status: event.target.value as ManuscriptBookStatus })}>{Object.entries(manuscriptBookStatusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></label> : null}
          {selectedVolume ? <label><span>卷名</span><input value={selectedVolume.title} onChange={(event) => onUpdateVolume(selectedVolume.id, { title: event.target.value })} /></label> : null}
          {selectedUnit ? <label data-reference-path="summary" data-reference-source-id={selectedUnit.id} data-reference-source-kind={selectedScene ? "manuscript-scene" : "manuscript-chapter"}><span>提要</span><textarea rows={5} value={selectedUnit.summary} onChange={(event) => selectedScene ? onUpdateScene(selectedScene.id, { summary: event.target.value }) : selectedChapter && onUpdateChapter(selectedChapter.id, { summary: event.target.value })} /></label> : null}
          {selectedUnit ? <label data-reference-path="notes" data-reference-source-id={selectedUnit.id} data-reference-source-kind={selectedScene ? "manuscript-scene" : "manuscript-chapter"}><span>创作备注</span><textarea rows={4} value={selectedUnit.notes} onChange={(event) => selectedScene ? onUpdateScene(selectedScene.id, { notes: event.target.value }) : selectedChapter && onUpdateChapter(selectedChapter.id, { notes: event.target.value })} /></label> : null}
          {selectedUnit ? <label><span>视角人物</span><select value={selectedUnit.viewpointEntityId} onChange={(event) => selectedScene ? onUpdateScene(selectedScene.id, { viewpointEntityId: event.target.value }) : selectedChapter && onUpdateChapter(selectedChapter.id, { viewpointEntityId: event.target.value })}><option value="">未指定</option>{characters.map((entity) => <option key={entity.id} value={entity.id}>{entity.title}</option>)}</select></label> : null}
          {selectedUnit ? <div className="manuscript-inspector-pair"><label><span>开始时间</span><input value={selectedUnit.timelineStart} onChange={(event) => selectedScene ? onUpdateScene(selectedScene.id, { timelineStart: event.target.value }) : selectedChapter && onUpdateChapter(selectedChapter.id, { timelineStart: event.target.value })} /></label><label><span>结束时间</span><input value={selectedUnit.timelineEnd} onChange={(event) => selectedScene ? onUpdateScene(selectedScene.id, { timelineEnd: event.target.value }) : selectedChapter && onUpdateChapter(selectedChapter.id, { timelineEnd: event.target.value })} /></label></div> : null}
          {selectedChapter && !selectedScene ? <label><span>章节目标字数</span><input min={0} type="number" value={selectedChapter.targetWordCount} onChange={(event) => onUpdateChapter(selectedChapter.id, { targetWordCount: Number(event.target.value) })} /></label> : null}
        </div>
      ) : null}

      {selectedTab === "review" && selectedUnit ? (
        <ManuscriptReviewPanel
          annotations={selectedUnit.annotations}
          body={selectedUnit.body}
          selectedQuote={selectedQuote}
          onAccept={onAcceptAnnotation}
          onAdd={onAddAnnotation}
          onAddReply={onAddAnnotationReply}
          onDelete={onDeleteAnnotation}
          onUpdate={onUpdateAnnotation}
        />
      ) : null}

      {selectedTab === "rhythm" && selectedBook ? (
        <ManuscriptRhythmPanel
          book={selectedBook}
          targetWords={targetWords}
          totalWords={totalWords}
          onUpdateBook={onUpdateBook}
        />
      ) : null}

      {selectedTab === "clues" ? (
        <div className="manuscript-inspector-body">
          <div className="manuscript-inspector-heading"><Lightbulb size={17} /><div><strong>伏笔与回收</strong><span>{bookClues.filter((clue) => clue.status === "open").length} 条未闭合</span></div><button aria-label="新增伏笔" title="新增伏笔" type="button" onClick={onAddClue}><Plus size={15} /></button></div>
          <div className="manuscript-ledger-list">
            {bookClues.map((clue) => (
              <details key={clue.id} open={clue.id === bookClues[0]?.id}>
                <summary><span className={`manuscript-clue-state is-${clue.status}`} /> <strong>{clue.title}</strong><small>{clue.status === "open" ? "未闭合" : clue.status === "resolved" ? "已回收" : "已放弃"}</small></summary>
                <label><span>线索名</span><input value={clue.title} onChange={(event) => onUpdateClue(clue.id, { title: event.target.value })} /></label>
                <label><span>说明</span><textarea rows={3} value={clue.description} onChange={(event) => onUpdateClue(clue.id, { description: event.target.value })} /></label>
                <label><span>状态</span><select value={clue.status} onChange={(event) => onUpdateClue(clue.id, { status: event.target.value as ManuscriptClue["status"] })}><option value="open">未闭合</option><option value="resolved">已回收</option><option value="abandoned">已放弃</option></select></label>
                <label><span>埋设位置</span><select value={`${clue.setupUnitKind}:${clue.setupUnitId}`} onChange={(event) => { const [kind, id] = event.target.value.split(":"); onUpdateClue(clue.id, { setupUnitKind: kind as "chapter" | "scene", setupUnitId: id }); }}><option value="chapter:">未指定</option>{unitOptions.map((option) => <option key={`setup:${option.kind}:${option.id}`} value={`${option.kind}:${option.id}`}>{option.label}</option>)}</select></label>
                <label><span>回收位置</span><select value={`${clue.payoffUnitKind}:${clue.payoffUnitId}`} onChange={(event) => { const [kind, id] = event.target.value.split(":"); onUpdateClue(clue.id, { payoffUnitKind: kind as "chapter" | "scene", payoffUnitId: id }); }}><option value="chapter:">尚未回收</option>{unitOptions.map((option) => <option key={`payoff:${option.kind}:${option.id}`} value={`${option.kind}:${option.id}`}>{option.label}</option>)}</select></label>
                <button className="manuscript-inline-delete" type="button" onClick={() => onDeleteClue(clue.id)}><Trash2 size={14} />删除线索</button>
              </details>
            ))}
            {!bookClues.length ? <p>还没有伏笔记录</p> : null}
          </div>
        </div>
      ) : null}

      {selectedTab === "knowledge" ? (
        <div className="manuscript-inspector-body">
          <div className="manuscript-inspector-heading"><UserRoundCheck size={17} /><div><strong>人物知识</strong><span>作者确认事实优先</span></div><button aria-label="新增人物知识" title="新增人物知识" type="button" onClick={onAddKnowledge}><Plus size={15} /></button></div>
          <div className="manuscript-ledger-list">
            {bookKnowledge.map((item) => (
              <details key={item.id}>
                <summary><strong>{entities.find((entity) => entity.id === item.characterId)?.title ?? "未指定人物"}</strong><small>{knowledgeLabels[item.level]}</small></summary>
                <label><span>人物</span><select value={item.characterId} onChange={(event) => onUpdateKnowledge(item.id, { characterId: event.target.value })}><option value="">未指定</option>{characters.map((entity) => <option key={entity.id} value={entity.id}>{entity.title}</option>)}</select></label>
                <label><span>事实</span><textarea rows={3} value={item.fact} onChange={(event) => onUpdateKnowledge(item.id, { fact: event.target.value })} /></label>
                <label><span>知情程度</span><select value={item.level} onChange={(event) => onUpdateKnowledge(item.id, { level: event.target.value as ManuscriptKnowledgeLevel })}>{Object.entries(knowledgeLabels).map(([level, label]) => <option key={level} value={level}>{label}</option>)}</select></label>
                <label><span>生效位置</span><select value={`${item.unitKind}:${item.unitId}`} onChange={(event) => { const [kind, id] = event.target.value.split(":"); onUpdateKnowledge(item.id, { unitKind: kind as "chapter" | "scene", unitId: id }); }}>{unitOptions.map((option) => <option key={`knowledge:${option.kind}:${option.id}`} value={`${option.kind}:${option.id}`}>{option.label}</option>)}</select></label>
                <label className="manuscript-check-row"><input checked={item.authorConfirmed} type="checkbox" onChange={(event) => onUpdateKnowledge(item.id, { authorConfirmed: event.target.checked })} /><span>作者确认事实</span></label>
                <button className="manuscript-inline-delete" type="button" onClick={() => onDeleteKnowledge(item.id)}><Trash2 size={14} />删除记录</button>
              </details>
            ))}
            {!bookKnowledge.length ? <p>还没有人物知识记录</p> : null}
          </div>
        </div>
      ) : null}

      {selectedTab === "history" ? (
        <div className="manuscript-inspector-body manuscript-history-body">
          <div className="manuscript-inspector-heading"><FileClock size={17} /><div><strong>章节历史</strong><span>对比并恢复本地版本</span></div></div>
          {selectedScene ? <p>历史按整章保存。返回整章后可查看和恢复。</p> : historyLoading ? <p>正在读取版本...</p> : (
            <>
              <div className="manuscript-version-list">
                {versions.map((version) => <button className={version.id === selectedVersionId ? "is-active" : ""} key={version.id} type="button" onClick={() => onSelectVersion(version.id)}><History size={14} /><span><strong>{versionReasonLabel(version.reason)}</strong><small>{new Date(version.createdAt).toLocaleString("zh-CN")}</small></span></button>)}
              </div>
              {selectedVersion && versionDiff ? <div className="manuscript-version-diff"><div><span>该版本</span><pre>{versionDiff.removed || "无删除内容"}</pre></div><div><span>当前章节</span><pre>{versionDiff.added || "无新增内容"}</pre></div><button type="button" onClick={() => onRestoreVersion && void onRestoreVersion(selectedVersion)}><RotateCcw size={15} />恢复这个版本</button></div> : null}
              {!versions.length ? <p>保存正文后，这里会出现章节版本。</p> : null}
            </>
          )}
        </div>
      ) : null}
    </aside>
  );
}
