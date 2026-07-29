"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { Details, DetailsContent, DetailsSummary } from "@tiptap/extension-details";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AtSign,
  Bold,
  Braces,
  ChevronDown,
  Code2,
  Hash,
  Heading2,
  ImagePlus,
  Italic,
  Library,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Quote,
  Redo2,
  Search,
  Strikethrough,
  Table2,
  Undo2
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { InlineAiAssistant } from "./InlineAiAssistant";
import type { InlineAiAction, InlineAiTarget } from "../inline-ai";
import { stripSecretRichTextBlocks } from "../publication";
import type { ProjectReferenceOption } from "./ProjectReferencePicker";

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

type RichTextEditorProps = {
  assets: AssetOption[];
  content: string;
  entities: EntityOption[];
  entityId: string;
  aiTarget?: InlineAiTarget;
  references?: ProjectReferenceOption[];
  sectionTitle?: string;
  tags: string[];
  onChange: (content: string) => void;
};

const SecretBlock = Node.create({
  name: "secretBlock",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: "section[data-secret-block]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "section",
      mergeAttributes(HTMLAttributes, {
        "data-secret-block": "true",
        class: "secret-block"
      }),
      ["div", { class: "secret-block-label", contenteditable: "false" }, "开发者秘密"],
      ["div", { class: "secret-block-content" }, 0]
    ];
  }
});

const StableProjectReference = Node.create({
  name: "stableProjectReference",
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  addAttributes() {
    return {
      kind: { default: "entity" },
      referenceId: { default: "" },
      worldId: { default: "" },
      label: { default: "未命名引用" }
    };
  },
  parseHTML() {
    return [
      {
        tag: "span[data-project-reference-id]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          return {
            kind: element.dataset.projectReferenceKind || "entity",
            referenceId: element.dataset.projectReferenceId || "",
            worldId: element.dataset.projectReferenceWorldId || "",
            label:
              element.dataset.projectReferenceLabel ||
              element.textContent?.replace(/^\[\[|\]\]$/g, "") ||
              "未命名引用"
          };
        }
      }
    ];
  },
  renderHTML({ node }) {
    const label = String(node.attrs.label || "未命名引用");
    return [
      "span",
      {
        class: "stable-project-reference",
        "data-project-reference-kind": node.attrs.kind,
        "data-project-reference-id": node.attrs.referenceId,
        "data-project-reference-world-id": node.attrs.worldId,
        "data-project-reference-label": label,
        contenteditable: "false"
      },
      `[[${label}]]`
    ];
  }
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toEditorHtml(content: string) {
  const trimmed = content.trim();
  if (!trimmed) {
    return "<p></p>";
  }

  if (/<(?:p|h[1-6]|ul|ol|blockquote|pre|table|details|section|img)(?:\s|>)/i.test(trimmed)) {
    return content;
  }

  return content
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

function ToolbarButton({
  active = false,
  children,
  disabled = false,
  label,
  onClick
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={active ? "is-active" : ""}
      disabled={disabled}
      title={label}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  aiTarget,
  assets,
  content,
  entities,
  entityId,
  references,
  sectionTitle = "正文",
  tags,
  onChange
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const suppressAiPreviewUpdateRef = useRef(false);
  const linkPickerRef = useRef<HTMLDetailsElement>(null);
  const characterPickerRef = useRef<HTMLDetailsElement>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [linkQuery, setLinkQuery] = useState("");
  const [characterQuery, setCharacterQuery] = useState("");
  const characterOptions = useMemo(
    () => entities.filter((entity) => entity.type === "character" && entity.id !== entityId),
    [entities, entityId]
  );
  const linkOptions = useMemo<ProjectReferenceOption[]>(() => {
    const options = references?.length
      ? references
      : entities.map((entity) => ({
          reference: { kind: "entity" as const, id: entity.id },
          title: entity.title,
          detail: entity.type,
          keywords: []
        }));
    return options.filter((option) => option.reference.id !== entityId);
  }, [entities, entityId, references]);
  const tagOptions = useMemo(
    () => Array.from(new Set(tags)),
    [tags]
  );
  const visibleLinkOptions = useMemo(() => {
    const query = linkQuery.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
    return linkOptions
      .filter((item) =>
        !query ||
        [item.title, item.detail, ...(item.keywords ?? [])]
          .join(" ")
          .normalize("NFKC")
          .toLocaleLowerCase("zh-CN")
          .includes(query)
      )
      .slice(0, 50);
  }, [linkOptions, linkQuery]);
  const visibleCharacterOptions = useMemo(() => {
    const query = characterQuery.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
    return characterOptions
      .filter((item) => !query || item.title.normalize("NFKC").toLocaleLowerCase("zh-CN").includes(query))
      .slice(0, 50);
  }, [characterOptions, characterQuery]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      StableProjectReference,
      Placeholder.configure({
        placeholder: "记录设定正文。输入 [[条目名]] 建立双向链接。"
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: { class: "editor-image" }
      }),
      TableKit.configure({
        table: {
          HTMLAttributes: { class: "editor-table" },
          resizable: true
        }
      }),
      Details.configure({ persist: true }),
      DetailsSummary,
      DetailsContent,
      SecretBlock
    ],
    content: toEditorHtml(content),
    onCreate: ({ editor: nextEditor }) => {
      setCharacterCount(nextEditor.getText().length);
    },
    onUpdate: ({ editor: nextEditor }) => {
      setCharacterCount(nextEditor.getText().length);
      if (suppressAiPreviewUpdateRef.current) return;
      onChange(nextEditor.getHTML());
    }
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent = toEditorHtml(content);
    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
      setCharacterCount(editor.getText().length);
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor || !linkOptions.length) return;
    const labels = new Map(
      linkOptions.map((option) => [
        `${option.reference.kind}\u0000${option.reference.id}`,
        option.title
      ])
    );
    const transaction = editor.state.tr;
    let changed = false;
    editor.state.doc.descendants((node, position) => {
      if (node.type.name !== "stableProjectReference") return;
      const label = labels.get(`${node.attrs.kind}\u0000${node.attrs.referenceId}`);
      if (!label || label === node.attrs.label) return;
      transaction.setNodeMarkup(position, undefined, { ...node.attrs, label });
      changed = true;
    });
    if (changed) editor.view.dispatch(transaction);
  }, [editor, linkOptions]);

  useEffect(() => {
    if (!isFocusMode) {
      return;
    }

    document.body.classList.add("focus-editor-open");
    const frame = window.requestAnimationFrame(() => editor?.commands.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFocusMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("focus-editor-open");
    };
  }, [editor, isFocusMode]);

  function insertText(value: string) {
    editor?.chain().focus().insertContent(value).run();
  }

  function safePlainText() {
    const documentNode = new DOMParser().parseFromString(
      stripSecretRichTextBlocks(editor?.getHTML() || content),
      "text/html"
    );
    return (documentNode.body.textContent || "").trim();
  }

  function inlineAiSelection() {
    if (!editor) return { start: 0, end: 0 };
    const { from, to } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to, "\n").trim();
    const safeText = safePlainText();
    if (!selected) return { start: safeText.length, end: safeText.length };
    const start = safeText.indexOf(selected);
    return start >= 0
      ? { start, end: start + selected.length }
      : { start: 0, end: 0 };
  }

  function richTextAfterAi(
    _after: string,
    responseText: string,
    action: InlineAiAction
  ) {
    if (!editor) return content;
    const original = editor.getJSON();
    const originalSelection = {
      from: editor.state.selection.from,
      to: editor.state.selection.to
    };
    const selected = originalSelection.to > originalSelection.from;
    suppressAiPreviewUpdateRef.current = true;
    try {
      if (action === "continue") {
        const position = selected ? originalSelection.to : editor.state.doc.content.size;
        editor.commands.insertContentAt(position, toEditorHtml(responseText));
      } else if (selected) {
        editor.commands.insertContentAt(
          { from: originalSelection.from, to: originalSelection.to },
          escapeHtml(responseText).replaceAll("\n", "<br>")
        );
      } else {
        editor.commands.setContent(toEditorHtml(responseText), { emitUpdate: false });
      }
      return editor.getHTML();
    } finally {
      editor.commands.setContent(original, { emitUpdate: false });
      const maximum = editor.state.doc.content.size;
      editor.commands.setTextSelection({
        from: Math.min(originalSelection.from, maximum),
        to: Math.min(originalSelection.to, maximum)
      });
      suppressAiPreviewUpdateRef.current = false;
      setCharacterCount(editor.getText().length);
    }
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) {
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      window.alert("单张图片请控制在 8 MB 以内。");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      editor
        .chain()
        .focus()
        .setImage({ src: String(reader.result), alt: file.name, title: file.name })
        .run();
    };
    reader.readAsDataURL(file);
  }

  if (!editor) {
    return <div className="rich-editor-loading">正在载入编辑器...</div>;
  }

  return (
    <div className={`rich-editor-shell ${isFocusMode ? "is-focus-mode" : ""}`}>
      {isFocusMode ? (
        <div className="rich-editor-focus-heading">
          <div>
            <strong>{sectionTitle}</strong>
            <span>专注写作</span>
          </div>
          <button
            aria-label="退出专注模式"
            title="退出专注模式"
            type="button"
            onClick={() => setIsFocusMode(false)}
          >
            <Minimize2 size={19} />
          </button>
        </div>
      ) : null}
      <div className="rich-editor-toolbar" role="toolbar" aria-label="正文格式工具">
        <div className="toolbar-group">
          <ToolbarButton
            active={editor.isActive("bold")}
            label="粗体"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={17} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            label="斜体"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={17} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            label="删除线"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough size={17} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("heading", { level: 2 })}
            label="二级标题"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 size={17} />
          </ToolbarButton>
        </div>

        <div className="toolbar-group">
          <ToolbarButton
            active={editor.isActive("bulletList")}
            label="项目列表"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={17} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("orderedList")}
            label="编号列表"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={17} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("blockquote")}
            label="引用"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={17} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("codeBlock")}
            label="代码块"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code2 size={17} />
          </ToolbarButton>
        </div>

        <div className="toolbar-group">
          <ToolbarButton
            label="插入 3×3 表格"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          >
            <Table2 size={17} />
          </ToolbarButton>
          <ToolbarButton label="插入图片" onClick={() => imageInputRef.current?.click()}>
            <ImagePlus size={17} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("details")}
            label="折叠块"
            onClick={() => editor.chain().focus().setDetails().run()}
          >
            <ChevronDown size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="开发者秘密块"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertContent({
                  type: "secretBlock",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "仅开发者可见的设定" }]
                    }
                  ]
                })
                .run()
            }
          >
            <Braces size={17} />
          </ToolbarButton>
        </div>

        <label className="toolbar-select" title="从资源库插入图片">
          <Library size={16} />
          <select
            aria-label="从资源库插入图片"
            value=""
            onChange={(event) => {
              const asset = assets.find((item) => item.id === event.target.value);
              if (asset) {
                editor.chain().focus().setImage({ src: asset.url, alt: asset.name }).run();
              }
            }}
          >
            <option value="">资源图片</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>
        </label>

        <details className="toolbar-picker" ref={linkPickerRef}>
          <summary aria-label="插入双向链接" title="插入双向链接">
            <Link2 size={16} />
            <ChevronDown size={13} />
          </summary>
          <div className="toolbar-picker-popover">
            <label>
              <Search size={15} />
              <input
                aria-label="搜索双向链接条目"
                placeholder="搜索条目"
                value={linkQuery}
                onChange={(event) => setLinkQuery(event.target.value)}
              />
            </label>
            <div>
              {visibleLinkOptions.map((item) => (
                <button
                  key={`${item.reference.kind}:${item.reference.id}`}
                  type="button"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .insertContent({
                        type: "stableProjectReference",
                        attrs: {
                          kind: item.reference.kind,
                          referenceId: item.reference.id,
                          worldId: aiTarget?.worldId || "",
                          label: item.title
                        }
                      })
                      .insertContent(" ")
                      .run();
                    linkPickerRef.current?.removeAttribute("open");
                    setLinkQuery("");
                  }}
                >
                  <span>{item.title}</span>
                  <small>{item.detail}</small>
                </button>
              ))}
              {!visibleLinkOptions.length ? <span className="toolbar-picker-empty">没有匹配条目</span> : null}
            </div>
            <small>{linkOptions.length} 个可关联条目</small>
          </div>
        </details>

        <details className="toolbar-picker is-character" ref={characterPickerRef}>
          <summary aria-label="插入角色提及" title="插入角色提及">
            <AtSign size={16} />
            <ChevronDown size={13} />
          </summary>
          <div className="toolbar-picker-popover">
            <label>
              <Search size={15} />
              <input
                aria-label="搜索角色提及"
                placeholder="搜索角色"
                value={characterQuery}
                onChange={(event) => setCharacterQuery(event.target.value)}
              />
            </label>
            <div>
              {visibleCharacterOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    insertText(`@${item.title}`);
                    characterPickerRef.current?.removeAttribute("open");
                    setCharacterQuery("");
                  }}
                >
                  <span>{item.title}</span>
                </button>
              ))}
              {!visibleCharacterOptions.length ? <span className="toolbar-picker-empty">没有匹配角色</span> : null}
            </div>
            <small>{characterOptions.length} 个角色</small>
          </div>
        </details>

        <label className="toolbar-select" title="插入标签">
          <Hash size={16} />
          <select
            aria-label="插入标签"
            value=""
            onChange={(event) => {
              if (event.target.value) {
                insertText(`#${event.target.value}`);
              }
            }}
          >
            <option value="">标签</option>
            {tagOptions.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <div className="toolbar-group toolbar-history">
          <ToolbarButton
            disabled={!editor.can().chain().focus().undo().run()}
            label="撤销"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 size={17} />
          </ToolbarButton>
          <ToolbarButton
            disabled={!editor.can().chain().focus().redo().run()}
            label="重做"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 size={17} />
          </ToolbarButton>
        </div>

        <div className="toolbar-group toolbar-focus">
          <ToolbarButton
            label={isFocusMode ? "退出专注模式" : "全屏编写正文"}
            onClick={() => setIsFocusMode((current) => !current)}
          >
            {isFocusMode ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </ToolbarButton>
        </div>

        {aiTarget ? (
          <div className="toolbar-group toolbar-ai">
            <InlineAiAssistant
              getSelection={inlineAiSelection}
              getStoredValue={richTextAfterAi}
              getUnavailableReason={() =>
                editor.isActive("secretBlock")
                  ? "开发者秘密块默认不会发送给 AI；请先把可发送内容移到普通正文或改用手动写作。"
                  : ""
              }
              storedValue={content}
              target={aiTarget}
              value={safePlainText()}
            />
          </div>
        ) : null}

        <input
          ref={imageInputRef}
          accept="image/*"
          className="visually-hidden"
          type="file"
          onChange={handleImage}
        />
      </div>

      <EditorContent className="rich-editor-content" editor={editor} />

      <div className="rich-editor-status">
        <span>{characterCount} 字</span>
        <span>自动保存已开启</span>
      </div>
    </div>
  );
}
