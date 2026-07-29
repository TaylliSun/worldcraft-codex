"use client";

import { ArrowUpRight, LocateFixed } from "lucide-react";
import type { ProjectReference, ProjectReferenceRole } from "../project-references";
import { projectReferenceKindLabels } from "./ProjectReferencePicker";

const roleLabels: Record<ProjectReferenceRole, string> = {
  association: "关联",
  dependency: "依赖",
  mention: "正文提及",
  speaker: "说话者",
  template: "资料字段",
  route: "路线停靠"
};

export function BackReferenceList({
  emptyLabel = "暂无反向引用",
  onOpen,
  references
}: {
  emptyLabel?: string;
  onOpen: (reference: ProjectReference) => void;
  references: ProjectReference[];
}) {
  if (!references.length) {
    return <p className="muted-text">{emptyLabel}</p>;
  }

  return (
    <div className="back-reference-list">
      {references.map((reference) => (
        <button
          key={reference.id}
          title={`定位到 ${reference.sourceLabel} / ${reference.anchor.path}`}
          type="button"
          onClick={() => onOpen(reference)}
        >
          <span className="back-reference-icon">
            <LocateFixed size={15} />
          </span>
          <span className="back-reference-copy">
            <strong>{reference.sourceLabel}</strong>
            <small>
              {projectReferenceKindLabels[reference.source.kind]} · {roleLabels[reference.role]} · {reference.anchor.field}
            </small>
            {reference.anchor.excerpt ? <em>{reference.anchor.excerpt}</em> : null}
          </span>
          <ArrowUpRight size={15} />
        </button>
      ))}
    </div>
  );
}
