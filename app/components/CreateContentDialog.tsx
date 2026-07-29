"use client";

import {
  CalendarDays,
  FileText,
  Flag,
  Folder,
  Gem,
  LayoutTemplate,
  MapPin,
  MessagesSquare,
  Plus,
  Route,
  Search,
  UsersRound,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CodexCategory, CodexEntityType } from "../codex-tree";
import { flattenCodexCategories } from "../codex-tree";
import type { EntityTemplateDefinition } from "../entity-templates";
import { useDialogFocus } from "./useDialogFocus";

export type CreateContentKind = CodexEntityType | "quest" | "scene";
export type CreateContentVisibility = "private" | "shared" | "public" | "secret";

export type CreateContentRequest = {
  kind: CreateContentKind;
  title: string;
  categoryId: string;
  templateId: string;
  visibility: CreateContentVisibility;
};

const kindMeta: Record<
  CreateContentKind,
  { label: string; icon: LucideIcon; placeholder: string }
> = {
  character: { label: "角色", icon: UsersRound, placeholder: "例如：守灯人岚" },
  location: { label: "地点", icon: MapPin, placeholder: "例如：灰港" },
  faction: { label: "阵营", icon: Flag, placeholder: "例如：守灯人议会" },
  event: { label: "事件", icon: CalendarDays, placeholder: "例如：信标熄灭" },
  item: { label: "物品", icon: Gem, placeholder: "例如：失落信标" },
  note: { label: "笔记", icon: FileText, placeholder: "例如：序章待办" },
  quest: { label: "任务线", icon: Route, placeholder: "例如：失落信标" },
  scene: { label: "剧情场景", icon: MessagesSquare, placeholder: "例如：灰港初遇" }
};

const entityKinds = new Set<CreateContentKind>([
  "character",
  "location",
  "faction",
  "event",
  "item",
  "note"
]);

const visibilityLabels: Record<CreateContentVisibility, string> = {
  private: "仅自己",
  shared: "项目成员",
  public: "可公开导出",
  secret: "秘密内容"
};

function defaultCategoryForKind(categories: CodexCategory[], kind: CreateContentKind) {
  if (!entityKinds.has(kind)) return "";
  return categories.find((category) => category.id.endsWith(`:${kind}`))?.id ?? "";
}

function defaultTemplateForKind(
  templates: EntityTemplateDefinition[],
  kind: CreateContentKind
) {
  if (!entityKinds.has(kind)) return "";
  return (
    templates.find(
      (template) => template.builtIn && template.entityTypes.includes(kind as CodexEntityType)
    ) ?? templates.find((template) => template.entityTypes.includes(kind as CodexEntityType))
  )?.id ?? "";
}

export function CreateContentDialog({
  categories,
  initialCategoryId,
  initialKind,
  open,
  templates,
  onClose,
  onCreate
}: {
  categories: CodexCategory[];
  initialCategoryId: string;
  initialKind: CreateContentKind;
  open: boolean;
  templates: EntityTemplateDefinition[];
  onClose: () => void;
  onCreate: (request: CreateContentRequest) => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const [kind, setKind] = useState<CreateContentKind>(initialKind);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templateQuery, setTemplateQuery] = useState("");
  const [visibility, setVisibility] = useState<CreateContentVisibility>("private");
  const categoryRows = useMemo(() => flattenCodexCategories(categories), [categories]);
  const relevantTemplates = useMemo(
    () =>
      entityKinds.has(kind)
        ? templates.filter((template) => template.entityTypes.includes(kind as CodexEntityType))
        : [],
    [kind, templates]
  );
  const filteredTemplates = useMemo(() => {
    const query = templateQuery.trim().toLocaleLowerCase("zh-CN");
    if (!query) return relevantTemplates;
    return relevantTemplates.filter((template) =>
      `${template.name} ${template.description}`.toLocaleLowerCase("zh-CN").includes(query)
    );
  }, [relevantTemplates, templateQuery]);
  const showBlankTemplate =
    !templateQuery.trim() || "空白条目 无模板".includes(templateQuery.trim());
  const isEntity = entityKinds.has(kind);
  useDialogFocus({ containerRef: dialogRef, initialFocusRef: titleRef, onClose, open });

  useEffect(() => {
    if (!open) return;
    const nextKind = initialKind;
    setKind(nextKind);
    setTitle("");
    setCategoryId(
      categories.some((category) => category.id === initialCategoryId)
        ? initialCategoryId
        : defaultCategoryForKind(categories, nextKind)
    );
    setTemplateId(defaultTemplateForKind(templates, nextKind));
    setTemplateQuery("");
    setVisibility("private");
    document.body.classList.add("create-dialog-open");
    return () => {
      document.body.classList.remove("create-dialog-open");
    };
  }, [categories, initialCategoryId, initialKind, open, templates]);

  function changeKind(nextKind: CreateContentKind) {
    setKind(nextKind);
    setCategoryId(defaultCategoryForKind(categories, nextKind));
    setTemplateId(defaultTemplateForKind(templates, nextKind));
    setTemplateQuery("");
    if (!entityKinds.has(nextKind)) setVisibility("private");
    window.requestAnimationFrame(() => titleRef.current?.focus());
  }

  function submit() {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      titleRef.current?.focus();
      return;
    }
    onCreate({ kind, title: normalizedTitle, categoryId, templateId, visibility });
  }

  if (!open) return null;

  return (
    <div className="create-content-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        aria-labelledby="create-content-title"
        aria-modal="true"
        className="create-content-dialog"
        role="dialog"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <strong id="create-content-title">新建内容</strong>
            <span>选择内容类型和模板，创建后直接进入编辑</span>
          </div>
          <button aria-label="关闭" title="关闭" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="create-kind-picker" role="group" aria-label="内容类型">
          {(Object.keys(kindMeta) as CreateContentKind[]).map((itemKind) => {
            const Icon = kindMeta[itemKind].icon;
            return (
              <button
                aria-pressed={kind === itemKind}
                className={kind === itemKind ? "is-active" : ""}
                key={itemKind}
                type="button"
                onClick={() => changeKind(itemKind)}
              >
                <Icon size={17} />
                <span>{kindMeta[itemKind].label}</span>
              </button>
            );
          })}
        </div>

        {isEntity ? (
          <section className="create-template-picker" aria-label="条目模板">
            <div className="create-template-picker-heading">
              <div>
                <strong>选择模板</strong>
                <span>{relevantTemplates.length} 个适用于{kindMeta[kind].label}的模板</span>
              </div>
              <label>
                <Search size={15} />
                <input
                  aria-label="搜索条目模板"
                  value={templateQuery}
                  placeholder="搜索模板"
                  onChange={(event) => setTemplateQuery(event.target.value)}
                />
              </label>
            </div>
            <div className="create-template-list">
              {showBlankTemplate ? (
                <button
                  aria-pressed={!templateId}
                  className={!templateId ? "is-active" : ""}
                  type="button"
                  onClick={() => setTemplateId("")}
                >
                  <FileText size={17} />
                  <span>
                    <strong>空白条目</strong>
                    <small>仅使用摘要与正文</small>
                  </span>
                  <em>0 字段</em>
                </button>
              ) : null}
              {filteredTemplates.map((template) => (
                <button
                  aria-pressed={templateId === template.id}
                  className={templateId === template.id ? "is-active" : ""}
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                >
                  <LayoutTemplate size={17} />
                  <span>
                    <strong>{template.name}</strong>
                    <small>{template.description || "项目自定义模板"}</small>
                  </span>
                  <em>{template.fields.length} 字段</em>
                </button>
              ))}
              {!showBlankTemplate && !filteredTemplates.length ? (
                <div className="create-template-empty">没有匹配的模板</div>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className="create-content-fields">
          <label className="create-title-field">
            <span>名称</span>
            <input
              ref={titleRef}
              value={title}
              placeholder={kindMeta[kind].placeholder}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  submit();
                }
              }}
            />
          </label>

          {isEntity ? (
            <div className="create-content-field-grid">
              <label>
                <span>所在分类</span>
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                  <option value="">未归类</option>
                  {categoryRows.map(({ category, depth }) => (
                    <option key={category.id} value={category.id}>
                      {`${"　".repeat(depth)}${category.title}`}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>可见性</span>
                <select
                  value={visibility}
                  onChange={(event) =>
                    setVisibility(event.target.value as CreateContentVisibility)
                  }
                >
                  {(Object.keys(visibilityLabels) as CreateContentVisibility[]).map((item) => (
                    <option key={item} value={item}>{visibilityLabels[item]}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="create-domain-note">
              {kind === "quest" ? <Route size={18} /> : <MessagesSquare size={18} />}
              <span>
                {kind === "quest"
                  ? "将在任务线工作区创建一条可编排步骤与分支的任务。"
                  : "将在剧情工作区创建一个带起始对白节点的场景。"}
              </span>
            </div>
          )}
        </div>

        <footer>
          <button className="secondary" type="button" onClick={onClose}>取消</button>
          <button className="primary" type="button" onClick={submit}>
            <Plus size={17} />
            <span>创建{kindMeta[kind].label}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
