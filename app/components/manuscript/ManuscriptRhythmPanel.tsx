"use client";

import { BarChart3 } from "lucide-react";
import {
  getManuscriptWritingRhythm,
  manuscriptLocalDate,
  type ManuscriptBook
} from "../../manuscript";

export function ManuscriptRhythmPanel({
  book,
  targetWords,
  totalWords,
  onUpdateBook
}: {
  book: ManuscriptBook;
  targetWords: number;
  totalWords: number;
  onUpdateBook: (id: string, patch: Partial<ManuscriptBook>) => void;
}) {
  const rhythm = getManuscriptWritingRhythm(book);
  const todayKey = manuscriptLocalDate();
  const maximum = Math.max(book.dailyWordGoal, ...rhythm.days.map((day) => Math.max(0, day.words)), 1);
  const bookPercent = targetWords > 0 ? Math.min(100, Math.round((totalWords / targetWords) * 100)) : 0;
  return (
    <div className="manuscript-inspector-body manuscript-rhythm-body">
      <div className="manuscript-inspector-heading"><BarChart3 size={17} /><div><strong>写作节奏</strong><span>最近 14 天</span></div></div>
      <div className="manuscript-rhythm-summary">
        <div><strong>{rhythm.todayWords.toLocaleString("zh-CN")}</strong><span>今日净增</span></div>
        <div><strong>{rhythm.goalPercent}%</strong><span>今日目标</span></div>
        <div><strong>{rhythm.streak}</strong><span>连续天数</span></div>
      </div>
      <label><span>每日目标字数</span><input min={0} step={100} type="number" value={book.dailyWordGoal} onChange={(event) => onUpdateBook(book.id, { dailyWordGoal: Math.max(0, Number(event.target.value) || 0) })} /></label>
      <div className="manuscript-rhythm-goal"><span><strong>{totalWords.toLocaleString("zh-CN")}</strong> / {targetWords.toLocaleString("zh-CN")}</span><div><i style={{ width: `${bookPercent}%` }} /></div><small>全书进度 {bookPercent}%</small></div>
      <div className="manuscript-rhythm-chart" aria-label="最近十四天写作净增">
        {rhythm.days.map((day) => {
          const height = day.words === 0
            ? 3
            : Math.min(100, Math.max(10, Math.round((Math.abs(day.words) / maximum) * 100)));
          const className = [day.date === todayKey ? "is-today" : "", day.words < 0 ? "is-negative" : ""]
            .filter(Boolean)
            .join(" ");
          return <div aria-label={`${day.date} 净变化 ${day.words} 字`} className={className} key={day.date} title={`${day.date} · ${day.words} 字`}><i style={{ height: `${height}%` }} /><span>{day.date.slice(8)}</span></div>;
        })}
      </div>
      <p className="manuscript-rhythm-note">按每天首次编辑前与当前总字数计算净变化，删改不会被误记为新增字数。</p>
    </div>
  );
}
