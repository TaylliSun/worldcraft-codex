"use client";

import {
  BookOpenText,
  Check,
  Dices,
  LoaderCircle,
  MapPinned,
  MessagesSquare,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { starterPacks, type StarterPackId } from "../starter-packs";
import { useDialogFocus } from "./useDialogFocus";

const packIcons = {
  "game-narrative": BookOpenText,
  "rpg-campaign": Dices,
  "visual-novel": MessagesSquare,
  "open-world": MapPinned
};

export function StarterPackDialog({
  busy,
  firstRun,
  open,
  onClose,
  onCreate
}: {
  busy: boolean;
  firstRun: boolean;
  open: boolean;
  onClose: () => void;
  onCreate: (packId: StarterPackId, worldName: string) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState<StarterPackId>("game-narrative");
  const selected = starterPacks.find((pack) => pack.id === selectedId) ?? starterPacks[0];
  const [worldName, setWorldName] = useState(selected.initialName);
  const dialogRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  useDialogFocus({
    closeOnEscape: !firstRun,
    containerRef: dialogRef,
    initialFocusRef: nameRef,
    onClose,
    open
  });

  useEffect(() => {
    if (!open) return;
    setSelectedId("game-narrative");
    setWorldName(starterPacks[0].initialName);
    document.body.classList.add("create-dialog-open");
    return () => document.body.classList.remove("create-dialog-open");
  }, [open]);

  if (!open) return null;

  function selectPack(packId: StarterPackId) {
    const pack = starterPacks.find((item) => item.id === packId) ?? starterPacks[0];
    setSelectedId(pack.id);
    setWorldName(pack.initialName);
  }

  return (
    <div className="starter-pack-backdrop" role="presentation">
      <section ref={dialogRef} aria-label="选择项目起步包" aria-modal="true" className="starter-pack-dialog" role="dialog" tabIndex={-1}>
        <header>
          <div><span>{firstRun ? "创建第一个项目" : "创建世界"}</span><h2>选择项目起步包</h2></div>
          {!firstRun ? <button aria-label="关闭起步包" title="关闭" type="button" onClick={onClose}><X size={18} /></button> : null}
        </header>
        <div className="starter-pack-options" role="radiogroup" aria-label="项目类型">
          {starterPacks.map((pack) => {
            const Icon = packIcons[pack.id];
            const active = pack.id === selectedId;
            return (
              <button aria-checked={active} className={active ? "is-active" : ""} key={pack.id} role="radio" type="button" onClick={() => selectPack(pack.id)}>
                <Icon size={20} />
                <span><strong>{pack.label}</strong><small>{pack.detail}</small></span>
                {active ? <Check size={17} /> : null}
              </button>
            );
          })}
        </div>
        <label className="starter-pack-name"><span>世界名称</span><input ref={nameRef} aria-label="新世界名称" value={worldName} onChange={(event) => setWorldName(event.target.value)} /></label>
        <footer>
          {!firstRun ? <button disabled={busy} type="button" onClick={onClose}>取消</button> : <span />}
          <button className="starter-pack-create" disabled={busy || !worldName.trim()} type="button" onClick={() => void onCreate(selectedId, worldName.trim())}>{busy ? <LoaderCircle className="is-spinning" size={16} /> : <Check size={16} />}<span>{busy ? "正在创建" : "进入创作台"}</span></button>
        </footer>
      </section>
    </div>
  );
}
