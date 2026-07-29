"use client";

import {
  BookOpen,
  ChevronRight,
  Combine,
  FilePlus2,
  FileDown,
  FileText,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Scissors,
  Trash2
} from "lucide-react";
import {
  countManuscriptWords,
  manuscriptPlainText,
  manuscriptStatusLabels,
  manuscriptStatusOrder,
  type ManuscriptBook,
  type ManuscriptChapter,
  type ManuscriptScene,
  type ManuscriptStatus,
  type ManuscriptVolume
} from "../../manuscript";
import type { ProjectReferenceOption } from "../ProjectReferencePicker";
import { RichTextEditor } from "../RichTextEditor";

type EntityOption = {
  id: string;
  title: string;
  type: string;
};

type AssetOption = {
  id: string;
  name: string;
  url: string;
};

export function ManuscriptWritingPanel({
  assets,
  entities,
  onAddScene,
  onCreateInitialStructure,
  onDeleteSelectedUnit,
  onMergeNextChapter,
  onOpenPublication,
  onOpenReview,
  onToggleInspector,
  onToggleOutline,
  onSelectChapter,
  onSplitChapter,
  onUpdateChapter,
  onUpdateScene,
  referenceOptions,
  selectedBook,
  selectedChapter,
  selectedScene,
  selectedVolume,
  inspectorOpen,
  outlineOpen,
  tags,
  worldId
}: {
  assets: AssetOption[];
  entities: EntityOption[];
  onAddScene: (chapter: ManuscriptChapter) => void;
  onCreateInitialStructure: () => void;
  onDeleteSelectedUnit: () => void;
  onMergeNextChapter: () => void;
  onOpenPublication: () => void;
  onOpenReview: () => void;
  onToggleInspector: () => void;
  onToggleOutline: () => void;
  onSelectChapter: (chapterId: string) => void;
  onSplitChapter: () => void;
  onUpdateChapter: (id: string, patch: Partial<ManuscriptChapter>) => void;
  onUpdateScene: (id: string, patch: Partial<ManuscriptScene>) => void;
  referenceOptions: ProjectReferenceOption[];
  selectedBook: ManuscriptBook | null;
  selectedChapter: ManuscriptChapter | null;
  selectedScene: ManuscriptScene | null;
  selectedVolume: ManuscriptVolume | null;
  inspectorOpen: boolean;
  outlineOpen: boolean;
  tags: string[];
  worldId: string;
}) {
  const selectedUnit = selectedScene ?? selectedChapter;
  const paneControls = (
    <>
      <button
        aria-label={outlineOpen ? "收起书稿目录" : "展开书稿目录"}
        className={outlineOpen ? "is-active" : ""}
        title={outlineOpen ? "收起书稿目录" : "展开书稿目录"}
        type="button"
        onClick={onToggleOutline}
      >
        {outlineOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>
      <button
        aria-label={inspectorOpen ? "收起文稿检查栏" : "展开文稿检查栏"}
        className={inspectorOpen ? "is-active" : ""}
        title={inspectorOpen ? "收起文稿检查栏" : "展开文稿检查栏"}
        type="button"
        onClick={onToggleInspector}
      >
        {inspectorOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
      </button>
    </>
  );

  return (
    <main className="manuscript-writing-panel">
      {selectedUnit && selectedChapter ? (
        <>
          <header className="manuscript-writing-header">
            <div className="manuscript-breadcrumb">
              <span>{selectedBook?.title}</span><ChevronRight size={13} /><span>{selectedVolume?.title}</span>
              {selectedScene ? <><ChevronRight size={13} /><span>{selectedChapter.title}</span></> : null}
            </div>
            <div className="manuscript-title-line">
              <input
                aria-label={selectedScene ? "场景标题" : "章节标题"}
                value={selectedUnit.title}
                onChange={(event) => selectedScene
                  ? onUpdateScene(selectedScene.id, { title: event.target.value })
                  : onUpdateChapter(selectedChapter.id, { title: event.target.value })}
              />
              <div>
                <span>{countManuscriptWords(selectedUnit.body).toLocaleString("zh-CN")} 字</span>
                {paneControls}
                <button aria-label="批注与修订" title="批注与修订" type="button" onClick={onOpenReview}><MessageSquareText size={16} /></button>
                <button aria-label="出版文稿" title="出版文稿" type="button" onClick={onOpenPublication}><FileDown size={16} /></button>
                {!selectedScene ? <button aria-label="拆分章节" disabled={!manuscriptPlainText(selectedChapter.body)} title="从正文中段拆分为下一章" type="button" onClick={onSplitChapter}><Scissors size={16} /></button> : null}
                {!selectedScene ? <button aria-label="合并下一章" title="合并下一章" type="button" onClick={onMergeNextChapter}><Combine size={16} /></button> : null}
                <button aria-label="删除当前文稿项" title="删除" type="button" onClick={onDeleteSelectedUnit}><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="manuscript-quick-meta">
              <select
                aria-label="文稿状态"
                value={selectedUnit.status}
                onChange={(event) => selectedScene
                  ? onUpdateScene(selectedScene.id, { status: event.target.value as ManuscriptStatus })
                  : onUpdateChapter(selectedChapter.id, { status: event.target.value as ManuscriptStatus })}
              >
                {manuscriptStatusOrder.map((status) => <option key={status} value={status}>{manuscriptStatusLabels[status]}</option>)}
              </select>
              {!selectedScene ? <button type="button" onClick={() => onAddScene(selectedChapter)}><Plus size={15} />场景</button> : null}
              {selectedScene ? <button type="button" onClick={() => onSelectChapter(selectedChapter.id)}><FileText size={15} />返回整章</button> : null}
            </div>
          </header>
          <div
            className="manuscript-prose-editor"
            data-reference-path="body"
            data-reference-source-id={selectedUnit.id}
            data-reference-source-kind={selectedScene ? "manuscript-scene" : "manuscript-chapter"}
          >
            <RichTextEditor
              aiTarget={{
                worldId,
                kind: selectedScene ? "manuscript-scene" : "manuscript-chapter",
                objectId: selectedUnit.id,
                contextId: `${selectedScene ? "manuscript-scene" : "manuscript-chapter"}:${selectedUnit.id}`,
                fieldPath: "body",
                fieldLabel: `${selectedUnit.title || "当前文稿"}正文`,
                format: "rich-text"
              }}
              assets={assets}
              content={selectedUnit.body}
              entities={entities}
              entityId={selectedUnit.id}
              key={`${selectedScene ? "scene" : "chapter"}:${selectedUnit.id}`}
              references={referenceOptions}
              sectionTitle={selectedUnit.title || "正文"}
              tags={tags}
              onChange={(body) => selectedScene
                ? onUpdateScene(selectedScene.id, { body })
                : onUpdateChapter(selectedChapter.id, { body })}
            />
          </div>
        </>
      ) : (
        <div className="manuscript-empty-state">
          <div className="manuscript-empty-pane-controls">{paneControls}</div>
          <BookOpen size={38} />
          <h2>从第一章开始</h2>
          <button type="button" onClick={onCreateInitialStructure}><FilePlus2 size={17} />建立书稿</button>
        </div>
      )}
    </main>
  );
}
