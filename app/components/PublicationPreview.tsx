"use client";

import {
  BookOpen,
  EyeOff,
  FileText,
  LayoutPanelLeft,
  LayoutPanelTop,
  PanelBottom,
  Rows3
} from "lucide-react";
import { useMemo, useState } from "react";
import { sanitizePublicationRichText } from "../publication";

type PreviewEntity = {
  title: string;
  summary: string;
  content: string;
  tags: string[];
  visibility: string;
  templateData: Record<string, string>;
};

type PreviewTemplate = {
  name: string;
  fields: Array<{
    id: string;
    key: string;
    label: string;
    type: string;
    secret: boolean;
  }>;
} | null;

export function PublicationPreview({
  entity,
  entityNames,
  template,
  typeLabel,
  visibilityLabel,
  worldName
}: {
  entity: PreviewEntity;
  entityNames: Record<string, string>;
  template: PreviewTemplate;
  typeLabel: string;
  visibilityLabel: string;
  worldName: string;
}) {
  const [showHeader, setShowHeader] = useState(true);
  const [showFields, setShowFields] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const safeContent = useMemo(
    () => sanitizePublicationRichText(entity.content),
    [entity.content]
  );
  const visibleFields = useMemo(
    () =>
      (template?.fields ?? [])
        .filter((field) => !field.secret && entity.templateData[field.key]?.trim())
        .map((field) => ({
          ...field,
          value:
            field.type === "entity_ref"
              ? entityNames[entity.templateData[field.key]] ?? "未找到关联对象"
              : entity.templateData[field.key]
        })),
    [entity.templateData, entityNames, template?.fields]
  );
  const secret = entity.visibility === "secret";

  return (
    <div className="publication-preview-shell">
      <div className="publication-preview-controls" role="group" aria-label="阅读预览区块">
        <PreviewToggle checked={showHeader} icon={LayoutPanelTop} label="页眉" onChange={setShowHeader} />
        <PreviewToggle checked={showFields} icon={Rows3} label="资料" onChange={setShowFields} />
        <PreviewToggle checked={showSidebar} icon={LayoutPanelLeft} label="侧栏" onChange={setShowSidebar} />
        <PreviewToggle checked={showFooter} icon={PanelBottom} label="页脚" onChange={setShowFooter} />
      </div>

      {secret ? (
        <div className="publication-secret-state">
          <EyeOff size={24} />
          <strong>秘密条目已从阅读预览隐藏</strong>
          <span>{entity.title}</span>
        </div>
      ) : (
        <article className={`publication-document ${showSidebar ? "has-sidebar" : ""}`}>
          {showHeader ? (
            <header>
              <span>{worldName}</span>
              <h1>{entity.title}</h1>
              <p>{entity.summary || "暂无摘要"}</p>
            </header>
          ) : null}

          <div className="publication-document-layout">
            <main>
              <div
                className="publication-rich-text"
                dangerouslySetInnerHTML={{ __html: safeContent || "<p>暂无正文</p>" }}
              />
              {showFields && visibleFields.length ? (
                <section className="publication-fields">
                  <h2>资料</h2>
                  <dl>
                    {visibleFields.map((field) => (
                      <div key={field.id}>
                        <dt>{field.label}</dt>
                        <dd>{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}
            </main>

            {showSidebar ? (
              <aside>
                <div>
                  <FileText size={16} />
                  <span>类型</span>
                  <strong>{typeLabel}</strong>
                </div>
                <div>
                  <BookOpen size={16} />
                  <span>可见性</span>
                  <strong>{visibilityLabel}</strong>
                </div>
                {entity.tags.length ? (
                  <section>
                    <span>标签</span>
                    <div>{entity.tags.map((tag) => <b key={tag}>{tag}</b>)}</div>
                  </section>
                ) : null}
              </aside>
            ) : null}
          </div>

          {showFooter ? (
            <footer>
              <span>{worldName}</span>
              <strong>{entity.title}</strong>
            </footer>
          ) : null}
        </article>
      )}
    </div>
  );
}

function PreviewToggle({
  checked,
  icon: Icon,
  label,
  onChange
}: {
  checked: boolean;
  icon: typeof LayoutPanelTop;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={checked ? "is-active" : ""}>
      <input checked={checked} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
      <Icon size={15} />
      <span>{label}</span>
    </label>
  );
}
