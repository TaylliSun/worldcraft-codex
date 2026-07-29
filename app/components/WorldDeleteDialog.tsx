"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDialogFocus } from "./useDialogFocus";

type WorldDeleteDialogProps = {
  busy: boolean;
  counts: {
    chapters: number;
    entities: number;
    maps: number;
    quests: number;
  };
  world: { id: string; name: string } | null;
  onClose: () => void;
  onConfirm: (worldId: string) => void;
};

export function WorldDeleteDialog({
  busy,
  counts,
  world,
  onClose,
  onConfirm
}: WorldDeleteDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);

  useDialogFocus({
    closeOnEscape: !busy,
    containerRef: dialogRef,
    initialFocusRef: confirmationRef,
    onClose,
    open: Boolean(world)
  });

  useEffect(() => {
    setConfirmation("");
  }, [world?.id]);

  useEffect(() => {
    if (!world) return;
    document.body.classList.add("create-dialog-open");
    return () => document.body.classList.remove("create-dialog-open");
  }, [world]);

  if (!world) return null;
  const confirmed = confirmation === world.name;

  return (
    <div
      className="world-delete-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section ref={dialogRef} aria-labelledby="world-delete-title" aria-modal="true" className="world-delete-dialog" role="dialog" tabIndex={-1}>
        <header>
          <span><AlertTriangle size={20} /></span>
          <div>
            <h2 id="world-delete-title">删除世界</h2>
            <p>{world.name}</p>
          </div>
        </header>

        <p className="world-delete-warning">
          这个世界的条目、任务、地图、文稿和 AI 记忆会从当前工程移除。删除前将自动创建完整工程备份，本地资源文件会保留。
        </p>

        <div className="world-delete-counts" aria-label="待删除世界内容统计">
          <span><strong>{counts.entities}</strong>条目</span>
          <span><strong>{counts.quests}</strong>任务</span>
          <span><strong>{counts.maps}</strong>地图</span>
          <span><strong>{counts.chapters}</strong>章节</span>
        </div>

        <label>
          <span>输入“{world.name}”确认删除</span>
          <input
            ref={confirmationRef}
            aria-label="删除世界确认名称"
            disabled={busy}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>

        <footer>
          <button disabled={busy} type="button" onClick={onClose}>取消</button>
          <button
            className="is-danger"
            disabled={!confirmed || busy}
            type="button"
            onClick={() => onConfirm(world.id)}
          >
            <Trash2 size={16} />
            <span>{busy ? "正在备份并删除..." : "删除这个世界"}</span>
          </button>
        </footer>
      </section>
    </div>
  );
}
