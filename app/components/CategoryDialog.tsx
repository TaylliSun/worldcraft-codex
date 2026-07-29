"use client";

import {
  CalendarDays,
  FileText,
  Flag,
  Folder,
  Gem,
  MapPin,
  UsersRound,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  flattenCodexCategories,
  getCodexCategoryDescendantIds,
  type CodexCategory,
  type CodexCategoryIcon
} from "../codex-tree";
import { useDialogFocus } from "./useDialogFocus";

export type CategoryDialogRequest = {
  title: string;
  description: string;
  parentId: string;
  icon: CodexCategoryIcon;
  color: string;
};

const iconMeta: Record<CodexCategoryIcon, { label: string; icon: LucideIcon }> = {
  folder: { label: "分类", icon: Folder },
  characters: { label: "角色", icon: UsersRound },
  locations: { label: "地点", icon: MapPin },
  factions: { label: "阵营", icon: Flag },
  events: { label: "事件", icon: CalendarDays },
  items: { label: "物品", icon: Gem },
  notes: { label: "笔记", icon: FileText }
};

const colors = ["#3f6f5c", "#456d8c", "#8a5b46", "#75608f", "#9a6b31", "#61706a", "#8a5963"];

export function CategoryDialog({
  categories,
  category,
  initialParentId,
  open,
  onClose,
  onSubmit
}: {
  categories: CodexCategory[];
  category: CodexCategory | null;
  initialParentId: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (request: CategoryDialogRequest) => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [icon, setIcon] = useState<CodexCategoryIcon>("folder");
  const [color, setColor] = useState(colors[0]);
  const unavailableIds = useMemo(() => {
    const ids = category
      ? getCodexCategoryDescendantIds(categories, category.id)
      : new Set<string>();
    if (category) ids.add(category.id);
    return ids;
  }, [categories, category]);
  const categoryRows = useMemo(
    () => flattenCodexCategories(categories).filter(({ category: item }) => !unavailableIds.has(item.id)),
    [categories, unavailableIds]
  );
  useDialogFocus({ containerRef: dialogRef, initialFocusRef: titleRef, onClose, open });

  useEffect(() => {
    if (!open) return;
    setTitle(category?.title ?? "");
    setDescription(category?.description ?? "");
    setParentId(category?.parentId ?? initialParentId);
    setIcon(category?.icon ?? "folder");
    setColor(category?.color ?? colors[0]);
    document.body.classList.add("create-dialog-open");
    return () => {
      document.body.classList.remove("create-dialog-open");
    };
  }, [category, initialParentId, open]);

  function submit() {
    if (!title.trim()) return titleRef.current?.focus();
    onSubmit({ title: title.trim(), description: description.trim(), parentId, icon, color });
  }

  if (!open) return null;

  return (
    <div className="create-content-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        aria-labelledby="category-dialog-title"
        aria-modal="true"
        className="category-dialog"
        role="dialog"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <strong id="category-dialog-title">{category ? "编辑分类" : "新建分类"}</strong>
            <span>分类可继续嵌套，并通过拖放调整位置</span>
          </div>
          <button aria-label="关闭" title="关闭" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="category-dialog-fields">
          <label>
            <span>名称</span>
            <input
              ref={titleRef}
              value={title}
              placeholder="例如：灰港篇"
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  submit();
                }
              }}
            />
          </label>
          <label>
            <span>父级分类</span>
            <select value={parentId} onChange={(event) => setParentId(event.target.value)}>
              <option value="">设定资料（根级）</option>
              {categoryRows.map(({ category: item, depth }) => (
                <option key={item.id} value={item.id}>
                  {`${"　".repeat(depth)}${item.title}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>说明</span>
            <textarea
              rows={3}
              value={description}
              placeholder="可选，用一句话说明这里收纳什么内容"
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <div className="category-option-group">
            <span>图标</span>
            <div className="category-icon-picker" role="group" aria-label="分类图标">
              {(Object.keys(iconMeta) as CodexCategoryIcon[]).map((item) => {
                const Icon = iconMeta[item].icon;
                return (
                  <button
                    aria-label={iconMeta[item].label}
                    aria-pressed={icon === item}
                    className={icon === item ? "is-active" : ""}
                    key={item}
                    title={iconMeta[item].label}
                    type="button"
                    onClick={() => setIcon(item)}
                  >
                    <Icon size={17} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="category-option-group">
            <span>颜色</span>
            <div className="category-color-picker" role="group" aria-label="分类颜色">
              {colors.map((item) => (
                <button
                  aria-label={`颜色 ${item}`}
                  aria-pressed={color === item}
                  className={color === item ? "is-active" : ""}
                  key={item}
                  style={{ backgroundColor: item }}
                  title={item}
                  type="button"
                  onClick={() => setColor(item)}
                />
              ))}
            </div>
          </div>
        </div>

        <footer>
          <button className="secondary" type="button" onClick={onClose}>取消</button>
          <button className="primary" type="button" onClick={submit}>
            <Folder size={17} />
            <span>{category ? "保存分类" : "创建分类"}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
