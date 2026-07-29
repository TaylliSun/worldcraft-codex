"use client";

import {
  CalendarClock,
  Check,
  CircleDot,
  GitBranch,
  List,
  MapPin,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  formatTimelineInterval,
  mapMarkerMatchesTimelineEvent,
  planningColors,
  sortTimelineEvents,
  timelineDatePrecisionLabels
} from "../world-planning";
import type {
  MapMarker,
  TimelineDatePrecision,
  TimelineEvent,
  TimelineTrack,
  WorldMap
} from "../world-planning";
import { ProjectReferencePicker } from "./ProjectReferencePicker";
import type { ProjectReferenceOption } from "./ProjectReferencePicker";
import type { ProjectObjectKind, ProjectObjectRef } from "../project-references";

export type TimelineEntityOption = { id: string; title: string; type: string };
export type TimelineQuestOption = { id: string; title: string };
export type TimelineSceneOption = { id: string; title: string };

type TimelineViewMode = "tracks" | "list";

function findTitle<T extends { id: string; title: string }>(items: T[], id: string) {
  return items.find((item) => item.id === id)?.title ?? "";
}

function eventTitle(
  event: TimelineEvent,
  entities: TimelineEntityOption[],
  quests: TimelineQuestOption[],
  scenes: TimelineSceneOption[]
) {
  return (
    event.title ||
    findTitle(entities, event.entityId) ||
    findTitle(quests, event.questId) ||
    findTitle(scenes, event.sceneId) ||
    "未命名时间点"
  );
}

function eventSearchText(
  event: TimelineEvent,
  entities: TimelineEntityOption[],
  quests: TimelineQuestOption[],
  scenes: TimelineSceneOption[]
) {
  return [
    eventTitle(event, entities, quests, scenes),
    event.summary,
    event.displayDate,
    event.era,
    event.startValue,
    event.endValue,
    findTitle(entities, event.entityId),
    findTitle(quests, event.questId),
    findTitle(scenes, event.sceneId)
  ]
    .join(" ")
    .toLocaleLowerCase("zh-CN");
}

export function TimelineWorkspace({
  creatableReferenceKinds,
  entities,
  events,
  maps,
  markers,
  onCreateEvent,
  onCreateTrack,
  onCreateReference,
  onDeleteEvent,
  onDeleteTrack,
  onOpenMapMarker,
  onOpenReference,
  onSelectEvent,
  onSelectTrack,
  onUpdateEvent,
  onUpdateTrack,
  quests,
  referenceOptions,
  scenes,
  selectedEventId,
  selectedTrackId,
  tracks
}: {
  creatableReferenceKinds: ProjectObjectKind[];
  entities: TimelineEntityOption[];
  events: TimelineEvent[];
  maps: WorldMap[];
  markers: MapMarker[];
  onCreateEvent: (trackId: string) => void;
  onCreateTrack: () => void;
  onCreateReference: (source: ProjectObjectRef, kind: ProjectObjectKind) => void;
  onDeleteEvent: (eventId: string) => void | Promise<void>;
  onDeleteTrack: (trackId: string) => void | Promise<void>;
  onOpenMapMarker: (markerId: string) => void;
  onOpenReference: (reference: ProjectObjectRef) => void;
  onSelectEvent: (eventId: string) => void;
  onSelectTrack: (trackId: string) => void;
  onUpdateEvent: (eventId: string, patch: Partial<TimelineEvent>) => void;
  onUpdateTrack: (trackId: string, patch: Partial<TimelineTrack>) => void;
  quests: TimelineQuestOption[];
  referenceOptions: ProjectReferenceOption[];
  scenes: TimelineSceneOption[];
  selectedEventId: string;
  selectedTrackId: string;
  tracks: TimelineTrack[];
}) {
  const [viewMode, setViewMode] = useState<TimelineViewMode>("tracks");
  const [query, setQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [eraFilter, setEraFilter] = useState("all");
  const orderedTracks = useMemo(
    () => [...tracks].sort((left, right) => left.order - right.order || left.name.localeCompare(right.name, "zh-CN")),
    [tracks]
  );
  const orderedEvents = useMemo(() => sortTimelineEvents(events), [events]);
  const eras = Array.from(new Set(events.map((event) => event.era.trim()).filter(Boolean))).sort(
    (left, right) => left.localeCompare(right, "zh-CN")
  );
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filteredEvents = orderedEvents.filter(
    (event) =>
      (trackFilter === "all" || event.trackId === trackFilter) &&
      (eraFilter === "all" || event.era === eraFilter) &&
      eventSearchText(event, entities, quests, scenes).includes(normalizedQuery)
  );
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;
  const selectedTrack = tracks.find((track) => track.id === selectedTrackId) ?? tracks[0] ?? null;
  const relatedMarkers = selectedEvent
    ? markers.filter((marker) => mapMarkerMatchesTimelineEvent(marker, selectedEvent))
    : [];

  if (!selectedTrack) {
    return (
      <section className="panel planning-empty-state">
        <CalendarClock size={30} />
        <h2>当前世界没有时间轨道</h2>
        <button type="button" onClick={onCreateTrack}><Plus size={17} />新建轨道</button>
      </section>
    );
  }

  return (
    <div className="planning-workspace">
      <header className="planning-toolbar timeline-planning-toolbar">
        <div>
          <span className="planning-eyebrow"><CalendarClock size={14} />时间编排</span>
          <h2>历史与剧情时间线</h2>
        </div>
        <div className="timeline-toolbar-actions">
          <div className="planning-mode-switch" role="group" aria-label="时间线显示模式">
            <button className={viewMode === "tracks" ? "is-active" : ""} type="button" onClick={() => setViewMode("tracks")}><GitBranch size={16} /><span>轨道</span></button>
            <button className={viewMode === "list" ? "is-active" : ""} type="button" onClick={() => setViewMode("list")}><List size={16} /><span>列表</span></button>
          </div>
          <button type="button" onClick={() => onCreateEvent(selectedTrack.id)}><Plus size={17} /><span>新建时间点</span></button>
        </div>
      </header>

      <div className="timeline-filterbar">
        <label className="planning-search"><Search size={16} /><input value={query} placeholder="搜索时间点" onChange={(event) => setQuery(event.target.value)} /></label>
        <label><span>轨道</span><select aria-label="筛选轨道" value={trackFilter} onChange={(event) => setTrackFilter(event.target.value)}><option value="all">全部轨道</option>{orderedTracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}</select></label>
        <label><span>时代</span><select aria-label="筛选时代" value={eraFilter} onChange={(event) => setEraFilter(event.target.value)}><option value="all">全部时代</option>{eras.map((era) => <option key={era} value={era}>{era}</option>)}</select></label>
      </div>

      <section className="timeline-planning-layout">
        <aside className="panel timeline-track-browser">
          <div className="planning-browser-heading"><div><h2>时间轨道</h2><p>{tracks.length} 条</p></div><button aria-label="新建时间轨道" title="新建时间轨道" type="button" onClick={onCreateTrack}><Plus size={17} /></button></div>
          <div className="planning-item-list">
            {orderedTracks.map((track) => {
              const count = events.filter((event) => event.trackId === track.id).length;
              return (
                <button className={track.id === selectedTrack.id && !selectedEvent ? "is-active" : ""} key={track.id} type="button" onClick={() => onSelectTrack(track.id)}>
                  <span className="planning-color-icon" style={{ background: track.color }}><CircleDot size={15} /></span>
                  <span><strong>{track.name}</strong><small>顺序 {track.order} · {count} 项</small></span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="timeline-planning-stage">
          {viewMode === "tracks" ? (
            <div className="timeline-track-board">
              {orderedTracks
                .filter((track) => trackFilter === "all" || track.id === trackFilter)
                .map((track) => {
                  const trackEvents = filteredEvents.filter((event) => event.trackId === track.id);
                  return (
                    <section key={track.id} className="timeline-lane">
                      <header style={{ borderColor: track.color }}><span style={{ background: track.color }} /><div><strong>{track.name}</strong><small>{trackEvents.length} 项</small></div><button aria-label={`在${track.name}新建时间点`} title={`在${track.name}新建时间点`} type="button" onClick={() => onCreateEvent(track.id)}><Plus size={15} /></button></header>
                      <div className="timeline-lane-events">
                        {trackEvents.map((event) => <TimelineEventButton entities={entities} event={event} key={event.id} quests={quests} scenes={scenes} selected={event.id === selectedEvent?.id} trackColor={track.color} onClick={() => onSelectEvent(event.id)} />)}
                        {!trackEvents.length ? <p className="muted-text">暂无时间点</p> : null}
                      </div>
                    </section>
                  );
                })}
            </div>
          ) : (
            <div className="timeline-planning-list">
              {filteredEvents.map((event) => {
                const track = tracks.find((item) => item.id === event.trackId);
                return <TimelineEventButton entities={entities} event={event} key={event.id} quests={quests} scenes={scenes} selected={event.id === selectedEvent?.id} trackColor={track?.color || planningColors[0]} onClick={() => onSelectEvent(event.id)} />;
              })}
              {!filteredEvents.length ? <p className="muted-text">没有匹配的时间点</p> : null}
            </div>
          )}
        </div>

        <aside
          className="panel planning-inspector timeline-planning-inspector"
          data-reference-path={selectedEvent ? "references" : undefined}
          data-reference-source-id={selectedEvent?.id}
          data-reference-source-kind={selectedEvent ? "timeline-event" : undefined}
        >
          {selectedEvent ? (
            <TimelineEventInspector
              creatableReferenceKinds={creatableReferenceKinds}
              entities={entities}
              event={selectedEvent}
              events={orderedEvents}
              maps={maps}
              markers={relatedMarkers}
              onDelete={() => onDeleteEvent(selectedEvent.id)}
              onOpenMapMarker={onOpenMapMarker}
              onOpenReference={onOpenReference}
              onCreateReference={(kind) =>
                onCreateReference({ kind: "timeline-event", id: selectedEvent.id }, kind)
              }
              onUpdate={(patch) => onUpdateEvent(selectedEvent.id, patch)}
              quests={quests}
              referenceOptions={referenceOptions}
              scenes={scenes}
              tracks={orderedTracks}
            />
          ) : (
            <TimelineTrackInspector
              canDelete={tracks.length > 1}
              count={events.filter((event) => event.trackId === selectedTrack.id).length}
              onDelete={() => onDeleteTrack(selectedTrack.id)}
              onUpdate={(patch) => onUpdateTrack(selectedTrack.id, patch)}
              track={selectedTrack}
            />
          )}
        </aside>
      </section>
    </div>
  );
}

function TimelineEventButton({
  entities,
  event,
  onClick,
  quests,
  scenes,
  selected,
  trackColor
}: {
  entities: TimelineEntityOption[];
  event: TimelineEvent;
  onClick: () => void;
  quests: TimelineQuestOption[];
  scenes: TimelineSceneOption[];
  selected: boolean;
  trackColor: string;
}) {
  return (
    <button className={`timeline-planning-event ${selected ? "is-active" : ""}`} type="button" onClick={onClick}>
      <span className="timeline-event-accent" style={{ background: trackColor }} />
      <span><strong>{event.displayDate}</strong><b>{eventTitle(event, entities, quests, scenes)}</b><small>{event.era || formatTimelineInterval(event)}</small></span>
      {event.dependencyIds.length ? <em>{event.dependencyIds.length} 前置</em> : null}
    </button>
  );
}

function TimelineTrackInspector({ canDelete, count, onDelete, onUpdate, track }: { canDelete: boolean; count: number; onDelete: () => void | Promise<void>; onUpdate: (patch: Partial<TimelineTrack>) => void; track: TimelineTrack }) {
  return (
    <>
      <InspectorHeading icon={GitBranch} subtitle={`${count} 个时间点`} title={track.name} />
      <PlanningField label="轨道名称"><input aria-label="轨道名称" value={track.name} onChange={(event) => onUpdate({ name: event.target.value })} /></PlanningField>
      <PlanningField label="轨道说明"><textarea aria-label="轨道说明" rows={4} value={track.description} onChange={(event) => onUpdate({ description: event.target.value })} /></PlanningField>
      <PlanningField label="轨道顺序"><input aria-label="轨道顺序" type="number" value={track.order} onChange={(event) => onUpdate({ order: Number(event.target.value) })} /></PlanningField>
      <PlanningField label="颜色"><ColorSwatches color={track.color} label="轨道颜色" onChange={(color) => onUpdate({ color })} /></PlanningField>
      <button className="planning-danger-action" disabled={!canDelete} type="button" onClick={() => void onDelete()}><Trash2 size={17} /><span>删除轨道</span></button>
    </>
  );
}

function TimelineEventInspector({
  creatableReferenceKinds,
  entities,
  event,
  events,
  maps,
  markers,
  onDelete,
  onCreateReference,
  onOpenMapMarker,
  onOpenReference,
  onUpdate,
  quests,
  referenceOptions,
  scenes,
  tracks
}: {
  creatableReferenceKinds: ProjectObjectKind[];
  entities: TimelineEntityOption[];
  event: TimelineEvent;
  events: TimelineEvent[];
  maps: WorldMap[];
  markers: MapMarker[];
  onDelete: () => void | Promise<void>;
  onCreateReference: (kind: ProjectObjectKind) => void;
  onOpenMapMarker: (id: string) => void;
  onOpenReference: (reference: ProjectObjectRef) => void;
  onUpdate: (patch: Partial<TimelineEvent>) => void;
  quests: TimelineQuestOption[];
  referenceOptions: ProjectReferenceOption[];
  scenes: TimelineSceneOption[];
  tracks: TimelineTrack[];
}) {
  function updateReferences(references: ProjectObjectRef[]) {
    onUpdate({
      references,
      entityId: references.find((reference) => reference.kind === "entity")?.id ?? "",
      questId: references.find((reference) => reference.kind === "quest")?.id ?? "",
      sceneId: references.find((reference) => reference.kind === "scene")?.id ?? ""
    });
  }

  function toggleDependency(dependencyId: string) {
    onUpdate({
      dependencyIds: event.dependencyIds.includes(dependencyId)
        ? event.dependencyIds.filter((id) => id !== dependencyId)
        : [...event.dependencyIds, dependencyId]
    });
  }

  return (
    <>
      <InspectorHeading icon={CalendarClock} subtitle={event.displayDate} title={eventTitle(event, entities, quests, scenes)} />
      <PlanningField label="时间点名称"><input aria-label="时间点名称" value={event.title} onChange={(inputEvent) => onUpdate({ title: inputEvent.target.value })} /></PlanningField>
      <PlanningField label="摘要"><textarea aria-label="时间点摘要" rows={3} value={event.summary} onChange={(inputEvent) => onUpdate({ summary: inputEvent.target.value })} /></PlanningField>
      <div className="planning-field-grid"><PlanningField label="显示时间"><input aria-label="显示时间" value={event.displayDate} onChange={(inputEvent) => onUpdate({ displayDate: inputEvent.target.value })} /></PlanningField><PlanningField label="时间精度"><select aria-label="时间精度" value={event.datePrecision} onChange={(inputEvent) => onUpdate({ datePrecision: inputEvent.target.value as TimelineDatePrecision })}>{(Object.entries(timelineDatePrecisionLabels) as Array<[TimelineDatePrecision, string]>).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></PlanningField></div>
      <PlanningField label="时代 / 纪元"><input aria-label="时代或纪元" value={event.era} onChange={(inputEvent) => onUpdate({ era: inputEvent.target.value })} /></PlanningField>
      <PlanningField label="时间轨道"><select aria-label="时间轨道" value={event.trackId} onChange={(inputEvent) => onUpdate({ trackId: inputEvent.target.value })}>{tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}</select></PlanningField>
      <PlanningField label="排序值"><input aria-label="时间排序值" type="number" value={event.sortOrder} onChange={(inputEvent) => onUpdate({ sortOrder: Number(inputEvent.target.value) })} /></PlanningField>
      <div className="planning-field-grid"><PlanningField label="区间起点"><input aria-label="时间区间起点" value={event.startValue} onChange={(inputEvent) => onUpdate({ startValue: inputEvent.target.value })} /></PlanningField><PlanningField label="区间终点"><input aria-label="时间区间终点" value={event.endValue} onChange={(inputEvent) => onUpdate({ endValue: inputEvent.target.value })} /></PlanningField></div>
      <div
        data-reference-path="references"
        data-reference-source-id={event.id}
        data-reference-source-kind="timeline-event"
      >
        <ProjectReferencePicker
          creatableKinds={creatableReferenceKinds}
          onChange={updateReferences}
          onCreate={onCreateReference}
          onOpenReference={onOpenReference}
          options={referenceOptions.filter(
            (option) =>
              option.reference.kind !== "timeline-event" || option.reference.id !== event.id
          )}
          value={event.references}
        />
      </div>
      <div
        className="timeline-dependency-editor"
        data-reference-path="dependencyIds"
        data-reference-source-id={event.id}
        data-reference-source-kind="timeline-event"
      >
        <div><strong>前置事件</strong><span>{event.dependencyIds.length}</span></div>
        <div>{events.filter((item) => item.id !== event.id).map((item) => <label key={item.id}><input checked={event.dependencyIds.includes(item.id)} type="checkbox" onChange={() => toggleDependency(item.id)} /><span>{eventTitle(item, entities, quests, scenes)}</span><small>{item.displayDate}</small></label>)}</div>
      </div>
      <div className="planning-reference-section">
        <div><strong>相关地图标记</strong><span>{markers.length}</span></div>
        {markers.map((marker) => {
          const map = maps.find((item) => item.id === marker.mapId);
          return <button key={marker.id} type="button" onClick={() => onOpenMapMarker(marker.id)}><MapPin size={15} /><span><strong>{marker.label}</strong><small>{map?.title ?? "失效地图"}</small></span></button>;
        })}
        {!markers.length ? <p className="muted-text">暂无相关地图标记</p> : null}
      </div>
      <button className="planning-danger-action" type="button" onClick={() => void onDelete()}><Trash2 size={17} /><span>删除时间点</span></button>
    </>
  );
}

function InspectorHeading({ icon: Icon, subtitle, title }: { icon: typeof CalendarClock; subtitle: string; title: string }) {
  return <div className="planning-inspector-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><Icon size={20} /></div>;
}

function PlanningField({ children, label }: { children: ReactNode; label: string }) {
  return <label className="planning-field"><span>{label}</span>{children}</label>;
}

function ColorSwatches({ color, label, onChange }: { color: string; label: string; onChange: (color: string) => void }) {
  return <div className="planning-color-swatches" role="radiogroup" aria-label={label}>{planningColors.map((item) => <button aria-label={`选择颜色 ${item}`} aria-checked={color === item} className={color === item ? "is-active" : ""} key={item} role="radio" style={{ background: item }} title={item} type="button" onClick={() => onChange(item)}>{color === item ? <Check size={13} /> : null}</button>)}</div>;
}
