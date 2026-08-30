"use client";

import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronsDown,
  ClipboardList,
  Copy,
  EyeOff,
  FileText,
  LayoutTemplate,
  Plus,
  Search,
  Settings2,
  Tags,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  entityTemplateFieldTypeLabels,
  getTemplateCompletion,
  resolveEntityTemplate,
  templateEntityTypeLabels,
  templateEntityTypes
} from "../entity-templates";
import type {
  EntityTemplateDefinition,
  EntityTemplateField,
  EntityTemplateFieldType,
  TemplateEntityType
} from "../entity-templates";

type LedgerEntity = {
  id: string;
  type: TemplateEntityType;
  title: string;
  summary: string;
  tags: string[];
  visibility: "private" | "shared" | "public" | "secret";
  templateId?: string;
  templateData: Record<string, string>;
  updatedAt: string;
};

type WorkspaceMode = "studio" | "ledger";
const TEMPLATE_LEDGER_PAGE_SIZE = 120;

export function TemplateWorkspace({
  templates,
  entities,
  selectedTemplateId,
  onSelectTemplate,
  onCreateTemplate,
  onDuplicateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onAddField,
  onUpdateField,
  onDeleteField,
  onMoveField,
  onApplyTemplate,
  onBatchUpdate,
  onOpenEntity
}: {
  templates: EntityTemplateDefinition[];
  entities: LedgerEntity[];
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onCreateTemplate: () => void;
  onDuplicateTemplate: (id: string) => void;
  onUpdateTemplate: (id: string, patch: Partial<EntityTemplateDefinition>) => void;
  onDeleteTemplate: (id: string) => void;
  onAddField: (templateId: string) => void;
  onUpdateField: (templateId: string, fieldId: string, patch: Partial<EntityTemplateField>) => void;
  onDeleteField: (templateId: string, fieldId: string) => void;
  onMoveField: (templateId: string, fieldId: string, direction: -1 | 1) => void;
  onApplyTemplate: (entityIds: string[], templateId: string) => void;
  onBatchUpdate: (entityIds: string[], patch: { tags?: string[]; visibility?: LedgerEntity["visibility"] }) => void;
  onOpenEntity: (id: string) => void;
}) {
  const [mode, setMode] = useState<WorkspaceMode>("studio");
  const [query, setQuery] = useState("");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<TemplateEntityType | "all">("all");
  const [completionFilter, setCompletionFilter] = useState<"all" | "complete" | "incomplete">("all");
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [batchTemplateId, setBatchTemplateId] = useState("");
  const [batchVisibility, setBatchVisibility] = useState<LedgerEntity["visibility"] | "">("");
  const [batchTags, setBatchTags] = useState("");
  const [ledgerVisibleLimit, setLedgerVisibleLimit] = useState(TEMPLATE_LEDGER_PAGE_SIZE);
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? templates[0] ?? null;
  const usageCounts = useMemo(() => entities.reduce<Record<string, number>>((counts, entity) => {
    const template = resolveEntityTemplate(templates, entity);
    if (template) counts[template.id] = (counts[template.id] ?? 0) + 1;
    return counts;
  }, {}), [entities, templates]);
  const ledgerRows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return entities
      .map((entity) => {
        const template = resolveEntityTemplate(templates, entity);
        return { entity, template, completion: getTemplateCompletion(template, entity.templateData) };
      })
      .filter(({ entity, template, completion }) =>
        (!normalized || `${entity.title} ${entity.summary} ${entity.tags.join(" ")} ${template?.name ?? ""}`.toLocaleLowerCase().includes(normalized)) &&
        (templateFilter === "all" || template?.id === templateFilter) &&
        (typeFilter === "all" || entity.type === typeFilter) &&
        (completionFilter === "all" || (completionFilter === "complete" ? completion.percent === 100 : completion.percent < 100))
      )
      .sort((left, right) => left.completion.percent - right.completion.percent || left.entity.title.localeCompare(right.entity.title, "zh-CN"));
  }, [completionFilter, entities, query, templateFilter, templates, typeFilter]);
  const visibleLedgerRows = ledgerRows.slice(0, ledgerVisibleLimit);
  const hiddenLedgerRowCount = Math.max(0, ledgerRows.length - visibleLedgerRows.length);
  const checkedIdSet = useMemo(() => new Set(checkedIds), [checkedIds]);
  const filteredEntityIds = useMemo(
    () => ledgerRows.map(({ entity }) => entity.id),
    [ledgerRows]
  );
  const allFilteredEntitiesChecked = filteredEntityIds.length > 0
    && filteredEntityIds.every((id) => checkedIdSet.has(id));
  const incompleteCount = entities.filter((entity) => getTemplateCompletion(resolveEntityTemplate(templates, entity), entity.templateData).percent < 100).length;

  useEffect(() => {
    setLedgerVisibleLimit(TEMPLATE_LEDGER_PAGE_SIZE);
  }, [completionFilter, query, templateFilter, typeFilter]);

  function toggleEntity(id: string) {
    setCheckedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleFilteredEntities() {
    const filteredSet = new Set(filteredEntityIds);
    setCheckedIds((current) => allFilteredEntitiesChecked
      ? current.filter((id) => !filteredSet.has(id))
      : [...new Set([...current, ...filteredEntityIds])]
    );
  }

  return (
    <section className="template-workspace">
      <header className="template-toolbar">
        <div><h2>模板与资料</h2><p>定义项目字段，并集中检查设定资料完成度</p></div>
        <div className="template-mode-switch" role="group" aria-label="模板工作区视图">
          <button className={mode === "studio" ? "is-active" : ""} type="button" onClick={() => setMode("studio")}><LayoutTemplate size={16} /><span>模板工坊</span></button>
          <button className={mode === "ledger" ? "is-active" : ""} type="button" onClick={() => setMode("ledger")}><ClipboardList size={16} /><span>资料台账</span></button>
        </div>
        <button className="template-primary-action" type="button" onClick={onCreateTemplate}><Plus size={17} /><span>新建模板</span></button>
      </header>

      <div className="template-summary-strip">
        <div><span>模板</span><strong>{templates.length}</strong></div>
        <div><span>自定义模板</span><strong>{templates.filter((item) => !item.builtIn).length}</strong></div>
        <div><span>模板字段</span><strong>{templates.reduce((total, item) => total + item.fields.length, 0)}</strong></div>
        <div className={incompleteCount ? "has-warning" : ""}><span>必填缺项条目</span><strong>{incompleteCount}</strong></div>
      </div>

      {mode === "studio" ? (
        <div className="template-studio-layout">
          <aside className="template-browser">
            <label className="template-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索模板" /></label>
            <div className="template-list">
              {templates.filter((item) => !query.trim() || `${item.name} ${item.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).map((template) => (
                <button className={template.id === selectedTemplate?.id ? "is-active" : ""} key={template.id} type="button" onClick={() => onSelectTemplate(template.id)}>
                  <span className="template-list-icon"><LayoutTemplate size={16} /></span>
                  <span><strong>{template.name}</strong><small>{template.entityTypes.map((type) => templateEntityTypeLabels[type]).join("、")} · {template.fields.length} 字段</small></span>
                  <em>{usageCounts[template.id] ?? 0}</em>
                </button>
              ))}
            </div>
          </aside>
          <div className="template-definition-editor">
            {selectedTemplate ? <>
              <div className="template-editor-heading">
                <div><span>{selectedTemplate.builtIn ? "默认模板" : "自定义模板"}</span><strong>{selectedTemplate.name}</strong></div>
                <div><button title="复制模板" type="button" onClick={() => onDuplicateTemplate(selectedTemplate.id)}><Copy size={16} /></button><button disabled={selectedTemplate.builtIn || Boolean(usageCounts[selectedTemplate.id])} title="删除模板" type="button" onClick={() => onDeleteTemplate(selectedTemplate.id)}><Trash2 size={16} /></button></div>
              </div>
              <div className="template-basic-grid">
                <label>模板名称<input value={selectedTemplate.name} onChange={(event) => onUpdateTemplate(selectedTemplate.id, { name: event.target.value })} /></label>
                <label>说明<textarea rows={2} value={selectedTemplate.description} onChange={(event) => onUpdateTemplate(selectedTemplate.id, { description: event.target.value })} /></label>
              </div>
              <div className="template-type-picker"><span>适用条目类型</span>{templateEntityTypes.map((type) => <label key={type}><input checked={selectedTemplate.entityTypes.includes(type)} type="checkbox" onChange={() => onUpdateTemplate(selectedTemplate.id, { entityTypes: selectedTemplate.entityTypes.includes(type) ? selectedTemplate.entityTypes.filter((item) => item !== type) : [...selectedTemplate.entityTypes, type] })} /><span>{templateEntityTypeLabels[type]}</span></label>)}</div>
              <div className="template-field-heading"><div><strong>字段定义</strong><span>{selectedTemplate.fields.length} 个字段</span></div><button type="button" onClick={() => onAddField(selectedTemplate.id)}><Plus size={15} /><span>添加字段</span></button></div>
              <div className="template-field-list">
                {selectedTemplate.fields.map((field, index) => <div className="template-field-row" key={field.id}>
                  <div className="template-field-order"><button disabled={index === 0} title="上移字段" type="button" onClick={() => onMoveField(selectedTemplate.id, field.id, -1)}><ArrowUp size={14} /></button><button disabled={index === selectedTemplate.fields.length - 1} title="下移字段" type="button" onClick={() => onMoveField(selectedTemplate.id, field.id, 1)}><ArrowDown size={14} /></button></div>
                  <div className="template-field-controls"><label>字段标题<input value={field.label} onChange={(event) => onUpdateField(selectedTemplate.id, field.id, { label: event.target.value })} /></label><label>字段键<input value={field.key} onChange={(event) => onUpdateField(selectedTemplate.id, field.id, { key: event.target.value })} /></label><label>类型<select value={field.type} onChange={(event) => onUpdateField(selectedTemplate.id, field.id, { type: event.target.value as EntityTemplateFieldType })}>{(Object.keys(entityTemplateFieldTypeLabels) as EntityTemplateFieldType[]).map((type) => <option key={type} value={type}>{entityTemplateFieldTypeLabels[type]}</option>)}</select></label></div>
                  <div className="template-field-settings"><label><input checked={field.required} type="checkbox" onChange={(event) => onUpdateField(selectedTemplate.id, field.id, { required: event.target.checked })} /><span>必填</span></label><label><input checked={field.secret} type="checkbox" onChange={(event) => onUpdateField(selectedTemplate.id, field.id, { secret: event.target.checked })} /><EyeOff size={13} /><span>秘密</span></label>{field.type === "select" ? <label className="template-field-wide">选项<input value={field.options.join("，")} onChange={(event) => onUpdateField(selectedTemplate.id, field.id, { options: event.target.value.split(/[,，]/).map((item) => item.trim()).filter(Boolean) })} /></label> : null}{field.type === "entity_ref" ? <div className="template-ref-types"><span>引用类型</span>{templateEntityTypes.map((type) => <label key={type}><input checked={field.targetEntityTypes.includes(type)} type="checkbox" onChange={() => onUpdateField(selectedTemplate.id, field.id, { targetEntityTypes: field.targetEntityTypes.includes(type) ? field.targetEntityTypes.filter((item) => item !== type) : [...field.targetEntityTypes, type] })} /><span>{templateEntityTypeLabels[type]}</span></label>)}</div> : null}</div>
                  <button className="template-field-delete" title="删除字段" type="button" onClick={() => onDeleteField(selectedTemplate.id, field.id)}><Trash2 size={15} /></button>
                </div>)}
              </div>
            </> : <div className="template-empty"><LayoutTemplate size={30} /><strong>创建第一个模板</strong></div>}
          </div>
        </div>
      ) : (
        <div className="template-ledger">
          <div className="template-ledger-filters">
            <label className="template-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索条目、标签或模板" /></label>
            <select aria-label="按模板筛选" value={templateFilter} onChange={(event) => setTemplateFilter(event.target.value)}><option value="all">全部模板</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select>
            <select aria-label="按类型筛选" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TemplateEntityType | "all")}><option value="all">全部类型</option>{templateEntityTypes.map((type) => <option key={type} value={type}>{templateEntityTypeLabels[type]}</option>)}</select>
            <select aria-label="按完成度筛选" value={completionFilter} onChange={(event) => setCompletionFilter(event.target.value as typeof completionFilter)}><option value="all">全部完成度</option><option value="incomplete">存在缺项</option><option value="complete">必填完成</option></select>
          </div>
          {checkedIds.length ? <div className="template-batchbar"><strong>{checkedIds.length} 个条目</strong><select aria-label="批量应用模板" value={batchTemplateId} onChange={(event) => setBatchTemplateId(event.target.value)}><option value="">选择模板</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select><button disabled={!batchTemplateId} type="button" onClick={() => { onApplyTemplate(checkedIds, batchTemplateId); setCheckedIds([]); }}>应用模板</button><select aria-label="批量可见性" value={batchVisibility} onChange={(event) => setBatchVisibility(event.target.value as typeof batchVisibility)}><option value="">选择可见性</option><option value="private">私密</option><option value="shared">成员可见</option><option value="public">公开</option><option value="secret">秘密</option></select><input value={batchTags} onChange={(event) => setBatchTags(event.target.value)} placeholder="追加标签，用逗号分隔" /><button disabled={!batchVisibility && !batchTags.trim()} type="button" onClick={() => { onBatchUpdate(checkedIds, { visibility: batchVisibility || undefined, tags: batchTags.trim() ? batchTags.split(/[,，]/).map((item) => item.trim()).filter(Boolean) : undefined }); setCheckedIds([]); setBatchTags(""); }}>批量更新</button></div> : null}
          <div className="template-ledger-table" role="table" aria-label="设定资料台账">
            <div className="template-ledger-header" role="row"><input aria-label="选择当前筛选的全部条目" checked={allFilteredEntitiesChecked} disabled={!filteredEntityIds.length} title="选择当前筛选的全部条目" type="checkbox" onChange={toggleFilteredEntities} /><span>条目</span><span>类型</span><span>模板</span><span>必填完成度</span><span>可见性</span><span>更新</span></div>
            {visibleLedgerRows.map(({ entity, template, completion }) => <div className="template-ledger-row" role="row" key={entity.id}><input aria-label={`选择 ${entity.title}`} checked={checkedIdSet.has(entity.id)} type="checkbox" onChange={() => toggleEntity(entity.id)} /><button type="button" onClick={() => onOpenEntity(entity.id)}><strong>{entity.title}</strong><small>{entity.tags.slice(0, 3).join("、") || entity.summary || "暂无摘要"}</small></button><span>{templateEntityTypeLabels[entity.type]}</span><span>{template?.name ?? "失效模板"}</span><div className={completion.percent < 100 ? "is-incomplete" : "is-complete"}><strong>{completion.percent}%</strong><progress max={100} value={completion.percent} /><small>{completion.missingKeys.length ? `缺 ${completion.missingKeys.length} 项` : "已完成"}</small></div><span>{entity.visibility === "public" ? "公开" : entity.visibility === "shared" ? "成员可见" : entity.visibility === "secret" ? "秘密" : "私密"}</span><span>{new Date(entity.updatedAt).toLocaleDateString("zh-CN")}</span></div>)}
            {hiddenLedgerRowCount ? <div className="template-ledger-more"><span>已显示 {visibleLedgerRows.length}/{ledgerRows.length} 个条目</span><button aria-label="显示更多设定资料条目" type="button" onClick={() => setLedgerVisibleLimit((current) => current + TEMPLATE_LEDGER_PAGE_SIZE)}><ChevronsDown size={15} />再显示 {Math.min(TEMPLATE_LEDGER_PAGE_SIZE, hiddenLedgerRowCount)} 个</button></div> : null}
            {!ledgerRows.length ? <div className="template-empty"><CheckCircle2 size={28} /><strong>当前筛选下没有条目</strong></div> : null}
          </div>
        </div>
      )}
    </section>
  );
}
