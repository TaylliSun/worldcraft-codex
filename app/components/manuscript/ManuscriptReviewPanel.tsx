"use client";

import {
  Check,
  MessageSquarePlus,
  Plus,
  Reply,
  ThumbsDown,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  manuscriptPlainText,
  type ManuscriptAnnotation,
  type ManuscriptAnnotationKind
} from "../../manuscript";

const statusLabels: Record<ManuscriptAnnotation["status"], string> = {
  open: "待处理",
  resolved: "已解决",
  accepted: "已接受",
  rejected: "已拒绝"
};

function AnnotationRow({
  annotation,
  body,
  onAccept,
  onAddReply,
  onDelete,
  onUpdate
}: {
  annotation: ManuscriptAnnotation;
  body: string;
  onAccept: (annotationId: string) => boolean;
  onAddReply: (annotationId: string, body: string) => void;
  onDelete: (annotationId: string) => void;
  onUpdate: (annotationId: string, patch: Partial<ManuscriptAnnotation>) => void;
}) {
  const [reply, setReply] = useState("");
  const [message, setMessage] = useState("");
  const quoteAvailable = Boolean(annotation.quote && manuscriptPlainText(body).includes(annotation.quote));

  return (
    <details className={`manuscript-annotation-row is-${annotation.status}`} open={annotation.status === "open"}>
      <summary>
        <span className="manuscript-annotation-kind">{annotation.kind === "suggestion" ? "修订" : "批注"}</span>
        <strong>{annotation.comment || annotation.quote || "未命名批注"}</strong>
        <small>{statusLabels[annotation.status]}</small>
      </summary>
      {annotation.quote ? <blockquote>{annotation.quote}</blockquote> : null}
      {annotation.kind === "suggestion" ? <div className="manuscript-annotation-replacement"><span>建议改为</span><p>{annotation.replacement || "未填写替换内容"}</p></div> : null}
      {!quoteAvailable && annotation.status === "open" ? <p className="manuscript-annotation-stale">原文已经变化，请更新引用后再处理。</p> : null}
      {annotation.replies.length ? <div className="manuscript-annotation-replies">{annotation.replies.map((item) => <p key={item.id}><Reply size={12} />{item.body}</p>)}</div> : null}
      {annotation.status === "open" ? <div className="manuscript-annotation-actions">
        {annotation.kind === "suggestion" ? <>
          <button disabled={!quoteAvailable} type="button" onClick={() => {
            const accepted = onAccept(annotation.id);
            setMessage(accepted ? "已写入正文" : "没有找到对应原文");
          }}><Check size={14} />接受</button>
          <button type="button" onClick={() => onUpdate(annotation.id, { status: "rejected" })}><ThumbsDown size={14} />拒绝</button>
        </> : <button type="button" onClick={() => onUpdate(annotation.id, { status: "resolved" })}><Check size={14} />解决</button>}
        <button aria-label="删除批注" title="删除批注" type="button" onClick={() => onDelete(annotation.id)}><Trash2 size={14} /></button>
      </div> : null}
      <div className="manuscript-annotation-reply"><input aria-label={`回复批注 ${annotation.comment || annotation.quote}`} placeholder="回复" value={reply} onChange={(event) => setReply(event.target.value)} /><button aria-label="发送批注回复" disabled={!reply.trim()} title="回复" type="button" onClick={() => { onAddReply(annotation.id, reply.trim()); setReply(""); }}><Plus size={14} /></button></div>
      {message ? <small className="manuscript-annotation-message">{message}</small> : null}
    </details>
  );
}

export function ManuscriptReviewPanel({
  annotations,
  body,
  onAccept,
  onAdd,
  onAddReply,
  onDelete,
  onUpdate,
  selectedQuote
}: {
  annotations: ManuscriptAnnotation[];
  body: string;
  onAccept: (annotationId: string) => boolean;
  onAdd: (input: {
    comment: string;
    kind: ManuscriptAnnotationKind;
    quote: string;
    replacement: string;
  }) => void;
  onAddReply: (annotationId: string, body: string) => void;
  onDelete: (annotationId: string) => void;
  onUpdate: (annotationId: string, patch: Partial<ManuscriptAnnotation>) => void;
  selectedQuote: string;
}) {
  const [kind, setKind] = useState<ManuscriptAnnotationKind>("comment");
  const [quote, setQuote] = useState(selectedQuote);
  const [comment, setComment] = useState("");
  const [replacement, setReplacement] = useState("");

  useEffect(() => {
    if (selectedQuote) setQuote(selectedQuote);
  }, [selectedQuote]);

  function add() {
    if (!comment.trim() && !replacement.trim()) return;
    onAdd({
      comment: comment.trim(),
      kind,
      quote: quote.trim(),
      replacement: replacement.trim()
    });
    setComment("");
    setReplacement("");
  }

  const openCount = annotations.filter((annotation) => annotation.status === "open").length;
  return (
    <div className="manuscript-inspector-body manuscript-review-body">
      <div className="manuscript-inspector-heading"><MessageSquarePlus size={17} /><div><strong>批注与修订</strong><span>{openCount} 条待处理</span></div></div>
      <div className="manuscript-review-compose">
        <div className="manuscript-review-kind" role="radiogroup" aria-label="批注类型">
          <button aria-checked={kind === "comment"} className={kind === "comment" ? "is-active" : ""} role="radio" type="button" onClick={() => setKind("comment")}>批注</button>
          <button aria-checked={kind === "suggestion"} className={kind === "suggestion" ? "is-active" : ""} role="radio" type="button" onClick={() => setKind("suggestion")}>修订建议</button>
        </div>
        <label><span>引用原文</span><textarea aria-label="批注引用原文" placeholder="先在正文中选择文字" rows={3} value={quote} onChange={(event) => setQuote(event.target.value)} /></label>
        <label><span>{kind === "suggestion" ? "修改理由" : "批注"}</span><textarea aria-label="批注内容" rows={3} value={comment} onChange={(event) => setComment(event.target.value)} /></label>
        {kind === "suggestion" ? <label><span>替换文本</span><textarea aria-label="修订替换文本" rows={3} value={replacement} onChange={(event) => setReplacement(event.target.value)} /></label> : null}
        <button className="manuscript-review-add" disabled={!comment.trim() && !replacement.trim()} type="button" onClick={add}><Plus size={14} />加入审阅</button>
      </div>
      <div className="manuscript-annotation-list">
        {annotations.map((annotation) => <AnnotationRow annotation={annotation} body={body} key={annotation.id} onAccept={onAccept} onAddReply={onAddReply} onDelete={onDelete} onUpdate={onUpdate} />)}
        {!annotations.length ? <p>当前写作单元没有批注</p> : null}
      </div>
    </div>
  );
}
