"use client";

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleStop,
  Copy,
  FileText,
  GitBranch,
  ListTree,
  MessagesSquare,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Trash2,
  UserRound,
  Variable
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  applyStoryEffects,
  coerceStoryValue,
  createDialogueChoice,
  createDialogueNode,
  createInitialStoryState,
  createStoryCondition,
  createStoryEffect,
  defaultValueForType,
  storyConditionOperatorsForType,
  storyConditionsPass,
  storyEffectOperationsForType,
  validateStoryScene,
  validateStoryVariables
} from "../story";
import { formatTimelineInterval } from "../world-planning";
import type { TimelineEvent } from "../world-planning";
import type { ManuscriptWorkspaceData } from "../manuscript";
import type {
  ManuscriptPublicationExportResult,
  ManuscriptPublicationRequest
} from "../manuscript-publication";
import type { ProjectObjectRef } from "../project-references";
import type { ProjectReferenceOption } from "./ProjectReferencePicker";
import type { InlineAiTarget } from "../inline-ai";
import { InlineAiTextarea } from "./InlineAiAssistant";
import {
  ManuscriptWorkspace,
  type ManuscriptChapterVersion
} from "./ManuscriptWorkspace";
import type {
  DialogueChoice,
  DialogueNode,
  StoryCondition,
  StoryConditionOperator,
  StoryEffect,
  StoryEffectOperation,
  StoryScene,
  StorySceneStatus,
  StoryState,
  StoryValidationIssue,
  StoryValue,
  StoryVariable,
  StoryVariableType
} from "../story";

export type StoryWorkspaceMode = "manuscript" | "editor" | "variables" | "preview";

type EntityOption = {
  id: string;
  title: string;
  type: string;
  typeLabel: string;
};

type QuestOption = {
  id: string;
  title: string;
};

const sceneStatusMeta: Record<StorySceneStatus, { label: string; helper: string }> = {
  draft: { label: "草稿", helper: "仍在搭建结构" },
  review: { label: "待审", helper: "等待剧情审阅" },
  ready: { label: "已确认", helper: "可进入制作" }
};

const variableTypeMeta: Record<StoryVariableType, { label: string; helper: string }> = {
  boolean: { label: "开关", helper: "真或假" },
  number: { label: "数值", helper: "声望、计数与进度" },
  text: { label: "文本", helper: "阵营、路线或自定义状态" }
};

const conditionOperatorLabels: Record<StoryConditionOperator, string> = {
  equals: "等于",
  notEquals: "不等于",
  greaterThan: "大于",
  lessThan: "小于",
  atLeast: "大于等于",
  atMost: "小于等于",
  truthy: "为真",
  falsy: "为假"
};

const effectOperationLabels: Record<StoryEffectOperation, string> = {
  set: "设为",
  increment: "增加",
  decrement: "减少",
  toggle: "切换"
};

function operatorsForVariable(variable?: StoryVariable): StoryConditionOperator[] {
  return storyConditionOperatorsForType(variable?.type);
}

function operationsForVariable(variable?: StoryVariable): StoryEffectOperation[] {
  return storyEffectOperationsForType(variable?.type);
}

function formatStoryValue(value: StoryValue) {
  if (typeof value === "boolean") return value ? "真" : "假";
  if (value === "") return "空文本";
  return String(value);
}

export function StoryWorkspace({
  assets,
  entities,
  manuscriptData,
  mode,
  onCreateChapter,
  onCreateScene,
  onCreateVariable,
  onDeleteScene,
  onDeleteVariable,
  onLoadManuscriptChapterVersions,
  onExportManuscriptPublication,
  onManuscriptChange,
  onModeChange,
  onOpenTimeline,
  onRestoreManuscriptChapterVersion,
  onSelectScene,
  onSelectManuscript,
  onSelectVariable,
  onUpdateScene,
  onUpdateVariable,
  quests,
  referenceOptions,
  referenceFocus,
  scenes,
  selectedManuscriptChapterId,
  selectedSceneId,
  selectedVariableId,
  tags,
  timelineEvents,
  variables,
  worldId,
  worldName
}: {
  assets: Array<{ id: string; name: string; storedName: string; url: string }>;
  entities: EntityOption[];
  manuscriptData: ManuscriptWorkspaceData;
  mode: StoryWorkspaceMode;
  onCreateChapter: () => void;
  onCreateScene: () => void;
  onCreateVariable: () => void;
  onDeleteScene: (sceneId: string) => void | Promise<void>;
  onDeleteVariable: (variableId: string) => void | Promise<void>;
  onLoadManuscriptChapterVersions: (
    chapterId: string
  ) => Promise<ManuscriptChapterVersion[]>;
  onExportManuscriptPublication: (
    request: ManuscriptPublicationRequest
  ) => Promise<ManuscriptPublicationExportResult>;
  onManuscriptChange: (
    data: ManuscriptWorkspaceData,
    reason: string,
    destructive?: boolean
  ) => void | Promise<void>;
  onModeChange: (mode: StoryWorkspaceMode) => void;
  onOpenTimeline: (eventId: string) => void;
  onRestoreManuscriptChapterVersion: (
    version: ManuscriptChapterVersion
  ) => void | Promise<void>;
  onSelectScene: (sceneId: string) => void;
  onSelectManuscript: (selection: { kind: "chapter" | "scene"; id: string }) => void;
  onSelectVariable: (variableId: string) => void;
  onUpdateScene: (sceneId: string, patch: Partial<StoryScene>) => void;
  onUpdateVariable: (variableId: string, patch: Partial<StoryVariable>) => void;
  quests: QuestOption[];
  referenceOptions: ProjectReferenceOption[];
  referenceFocus: {
    source: ProjectObjectRef;
    anchor: { path: string };
    token: number;
  } | null;
  scenes: StoryScene[];
  selectedManuscriptChapterId: string;
  selectedSceneId: string;
  selectedVariableId: string;
  tags: string[];
  timelineEvents: TimelineEvent[];
  variables: StoryVariable[];
  worldId: string;
  worldName: string;
}) {
  const [sceneQuery, setSceneQuery] = useState("");
  const [variableQuery, setVariableQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [previewNodeId, setPreviewNodeId] = useState("");
  const [previewState, setPreviewState] = useState<StoryState>({});
  const [previewHistory, setPreviewHistory] = useState<string[]>([]);
  const [previewBlocked, setPreviewBlocked] = useState("");

  const selectedScene =
    scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0] ?? null;
  const selectedVariable =
    variables.find((variable) => variable.id === selectedVariableId) ?? variables[0] ?? null;
  const selectedNode =
    selectedScene?.nodes.find((node) => node.id === selectedNodeId) ??
    selectedScene?.nodes.find((node) => node.id === selectedScene.entryNodeId) ??
    selectedScene?.nodes[0] ??
    null;

  const filteredScenes = useMemo(() => {
    const query = sceneQuery.trim().toLocaleLowerCase();
    return scenes.filter((scene) =>
      query
        ? [scene.title, scene.summary, scene.notes]
            .join(" ")
            .toLocaleLowerCase()
            .includes(query)
        : true
    );
  }, [sceneQuery, scenes]);

  const filteredVariables = useMemo(() => {
    const query = variableQuery.trim().toLocaleLowerCase();
    return variables.filter((variable) =>
      query
        ? [variable.name, variable.key, variable.description]
            .join(" ")
            .toLocaleLowerCase()
            .includes(query)
        : true
    );
  }, [variableQuery, variables]);

  const sceneIssues = useMemo(
    () =>
      selectedScene
        ? validateStoryScene(selectedScene, {
            variableIds: new Set(variables.map((variable) => variable.id)),
            entityIds: new Set(entities.map((entity) => entity.id)),
            questIds: new Set(quests.map((quest) => quest.id))
          })
        : [],
    [entities, quests, selectedScene, variables]
  );

  const variableIssues = useMemo(() => validateStoryVariables(variables), [variables]);

  const variableUsage = useMemo(() => {
    const usage = new Map<string, Set<string>>();
    variables.forEach((variable) => usage.set(variable.id, new Set()));
    scenes.forEach((scene) => {
      const register = (variableId: string) => usage.get(variableId)?.add(scene.id);
      scene.nodes.forEach((node) => {
        node.conditions.forEach((condition) => register(condition.variableId));
        node.effects.forEach((effect) => register(effect.variableId));
        node.choices.forEach((choice) => {
          choice.conditions.forEach((condition) => register(condition.variableId));
          choice.effects.forEach((effect) => register(effect.variableId));
        });
      });
    });
    return usage;
  }, [scenes, variables]);

  const currentPreviewNode =
    selectedScene?.nodes.find((node) => node.id === previewNodeId) ?? null;

  useEffect(() => {
    setSelectedNodeId(selectedScene?.entryNodeId || selectedScene?.nodes[0]?.id || "");
    setPreviewNodeId("");
    setPreviewHistory([]);
    setPreviewBlocked("");
  }, [selectedScene?.id]);

  useEffect(() => {
    if (
      !selectedScene ||
      referenceFocus?.source.kind !== "scene" ||
      referenceFocus.source.id !== selectedScene.id
    ) {
      return;
    }
    const nodeIndex = Number(referenceFocus.anchor.path.match(/^nodes\[(\d+)\]/)?.[1]);
    if (Number.isInteger(nodeIndex) && selectedScene.nodes[nodeIndex]) {
      setSelectedNodeId(selectedScene.nodes[nodeIndex].id);
    }
  }, [referenceFocus?.token, selectedScene]);

  useEffect(() => {
    if (selectedScene && selectedNodeId && !selectedScene.nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(selectedScene.entryNodeId || selectedScene.nodes[0]?.id || "");
    }
  }, [selectedNodeId, selectedScene]);

  function updateSelectedScene(patch: Partial<StoryScene>) {
    if (selectedScene) onUpdateScene(selectedScene.id, patch);
  }

  function updateNodes(nodes: DialogueNode[], patch: Partial<StoryScene> = {}) {
    updateSelectedScene({ nodes, ...patch });
  }

  function updateNode(nodeId: string, patch: Partial<DialogueNode>) {
    if (!selectedScene) return;
    updateNodes(
      selectedScene.nodes.map((node) => (node.id === nodeId ? { ...node, ...patch } : node))
    );
  }

  function addNode() {
    if (!selectedScene) return;
    const node = createDialogueNode(`对白节点 ${selectedScene.nodes.length + 1}`);
    updateNodes([...selectedScene.nodes, node], {
      entryNodeId: selectedScene.entryNodeId || node.id
    });
    setSelectedNodeId(node.id);
  }

  function duplicateNode(node: DialogueNode) {
    if (!selectedScene) return;
    const clone = createDialogueNode(`${node.label} 副本`);
    clone.speakerEntityId = node.speakerEntityId;
    clone.text = node.text;
    clone.stageDirection = node.stageDirection;
    clone.nextNodeId = node.nextNodeId;
    clone.isEnding = node.isEnding;
    clone.conditions = node.conditions.map((condition) => ({
      ...condition,
      id: createStoryCondition(condition.variableId).id
    }));
    clone.effects = node.effects.map((effect) => ({
      ...effect,
      id: createStoryEffect(effect.variableId).id
    }));
    clone.choices = node.choices.map((choice) => ({
      ...choice,
      id: createDialogueChoice(choice.targetNodeId).id,
      conditions: choice.conditions.map((condition) => ({
        ...condition,
        id: createStoryCondition(condition.variableId).id
      })),
      effects: choice.effects.map((effect) => ({
        ...effect,
        id: createStoryEffect(effect.variableId).id
      }))
    }));
    updateNodes([...selectedScene.nodes, clone]);
    setSelectedNodeId(clone.id);
  }

  function moveNode(nodeId: string, offset: -1 | 1) {
    if (!selectedScene) return;
    const index = selectedScene.nodes.findIndex((node) => node.id === nodeId);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= selectedScene.nodes.length) return;
    const nodes = [...selectedScene.nodes];
    [nodes[index], nodes[target]] = [nodes[target], nodes[index]];
    updateNodes(nodes);
  }

  function deleteNode(node: DialogueNode) {
    if (!selectedScene || selectedScene.nodes.length <= 1) return;
    if (!window.confirm(`删除对白节点“${node.label}”？指向它的跳转会被清空。`)) return;

    const nodes = selectedScene.nodes
      .filter((item) => item.id !== node.id)
      .map((item) => ({
        ...item,
        nextNodeId: item.nextNodeId === node.id ? "" : item.nextNodeId,
        choices: item.choices.map((choice) => ({
          ...choice,
          targetNodeId: choice.targetNodeId === node.id ? "" : choice.targetNodeId
        }))
      }));
    const entryNodeId =
      selectedScene.entryNodeId === node.id ? nodes[0]?.id ?? "" : selectedScene.entryNodeId;
    updateNodes(nodes, { entryNodeId });
    setSelectedNodeId(entryNodeId || nodes[0]?.id || "");
  }

  function updateChoice(nodeId: string, choiceId: string, patch: Partial<DialogueChoice>) {
    if (!selectedScene) return;
    const node = selectedScene.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    updateNode(nodeId, {
      choices: node.choices.map((choice) =>
        choice.id === choiceId ? { ...choice, ...patch } : choice
      )
    });
  }

  function startPreview() {
    if (!selectedScene) return;
    const initialState = createInitialStoryState(variables);
    const entry = selectedScene.nodes.find((node) => node.id === selectedScene.entryNodeId);
    if (!entry) {
      setPreviewNodeId("");
      setPreviewState(initialState);
      setPreviewHistory([]);
      setPreviewBlocked("入口节点不存在");
      return;
    }
    if (!storyConditionsPass(entry.conditions, variables, initialState)) {
      setPreviewNodeId("");
      setPreviewState(initialState);
      setPreviewHistory([]);
      setPreviewBlocked("当前默认变量无法满足入口条件");
      return;
    }
    setPreviewNodeId(entry.id);
    setPreviewState(applyStoryEffects(entry.effects, variables, initialState));
    setPreviewHistory([entry.id]);
    setPreviewBlocked("");
  }

  function enterPreviewNode(targetNodeId: string, candidateState: StoryState) {
    if (!selectedScene) return;
    const target = selectedScene.nodes.find((node) => node.id === targetNodeId);
    if (!target) {
      setPreviewBlocked("目标节点不存在");
      return;
    }
    if (!storyConditionsPass(target.conditions, variables, candidateState)) {
      setPreviewBlocked(`“${target.label}”的进入条件尚未满足`);
      return;
    }
    setPreviewState(applyStoryEffects(target.effects, variables, candidateState));
    setPreviewNodeId(target.id);
    setPreviewHistory((history) => [...history, target.id]);
    setPreviewBlocked("");
  }

  function choosePreviewOption(choice: DialogueChoice) {
    const afterChoice = applyStoryEffects(choice.effects, variables, previewState);
    enterPreviewNode(choice.targetNodeId, afterChoice);
  }

  function resetPreview() {
    setPreviewNodeId("");
    setPreviewState(createInitialStoryState(variables));
    setPreviewHistory([]);
    setPreviewBlocked("");
  }

  return (
    <section className="story-workspace">
      <div className="story-workspace-toolbar">
        <div>
          <div className="eyebrow">
            <MessagesSquare size={14} />
            <span>剧情生产</span>
          </div>
          <h2>{mode === "manuscript" ? "小说正文与章节" : "场景、对白与剧情状态"}</h2>
        </div>
        <div className="story-mode-switch" aria-label="剧情工作模式">
          <button
            className={mode === "manuscript" ? "is-active" : ""}
            type="button"
            onClick={() => onModeChange("manuscript")}
          >
            <FileText size={16} />
            <span>正文</span>
          </button>
          <button
            className={mode === "editor" ? "is-active" : ""}
            type="button"
            onClick={() => onModeChange("editor")}
          >
            <MessagesSquare size={16} />
            <span>场景</span>
          </button>
          <button
            className={mode === "variables" ? "is-active" : ""}
            type="button"
            onClick={() => onModeChange("variables")}
          >
            <Variable size={16} />
            <span>变量</span>
          </button>
          <button
            className={mode === "preview" ? "is-active" : ""}
            type="button"
            onClick={() => onModeChange("preview")}
          >
            <Play size={16} />
            <span>模拟</span>
          </button>
        </div>
        <button
          className="story-primary-button"
          type="button"
          onClick={
            mode === "manuscript"
              ? onCreateChapter
              : mode === "variables"
                ? onCreateVariable
                : onCreateScene
          }
        >
          <Plus size={17} />
          <span>
            {mode === "manuscript"
              ? "新建章节"
              : mode === "variables"
                ? "新建变量"
                : "新建场景"}
          </span>
        </button>
      </div>

      {mode === "manuscript" ? (
        <ManuscriptWorkspace
          assets={assets}
          data={manuscriptData}
          entities={entities}
          selectedChapterId={selectedManuscriptChapterId}
          tags={tags}
          worldId={worldId}
          worldName={worldName}
          onChange={onManuscriptChange}
          onLoadChapterVersions={onLoadManuscriptChapterVersions}
          onExportPublication={onExportManuscriptPublication}
          onRestoreChapterVersion={onRestoreManuscriptChapterVersion}
          onSelect={onSelectManuscript}
          referenceOptions={referenceOptions}
        />
      ) : null}

      {mode === "editor" ? (
        <div className="story-layout">
          <SceneBrowser
            filteredScenes={filteredScenes}
            query={sceneQuery}
            scenes={scenes}
            selectedSceneId={selectedScene?.id ?? ""}
            onCreateScene={onCreateScene}
            onQueryChange={setSceneQuery}
            onSelectScene={onSelectScene}
          />

          <div
            className="panel story-editor-panel"
            data-reference-path={selectedScene ? "summary" : undefined}
            data-reference-source-id={selectedScene?.id}
            data-reference-source-kind={selectedScene ? "scene" : undefined}
          >
            {selectedScene ? (
              <>
                <div className="story-scene-header">
                  <div className="story-scene-title-row">
                    <input
                      aria-label="场景标题"
                      value={selectedScene.title}
                      onChange={(event) => updateSelectedScene({ title: event.target.value })}
                    />
                    <select
                      aria-label="场景状态"
                      value={selectedScene.status}
                      onChange={(event) =>
                        updateSelectedScene({ status: event.target.value as StorySceneStatus })
                      }
                    >
                      {(Object.keys(sceneStatusMeta) as StorySceneStatus[]).map((status) => (
                        <option key={status} value={status}>
                          {sceneStatusMeta[status].label}
                        </option>
                      ))}
                    </select>
                    <button
                      aria-label="删除场景"
                      className="icon-button danger-icon-button"
                      type="button"
                      onClick={() => {
                        if (window.confirm(`删除剧情场景“${selectedScene.title}”？软件会先创建备份。`)) {
                          void onDeleteScene(selectedScene.id);
                        }
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <InlineAiTextarea
                    aiTarget={{
                      worldId: selectedScene.worldId,
                      kind: "scene",
                      objectId: selectedScene.id,
                      contextId: `scene:${selectedScene.id}`,
                      fieldPath: "summary",
                      fieldLabel: "场景摘要",
                      format: "plain"
                    }}
                    aria-label="场景摘要"
                    data-reference-path="summary"
                    data-reference-source-id={selectedScene.id}
                    data-reference-source-kind="scene"
                    placeholder="场景摘要"
                    rows={2}
                    value={selectedScene.summary}
                    onChange={(value) => updateSelectedScene({ summary: value })}
                  />
                </div>

                <div className="story-node-strip">
                  <div className="story-node-tabs">
                    {selectedScene.nodes.map((node, index) => (
                      <button
                        className={node.id === selectedNode?.id ? "is-active" : ""}
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNodeId(node.id)}
                      >
                        <span>{index + 1}</span>
                        <strong>{node.label}</strong>
                        {node.id === selectedScene.entryNodeId ? <small>入口</small> : null}
                      </button>
                    ))}
                  </div>
                  <button aria-label="添加对白节点" className="icon-button" type="button" onClick={addNode}>
                    <Plus size={17} />
                  </button>
                </div>

                {selectedNode ? (
                  <DialogueNodeEditor
                    entities={entities}
                    node={selectedNode}
                    nodes={selectedScene.nodes}
                    sceneId={selectedScene.id}
                    worldId={selectedScene.worldId}
                    variables={variables}
                    onAddChoice={() => {
                      const target = selectedScene.nodes.find((node) => node.id !== selectedNode.id);
                      updateNode(selectedNode.id, {
                        nextNodeId: "",
                        choices: [
                          ...selectedNode.choices,
                          createDialogueChoice(target?.id ?? "")
                        ]
                      });
                    }}
                    onDelete={() => deleteNode(selectedNode)}
                    onDuplicate={() => duplicateNode(selectedNode)}
                    onMove={(offset) => moveNode(selectedNode.id, offset)}
                    onRemoveChoice={(choiceId) =>
                      updateNode(selectedNode.id, {
                        choices: selectedNode.choices.filter((choice) => choice.id !== choiceId)
                      })
                    }
                    onUpdate={(patch) => updateNode(selectedNode.id, patch)}
                    onUpdateChoice={(choiceId, patch) =>
                      updateChoice(selectedNode.id, choiceId, patch)
                    }
                  />
                ) : (
                  <StoryEmptyState
                    actionLabel="添加对白节点"
                    icon={<MessagesSquare size={32} />}
                    title="场景还没有对白节点"
                    onAction={addNode}
                  />
                )}
              </>
            ) : (
              <StoryEmptyState
                actionLabel="创建剧情场景"
                icon={<MessagesSquare size={32} />}
                title="还没有剧情场景"
                onAction={onCreateScene}
              />
            )}
          </div>

          <SceneInspector
            entities={entities}
            issues={sceneIssues}
            onOpenTimeline={onOpenTimeline}
            quests={quests}
            scene={selectedScene}
            selectedNodeId={selectedNode?.id ?? ""}
            timelineEvents={timelineEvents}
            onSelectNode={setSelectedNodeId}
            onUpdateScene={updateSelectedScene}
          />
        </div>
      ) : null}

      {mode === "variables" ? (
        <div className="story-variable-layout">
          <div className="panel story-variable-list-panel">
            <div className="panel-heading compact">
              <div>
                <h2>剧情变量</h2>
                <p>{variables.length} 个世界状态</p>
              </div>
              <button aria-label="新建变量" className="icon-button" type="button" onClick={onCreateVariable}>
                <Plus size={17} />
              </button>
            </div>
            <label className="search-box">
              <Search size={16} />
              <input
                placeholder="搜索变量名或键"
                value={variableQuery}
                onChange={(event) => setVariableQuery(event.target.value)}
              />
            </label>
            <div className="story-variable-list">
              {filteredVariables.map((variable) => (
                <button
                  className={variable.id === selectedVariable?.id ? "is-active" : ""}
                  key={variable.id}
                  type="button"
                  onClick={() => onSelectVariable(variable.id)}
                >
                  <span className={`story-variable-type type-${variable.type}`}>
                    <Variable size={16} />
                  </span>
                  <span>
                    <strong>{variable.name}</strong>
                    <small>{variable.key}</small>
                  </span>
                  <em>{variableTypeMeta[variable.type].label}</em>
                </button>
              ))}
            </div>
          </div>

          <div className="panel story-variable-editor-panel">
            {selectedVariable ? (
              <>
                <div className="panel-heading">
                  <div>
                    <h2>变量设置</h2>
                    <p>{variableTypeMeta[selectedVariable.type].helper}</p>
                  </div>
                  <button
                    aria-label="删除变量"
                    className="icon-button danger-icon-button"
                    type="button"
                    onClick={() => {
                      const count = variableUsage.get(selectedVariable.id)?.size ?? 0;
                      if (
                        window.confirm(
                          `删除变量“${selectedVariable.name}”？${count ? `它正在被 ${count} 个场景使用，删除后会产生检查错误。` : "软件会先创建备份。"}`
                        )
                      ) {
                        void onDeleteVariable(selectedVariable.id);
                      }
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="story-variable-form">
                  <StoryField label="显示名称">
                    <input
                      value={selectedVariable.name}
                      onChange={(event) =>
                        onUpdateVariable(selectedVariable.id, { name: event.target.value })
                      }
                    />
                  </StoryField>
                  <StoryField label="变量键">
                    <input
                      value={selectedVariable.key}
                      onChange={(event) =>
                        onUpdateVariable(selectedVariable.id, {
                          key: event.target.value.replace(/\s+/g, "_")
                        })
                      }
                    />
                  </StoryField>
                  <StoryField label="类型">
                    <select
                      value={selectedVariable.type}
                      onChange={(event) => {
                        const type = event.target.value as StoryVariableType;
                        onUpdateVariable(selectedVariable.id, {
                          type,
                          defaultValue: defaultValueForType(type)
                        });
                      }}
                    >
                      {(Object.keys(variableTypeMeta) as StoryVariableType[]).map((type) => (
                        <option key={type} value={type}>
                          {variableTypeMeta[type].label}
                        </option>
                      ))}
                    </select>
                  </StoryField>
                  <StoryField label="默认值">
                    <StoryValueInput
                      value={selectedVariable.defaultValue}
                      variable={selectedVariable}
                      onChange={(defaultValue) =>
                        onUpdateVariable(selectedVariable.id, { defaultValue })
                      }
                    />
                  </StoryField>
                  <StoryField label="说明" wide>
                    <textarea
                      rows={5}
                      value={selectedVariable.description}
                      onChange={(event) =>
                        onUpdateVariable(selectedVariable.id, {
                          description: event.target.value
                        })
                      }
                    />
                  </StoryField>
                </div>
              </>
            ) : (
              <StoryEmptyState
                actionLabel="创建剧情变量"
                icon={<Variable size={32} />}
                title="还没有剧情变量"
                onAction={onCreateVariable}
              />
            )}
          </div>

          <div className="panel story-variable-usage-panel">
            <div className="panel-heading compact">
              <div>
                <h2>使用情况</h2>
                <p>条件与效果引用</p>
              </div>
              <ListTree size={19} />
            </div>
            {selectedVariable ? (
              <>
                <div className="story-variable-current-value">
                  <span>默认值</span>
                  <strong>{formatStoryValue(selectedVariable.defaultValue)}</strong>
                </div>
                <div className="story-variable-usage-list">
                  {Array.from(variableUsage.get(selectedVariable.id) ?? []).length ? (
                    Array.from(variableUsage.get(selectedVariable.id) ?? []).map((sceneId) => {
                      const scene = scenes.find((item) => item.id === sceneId);
                      return scene ? (
                        <button
                          key={scene.id}
                          type="button"
                          onClick={() => {
                            onSelectScene(scene.id);
                            onModeChange("editor");
                          }}
                        >
                          <MessagesSquare size={15} />
                          <span>{scene.title}</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : null;
                    })
                  ) : (
                    <p className="muted-text">尚未被任何场景使用</p>
                  )}
                </div>
                {variableIssues
                  .filter((issue) => issue.id.endsWith(selectedVariable.id))
                  .map((issue) => (
                    <div className="story-inline-warning" key={issue.id}>
                      <AlertTriangle size={16} />
                      <span>{issue.title}</span>
                    </div>
                  ))}
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {mode === "preview" ? (
        <div className="story-preview-layout">
          <SceneBrowser
            filteredScenes={filteredScenes}
            query={sceneQuery}
            scenes={scenes}
            selectedSceneId={selectedScene?.id ?? ""}
            onCreateScene={onCreateScene}
            onQueryChange={setSceneQuery}
            onSelectScene={onSelectScene}
          />

          <div className="panel story-preview-panel">
            <div className="panel-heading">
              <div>
                <h2>{selectedScene?.title ?? "剧情模拟"}</h2>
                <p>{selectedScene ? sceneStatusMeta[selectedScene.status].helper : "选择一个场景"}</p>
              </div>
              <div className="story-preview-actions">
                <button type="button" onClick={startPreview} disabled={!selectedScene}>
                  <Play size={16} />
                  <span>从入口开始</span>
                </button>
                <button aria-label="重置模拟" type="button" onClick={resetPreview}>
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {previewBlocked ? (
              <div className="story-preview-blocked">
                <AlertTriangle size={20} />
                <div>
                  <strong>流程被阻断</strong>
                  <span>{previewBlocked}</span>
                </div>
              </div>
            ) : null}

            {currentPreviewNode ? (
              <div className="story-preview-stage">
                <div className="story-preview-node-meta">
                  <span>{currentPreviewNode.label}</span>
                  {currentPreviewNode.isEnding ? (
                    <strong>
                      <CircleStop size={14} />
                      结局节点
                    </strong>
                  ) : null}
                </div>
                {currentPreviewNode.stageDirection ? (
                  <p className="story-stage-direction">{currentPreviewNode.stageDirection}</p>
                ) : null}
                <div className="story-dialogue-line">
                  <span className="story-speaker-avatar">
                    <UserRound size={20} />
                  </span>
                  <div>
                    <strong>
                      {entities.find((entity) => entity.id === currentPreviewNode.speakerEntityId)
                        ?.title ?? "旁白"}
                    </strong>
                    <p>{currentPreviewNode.text || "（此节点还没有对白文本）"}</p>
                  </div>
                </div>

                {currentPreviewNode.isEnding ? (
                  <div className="story-preview-finished">
                    <CheckCircle2 size={20} />
                    <strong>场景已结束</strong>
                  </div>
                ) : currentPreviewNode.choices.length ? (
                  <div className="story-preview-choices">
                    {currentPreviewNode.choices.map((choice) => {
                      const available = storyConditionsPass(
                        choice.conditions,
                        variables,
                        previewState
                      );
                      return (
                        <button
                          disabled={!available || !choice.targetNodeId}
                          key={choice.id}
                          type="button"
                          onClick={() => choosePreviewOption(choice)}
                        >
                          <GitBranch size={16} />
                          <span>{choice.text || "未命名选项"}</span>
                          <ArrowRight size={15} />
                        </button>
                      );
                    })}
                  </div>
                ) : currentPreviewNode.nextNodeId ? (
                  <button
                    className="story-preview-next"
                    type="button"
                    onClick={() => enterPreviewNode(currentPreviewNode.nextNodeId, previewState)}
                  >
                    <span>继续</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <div className="story-preview-blocked compact">
                    <AlertTriangle size={18} />
                    <span>该节点没有后续路径，也没有标记为结局</span>
                  </div>
                )}
              </div>
            ) : (
              <StoryEmptyState
                actionLabel="开始模拟"
                icon={<Play size={32} />}
                title={selectedScene ? "从场景入口开始模拟" : "还没有可模拟的场景"}
                onAction={selectedScene ? startPreview : onCreateScene}
              />
            )}

            {previewHistory.length ? (
              <div className="story-preview-history">
                <strong>经过节点</strong>
                <div>
                  {previewHistory.map((nodeId, index) => (
                    <span key={`${nodeId}-${index}`}>
                      {selectedScene?.nodes.find((node) => node.id === nodeId)?.label ?? nodeId}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="panel story-preview-state-panel">
            <div className="panel-heading compact">
              <div>
                <h2>当前变量</h2>
                <p>{variables.length} 个世界状态</p>
              </div>
              <Settings2 size={19} />
            </div>
            <div className="story-preview-variable-list">
              {variables.map((variable) => (
                <StoryField key={variable.id} label={variable.name}>
                  <StoryValueInput
                    value={previewState[variable.id] ?? variable.defaultValue}
                    variable={variable}
                    onChange={(value) =>
                      setPreviewState((state) => ({ ...state, [variable.id]: value }))
                    }
                  />
                  <small>{variable.key}</small>
                </StoryField>
              ))}
            </div>
            {!variables.length ? (
              <p className="muted-text">场景尚未定义剧情变量</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SceneBrowser({
  filteredScenes,
  onCreateScene,
  onQueryChange,
  onSelectScene,
  query,
  scenes,
  selectedSceneId
}: {
  filteredScenes: StoryScene[];
  onCreateScene: () => void;
  onQueryChange: (value: string) => void;
  onSelectScene: (sceneId: string) => void;
  query: string;
  scenes: StoryScene[];
  selectedSceneId: string;
}) {
  return (
    <div className="panel story-scene-list-panel">
      <div className="panel-heading compact">
        <div>
          <h2>剧情场景</h2>
          <p>{scenes.length} 个场景</p>
        </div>
        <button aria-label="新建场景" className="icon-button" type="button" onClick={onCreateScene}>
          <Plus size={17} />
        </button>
      </div>
      <label className="search-box">
        <Search size={16} />
        <input
          placeholder="搜索场景"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <div className="story-scene-list">
        {filteredScenes.map((scene) => (
          <button
            className={scene.id === selectedSceneId ? "is-active" : ""}
            key={scene.id}
            type="button"
            onClick={() => onSelectScene(scene.id)}
          >
            <span className="story-scene-card-icon">
              <MessagesSquare size={17} />
            </span>
            <span>
              <strong>{scene.title}</strong>
              <small>{scene.summary || "暂无摘要"}</small>
              <em>
                {sceneStatusMeta[scene.status].label} · {scene.nodes.length} 节点
              </em>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DialogueNodeEditor({
  entities,
  node,
  nodes,
  onAddChoice,
  onDelete,
  onDuplicate,
  onMove,
  onRemoveChoice,
  onUpdate,
  onUpdateChoice,
  sceneId,
  worldId,
  variables
}: {
  entities: EntityOption[];
  node: DialogueNode;
  nodes: DialogueNode[];
  onAddChoice: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (offset: -1 | 1) => void;
  onRemoveChoice: (choiceId: string) => void;
  onUpdate: (patch: Partial<DialogueNode>) => void;
  onUpdateChoice: (choiceId: string, patch: Partial<DialogueChoice>) => void;
  sceneId: string;
  worldId: string;
  variables: StoryVariable[];
}) {
  const nodeIndex = nodes.findIndex((item) => item.id === node.id);
  const aiTarget = (fieldPath: string, fieldLabel: string): InlineAiTarget => ({
    worldId,
    kind: "scene",
    objectId: sceneId,
    contextId: `scene:${sceneId}`,
    fieldPath,
    fieldLabel,
    format: "plain"
  });
  return (
    <div className="story-node-editor">
      <div className="story-node-editor-heading">
        <div>
          <span>节点 {nodeIndex + 1}</span>
          <input
            aria-label="节点名称"
            value={node.label}
            onChange={(event) => onUpdate({ label: event.target.value })}
          />
        </div>
        <div className="story-node-actions">
          <button aria-label="上移节点" disabled={nodeIndex <= 0} type="button" onClick={() => onMove(-1)}>
            <ChevronUp size={16} />
          </button>
          <button
            aria-label="下移节点"
            disabled={nodeIndex >= nodes.length - 1}
            type="button"
            onClick={() => onMove(1)}
          >
            <ChevronDown size={16} />
          </button>
          <button aria-label="复制节点" type="button" onClick={onDuplicate}>
            <Copy size={16} />
          </button>
          <button aria-label="删除节点" className="is-danger" type="button" onClick={onDelete}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="story-node-fields">
        <StoryField
          label="说话者"
          referencePath={`nodes[${nodeIndex}].speakerEntityId`}
          referenceSource={{ kind: "scene", id: sceneId }}
        >
          <select
            value={node.speakerEntityId}
            onChange={(event) => onUpdate({ speakerEntityId: event.target.value })}
          >
            <option value="">旁白 / 无说话者</option>
            {entities
              .filter((entity) => entity.type === "character")
              .map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.title}
                </option>
              ))}
          </select>
        </StoryField>
        <StoryField
          label="舞台指示"
          referencePath={`nodes[${nodeIndex}].stageDirection`}
          referenceSource={{ kind: "scene", id: sceneId }}
        >
          <input
            placeholder="表情、动作或镜头"
            value={node.stageDirection}
            onChange={(event) => onUpdate({ stageDirection: event.target.value })}
          />
        </StoryField>
        <StoryField
          label="对白 / 旁白"
          referencePath={`nodes[${nodeIndex}].text`}
          referenceSource={{ kind: "scene", id: sceneId }}
          wide
        >
          <InlineAiTextarea
            aiTarget={aiTarget(`nodes[${nodeIndex}].text`, `节点 ${nodeIndex + 1} · 对白 / 旁白`)}
            rows={5}
            value={node.text}
            onChange={(value) => onUpdate({ text: value })}
          />
        </StoryField>
        <label className="story-ending-toggle">
          <input
            checked={node.isEnding}
            type="checkbox"
            onChange={(event) => onUpdate({ isEnding: event.target.checked })}
          />
          <CircleStop size={16} />
          <span>结局节点</span>
        </label>
      </div>

      <div className="story-rule-grid">
        <ConditionEditor
          conditions={node.conditions}
          title="进入条件"
          variables={variables}
          onChange={(conditions) => onUpdate({ conditions })}
        />
        <EffectEditor
          effects={node.effects}
          title="进入后效果"
          variables={variables}
          onChange={(effects) => onUpdate({ effects })}
        />
      </div>

      <div className="story-flow-section">
        <div className="story-section-heading">
          <div>
            <GitBranch size={17} />
            <strong>后续路径</strong>
          </div>
          <button type="button" onClick={onAddChoice} disabled={node.isEnding}>
            <Plus size={15} />
            <span>玩家选项</span>
          </button>
        </div>

        {!node.choices.length ? (
          <StoryField label="下一节点">
            <select
              disabled={node.isEnding}
              value={node.nextNodeId}
              onChange={(event) => onUpdate({ nextNodeId: event.target.value })}
            >
              <option value="">未设置</option>
              {nodes
                .filter((item) => item.id !== node.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
            </select>
          </StoryField>
        ) : (
          <div className="story-choice-list">
            {node.choices.map((choice, index) => (
              <div
                className="story-choice-card"
                key={choice.id}
                data-reference-path={`nodes[${nodeIndex}].choices[${index}].text`}
                data-reference-source-id={sceneId}
                data-reference-source-kind="scene"
              >
                <div className="story-choice-heading">
                  <span>{index + 1}</span>
                  <input
                    aria-label={`玩家选项 ${index + 1}`}
                    value={choice.text}
                    onChange={(event) => onUpdateChoice(choice.id, { text: event.target.value })}
                  />
                  <button aria-label={`删除玩家选项 ${index + 1}`} type="button" onClick={() => onRemoveChoice(choice.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <StoryField label="跳转到">
                  <select
                    value={choice.targetNodeId}
                    onChange={(event) =>
                      onUpdateChoice(choice.id, { targetNodeId: event.target.value })
                    }
                  >
                    <option value="">未设置</option>
                    {nodes
                      .filter((item) => item.id !== node.id)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                  </select>
                </StoryField>
                <details className="story-choice-rules">
                  <summary>
                    条件 {choice.conditions.length} · 效果 {choice.effects.length}
                  </summary>
                  <div className="story-rule-grid">
                    <ConditionEditor
                      conditions={choice.conditions}
                      title="选项条件"
                      variables={variables}
                      onChange={(conditions) => onUpdateChoice(choice.id, { conditions })}
                    />
                    <EffectEditor
                      effects={choice.effects}
                      title="选择后效果"
                      variables={variables}
                      onChange={(effects) => onUpdateChoice(choice.id, { effects })}
                    />
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SceneInspector({
  entities,
  issues,
  onOpenTimeline,
  onSelectNode,
  onUpdateScene,
  quests,
  scene,
  selectedNodeId,
  timelineEvents
}: {
  entities: EntityOption[];
  issues: StoryValidationIssue[];
  onOpenTimeline: (eventId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onUpdateScene: (patch: Partial<StoryScene>) => void;
  quests: QuestOption[];
  scene: StoryScene | null;
  selectedNodeId: string;
  timelineEvents: TimelineEvent[];
}) {
  if (!scene) {
    return <div className="panel story-inspector-panel" />;
  }
  const activeScene = scene;
  const relatedTimelineEvents = timelineEvents.filter((event) => event.sceneId === scene.id);

  function toggleId(key: "relatedEntityIds" | "relatedQuestIds", id: string) {
    const values = activeScene[key];
    onUpdateScene({
      [key]: values.includes(id) ? values.filter((item) => item !== id) : [...values, id]
    });
  }

  return (
    <div className="story-inspector-stack">
      <div className="panel story-inspector-panel">
        <div className="panel-heading compact">
          <div>
            <h2>场景结构</h2>
            <p>{scene.nodes.length} 个对白节点</p>
          </div>
          <ListTree size={19} />
        </div>
        <StoryField label="入口节点">
          <select
            value={scene.entryNodeId}
            onChange={(event) => onUpdateScene({ entryNodeId: event.target.value })}
          >
            {scene.nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label}
              </option>
            ))}
          </select>
        </StoryField>
        <div className="story-flow-list">
          {scene.nodes.map((node, index) => {
            const targets = node.choices.length
              ? node.choices.map((choice) => choice.targetNodeId)
              : [node.nextNodeId];
            return (
              <button
                className={node.id === selectedNodeId ? "is-active" : ""}
                key={node.id}
                type="button"
                onClick={() => onSelectNode(node.id)}
              >
                <span>{index + 1}</span>
                <span>
                  <strong>{node.label}</strong>
                  <small>
                    {node.isEnding
                      ? "结局"
                      : targets.filter(Boolean).length
                        ? `${targets.filter(Boolean).length} 条后续路径`
                        : "无后续路径"}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel story-inspector-panel">
        <div className="panel-heading compact">
          <div>
            <h2>关联内容</h2>
            <p>角色、地点与任务</p>
          </div>
          <FileText size={19} />
        </div>
        <div
          className="story-link-picker"
          data-reference-path="relatedEntityIds"
          data-reference-source-id={scene.id}
          data-reference-source-kind="scene"
        >
          <strong>条目</strong>
          {entities.map((entity) => (
            <label key={entity.id}>
              <input
                checked={scene.relatedEntityIds.includes(entity.id)}
                type="checkbox"
                onChange={() => toggleId("relatedEntityIds", entity.id)}
              />
              <span>{entity.title}</span>
              <small>{entity.typeLabel}</small>
            </label>
          ))}
        </div>
        <div
          className="story-link-picker"
          data-reference-path="relatedQuestIds"
          data-reference-source-id={scene.id}
          data-reference-source-kind="scene"
        >
          <strong>任务</strong>
          {quests.map((quest) => (
            <label key={quest.id}>
              <input
                checked={scene.relatedQuestIds.includes(quest.id)}
                type="checkbox"
                onChange={() => toggleId("relatedQuestIds", quest.id)}
              />
              <span>{quest.title}</span>
            </label>
          ))}
        </div>
        <StoryField
          label="开发备注"
          referencePath="notes"
          referenceSource={{ kind: "scene", id: scene.id }}
        >
          <textarea
            rows={4}
            value={scene.notes}
            onChange={(event) => onUpdateScene({ notes: event.target.value })}
          />
        </StoryField>
      </div>

      <div className="panel story-inspector-panel">
        <div className="panel-heading compact">
          <div>
            <h2>相关时间点</h2>
            <p>{relatedTimelineEvents.length} 个场景节点</p>
          </div>
          <CalendarDays size={19} />
        </div>
        <div className="planning-reference-section story-timeline-links">
          <div>
            <strong>时间线关联</strong>
            <span>{relatedTimelineEvents.length}</span>
          </div>
          {relatedTimelineEvents.map((event) => (
            <button key={event.id} type="button" onClick={() => onOpenTimeline(event.id)}>
              <CalendarDays size={15} />
              <span>
                <strong>{event.title || scene.title}</strong>
                <small>{formatTimelineInterval(event) || event.era || "未设置时间"}</small>
              </span>
            </button>
          ))}
          {!relatedTimelineEvents.length ? (
            <p className="muted-text">这个场景尚未关联时间点</p>
          ) : null}
        </div>
      </div>

      <div className="panel story-inspector-panel">
        <div className="panel-heading compact">
          <div>
            <h2>剧情校验</h2>
            <p>{issues.length} 个问题</p>
          </div>
          {issues.length ? <AlertTriangle size={19} /> : <CheckCircle2 size={19} />}
        </div>
        <div className="story-validation-list">
          {issues.length ? (
            issues.map((issue) => (
              <button
                className={`severity-${issue.severity}`}
                disabled={!issue.nodeId}
                key={issue.id}
                type="button"
                onClick={() => issue.nodeId && onSelectNode(issue.nodeId)}
              >
                <AlertTriangle size={15} />
                <span>
                  <strong>{issue.title}</strong>
                  <small>{issue.detail}</small>
                </span>
              </button>
            ))
          ) : (
            <div className="story-validation-clear">
              <CheckCircle2 size={24} />
              <strong>场景结构检查通过</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConditionEditor({
  conditions,
  onChange,
  title,
  variables
}: {
  conditions: StoryCondition[];
  onChange: (conditions: StoryCondition[]) => void;
  title: string;
  variables: StoryVariable[];
}) {
  function updateCondition(id: string, patch: Partial<StoryCondition>) {
    onChange(
      conditions.map((condition) => (condition.id === id ? { ...condition, ...patch } : condition))
    );
  }

  return (
    <div className="story-rule-editor">
      <div className="story-rule-heading">
        <strong>{title}</strong>
        <button
          aria-label={`添加${title}`}
          disabled={!variables.length}
          type="button"
          onClick={() =>
            onChange([
              ...conditions,
              createStoryCondition(variables[0]?.id ?? "", variables[0]?.type)
            ])
          }
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="story-rule-list">
        {conditions.map((condition) => {
          const variable = variables.find((item) => item.id === condition.variableId);
          const operators = operatorsForVariable(variable);
          return (
            <div className="story-condition-row" key={condition.id}>
              <select
                aria-label="条件变量"
                value={condition.variableId}
                onChange={(event) => {
                  const nextVariable = variables.find((item) => item.id === event.target.value);
                  updateCondition(condition.id, {
                    variableId: event.target.value,
                    operator: operatorsForVariable(nextVariable)[0],
                    value: nextVariable ? defaultValueForType(nextVariable.type) : true
                  });
                }}
              >
                <option value="">缺失变量</option>
                {variables.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="条件运算符"
                value={condition.operator}
                onChange={(event) =>
                  updateCondition(condition.id, {
                    operator: event.target.value as StoryConditionOperator
                  })
                }
              >
                {operators.map((operator) => (
                  <option key={operator} value={operator}>
                    {conditionOperatorLabels[operator]}
                  </option>
                ))}
              </select>
              {condition.operator === "truthy" || condition.operator === "falsy" ? (
                <span className="story-rule-value-placeholder">无需数值</span>
              ) : variable ? (
                <StoryValueInput
                  value={condition.value}
                  variable={variable}
                  onChange={(value) => updateCondition(condition.id, { value })}
                />
              ) : (
                <input disabled value="" />
              )}
              <button
                aria-label="删除条件"
                type="button"
                onClick={() => onChange(conditions.filter((item) => item.id !== condition.id))}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
        {!conditions.length ? <small>始终可进入</small> : null}
      </div>
    </div>
  );
}

function EffectEditor({
  effects,
  onChange,
  title,
  variables
}: {
  effects: StoryEffect[];
  onChange: (effects: StoryEffect[]) => void;
  title: string;
  variables: StoryVariable[];
}) {
  function updateEffect(id: string, patch: Partial<StoryEffect>) {
    onChange(effects.map((effect) => (effect.id === id ? { ...effect, ...patch } : effect)));
  }

  return (
    <div className="story-rule-editor">
      <div className="story-rule-heading">
        <strong>{title}</strong>
        <button
          aria-label={`添加${title}`}
          disabled={!variables.length}
          type="button"
          onClick={() =>
            onChange([
              ...effects,
              createStoryEffect(variables[0]?.id ?? "", variables[0]?.type)
            ])
          }
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="story-rule-list">
        {effects.map((effect) => {
          const variable = variables.find((item) => item.id === effect.variableId);
          const operations = operationsForVariable(variable);
          return (
            <div className="story-effect-row" key={effect.id}>
              <select
                aria-label="效果变量"
                value={effect.variableId}
                onChange={(event) => {
                  const nextVariable = variables.find((item) => item.id === event.target.value);
                  updateEffect(effect.id, {
                    variableId: event.target.value,
                    operation: operationsForVariable(nextVariable)[0],
                    value: nextVariable ? defaultValueForType(nextVariable.type) : true
                  });
                }}
              >
                <option value="">缺失变量</option>
                {variables.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="效果操作"
                value={effect.operation}
                onChange={(event) =>
                  updateEffect(effect.id, {
                    operation: event.target.value as StoryEffectOperation
                  })
                }
              >
                {operations.map((operation) => (
                  <option key={operation} value={operation}>
                    {effectOperationLabels[operation]}
                  </option>
                ))}
              </select>
              {effect.operation === "toggle" ? (
                <span className="story-rule-value-placeholder">反转真假</span>
              ) : variable ? (
                <StoryValueInput
                  value={effect.value}
                  variable={variable}
                  onChange={(value) => updateEffect(effect.id, { value })}
                />
              ) : (
                <input disabled value="" />
              )}
              <button
                aria-label="删除效果"
                type="button"
                onClick={() => onChange(effects.filter((item) => item.id !== effect.id))}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
        {!effects.length ? <small>不修改剧情变量</small> : null}
      </div>
    </div>
  );
}

function StoryValueInput({
  onChange,
  value,
  variable
}: {
  onChange: (value: StoryValue) => void;
  value: StoryValue;
  variable: StoryVariable;
}) {
  if (variable.type === "boolean") {
    return (
      <select
        value={String(coerceStoryValue("boolean", value))}
        onChange={(event) => onChange(event.target.value === "true")}
      >
        <option value="false">假</option>
        <option value="true">真</option>
      </select>
    );
  }
  if (variable.type === "number") {
    return (
      <input
        type="number"
        value={Number(coerceStoryValue("number", value))}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    );
  }
  return (
    <input
      value={String(coerceStoryValue("text", value))}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function StoryField({
  children,
  label,
  referencePath,
  referenceSource,
  wide = false
}: {
  children: ReactNode;
  label: string;
  referencePath?: string;
  referenceSource?: ProjectObjectRef;
  wide?: boolean;
}) {
  return (
    <label
      className={`story-field ${wide ? "is-wide" : ""}`}
      data-reference-path={referencePath}
      data-reference-source-id={referenceSource?.id}
      data-reference-source-kind={referenceSource?.kind}
    >
      <span>{label}</span>
      {children}
    </label>
  );
}

function StoryEmptyState({
  actionLabel,
  icon,
  onAction,
  title
}: {
  actionLabel: string;
  icon: ReactNode;
  onAction: () => void;
  title: string;
}) {
  return (
    <div className="story-empty-state">
      {icon}
      <strong>{title}</strong>
      <button type="button" onClick={onAction}>
        <Plus size={16} />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}
