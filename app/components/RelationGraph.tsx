"use client";

import {
  ArrowLeftRight,
  ArrowRight,
  Boxes,
  CalendarDays,
  ChevronsDown,
  ChevronsUp,
  FileText,
  Flag,
  Layers3,
  ListTree,
  LocateFixed,
  MapPin,
  Maximize2,
  Network,
  Orbit,
  Pause,
  Play,
  Search,
  Tags,
  UserRound,
  X,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY
} from "d3-force";
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent
} from "react";

export type RelationGraphEntityType =
  | "character"
  | "location"
  | "faction"
  | "event"
  | "item"
  | "note";

export type RelationGraphEntity = {
  id: string;
  title: string;
  type: RelationGraphEntityType;
  summary: string;
};

export type RelationGraphEdge = {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  kind: string;
  label: string;
  direction: "directed" | "undirected" | "mutual";
  strength: number;
};

type RelationGraphViewMode = "all" | "focus" | "network";
type RelationLaneScope = "direct" | "context" | "all";

type NetworkLayoutNode = SimulationNodeDatum & {
  id: string;
  relationCount: number;
  type: RelationGraphEntityType;
};

type NetworkLayoutLink = SimulationLinkDatum<NetworkLayoutNode> & {
  source: string | NetworkLayoutNode;
  strength: number;
  target: string | NetworkLayoutNode;
};

const typeMeta: Record<
  RelationGraphEntityType,
  { label: string; icon: LucideIcon }
> = {
  character: { label: "角色", icon: UserRound },
  faction: { label: "组织", icon: Flag },
  location: { label: "地点", icon: MapPin },
  event: { label: "事件", icon: CalendarDays },
  item: { label: "物品", icon: Boxes },
  note: { label: "笔记", icon: FileText }
};

const typeOrder: RelationGraphEntityType[] = [
  "character",
  "faction",
  "location",
  "event",
  "item",
  "note"
];

const relationColors: Record<string, string> = {
  ally: "#238467",
  rival: "#c45b3d",
  family: "#7458aa",
  member: "#118195",
  leads: "#b07a16",
  controls: "#9a4d72",
  located: "#4f7f89",
  route: "#66736d",
  teacher: "#357a68",
  source: "#5f6f68",
  creator: "#9a6b31",
  companion: "#2f7f7b",
  protector: "#8a5b46",
  evolution: "#75608f",
  disputed: "#b05745",
  incarnation: "#79598c",
  subordinate: "#607080",
  devotion: "#8f586d",
  influence: "#456d8c",
  leader: "#9a6b31",
  collaborator: "#3f6f5c",
  worship: "#8a5963",
  peer: "#61706a",
  ritual: "#a05d3f",
  contains: "#526f7a",
  custom: "#526159"
};

const relationKindLabels: Record<string, string> = {
  ally: "盟友 / 合作",
  rival: "敌对 / 竞争",
  family: "亲属 / 亲密",
  member: "隶属 / 成员",
  leads: "领导",
  controls: "控制 / 影响",
  located: "位于 / 出生于",
  route: "道路 / 相连",
  teacher: "师承 / 授业",
  source: "原典 / 出处",
  creator: "创制 / 建立",
  companion: "同伴 / 胁侍",
  protector: "护法 / 守护",
  evolution: "演变 / 合流",
  disputed: "争议 / 异说",
  incarnation: "化身 / 应化",
  subordinate: "属官 / 下位",
  devotion: "信奉 / 归依",
  influence: "影响 / 承接",
  leader: "主持 / 领袖",
  collaborator: "协作 / 共事",
  worship: "祭祀 / 奉祀",
  peer: "同列 / 并列",
  ritual: "仪式 / 科仪",
  contains: "包含 / 收录",
  custom: "自定义"
};

const strengthRingLabels: Record<number, string> = {
  5: "强度 5 · 至密",
  4: "强度 4 · 紧密",
  3: "强度 3 · 稳定",
  2: "强度 2 · 松散",
  1: "强度 1 · 微弱"
};

const laneScopeLabels: Record<RelationLaneScope, string> = {
  direct: "直接关联",
  context: "二度上下文",
  all: "全部网络"
};

const MIN_ZOOM = 0.5;
const NETWORK_MIN_ZOOM = 0.2;
const MAX_ZOOM = 1.6;
const DEFAULT_ATLAS_RELATION_LIMIT = 8;

function clampZoom(value: number, minimum = MIN_ZOOM) {
  return Math.min(MAX_ZOOM, Math.max(minimum, Number(value.toFixed(2))));
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function RelationAtlas({
  entities,
  focusedEntityId,
  normalizedQuery,
  onOpenEntity,
  onSelectEntity,
  onSelectRelation,
  relations,
  scopedCountByKind,
  scopedRelations,
  selectedRelationId
}: {
  entities: RelationGraphEntity[];
  focusedEntityId: string;
  normalizedQuery: string;
  onOpenEntity?: (entityId: string) => void;
  onSelectEntity: (entityId: string) => void;
  onSelectRelation: (relationId: string) => void;
  relations: RelationGraphEdge[];
  scopedCountByKind: Map<string, number>;
  scopedRelations: RelationGraphEdge[];
  selectedRelationId: string;
}) {
  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]));
  const focusedEntity = entitiesById.get(focusedEntityId) ?? null;
  const FocusIcon = focusedEntity ? typeMeta[focusedEntity.type].icon : Boxes;
  const relatedEntityIds = new Set<string>();
  scopedRelations.forEach((relation) => {
    relatedEntityIds.add(relation.sourceEntityId);
    relatedEntityIds.add(relation.targetEntityId);
  });
  const averageStrength = scopedRelations.length
    ? (
        scopedRelations.reduce((total, relation) => total + relation.strength, 0) /
        scopedRelations.length
      ).toFixed(1)
    : "0";
  const orderedKinds = Array.from(new Set(relations.map((relation) => relation.kind))).sort(
    (left, right) => {
      const leftIndex = Object.keys(relationKindLabels).indexOf(left);
      const rightIndex = Object.keys(relationKindLabels).indexOf(right);
      return (
        (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) -
          (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex) ||
        left.localeCompare(right, "zh-CN")
      );
    }
  );

  return (
    <div className="relation-atlas-scroll">
      <header className="relation-atlas-heading">
        <div className="relation-atlas-core">
          <span className={`type-${focusedEntity?.type ?? "note"}`}>
            <FocusIcon size={18} />
          </span>
          <div>
            <small>{focusedEntity ? "当前核心" : "当前范围"}</small>
            <strong>{focusedEntity?.title ?? "全部关系"}</strong>
          </div>
        </div>
        <dl className="relation-atlas-stats">
          <div>
            <dt>范围关系</dt>
            <dd>{scopedRelations.length}</dd>
          </div>
          <div>
            <dt>关联条目</dt>
            <dd>{relatedEntityIds.size}</dd>
          </div>
          <div>
            <dt>平均强度</dt>
            <dd>{averageStrength}</dd>
          </div>
        </dl>
      </header>

      {orderedKinds.length ? (
        <div className="relation-atlas-groups">
          {orderedKinds.map((kind) => {
            const color = relationColors[kind] ?? relationColors.custom;
            const kindRelations = relations.filter((relation) => relation.kind === kind);
            const scopedCount = scopedCountByKind.get(kind) ?? kindRelations.length;
            return (
              <section
                className="relation-atlas-group"
                key={kind}
                style={{ "--relation-kind-color": color } as CSSProperties}
              >
                <header>
                  <span />
                  <strong>{relationKindLabels[kind] ?? kind}</strong>
                  <small>
                    {kindRelations.length < scopedCount
                      ? `${kindRelations.length}/${scopedCount}`
                      : scopedCount}
                  </small>
                </header>
                <div className="relation-atlas-list">
                  {kindRelations.map((relation) => {
                    const source = entitiesById.get(relation.sourceEntityId);
                    const target = entitiesById.get(relation.targetEntityId);
                    if (!source || !target) return null;
                    const SourceIcon = typeMeta[source.type].icon;
                    const TargetIcon = typeMeta[target.type].icon;
                    const connectedToCore =
                      !focusedEntityId ||
                      source.id === focusedEntityId ||
                      target.id === focusedEntityId;
                    const searchableText = `${source.title} ${target.title} ${relation.label} ${
                      relationKindLabels[kind] ?? kind
                    }`.toLocaleLowerCase("zh-CN");
                    const matchesSearch =
                      !normalizedQuery || searchableText.includes(normalizedQuery);
                    return (
                      <article
                        className={`relation-atlas-row ${
                          relation.id === selectedRelationId ? "is-selected" : ""
                        } ${connectedToCore ? "" : "is-context"} ${
                          matchesSearch ? "" : "is-search-muted"
                        }`}
                        key={relation.id}
                      >
                        <button
                          aria-label={`选择条目 ${source.title}`}
                          className={`relation-atlas-entity type-${source.type} ${
                            source.id === focusedEntityId ? "is-core" : ""
                          }`}
                          data-relation-interactive="true"
                          title={`${source.title}（双击打开条目）`}
                          type="button"
                          onClick={() => onSelectEntity(source.id)}
                          onDoubleClick={() => onOpenEntity?.(source.id)}
                        >
                          <span><SourceIcon size={16} /></span>
                          <span>
                            <strong>{source.title}</strong>
                            <small>{typeMeta[source.type].label}</small>
                          </span>
                        </button>

                        <button
                          aria-label={`查看关系 ${relation.label}`}
                          className="relation-atlas-relation"
                          data-relation-interactive="true"
                          title={`查看关系：${relation.label}`}
                          type="button"
                          onClick={() => onSelectRelation(relation.id)}
                        >
                          <strong>{relation.label}</strong>
                          <span className="relation-atlas-direction">
                            {relation.direction === "directed" ? (
                              <ArrowRight size={14} />
                            ) : (
                              <ArrowLeftRight size={14} />
                            )}
                            <small>{relation.direction === "directed" ? "单向" : relation.direction === "mutual" ? "互向" : "双向"}</small>
                          </span>
                          <span
                            aria-label={`关系强度 ${relation.strength}/5`}
                            className="relation-atlas-strength"
                          >
                            {Array.from({ length: 5 }, (_, index) => (
                              <i className={index < relation.strength ? "is-active" : ""} key={index} />
                            ))}
                          </span>
                        </button>

                        <button
                          aria-label={`选择条目 ${target.title}`}
                          className={`relation-atlas-entity type-${target.type} ${
                            target.id === focusedEntityId ? "is-core" : ""
                          }`}
                          data-relation-interactive="true"
                          title={`${target.title}（双击打开条目）`}
                          type="button"
                          onClick={() => onSelectEntity(target.id)}
                          onDoubleClick={() => onOpenEntity?.(target.id)}
                        >
                          <span><TargetIcon size={16} /></span>
                          <span>
                            <strong>{target.title}</strong>
                            <small>{typeMeta[target.type].label}</small>
                          </span>
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="relation-atlas-empty">
          <strong>当前范围没有关系</strong>
          <span>切换范围，或先创建一条关系。</span>
        </div>
      )}
    </div>
  );
}

export function RelationGraph({
  entities,
  focusedEntityId,
  onOpenEntity,
  onSelectEntity,
  onSelectRelation,
  relations,
  selectedRelationId
}: {
  entities: RelationGraphEntity[];
  focusedEntityId: string;
  onOpenEntity?: (entityId: string) => void;
  onSelectEntity: (entityId: string) => void;
  onSelectRelation: (relationId: string) => void;
  relations: RelationGraphEdge[];
  selectedRelationId: string;
}) {
  const [hiddenKinds, setHiddenKinds] = useState<Set<string>>(new Set());
  const [isPanning, setIsPanning] = useState(false);
  const [atlasRelationLimit, setAtlasRelationLimit] = useState(
    DEFAULT_ATLAS_RELATION_LIMIT
  );
  const [laneScope, setLaneScope] = useState<RelationLaneScope>("direct");
  const [networkMinStrength, setNetworkMinStrength] = useState<1 | 2 | 3 | 4>(1);
  const [orbitDepth, setOrbitDepth] = useState<1 | 2 | 3>(1);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [orbitMotion, setOrbitMotion] = useState(true);
  const [viewMode, setViewMode] = useState<RelationGraphViewMode>("all");
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingCenterEntityIdRef = useRef("");
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const initialFitRef = useRef(false);
  const previousOrbitDepthRef = useRef<1 | 2 | 3>(orbitDepth);
  const previousViewModeRef = useRef<RelationGraphViewMode>(viewMode);
  const markerPrefix = `relation-${useId().replaceAll(":", "")}`;
  const focusedEntity = entities.find((entity) => entity.id === focusedEntityId) ?? null;
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");

  const relationCountByEntity = useMemo(() => {
    const counts = new Map<string, number>();
    if (viewMode === "all" && !normalizedQuery) return counts;
    relations.forEach((relation) => {
      counts.set(relation.sourceEntityId, (counts.get(relation.sourceEntityId) ?? 0) + 1);
      counts.set(relation.targetEntityId, (counts.get(relation.targetEntityId) ?? 0) + 1);
    });
    return counts;
  }, [normalizedQuery, relations, viewMode]);

  const activeRelations = useMemo(
    () => hiddenKinds.size
      ? relations.filter((relation) => !hiddenKinds.has(relation.kind))
      : relations,
    [hiddenKinds, relations]
  );

  const relationDegreeByEntity = useMemo(() => {
    const degrees = new Map<string, number>();
    if (viewMode !== "focus" && laneScope !== "context") return degrees;
    const entityIds = new Set(entities.map((entity) => entity.id));
    if (!focusedEntityId || !entityIds.has(focusedEntityId)) return degrees;
    const neighborsByEntity = new Map<string, Set<string>>();
    activeRelations.forEach((relation) => {
      if (
        !entityIds.has(relation.sourceEntityId) ||
        !entityIds.has(relation.targetEntityId)
      ) {
        return;
      }
      const sourceNeighbors = neighborsByEntity.get(relation.sourceEntityId) ?? new Set<string>();
      sourceNeighbors.add(relation.targetEntityId);
      neighborsByEntity.set(relation.sourceEntityId, sourceNeighbors);
      const targetNeighbors = neighborsByEntity.get(relation.targetEntityId) ?? new Set<string>();
      targetNeighbors.add(relation.sourceEntityId);
      neighborsByEntity.set(relation.targetEntityId, targetNeighbors);
    });

    const queue = [focusedEntityId];
    degrees.set(focusedEntityId, 0);
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const entityId = queue[cursor];
      const nextDegree = (degrees.get(entityId) ?? 0) + 1;
      neighborsByEntity.get(entityId)?.forEach((neighborId) => {
        if (degrees.has(neighborId)) return;
        degrees.set(neighborId, nextDegree);
        queue.push(neighborId);
      });
    }
    return degrees;
  }, [activeRelations, entities, focusedEntityId, laneScope, viewMode]);

  const directStrengthByEntity = useMemo(() => {
    const strengths = new Map<string, number>();
    activeRelations.forEach((relation) => {
      const otherEntityId =
        relation.sourceEntityId === focusedEntityId
          ? relation.targetEntityId
          : relation.targetEntityId === focusedEntityId
            ? relation.sourceEntityId
            : "";
      if (!otherEntityId) return;
      const strength = Math.min(5, Math.max(1, relation.strength));
      strengths.set(otherEntityId, Math.max(strengths.get(otherEntityId) ?? 0, strength));
    });
    return strengths;
  }, [activeRelations, focusedEntityId]);

  const displayedEntities = useMemo(() => {
    if (viewMode === "all") return [];
    if (viewMode !== "focus" || !focusedEntityId) return entities;
    return entities.filter(
      (entity) =>
        (relationDegreeByEntity.get(entity.id) ?? Number.POSITIVE_INFINITY) <= orbitDepth
    );
  }, [entities, focusedEntityId, orbitDepth, relationDegreeByEntity, viewMode]);

  const atlasScopedRelations = useMemo(() => {
    if (!focusedEntityId || laneScope === "all") return activeRelations;
    if (laneScope === "direct") {
      return activeRelations.filter(
        (relation) =>
          relation.sourceEntityId === focusedEntityId ||
          relation.targetEntityId === focusedEntityId
      );
    }
    return activeRelations.filter(
      (relation) =>
        (relationDegreeByEntity.get(relation.sourceEntityId) ?? Number.POSITIVE_INFINITY) <= 2 &&
        (relationDegreeByEntity.get(relation.targetEntityId) ?? Number.POSITIVE_INFINITY) <= 2
    );
  }, [activeRelations, focusedEntityId, laneScope, relationDegreeByEntity]);

  const atlasScopedCountByKind = useMemo(() => {
    const counts = new Map<string, number>();
    atlasScopedRelations.forEach((relation) => {
      counts.set(relation.kind, (counts.get(relation.kind) ?? 0) + 1);
    });
    return counts;
  }, [atlasScopedRelations]);

  const atlasDisplayedRelations = useMemo(() => {
    const kinds = Array.from(new Set(atlasScopedRelations.map((relation) => relation.kind)));
    return kinds.flatMap((kind) =>
      atlasScopedRelations
        .filter((relation) => relation.kind === kind)
        .sort(
          (left, right) =>
            Number(right.id === selectedRelationId) - Number(left.id === selectedRelationId) ||
            Number(
              right.sourceEntityId === focusedEntityId ||
                right.targetEntityId === focusedEntityId
            ) -
              Number(
                left.sourceEntityId === focusedEntityId ||
                  left.targetEntityId === focusedEntityId
              ) ||
            right.strength - left.strength ||
            left.label.localeCompare(right.label, "zh-CN")
        )
        .slice(0, atlasRelationLimit)
    );
  }, [
    atlasRelationLimit,
    atlasScopedRelations,
    focusedEntityId,
    selectedRelationId
  ]);

  const hiddenAtlasRelationCount = Math.max(
    0,
    atlasScopedRelations.length - atlasDisplayedRelations.length
  );
  const atlasDisplayedEntityCount = new Set(
    atlasDisplayedRelations.flatMap((relation) => [
      relation.sourceEntityId,
      relation.targetEntityId
    ])
  ).size;

  const displayedEntityIds = useMemo(
    () => new Set(displayedEntities.map((entity) => entity.id)),
    [displayedEntities]
  );

  const displayedRelations = useMemo(
    () =>
      activeRelations.filter(
        (relation) =>
          displayedEntityIds.has(relation.sourceEntityId) &&
          displayedEntityIds.has(relation.targetEntityId) &&
          (viewMode !== "network" || relation.strength >= networkMinStrength)
      ),
    [activeRelations, displayedEntityIds, networkMinStrength, viewMode]
  );

  const displayedNeighborIds = useMemo(() => {
    const neighbors = new Set<string>();
    displayedRelations.forEach((relation) => {
      if (relation.sourceEntityId === focusedEntityId) neighbors.add(relation.targetEntityId);
      if (relation.targetEntityId === focusedEntityId) neighbors.add(relation.sourceEntityId);
    });
    return neighbors;
  }, [displayedRelations, focusedEntityId]);

  const graph = useMemo(() => {
    if (viewMode === "all") {
      return {
        gapX: 0,
        grouped: [],
        height: 0,
        layout: "network" as const,
        networkClusters: [],
        nodeHeight: 0,
        nodeWidth: 0,
        orbitCenter: null,
        orbitRings: [],
        positions: new Map<string, { x: number; y: number; type: RelationGraphEntityType }>(),
        width: 0
      };
    }
    const orbitLayout = viewMode === "focus" && Boolean(focusedEntityId);
    const nodeWidth = orbitLayout ? 96 : 132;
    const nodeHeight = orbitLayout ? 96 : 58;
    const gapX = orbitLayout ? 104 : 0;
    const grouped = typeOrder
      .map((type) => ({
        type,
        entities: displayedEntities
          .filter((entity) => entity.type === type)
          .sort(
            (left, right) =>
              Number(right.id === focusedEntityId) - Number(left.id === focusedEntityId) ||
              (relationCountByEntity.get(right.id) ?? 0) -
                (relationCountByEntity.get(left.id) ?? 0) ||
              left.title.localeCompare(right.title, "zh-CN")
          )
      }))
      .filter((group) => group.entities.length);
    const positions = new Map<
      string,
      { x: number; y: number; type: RelationGraphEntityType }
    >();

    const focusCore = displayedEntities.find((entity) => entity.id === focusedEntityId);
    if (viewMode === "focus" && focusCore) {
      const sortLayer = (layerEntities: RelationGraphEntity[]) =>
        layerEntities.sort(
          (left, right) =>
            typeOrder.indexOf(left.type) - typeOrder.indexOf(right.type) ||
            (relationCountByEntity.get(right.id) ?? 0) -
              (relationCountByEntity.get(left.id) ?? 0) ||
            left.title.localeCompare(right.title, "zh-CN")
        );
      const directEntitiesByStrength = new Map<number, RelationGraphEntity[]>();
      displayedEntities.forEach((entity) => {
        if ((relationDegreeByEntity.get(entity.id) ?? 0) !== 1) return;
        const strength = directStrengthByEntity.get(entity.id) ?? 1;
        const layer = directEntitiesByStrength.get(strength) ?? [];
        layer.push(entity);
        directEntitiesByStrength.set(strength, layer);
      });
      const orbitLayers: Array<{
        degree: number;
        entities: RelationGraphEntity[];
        label: string;
        strength: number | null;
      }> = Array.from(directEntitiesByStrength.entries())
        .sort(([leftStrength], [rightStrength]) => rightStrength - leftStrength)
        .map(([strength, layerEntities]) => ({
          degree: 1,
          entities: sortLayer(layerEntities),
          label: strengthRingLabels[strength] ?? `强度 ${strength}`,
          strength
        }));
      for (let degree = 2; degree <= orbitDepth; degree += 1) {
        const indirectEntities = displayedEntities.filter(
          (entity) => relationDegreeByEntity.get(entity.id) === degree
        );
        if (!indirectEntities.length) continue;
        orbitLayers.push({
          degree,
          entities: sortLayer(indirectEntities),
          label: `${degree} 度间接`,
          strength: null
        });
      }
      let previousRadius = 0;
      const ringSpecs = orbitLayers.map((layer, layerIndex) => {
        const spacingRadius =
          (layer.entities.length * (nodeWidth + 26)) / (Math.PI * 2);
        const radius =
          layerIndex === 0
            ? Math.max(142, spacingRadius + 20)
            : Math.max(previousRadius + 118, spacingRadius + 20);
        previousRadius = radius;
        return { ...layer, radius };
      });
      const outerRadius = ringSpecs.at(-1)?.radius ?? 0;
      const dimension = Math.max(
        520,
        Math.ceil((outerRadius + nodeWidth / 2 + 20) * 2)
      );
      const width = dimension;
      const height = dimension;
      const centerX = width / 2;
      const centerY = height / 2;
      const orbitRings: Array<{
        degree: number;
        height: number;
        index: number;
        label: string;
        strength: number | null;
        width: number;
        x: number;
        y: number;
      }> = [];
      positions.set(focusCore.id, {
        x: centerX - nodeWidth / 2,
        y: centerY - nodeHeight / 2,
        type: focusCore.type
      });

      ringSpecs.forEach((ring, currentRingIndex) => {
        orbitRings.push({
          degree: ring.degree,
          height: ring.radius * 2,
          index: currentRingIndex,
          label: ring.label,
          strength: ring.strength,
          width: ring.radius * 2,
          x: centerX - ring.radius,
          y: centerY - ring.radius
        });
        const count = ring.entities.length;
        const singleAngles = [
          -Math.PI / 3,
          (Math.PI * 2) / 3,
          Math.PI / 6,
          (Math.PI * 7) / 6,
          -Math.PI / 2
        ];
        const startAngle =
          count === 1
            ? singleAngles[currentRingIndex % singleAngles.length]
            : count === 2
              ? currentRingIndex % 2 === 0
                ? 0
                : Math.PI / 2
              : -Math.PI / 2 + currentRingIndex * 0.24;
        ring.entities.forEach((entity, itemIndex) => {
          const angle = startAngle + (Math.PI * 2 * itemIndex) / count;
          positions.set(entity.id, {
            x: Math.round(centerX + Math.cos(angle) * ring.radius - nodeWidth / 2),
            y: Math.round(centerY + Math.sin(angle) * ring.radius - nodeHeight / 2),
            type: entity.type
          });
        });
      });

      return {
        gapX,
        grouped: grouped.slice(0, 0),
        height,
        layout: "orbit" as const,
        networkClusters: [],
        nodeHeight,
        nodeWidth,
        orbitCenter: { x: centerX, y: centerY },
        orbitRings,
        positions,
        width
      };
    }

    const entityCount = Math.max(1, displayedEntities.length);
    const layoutColumns = Math.max(1, Math.ceil(Math.sqrt(entityCount * 1.4)));
    const layoutRows = Math.max(1, Math.ceil(entityCount / layoutColumns));
    const width = Math.max(1080, layoutColumns * 190);
    const height = Math.max(720, layoutRows * 150 + 300);
    const centerX = width / 2;
    const centerY = height / 2;
    const clusterCenters = new Map<RelationGraphEntityType, { x: number; y: number }>();
    grouped.forEach((group, index) => {
      const angle =
        grouped.length === 1
          ? 0
          : -Math.PI / 2 + (Math.PI * 2 * index) / grouped.length;
      clusterCenters.set(group.type, {
        x: centerX + Math.cos(angle) * width * 0.29,
        y: centerY + Math.sin(angle) * height * 0.27
      });
    });

    const networkNodes: NetworkLayoutNode[] = displayedEntities.map((entity) => {
      const hash = stableHash(entity.id);
      const cluster = clusterCenters.get(entity.type) ?? { x: centerX, y: centerY };
      const angle = ((hash % 360) * Math.PI) / 180;
      const radius = 34 + ((hash >>> 9) % 92);
      return {
        id: entity.id,
        relationCount: relationCountByEntity.get(entity.id) ?? 0,
        type: entity.type,
        x: cluster.x + Math.cos(angle) * radius,
        y: cluster.y + Math.sin(angle) * radius
      };
    });
    const networkLinks: NetworkLayoutLink[] = displayedRelations.map((relation) => ({
      source: relation.sourceEntityId,
      strength: relation.strength,
      target: relation.targetEntityId
    }));
    const simulation = forceSimulation(networkNodes)
      .force(
        "link",
        forceLink<NetworkLayoutNode, NetworkLayoutLink>(networkLinks)
          .id((node) => node.id)
          .distance((link) => {
            const source = link.source as NetworkLayoutNode;
            const target = link.target as NetworkLayoutNode;
            return source.type === target.type ? 116 : 176;
          })
          .strength((link) => 0.1 + link.strength * 0.035)
      )
      .force(
        "charge",
        forceManyBody<NetworkLayoutNode>().strength(
          (node) => -260 - Math.min(12, node.relationCount) * 12
        )
      )
      .force("collide", forceCollide<NetworkLayoutNode>().radius(82).iterations(2))
      .force(
        "cluster-x",
        forceX<NetworkLayoutNode>((node) => clusterCenters.get(node.type)?.x ?? centerX)
          .strength(0.13)
      )
      .force(
        "cluster-y",
        forceY<NetworkLayoutNode>((node) => clusterCenters.get(node.type)?.y ?? centerY)
          .strength(0.13)
      )
      .stop();

    const tickCount = Math.min(320, 160 + networkNodes.length * 3);
    for (let tick = 0; tick < tickCount; tick += 1) simulation.tick();
    simulation.stop();

    const horizontalPadding = nodeWidth / 2 + 54;
    const verticalPadding = nodeHeight / 2 + 54;
    networkNodes.forEach((node) => {
      const x = Math.min(width - horizontalPadding, Math.max(horizontalPadding, node.x ?? centerX));
      const y = Math.min(height - verticalPadding, Math.max(verticalPadding, node.y ?? centerY));
      positions.set(node.id, {
        x: Math.round(x - nodeWidth / 2),
        y: Math.round(y - nodeHeight / 2),
        type: node.type
      });
    });

    const networkClusters = grouped.map((group) => {
      const groupPositions = group.entities
        .map((entity) => positions.get(entity.id))
        .filter((position): position is NonNullable<typeof position> => Boolean(position));
      const left = Math.max(18, Math.min(...groupPositions.map((position) => position.x)) - 42);
      const top = Math.max(18, Math.min(...groupPositions.map((position) => position.y)) - 58);
      const right = Math.min(
        width - 18,
        Math.max(...groupPositions.map((position) => position.x + nodeWidth)) + 42
      );
      const bottom = Math.min(
        height - 18,
        Math.max(...groupPositions.map((position) => position.y + nodeHeight)) + 42
      );
      return {
        count: group.entities.length,
        height: bottom - top,
        type: group.type,
        width: right - left,
        x: left,
        y: top
      };
    });

    return {
      gapX,
      grouped,
      height,
      layout: "network" as const,
      networkClusters,
      nodeHeight,
      nodeWidth,
      orbitCenter: null,
      orbitRings: [],
      positions,
      width
    };
  }, [
    displayedEntities,
    displayedRelations,
    directStrengthByEntity,
    focusedEntityId,
    orbitDepth,
    relationCountByEntity,
    relationDegreeByEntity,
    viewMode
  ]);

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return entities
      .filter((entity) =>
        [entity.title, entity.summary, typeMeta[entity.type].label]
          .join(" ")
          .toLocaleLowerCase("zh-CN")
          .includes(normalizedQuery)
      )
      .sort(
        (left, right) =>
          Number(right.title.toLocaleLowerCase("zh-CN").startsWith(normalizedQuery)) -
            Number(left.title.toLocaleLowerCase("zh-CN").startsWith(normalizedQuery)) ||
          (relationCountByEntity.get(right.id) ?? 0) -
            (relationCountByEntity.get(left.id) ?? 0)
      )
      .slice(0, 8);
  }, [entities, normalizedQuery, relationCountByEntity]);
  const searchMatchIds = useMemo(
    () => new Set(searchResults.map((entity) => entity.id)),
    [searchResults]
  );
  const relationKinds = useMemo(
    () => Array.from(new Set(relations.map((relation) => relation.kind))),
    [relations]
  );

  const centerEntity = useCallback((entityId: string, behavior: ScrollBehavior = "smooth") => {
    const scroll = scrollRef.current;
    if (!scroll || !entityId) return;
    const node = Array.from(
      scroll.querySelectorAll<HTMLElement>("[data-relation-entity-id]")
    ).find((candidate) => candidate.dataset.relationEntityId === entityId);
    if (!node) return;
    const scrollBounds = scroll.getBoundingClientRect();
    const nodeBounds = node.getBoundingClientRect();
    scroll.scrollTo({
      behavior,
      left:
        scroll.scrollLeft +
        nodeBounds.left -
        scrollBounds.left +
        nodeBounds.width / 2 -
        scroll.clientWidth / 2,
      top:
        scroll.scrollTop +
        nodeBounds.top -
        scrollBounds.top +
        nodeBounds.height / 2 -
        scroll.clientHeight / 2
    });
  }, []);

  const fitToView = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const scroll = scrollRef.current;
      if (!scroll || !graph.width || !graph.height) return;
      const horizontalFit = Math.max(0, scroll.clientWidth - 52) / graph.width;
      const verticalFit = Math.max(0, scroll.clientHeight - 52) / graph.height;
      const minimumFitZoom = graph.layout === "network" ? NETWORK_MIN_ZOOM : MIN_ZOOM;
      const nextZoom = Math.max(
        minimumFitZoom,
        clampZoom(Math.floor(Math.min(horizontalFit, verticalFit, 1.4) * 20) / 20)
      );
      setZoom(nextZoom);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scroll.scrollTo({
            behavior,
            left: Math.max(0, (graph.width * nextZoom - scroll.clientWidth) / 2),
            top: Math.max(0, (graph.height * nextZoom - scroll.clientHeight) / 2)
          });
        });
      });
    },
    [graph.height, graph.layout, graph.width]
  );

  useEffect(() => {
    setAtlasRelationLimit(DEFAULT_ATLAS_RELATION_LIMIT);
  }, [focusedEntityId]);

  useEffect(() => {
    const shouldFitInitially = !initialFitRef.current;
    const viewModeChanged = previousViewModeRef.current !== viewMode;
    const orbitDepthChanged =
      viewMode === "focus" && previousOrbitDepthRef.current !== orbitDepth;
    initialFitRef.current = true;
    previousOrbitDepthRef.current = orbitDepth;
    previousViewModeRef.current = viewMode;
    if (!shouldFitInitially && !viewModeChanged && !orbitDepthChanged) return;
    const frame = requestAnimationFrame(() =>
      fitToView(shouldFitInitially ? "auto" : "smooth")
    );
    return () => cancelAnimationFrame(frame);
  }, [fitToView, orbitDepth, viewMode]);

  useEffect(() => {
    const entityId = pendingCenterEntityIdRef.current;
    if (!entityId || !graph.positions.has(entityId)) return;
    const frame = requestAnimationFrame(() => {
      centerEntity(entityId);
      pendingCenterEntityIdRef.current = "";
    });
    return () => cancelAnimationFrame(frame);
  }, [centerEntity, graph]);

  function changeZoom(direction: -1 | 1) {
    const minimum = graph.layout === "network" ? NETWORK_MIN_ZOOM : MIN_ZOOM;
    setZoom((current) => clampZoom(current + direction * 0.1, minimum));
  }

  function chooseEntity(entityId: string) {
    pendingCenterEntityIdRef.current = entityId;
    onSelectEntity(entityId);
  }

  function chooseSearchResult(entityId: string) {
    setQuery("");
    setSearchOpen(false);
    chooseEntity(entityId);
  }

  function toggleRelationKind(kind: string) {
    setHiddenKinds((current) => {
      const next = new Set(current);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  function handleSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setQuery("");
      setSearchOpen(false);
      return;
    }
    if (event.key === "Enter" && searchResults[0]) {
      event.preventDefault();
      chooseSearchResult(searchResults[0].id);
    }
  }

  function handleCanvasKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.currentTarget !== event.target) return;
    const scroll = scrollRef.current;
    if (!scroll) return;
    const distance = event.shiftKey ? 180 : 64;
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      changeZoom(1);
    } else if (event.key === "-") {
      event.preventDefault();
      changeZoom(-1);
    } else if (event.key === "0") {
      event.preventDefault();
      fitToView();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scroll.scrollBy({ behavior: "smooth", left: -distance });
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scroll.scrollBy({ behavior: "smooth", left: distance });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      scroll.scrollBy({ behavior: "smooth", top: -distance });
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      scroll.scrollBy({ behavior: "smooth", top: distance });
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest("[data-relation-interactive]")) return;
    panRef.current = {
      pointerId: event.pointerId,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
      startX: event.clientX,
      startY: event.clientY
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    event.currentTarget.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
    event.currentTarget.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
  }

  function stopPanning(event: ReactPointerEvent<HTMLDivElement>) {
    if (panRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    panRef.current = null;
    setIsPanning(false);
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const minimum = graph.layout === "network" ? NETWORK_MIN_ZOOM : MIN_ZOOM;
    setZoom((current) =>
      clampZoom(current + (event.deltaY < 0 ? 0.1 : -0.1), minimum)
    );
  }

  if (!entities.length) {
    return (
      <div className="relation-graph-empty">
        <strong>当前筛选没有可显示的条目</strong>
        <span>切换类型筛选，或先创建角色、组织和地点。</span>
      </div>
    );
  }

  const scaledWidth = Math.round(graph.width * zoom);
  const scaledHeight = Math.round(graph.height * zoom);

  return (
    <div className="relation-graph-shell">
      <div className="relation-graph-toolbar" role="toolbar" aria-label="关系图工具栏">
        <div className="relation-graph-search">
          <Search aria-hidden="true" size={16} />
          <input
            aria-label="搜索图中条目"
            autoComplete="off"
            placeholder="搜索图中条目"
            value={query}
            onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
          />
          {query ? (
            <button
              aria-label="清空图中搜索"
              data-relation-interactive="true"
              title="清空搜索"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setQuery("");
                setSearchOpen(false);
              }}
            >
              <X size={14} />
            </button>
          ) : null}
          {searchOpen && normalizedQuery ? (
            <div className="relation-graph-search-results" role="listbox">
              {searchResults.length ? (
                searchResults.map((entity) => {
                  const Icon = typeMeta[entity.type].icon;
                  return (
                    <button
                      data-relation-interactive="true"
                      key={entity.id}
                      role="option"
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => chooseSearchResult(entity.id)}
                    >
                      <Icon size={15} />
                      <span>
                        <strong>{entity.title}</strong>
                        <small>
                          {typeMeta[entity.type].label} · {relationCountByEntity.get(entity.id) ?? 0} 条关系
                        </small>
                      </span>
                    </button>
                  );
                })
              ) : (
                <span className="relation-graph-no-result">没有匹配条目</span>
              )}
            </div>
          ) : null}
        </div>

        <div className="relation-view-toggle" role="group" aria-label="关系图视图">
          <button
            aria-pressed={viewMode === "all"}
            className={viewMode === "all" ? "is-active" : ""}
            data-relation-interactive="true"
            title="按类型查阅结构化关系记录"
            type="button"
            onClick={() => setViewMode("all")}
          >
            <ListTree size={14} />
            <span>关系册</span>
          </button>
          <button
            aria-pressed={viewMode === "focus"}
            className={viewMode === "focus" ? "is-active" : ""}
            data-relation-interactive="true"
            disabled={!focusedEntityId}
            title="围绕当前条目查看关系星图"
            type="button"
            onClick={() => setViewMode("focus")}
          >
            <Orbit size={14} />
            <span>星图</span>
          </button>
          <button
            aria-pressed={viewMode === "network"}
            className={viewMode === "network" ? "is-active" : ""}
            data-relation-interactive="true"
            title="查看整个世界的关系拓扑"
            type="button"
            onClick={() => setViewMode("network")}
          >
            <Network size={14} />
            <span>全关系图谱</span>
          </button>
        </div>

        {viewMode === "all" ? (
          <label className="relation-graph-scope" title="控制关系册中显示的范围">
            <Layers3 size={14} />
            <select
              aria-label="关系册范围"
              value={laneScope}
              onChange={(event) => {
                setAtlasRelationLimit(DEFAULT_ATLAS_RELATION_LIMIT);
                setLaneScope(event.target.value as RelationLaneScope);
              }}
            >
              <option value="direct">当前直接关联</option>
              <option value="context">二度上下文</option>
              <option value="all">全部网络</option>
            </select>
          </label>
        ) : viewMode === "focus" ? (
          <label className="relation-graph-scope" title="星图关系范围">
            <Layers3 size={14} />
            <select
              aria-label="星图关系范围"
              value={orbitDepth}
              onChange={(event) => setOrbitDepth(Number(event.target.value) as 1 | 2 | 3)}
            >
              <option value="1">仅直接关系</option>
              <option value="2">展开二度</option>
              <option value="3">展开三度</option>
            </select>
          </label>
        ) : (
          <label className="relation-graph-scope" title="控制全关系图谱的关系密度">
            <Layers3 size={14} />
            <select
              aria-label="全关系图谱强度"
              value={networkMinStrength}
              onChange={(event) =>
                setNetworkMinStrength(Number(event.target.value) as 1 | 2 | 3 | 4)
              }
            >
              <option value="1">全部强度</option>
              <option value="2">强度 2 以上</option>
              <option value="3">强度 3 以上</option>
              <option value="4">仅强关系</option>
            </select>
          </label>
        )}

        {viewMode !== "all" ? (
          <div className="relation-graph-controls" role="group" aria-label="关系图视图控制">
            {viewMode === "focus" ? (
              <button
                aria-label={orbitMotion ? "暂停星体运行" : "继续星体运行"}
                aria-pressed={orbitMotion}
                className={orbitMotion ? "is-active" : ""}
                data-relation-interactive="true"
                title={orbitMotion ? "暂停星体运行" : "继续星体运行"}
                type="button"
                onClick={() => setOrbitMotion((current) => !current)}
              >
                {orbitMotion ? <Pause size={15} /> : <Play size={15} />}
              </button>
            ) : null}
            <button
            aria-label={showLabels ? "隐藏关系标签" : "显示关系标签"}
            aria-pressed={showLabels}
            className={showLabels ? "is-active" : ""}
            data-relation-interactive="true"
            title={showLabels ? "隐藏关系标签" : "显示关系标签"}
            type="button"
            onClick={() => setShowLabels((current) => !current)}
          >
            <Tags size={16} />
            </button>
            <span className="relation-control-divider" />
            <button
            aria-label="缩小关系图"
            data-relation-interactive="true"
            disabled={zoom <= (viewMode === "network" ? NETWORK_MIN_ZOOM : MIN_ZOOM)}
            title="缩小关系图"
            type="button"
            onClick={() => changeZoom(-1)}
          >
            <ZoomOut size={16} />
            </button>
            <output className="relation-graph-zoom-value">{Math.round(zoom * 100)}%</output>
            <button
            aria-label="放大关系图"
            data-relation-interactive="true"
            disabled={zoom >= MAX_ZOOM}
            title="放大关系图"
            type="button"
            onClick={() => changeZoom(1)}
          >
            <ZoomIn size={16} />
            </button>
            <button
            aria-label="适配全部内容"
            data-relation-interactive="true"
            title="适配全部内容"
            type="button"
            onClick={() => fitToView()}
          >
            <Maximize2 size={15} />
            </button>
            <button
            aria-label="定位当前条目"
            data-relation-interactive="true"
            disabled={!focusedEntityId}
            title="定位当前条目"
            type="button"
            onClick={() => centerEntity(focusedEntityId)}
          >
            <LocateFixed size={16} />
            </button>
          </div>
        ) : null}
      </div>

      {viewMode === "all" ? (
        <RelationAtlas
          entities={entities}
          focusedEntityId={focusedEntityId}
          normalizedQuery={normalizedQuery}
          relations={atlasDisplayedRelations}
          scopedCountByKind={atlasScopedCountByKind}
          scopedRelations={atlasScopedRelations}
          selectedRelationId={selectedRelationId}
          onOpenEntity={onOpenEntity}
          onSelectEntity={chooseEntity}
          onSelectRelation={onSelectRelation}
        />
      ) : (
        <div
          aria-label="世界关系画布"
          className={`relation-graph-scroll ${
            viewMode === "focus" ? "is-orbit-view" : "is-network-view"
          } ${isPanning ? "is-panning" : ""}`}
          ref={scrollRef}
          tabIndex={0}
          onKeyDown={handleCanvasKeyDown}
          onPointerCancel={stopPanning}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopPanning}
          onWheel={handleWheel}
        >
        <div
          className="relation-graph-stage"
          style={{ minHeight: Math.max(340, scaledHeight), minWidth: scaledWidth }}
        >
          <div
            className="relation-graph-scaled-canvas"
            style={{ height: scaledHeight, width: scaledWidth }}
          >
            <div
              className={`relation-graph-canvas layout-${graph.layout}`}
              style={{
                height: graph.height,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                width: graph.width
              }}
            >
              {graph.layout === "network"
                ? graph.networkClusters.map((cluster) => {
                    const Icon = typeMeta[cluster.type].icon;
                    return (
                      <div
                        aria-hidden="true"
                        className={`relation-network-cluster type-${cluster.type}`}
                        key={cluster.type}
                        style={{
                          height: cluster.height,
                          left: cluster.x,
                          top: cluster.y,
                          width: cluster.width
                        }}
                      >
                        <span className="relation-network-cluster-label">
                          <Icon size={14} />
                          <strong>{typeMeta[cluster.type].label}</strong>
                          <small>{cluster.count}</small>
                        </span>
                      </div>
                    );
                  })
                : graph.orbitRings.map((ring) => (
                    <div
                      aria-hidden="true"
                      className={`relation-orbit-ring ${
                        ring.strength ? `strength-${ring.strength}` : "is-indirect"
                      }`}
                      key={ring.index}
                      style={{
                        height: ring.height,
                        left: ring.x,
                        top: ring.y,
                        width: ring.width
                      }}
                    >
                      <span>{ring.label}</span>
                    </div>
                  ))}

              <div
                className={`relation-graph-system ${
                  graph.layout === "orbit" && orbitMotion ? "is-orbiting" : ""
                }`}
              >
                <svg
                aria-label="条目关系连线"
                className="relation-graph-lines"
                height={graph.height}
                viewBox={`0 0 ${graph.width} ${graph.height}`}
                width={graph.width}
              >
                <defs>
                  {Object.entries(relationColors).map(([kind, color]) => (
                    <marker
                      id={`${markerPrefix}-${kind}`}
                      key={kind}
                      markerHeight="10"
                      markerUnits="userSpaceOnUse"
                      markerWidth="10"
                      orient="auto-start-reverse"
                      refX="9"
                      refY="5"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
                    </marker>
                  ))}
                </defs>

                {displayedRelations.map((relation) => {
                  const source = graph.positions.get(relation.sourceEntityId);
                  const target = graph.positions.get(relation.targetEntityId);
                  if (!source || !target) return null;

                  let startX: number;
                  let startY: number;
                  let endX: number;
                  let endY: number;
                  let curve: string;
                  let labelX: number;
                  let labelY: number;
                  if (graph.layout === "orbit") {
                    const sourceCenterX = source.x + graph.nodeWidth / 2;
                    const sourceCenterY = source.y + graph.nodeHeight / 2;
                    const targetCenterX = target.x + graph.nodeWidth / 2;
                    const targetCenterY = target.y + graph.nodeHeight / 2;
                    const deltaX = targetCenterX - sourceCenterX;
                    const deltaY = targetCenterY - sourceCenterY;
                    const distance = Math.max(1, Math.hypot(deltaX, deltaY));
                    const edgeScale = graph.nodeWidth / 2 / distance;
                    startX = sourceCenterX + deltaX * edgeScale;
                    startY = sourceCenterY + deltaY * edgeScale;
                    endX = targetCenterX - deltaX * edgeScale;
                    endY = targetCenterY - deltaY * edgeScale;
                    const bendDirection =
                      Array.from(relation.id).reduce(
                        (total, character) => total + character.charCodeAt(0),
                        0
                      ) % 2
                        ? 1
                        : -1;
                    const bend = Math.min(32, distance * 0.08) * bendDirection;
                    const controlX =
                      (startX + endX) / 2 + (-deltaY / distance) * bend;
                    const controlY =
                      (startY + endY) / 2 + (deltaX / distance) * bend;
                    curve = `M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`;
                    labelX = startX * 0.25 + controlX * 0.5 + endX * 0.25;
                    labelY = startY * 0.25 + controlY * 0.5 + endY * 0.25 - 7;
                  } else {
                    const sourceCenterX = source.x + graph.nodeWidth / 2;
                    const sourceCenterY = source.y + graph.nodeHeight / 2;
                    const targetCenterX = target.x + graph.nodeWidth / 2;
                    const targetCenterY = target.y + graph.nodeHeight / 2;
                    const deltaX = targetCenterX - sourceCenterX;
                    const deltaY = targetCenterY - sourceCenterY;
                    const distance = Math.max(1, Math.hypot(deltaX, deltaY));
                    const boundaryScale = Math.min(
                      graph.nodeWidth / 2 / Math.max(1, Math.abs(deltaX)),
                      graph.nodeHeight / 2 / Math.max(1, Math.abs(deltaY))
                    );
                    startX = sourceCenterX + deltaX * boundaryScale;
                    startY = sourceCenterY + deltaY * boundaryScale;
                    endX = targetCenterX - deltaX * boundaryScale;
                    endY = targetCenterY - deltaY * boundaryScale;
                    const bendSeed = stableHash(relation.id) % 5;
                    const bend = (bendSeed - 2) * Math.min(18, distance * 0.05);
                    const controlX =
                      (startX + endX) / 2 + (-deltaY / distance) * bend;
                    const controlY =
                      (startY + endY) / 2 + (deltaX / distance) * bend;
                    curve = `M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}`;
                    labelX = startX * 0.25 + controlX * 0.5 + endX * 0.25;
                    labelY = startY * 0.25 + controlY * 0.5 + endY * 0.25 - 7;
                  }
                  const color = relationColors[relation.kind] ?? relationColors.custom;
                  const selected = relation.id === selectedRelationId;
                  const directlyConnectedToFocus =
                    !focusedEntityId ||
                    relation.sourceEntityId === focusedEntityId ||
                    relation.targetEntityId === focusedEntityId;
                  const connectedToFocus =
                    graph.layout === "orbit" || directlyConnectedToFocus;
                  const connectedToSearch =
                    !normalizedQuery ||
                    searchMatchIds.has(relation.sourceEntityId) ||
                    searchMatchIds.has(relation.targetEntityId);
                  const visibleLabel =
                    relation.label.length > 12
                      ? `${relation.label.slice(0, 11)}…`
                      : relation.label;
                  const labelWidth = Math.max(42, Math.min(154, visibleLabel.length * 12 + 14));
                  const shouldShowLabel =
                    showLabels &&
                    (directlyConnectedToFocus || selected) &&
                    (relation.label !== "正文提及" || selected);

                  return (
                    <g
                      className={`relation-edge ${selected ? "is-selected" : ""} ${
                        connectedToFocus ? "" : "is-dimmed"
                      } ${connectedToSearch ? "" : "is-search-muted"}`}
                      data-relation-interactive="true"
                      key={relation.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectRelation(relation.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onSelectRelation(relation.id);
                        }
                      }}
                    >
                      <title>{relation.label}</title>
                      <path className="relation-edge-hit" d={curve} />
                      <path
                        className="relation-edge-line"
                        d={curve}
                        markerStart={
                          relation.direction === "mutual"
                            ? `url(#${markerPrefix}-${
                                relation.kind in relationColors ? relation.kind : "custom"
                              })`
                            : undefined
                        }
                        markerEnd={
                          relation.direction === "directed" || relation.direction === "mutual"
                            ? `url(#${markerPrefix}-${
                                relation.kind in relationColors ? relation.kind : "custom"
                              })`
                            : undefined
                        }
                        style={{
                          opacity: relation.label === "正文提及" && !selected ? 0.58 : 1,
                          strokeDasharray:
                            relation.label === "正文提及" && !selected ? "5 5" : undefined,
                          stroke: color,
                          strokeWidth: selected
                            ? Math.max(4, relation.strength)
                            : Math.max(2, relation.strength - 1)
                        }}
                      />
                      {shouldShowLabel ? (
                        <>
                          <rect
                            className="relation-edge-label-bg"
                            height="22"
                            rx="4"
                            style={{ stroke: color }}
                            width={labelWidth}
                            x={labelX - labelWidth / 2}
                            y={labelY - 15}
                          />
                          <text
                            className="relation-edge-label"
                            style={{ fill: color }}
                            textAnchor="middle"
                            x={labelX}
                            y={labelY}
                          >
                            {visibleLabel}
                          </text>
                        </>
                      ) : null}
                    </g>
                  );
                })}
                </svg>

                {displayedEntities.map((entity) => {
                const position = graph.positions.get(entity.id);
                if (!position) return null;
                const Icon = typeMeta[entity.type].icon;
                const connectedToFocus =
                  graph.layout === "orbit" ||
                  !focusedEntityId ||
                  entity.id === focusedEntityId ||
                  displayedNeighborIds.has(entity.id);
                const matchesSearch = !normalizedQuery || searchMatchIds.has(entity.id);
                const isFocusCore =
                  graph.layout === "orbit" && entity.id === focusedEntityId;
                const orbitStrength = directStrengthByEntity.get(entity.id) ?? null;
                const orbitDegree = relationDegreeByEntity.get(entity.id) ?? 0;
                return (
                  <button
                    className={`relation-graph-node type-${entity.type} ${
                      entity.id === focusedEntityId ? "is-focused" : ""
                    } ${connectedToFocus ? "" : "is-dimmed"} ${
                      matchesSearch ? "" : "is-search-muted"
                    } ${isFocusCore ? "is-focus-core" : ""} ${
                      orbitStrength ? `orbit-strength-${orbitStrength}` : ""
                    } ${
                      (relationCountByEntity.get(entity.id) ?? 0) > 0
                        ? "has-relations"
                        : ""
                    }`}
                    data-relation-entity-id={entity.id}
                    data-relation-interactive="true"
                    key={entity.id}
                    style={{
                      height: graph.nodeHeight,
                      left: position.x,
                      top: position.y,
                      width: graph.nodeWidth
                    }}
                    title={`${entity.title}${entity.summary ? `：${entity.summary}` : ""}${
                      onOpenEntity ? "（双击打开条目）" : ""
                    }`}
                    type="button"
                    onClick={() => chooseEntity(entity.id)}
                    onDoubleClick={() => onOpenEntity?.(entity.id)}
                  >
                    <span className="relation-node-face">
                      <span className="relation-node-icon">
                        <Icon size={17} />
                      </span>
                      <span className="relation-node-type">{typeMeta[entity.type].label}</span>
                      <span className="relation-node-copy">
                        <strong>{entity.title}</strong>
                        <small>
                          {isFocusCore
                            ? `核心 · ${relationCountByEntity.get(entity.id) ?? 0} 条关系`
                            : graph.layout === "orbit"
                              ? orbitStrength
                                ? strengthRingLabels[orbitStrength] ?? `强度 ${orbitStrength}`
                                : `${orbitDegree} 度间接`
                              : `${relationCountByEntity.get(entity.id) ?? 0} 条关系`}
                        </small>
                      </span>
                    </span>
                  </button>
                );
                })}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      <footer className="relation-graph-footer">
        <div className="relation-graph-legend" aria-label="关系类型图例">
          {relationKinds.map((kind) => {
            const active = !hiddenKinds.has(kind);
            return (
              <button
                aria-pressed={active}
                className={active ? "is-active" : ""}
                data-relation-interactive="true"
                key={kind}
                title={`${active ? "隐藏" : "显示"}${relationKindLabels[kind] ?? kind}`}
                type="button"
                onClick={() => toggleRelationKind(kind)}
              >
                <span style={{ backgroundColor: relationColors[kind] ?? relationColors.custom }} />
                {relationKindLabels[kind] ?? kind}
              </button>
            );
          })}
        </div>
        <div className="relation-graph-summary">
          {viewMode === "all" && atlasRelationLimit > DEFAULT_ATLAS_RELATION_LIMIT ? (
            <button
              aria-label="收起关系册记录"
              data-relation-interactive="true"
              title={`恢复为每种关系最多 ${DEFAULT_ATLAS_RELATION_LIMIT} 条`}
              type="button"
              onClick={() => setAtlasRelationLimit(DEFAULT_ATLAS_RELATION_LIMIT)}
            >
              <ChevronsUp size={13} />
              收起
            </button>
          ) : null}
          {viewMode === "all" && hiddenAtlasRelationCount > 0 ? (
            <button
              aria-label="显示更多关系册记录"
              data-relation-interactive="true"
              title={`每种关系再显示 ${DEFAULT_ATLAS_RELATION_LIMIT} 条`}
              type="button"
              onClick={() =>
                setAtlasRelationLimit((current) => current + DEFAULT_ATLAS_RELATION_LIMIT)
              }
            >
              <ChevronsDown size={13} />
              更多 {hiddenAtlasRelationCount}
            </button>
          ) : null}
          <span className="relation-graph-count">
            {viewMode === "focus" && focusedEntity
              ? `核心：${focusedEntity.title} · ${orbitDepth === 1 ? "直接关系" : `展开 ${orbitDepth} 度`} · `
              : viewMode === "all" && focusedEntity
                ? `核心：${focusedEntity.title} · ${laneScopeLabels[laneScope]} · `
                : viewMode === "network"
                  ? `全局网络 · ${networkMinStrength === 1 ? "全部强度" : `强度 ${networkMinStrength} 以上`} · `
                  : ""}
            {viewMode === "all" ? (
              <>
                {atlasDisplayedEntityCount} 个条目 · {atlasDisplayedRelations.length}
                {hiddenAtlasRelationCount > 0 ? `/${atlasScopedRelations.length}` : ""} 条关系
              </>
            ) : (
              <>
                {displayedEntities.length} 个条目 · {displayedRelations.length} 条关系
              </>
            )}
          </span>
        </div>
      </footer>
    </div>
  );
}
