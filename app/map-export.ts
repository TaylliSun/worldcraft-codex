import {
  calculateMapGrid,
  calculateMapRegionMetrics,
  getMapRoutePathPoints,
  resolveMapLabelVisibility,
  sampleMapRoutePath,
  type MapLayer,
  type MapMarker,
  type MapRegion,
  type MapRoute,
  type WorldMap
} from "./world-planning";

export type MapExportFormat = "png" | "webp";
export type MapExportScope = "map" | "selection" | "viewport";

export type MapExportBounds = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

export type MapExportOptions = {
  format: MapExportFormat;
  includeBaseMap: boolean;
  includeGrid: boolean;
  includeLabels: boolean;
  includeLayers: boolean;
  includeMarkers: boolean;
  includeRegions: boolean;
  includeRoutes: boolean;
  scale: 1 | 2 | 4;
  scope: MapExportScope;
  transparent: boolean;
};

export type MapExportInput = {
  bounds?: MapExportBounds;
  layers: MapLayer[];
  map: WorldMap;
  markers: MapMarker[];
  options: MapExportOptions;
  regions: MapRegion[];
  routes: MapRoute[];
};

export const defaultMapExportOptions: MapExportOptions = {
  format: "png",
  includeBaseMap: true,
  includeGrid: true,
  includeLabels: true,
  includeLayers: true,
  includeMarkers: true,
  includeRegions: true,
  includeRoutes: true,
  scale: 2,
  scope: "map",
  transparent: false
};

const MAX_EXPORT_EDGE = 8192;
const MAX_EXPORT_PIXELS = 48_000_000;
const MAX_MERGED_LAYER_EDGE = 4096;
const MAX_MERGED_LAYER_PIXELS = 24_000_000;

export function calculateMapExportDimensions(
  map: Pick<WorldMap, "height" | "width">,
  requestedScale: number,
  requestedBounds?: MapExportBounds
) {
  const bounds = normalizeMapExportBounds(requestedBounds);
  const normalizedScale = Math.max(1, Math.min(4, requestedScale));
  const sourceWidth = Math.max(1, (map.width * (bounds.right - bounds.left)) / 100);
  const sourceHeight = Math.max(1, (map.height * (bounds.bottom - bounds.top)) / 100);
  const edgeScale = Math.min(
    1,
    MAX_EXPORT_EDGE / Math.max(sourceWidth * normalizedScale, sourceHeight * normalizedScale)
  );
  const pixelScale = Math.min(
    1,
    Math.sqrt(MAX_EXPORT_PIXELS / Math.max(1, sourceWidth * sourceHeight * normalizedScale ** 2))
  );
  const actualScale = normalizedScale * Math.min(edgeScale, pixelScale);
  return {
    actualScale,
    bounds,
    height: Math.max(1, Math.round(sourceHeight * actualScale)),
    limited: actualScale < normalizedScale - 0.001,
    width: Math.max(1, Math.round(sourceWidth * actualScale))
  };
}

export function normalizeMapExportBounds(bounds?: MapExportBounds): MapExportBounds {
  if (!bounds) return { bottom: 100, left: 0, right: 100, top: 0 };
  const horizontal = [Number(bounds.left), Number(bounds.right)]
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
  const vertical = [Number(bounds.top), Number(bounds.bottom)]
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
  const left = horizontal[0] ?? 0;
  const top = vertical[0] ?? 0;
  return {
    bottom: Math.max(top + 0.01, vertical[1] ?? 100),
    left,
    right: Math.max(left + 0.01, horizontal[1] ?? 100),
    top
  };
}

type LoadedMapImage = {
  close: () => void;
  height: number;
  source: CanvasImageSource;
  width: number;
};

async function loadBitmap(url: string): Promise<LoadedMapImage> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image request failed (${response.status}).`);
  const blob = await response.blob();
  try {
    const bitmap = await createImageBitmap(blob);
    return {
      close: () => bitmap.close(),
      height: bitmap.height,
      source: bitmap,
      width: bitmap.width
    };
  } catch {
    const objectUrl = URL.createObjectURL(blob);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const candidate = new Image();
        candidate.onerror = () => reject(new Error("Image decode failed."));
        candidate.onload = () => resolve(candidate);
        candidate.src = objectUrl;
      });
      return {
        close: () => URL.revokeObjectURL(objectUrl),
        height: Math.max(1, image.naturalHeight),
        source: image,
        width: Math.max(1, image.naturalWidth)
      };
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      throw error;
    }
  }
}

function drawContainedImage(
  context: CanvasRenderingContext2D,
  image: LoadedMapImage,
  width: number,
  height: number,
  transform: WorldMap["imageTransform"],
  opacity = 1,
  blendMode: GlobalCompositeOperation = "source-over"
) {
  const fit = Math.min(width / image.width, height / image.height);
  const renderedWidth = image.width * fit;
  const renderedHeight = image.height * fit;
  context.save();
  context.globalAlpha = opacity;
  context.globalCompositeOperation = blendMode;
  context.translate(
    width * (0.5 + transform.x / 100),
    height * (0.5 + transform.y / 100)
  );
  context.rotate((transform.rotation * Math.PI) / 180);
  context.scale(
    transform.scale * (transform.flipX ? -1 : 1),
    transform.scale * (transform.flipY ? -1 : 1)
  );
  context.drawImage(
    image.source,
    -renderedWidth / 2,
    -renderedHeight / 2,
    renderedWidth,
    renderedHeight
  );
  context.restore();
}

export async function renderMergedMapLayerImage(
  map: Pick<WorldMap, "height" | "width">,
  layers: MapLayer[]
) {
  const renderableLayers = layers.filter((layer) => layer.imageUrl);
  if (!renderableLayers.length) return null;

  const loaded: Array<{ image: LoadedMapImage; layer: MapLayer }> = [];
  try {
    for (const layer of renderableLayers) {
      loaded.push({ image: await loadBitmap(layer.imageUrl), layer });
    }

    const mapEdge = Math.max(1, map.width, map.height);
    const sourceEdge = Math.max(
      mapEdge,
      ...loaded.map(({ image }) => Math.max(image.width, image.height))
    );
    const requestedScale = Math.min(MAX_MERGED_LAYER_EDGE, sourceEdge) / mapEdge;
    const pixelScale = Math.sqrt(
      MAX_MERGED_LAYER_PIXELS / Math.max(1, map.width * map.height)
    );
    const scale = Math.min(requestedScale, pixelScale);
    const width = Math.max(1, Math.round(map.width * scale));
    const height = Math.max(1, Math.round(map.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("无法创建图层合并画布。");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    loaded.forEach(({ image, layer }) => drawContainedImage(
      context,
      image,
      width,
      height,
      layer.imageTransform,
      layer.imageOpacity,
      layer.imageBlendMode === "normal" ? "source-over" : layer.imageBlendMode
    ));

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error("图层合并图像编码失败。")),
        "image/webp",
        0.96
      );
    });
    return { blob, height, width };
  } finally {
    loaded.forEach(({ image }) => image.close());
  }
}

function drawGeneratedMap(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = "#dce9e2";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#edf0dc";
  context.beginPath();
  context.ellipse(width * 0.42, height * 0.43, width * 0.34, height * 0.3, -0.2, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#c7e0e8";
  context.beginPath();
  context.ellipse(width * 0.84, height * 0.72, width * 0.27, height * 0.31, 0.35, 0, Math.PI * 2);
  context.fill();
}

function drawGrid(
  context: CanvasRenderingContext2D,
  map: WorldMap,
  width: number,
  height: number,
  scale: number
) {
  if (!map.grid.visible) return;
  const grid = calculateMapGrid(map);
  context.save();
  context.globalAlpha = map.grid.opacity;
  context.strokeStyle = map.grid.color;
  context.lineWidth = Math.max(1, scale);
  for (let column = 1; column < grid.columns; column += 1) {
    const x = (column / grid.columns) * width;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let row = 1; row < grid.rows; row += 1) {
    const y = (row / grid.rows) * height;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.restore();
}

function traceRegion(
  context: CanvasRenderingContext2D,
  region: MapRegion,
  width: number,
  height: number
) {
  const traceRing = (points: MapRegion["points"]) => {
    points.forEach((point, index) => {
      const x = (point.x / 100) * width;
      const y = (point.y / 100) * height;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
  };
  traceRing(region.points);
  region.holes.forEach(traceRing);
}

function drawRegions(
  context: CanvasRenderingContext2D,
  regions: MapRegion[],
  width: number,
  height: number,
  scale: number
) {
  regions.filter((region) => region.points.length >= 3).forEach((region) => {
    context.save();
    context.beginPath();
    traceRegion(context, region, width, height);
    context.globalAlpha = region.opacity;
    context.fillStyle = region.color;
    context.fill("evenodd");
    context.globalAlpha = 0.92;
    context.lineJoin = "round";
    context.lineWidth = Math.max(1.5, 2 * scale);
    context.strokeStyle = region.color;
    context.stroke();
    context.restore();
  });
}

function drawRoutes(
  context: CanvasRenderingContext2D,
  routes: MapRoute[],
  markerMap: Map<string, MapMarker>,
  width: number,
  height: number,
  scale: number
) {
  routes.forEach((route) => {
    const points = sampleMapRoutePath(
      getMapRoutePathPoints(route, Array.from(markerMap.values())),
      route.curveMode,
      14
    );
    if (points.length < 2) return;
    context.save();
    context.beginPath();
    points.forEach((point, index) => {
      const x = (point.x / 100) * width;
      const y = (point.y / 100) * height;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = Math.max(2, 4 * scale);
    context.strokeStyle = "rgba(255, 255, 255, 0.82)";
    context.stroke();
    context.lineWidth = Math.max(1.25, 2 * scale);
    context.strokeStyle = route.color;
    context.stroke();
    context.restore();
  });
}

function drawMarker(
  context: CanvasRenderingContext2D,
  marker: MapMarker,
  width: number,
  height: number,
  scale: number,
  icon?: LoadedMapImage
) {
  const x = (marker.x / 100) * width;
  const y = (marker.y / 100) * height;
  const radius = 11 * scale;
  context.save();
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = marker.color;
  context.fill();
  if (icon) {
    context.save();
    context.beginPath();
    context.arc(x, y, Math.max(1, radius - 2 * scale), 0, Math.PI * 2);
    context.clip();
    const sourceSize = Math.min(icon.width, icon.height);
    context.drawImage(
      icon.source,
      (icon.width - sourceSize) / 2,
      (icon.height - sourceSize) / 2,
      sourceSize,
      sourceSize,
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );
    context.restore();
  }
  context.lineWidth = Math.max(1.5, 2 * scale);
  context.strokeStyle = "rgba(255, 255, 255, 0.94)";
  context.stroke();
  if (!icon) {
    context.beginPath();
    context.arc(x, y, Math.max(2, 3 * scale), 0, Math.PI * 2);
    context.fillStyle = "rgba(255, 255, 255, 0.94)";
    context.fill();
  }
  context.restore();
}

function drawLabel(
  context: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  scale: number,
  color: string,
  kind: "marker" | "region"
) {
  const fontSize = (kind === "marker" ? 12 : 11) * scale;
  const horizontalPadding = 8 * scale;
  const height = (kind === "marker" ? 26 : 24) * scale;
  context.save();
  context.font = `700 ${fontSize}px system-ui, sans-serif`;
  const maximum = (kind === "marker" ? 164 : 148) * scale;
  const textWidth = Math.min(context.measureText(label).width, maximum);
  const width = textWidth + horizontalPadding * 2;
  const left = x - width / 2;
  const top = y - height / 2;
  context.fillStyle = "rgba(253, 254, 253, 0.94)";
  context.strokeStyle = color;
  context.lineWidth = Math.max(1, 1.5 * scale);
  context.beginPath();
  context.roundRect(left, top, width, height, 5 * scale);
  context.fill();
  context.stroke();
  context.beginPath();
  context.rect(left + horizontalPadding, top, textWidth, height);
  context.clip();
  context.fillStyle = "#24342d";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, x, y, maximum);
  context.restore();
}

export async function renderMapExport(input: MapExportInput) {
  const dimensions = calculateMapExportDimensions(
    input.map,
    input.options.scale,
    input.bounds
  );
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("无法创建地图导出画布。");
  const scale = dimensions.actualScale;
  const fullWidth = input.map.width * scale;
  const fullHeight = input.map.height * scale;
  const warnings: string[] = [];

  if (!input.options.transparent) {
    const outsideMap = dimensions.bounds.left < 0
      || dimensions.bounds.top < 0
      || dimensions.bounds.right > 100
      || dimensions.bounds.bottom > 100;
    context.fillStyle = outsideMap ? "#14201a" : "#dce6df";
    context.fillRect(0, 0, dimensions.width, dimensions.height);
  }

  context.save();
  context.translate(
    -(dimensions.bounds.left / 100) * fullWidth,
    -(dimensions.bounds.top / 100) * fullHeight
  );

  if (input.options.includeBaseMap) {
    if (input.map.imageUrl) {
      try {
        const image = await loadBitmap(input.map.imageUrl);
        drawContainedImage(context, image, fullWidth, fullHeight, input.map.imageTransform);
        image.close();
      } catch {
        warnings.push("底图无法载入，已使用默认画布。");
        drawGeneratedMap(context, fullWidth, fullHeight);
      }
    } else {
      drawGeneratedMap(context, fullWidth, fullHeight);
    }
  }

  if (input.options.includeLayers) {
    for (const layer of input.layers.filter((item) => item.visible && item.imageUrl)) {
      try {
        const image = await loadBitmap(layer.imageUrl);
        drawContainedImage(
          context,
          image,
          fullWidth,
          fullHeight,
          layer.imageTransform,
          layer.imageOpacity,
          layer.imageBlendMode === "normal" ? "source-over" : layer.imageBlendMode
        );
        image.close();
      } catch {
        warnings.push(`图层“${layer.title}”无法载入。`);
      }
    }
  }

  if (input.options.includeGrid) drawGrid(context, input.map, fullWidth, fullHeight, scale);
  if (input.options.includeRegions) drawRegions(context, input.regions, fullWidth, fullHeight, scale);

  const markerMap = new Map(input.markers.map((marker) => [marker.id, marker]));
  const markerIcons = new Map<string, LoadedMapImage>();
  if (input.options.includeMarkers) {
    for (const marker of input.markers.filter((item) => item.iconUrl)) {
      try {
        markerIcons.set(marker.id, await loadBitmap(marker.iconUrl));
      } catch {
        warnings.push(`标记“${marker.label}”的自定义图标无法载入。`);
      }
    }
  }
  if (input.options.includeRoutes) {
    drawRoutes(context, input.routes, markerMap, fullWidth, fullHeight, scale);
  }
  if (input.options.includeMarkers) {
    input.markers.forEach((marker) => drawMarker(
      context,
      marker,
      fullWidth,
      fullHeight,
      scale,
      markerIcons.get(marker.id)
    ));
  }

  if (input.options.includeLabels) {
    const regionMetrics = input.regions
      .filter((region) => input.options.includeRegions && region.points.length >= 3)
      .map((region) => ({ region, metrics: calculateMapRegionMetrics(region) }));
    const layout = resolveMapLabelVisibility(
      [
        ...input.markers
          .filter(() => input.options.includeMarkers)
          .map((marker) => ({
            id: marker.id,
            kind: "marker" as const,
            label: marker.label,
            minimumZoom: marker.labelPlacement.minZoom,
            pinned: marker.labelPlacement.locked,
            priority: 5,
            x: marker.x + marker.labelPlacement.offsetX,
            y: marker.y + marker.labelPlacement.offsetY
          })),
        ...regionMetrics.map(({ region, metrics }) => ({
          id: region.id,
          kind: "region" as const,
          label: region.title,
          minimumZoom: region.labelPlacement.minZoom,
          pinned: region.labelPlacement.locked,
          priority: 3,
          x: metrics.centroid.x + region.labelPlacement.offsetX,
          y: metrics.centroid.y + region.labelPlacement.offsetY
        }))
      ],
      {
        mapHeight: input.map.height,
        mapWidth: input.map.width,
        showLabels: true,
        zoom: Math.max(1, dimensions.actualScale)
      }
    );
    input.markers
      .filter((marker) => layout.markerIds.has(marker.id))
      .forEach((marker) => drawLabel(
        context,
        marker.label,
        ((marker.x + marker.labelPlacement.offsetX) / 100) * fullWidth,
        ((marker.y + marker.labelPlacement.offsetY) / 100) * fullHeight - 25 * scale,
        scale,
        marker.color,
        "marker"
      ));
    regionMetrics
      .filter(({ region }) => layout.regionIds.has(region.id))
      .forEach(({ region, metrics }) => drawLabel(
        context,
        region.title,
        ((metrics.centroid.x + region.labelPlacement.offsetX) / 100) * fullWidth,
        ((metrics.centroid.y + region.labelPlacement.offsetY) / 100) * fullHeight,
        scale,
        region.color,
        "region"
      ));
  }

  markerIcons.forEach((icon) => icon.close());

  context.restore();

  const mimeType = input.options.format === "webp" ? "image/webp" : "image/png";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error("地图图像编码失败。")),
      mimeType,
      input.options.format === "webp" ? 0.92 : undefined
    );
  });
  return { blob, dimensions, warnings };
}
