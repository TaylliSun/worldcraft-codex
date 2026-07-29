const fs = require("node:fs/promises");
const path = require("node:path");

const ALLOWED_RICH_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "s", "u", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "code", "pre", "hr", "table", "thead", "tbody", "tr", "th", "td",
  "details", "summary", "span", "a"
]);

function text(value, maximum = 20000) {
  return String(value ?? "").replace(/\u0000/g, "").slice(0, maximum);
}

function safeId(value) {
  return text(value, 300).replace(/[^a-zA-Z0-9_.:-]/g, "");
}

function escapeHtml(value) {
  return text(value, 100000)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attribute(value, name) {
  return value.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"))?.[1]
    || value.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"))?.[2]
    || "";
}

function sanitizeRichText(value) {
  const raw = text(value, 2_000_000)
    .replace(/<(script|style|iframe|object|embed|form|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<!--([\s\S]*?)-->/g, "");
  return raw.replace(/<\/?([a-z0-9-]+)\b([^>]*)>/gi, (token, rawTag, attributes) => {
    const tag = String(rawTag).toLowerCase();
    if (!ALLOWED_RICH_TAGS.has(tag)) return "";
    if (token.startsWith("</")) return `</${tag}>`;
    if (tag === "br" || tag === "hr") return `<${tag}>`;
    if (tag === "a") {
      const kind = safeId(attribute(attributes, "data-wiki-reference-kind"));
      const id = safeId(attribute(attributes, "data-wiki-reference-id"));
      const allowedKinds = new Set(["entity", "quest", "map", "timeline-event", "timeline-track"]);
      return kind && id && allowedKinds.has(kind)
        ? `<a href="#/${kind}/${encodeURIComponent(id)}" data-wiki-reference-kind="${kind}" data-wiki-reference-id="${id}">`
        : "<a>";
    }
    if (tag === "span") {
      const className = attribute(attributes, "class");
      return className.includes("wiki-redacted-reference")
        ? '<span class="redacted">'
        : "<span>";
    }
    return `<${tag}>`;
  });
}

function safeStoredName(value) {
  const raw = text(value, 500);
  if (!raw || raw.includes("/") || raw.includes("\\")) return "";
  const candidate = path.basename(raw);
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,499}$/.test(candidate) ? candidate : "";
}

function cleanPublication(source) {
  const raw = source && typeof source === "object" ? source : {};
  const world = raw.world && typeof raw.world === "object" ? raw.world : {};
  const arrays = (value, maximum) => Array.isArray(value) ? value.slice(0, maximum) : [];
  const entities = arrays(raw.entities, 100000).map((item) => ({
    id: safeId(item.id), type: text(item.type, 80), title: text(item.title, 500), slug: text(item.slug, 500),
    summary: text(item.summary, 24000), content: sanitizeRichText(item.content), tags: arrays(item.tags, 100).map((tag) => text(tag, 200)),
    categoryId: safeId(item.categoryId), updatedAt: text(item.updatedAt, 100),
    fields: arrays(item.fields, 200).map((field) => ({ label: text(field.label, 500), value: text(field.value, 24000) }))
  })).filter((item) => item.id && item.title);
  const entityIds = new Set(entities.map((item) => item.id));
  const quests = arrays(raw.quests, 20000).map((item) => ({
    id: safeId(item.id), title: text(item.title, 500), category: text(item.category, 80), status: text(item.status, 80),
    summary: text(item.summary, 24000), trigger: text(item.trigger, 12000),
    relatedEntityIds: arrays(item.relatedEntityIds, 500).map(safeId).filter((id) => entityIds.has(id)),
    steps: arrays(item.steps, 500).map((step) => ({
      id: safeId(step.id), title: text(step.title, 500), objective: text(step.objective, 12000),
      condition: text(step.condition, 12000), branch: text(step.branch, 12000), failure: text(step.failure, 12000), reward: text(step.reward, 12000)
    })), updatedAt: text(item.updatedAt, 100)
  })).filter((item) => item.id && item.title);
  const questIds = new Set(quests.map((item) => item.id));
  const maps = arrays(raw.maps, 5000).map((item) => ({
    id: safeId(item.id), parentMapId: safeId(item.parentMapId), title: text(item.title, 500),
    description: text(item.description, 24000), imageStoredName: safeStoredName(item.imageStoredName),
    markers: arrays(item.markers, 20000).map((marker) => ({
      id: safeId(marker.id), label: text(marker.label, 500), description: text(marker.description, 12000),
      x: Math.max(0, Math.min(100, Number(marker.x) || 0)), y: Math.max(0, Math.min(100, Number(marker.y) || 0)),
      entityId: entityIds.has(safeId(marker.entityId)) ? safeId(marker.entityId) : "",
      questId: questIds.has(safeId(marker.questId)) ? safeId(marker.questId) : ""
    })),
    regions: arrays(item.regions, 5000).map((region) => ({
      id: safeId(region.id), title: text(region.title, 500), description: text(region.description, 12000),
      color: /^#[0-9a-f]{6}$/i.test(region.color) ? region.color : "#176b5b",
      opacity: Math.max(0.05, Math.min(0.8, Number(region.opacity) || 0.18)),
      points: arrays(region.points, 1000).map((point) => ({ x: Math.max(0, Math.min(100, Number(point.x) || 0)), y: Math.max(0, Math.min(100, Number(point.y) || 0)) }))
    })).filter((region) => region.points.length >= 3)
  })).filter((item) => item.id && item.title);
  const timelines = arrays(raw.timelines, 5000).map((track) => ({
    id: safeId(track.id), name: text(track.name, 500), description: text(track.description, 12000),
    events: arrays(track.events, 50000).map((event) => ({
      id: safeId(event.id), title: text(event.title, 500), summary: text(event.summary, 12000), displayDate: text(event.displayDate, 500),
      entityId: entityIds.has(safeId(event.entityId)) ? safeId(event.entityId) : "",
      questId: questIds.has(safeId(event.questId)) ? safeId(event.questId) : ""
    }))
  })).filter((item) => item.id && item.name);
  const assets = arrays(raw.assets, 100000).map((asset) => ({
    id: safeId(asset.id), name: text(asset.name, 500), mimeType: text(asset.mimeType, 200),
    storedName: safeStoredName(asset.storedName), linkedEntityIds: arrays(asset.linkedEntityIds, 10000).map(safeId).filter((id) => entityIds.has(id))
  })).filter((asset) => asset.id && asset.storedName && asset.mimeType.startsWith("image/"));
  return {
    schemaVersion: 1,
    exportedAt: text(raw.exportedAt, 100) || new Date().toISOString(),
    audience: ["author", "member", "public"].includes(raw.audience) ? raw.audience : "public",
    world: {
      id: safeId(world.id), name: text(world.name, 500) || "Worldcraft Wiki", description: text(world.description, 24000),
      visibility: text(world.visibility, 30), themeColor: /^#[0-9a-f]{6}$/i.test(world.themeColor) ? world.themeColor : "#176b5b",
      coverAssetId: safeId(world.coverAssetId), featuredEntityIds: arrays(world.featuredEntityIds, 100).map(safeId).filter((id) => entityIds.has(id)),
      navigationCategoryIds: arrays(world.navigationCategoryIds, 1000).map(safeId), defaultMapId: safeId(world.defaultMapId)
    },
    categories: arrays(raw.categories, 50000).map((item) => ({
      id: safeId(item.id), parentId: safeId(item.parentId), title: text(item.title, 500), description: text(item.description, 2000), order: Number(item.order) || 0
    })).filter((item) => item.id && item.title),
    entities, quests, maps, timelines,
    relations: arrays(raw.relations, 100000).map((item) => ({
      id: safeId(item.id), sourceEntityId: safeId(item.sourceEntityId), targetEntityId: safeId(item.targetEntityId),
      label: text(item.label, 500), kind: text(item.kind, 100), strength: Math.max(1, Math.min(5, Number(item.strength) || 1))
    })).filter((item) => item.id && entityIds.has(item.sourceEntityId) && entityIds.has(item.targetEntityId)),
    assets
  };
}

const WIKI_CSS = `:root{--accent:#176b5b;--ink:#17211d;--muted:#66736d;--line:#d8e0dc;--paper:#fff;--soft:#f3f6f4;font-family:Inter,"Segoe UI","Microsoft YaHei",sans-serif;color:var(--ink);background:var(--soft)}*{box-sizing:border-box}body{margin:0}button,input{font:inherit}.shell{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:100vh}.side{position:sticky;top:0;height:100vh;overflow:auto;background:#15201c;color:#edf4f0;padding:24px 18px}.brand{display:block;color:inherit;text-decoration:none;margin-bottom:22px}.brand strong{display:block;font-size:20px}.brand span{color:#9eafa7;font-size:12px}.search{width:100%;border:1px solid #405149;background:#202e28;color:#fff;padding:10px 11px;margin-bottom:18px}.nav-title{color:#91a39a;font-size:11px;text-transform:uppercase;margin:18px 0 7px}.nav a{display:flex;justify-content:space-between;color:#dbe6e0;text-decoration:none;padding:8px 7px;border-left:2px solid transparent}.nav a:hover{background:#22322b;border-color:var(--accent)}.main{min-width:0}.top{height:58px;border-bottom:1px solid var(--line);background:rgba(255,255,255,.96);display:flex;align-items:center;justify-content:space-between;padding:0 32px;position:sticky;top:0;z-index:5}.top a{color:var(--ink);text-decoration:none;margin-right:20px}.top small{color:var(--muted)}#content{max-width:1120px;margin:0 auto;padding:42px 46px 80px}.hero{position:relative;min-height:300px;display:flex;align-items:flex-end;background:#17251f;color:#fff;overflow:hidden;margin-bottom:36px}.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.58}.hero-copy{position:relative;padding:42px;max-width:760px}.eyebrow{font-size:12px;color:#c8ddd3}.hero h1,.article h1{font-family:Georgia,"Songti SC",serif;font-size:42px;letter-spacing:0;margin:8px 0 12px}.hero p{font-size:17px;line-height:1.8}.section-title{display:flex;justify-content:space-between;align-items:end;border-bottom:1px solid var(--line);margin:34px 0 16px;padding-bottom:8px}.section-title h2{font-size:20px;margin:0}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.card{display:block;border:1px solid var(--line);background:var(--paper);padding:17px;color:inherit;text-decoration:none}.card:hover{border-color:var(--accent)}.card strong{display:block;margin-bottom:7px}.card p{color:var(--muted);line-height:1.6;margin:0}.article{background:var(--paper);border:1px solid var(--line);padding:46px 56px}.article header{border-bottom:1px solid var(--line);margin-bottom:28px}.article .summary{font-size:18px;color:var(--muted);line-height:1.7}.prose{font-size:16px;line-height:1.9}.prose h2,.prose h3{margin-top:1.8em}.prose a{color:var(--accent)}.facts{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line);margin-top:28px}.facts div{display:grid;grid-template-columns:130px 1fr;border-bottom:1px solid var(--line);padding:11px 0}.facts span{color:var(--muted)}.tags{display:flex;gap:7px;flex-wrap:wrap;margin:18px 0}.tags span{background:var(--soft);padding:5px 8px;font-size:12px}.list{display:grid;gap:10px}.row{border-bottom:1px solid var(--line);padding:15px 4px}.row a{color:inherit;text-decoration:none}.row small{display:block;color:var(--muted);margin-top:5px}.map{position:relative;aspect-ratio:16/10;background:#17211d;overflow:hidden}.map>img{width:100%;height:100%;object-fit:contain}.map svg{position:absolute;inset:0;width:100%;height:100%}.marker{position:absolute;transform:translate(-50%,-50%);background:#fff;border:2px solid var(--accent);border-radius:50%;width:14px;height:14px}.marker span{position:absolute;left:16px;top:-8px;background:#fff;padding:3px 6px;white-space:nowrap;font-size:11px}.empty{padding:70px 20px;text-align:center;color:var(--muted)}.redacted{color:#8b4a42;background:#f7ece9;padding:0 4px}.search-results{margin-top:12px}@media(max-width:900px){.shell{grid-template-columns:1fr}.side{position:relative;height:auto}.top{top:0;padding:0 18px}#content{padding:24px 18px}.grid{grid-template-columns:1fr}.article{padding:28px 22px}.hero h1,.article h1{font-size:32px}.facts{grid-template-columns:1fr}}`;

const WIKI_REFERENCE_CSS = `.wiki-ref-card{background:rgba(255,255,255,.98);border:1px solid var(--line);box-shadow:0 18px 42px rgba(19,36,29,.18);color:var(--ink);display:grid;gap:12px;grid-template-columns:58px minmax(0,1fr);max-width:min(330px,calc(100vw - 28px));min-height:108px;padding:12px;pointer-events:none;position:fixed;width:330px;z-index:50}.wiki-ref-card img,.wiki-ref-mark{align-items:center;background:var(--soft);border:1px solid var(--line);color:var(--accent);display:flex;height:58px;justify-content:center;object-fit:cover;width:58px}.wiki-ref-card span{color:var(--accent);display:block;font-size:11px;font-weight:800;margin-bottom:3px}.wiki-ref-card strong{display:block;font-size:15px;line-height:1.35;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wiki-ref-card small{color:var(--muted);display:block;font-size:11px;margin-bottom:7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wiki-ref-card p{color:#314139;display:-webkit-box;font-size:12px;line-height:1.55;margin:0;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:3}.wiki-ref-card .excerpt{color:var(--muted);margin-top:7px;-webkit-line-clamp:2}.prose a[data-wiki-reference-kind]{border-bottom:1px dotted color-mix(in srgb,var(--accent) 70%,#fff);font-weight:700;text-decoration:none}.prose a[data-wiki-reference-kind]:hover{border-bottom-style:solid}`;

const WIKI_JS = String.raw`(()=>{const d=window.__WORLDCRAFT_WIKI__;if(!d)return;document.documentElement.style.setProperty('--accent',d.world.themeColor);const byId=(a,id)=>a.find(x=>x.id===id);const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));const asset=id=>byId(d.assets,id);const assetPath=name=>'assets/'+encodeURIComponent(name);const route=(kind,id='')=>'#/'+kind+(id?'/'+encodeURIComponent(id):'');const entityLink=id=>{const e=byId(d.entities,id);return e?'<a href="'+route('entity',e.id)+'">'+esc(e.title)+'</a>':''};function layout(){const cats=d.categories.filter(c=>d.entities.some(e=>e.categoryId===c.id)).sort((a,b)=>a.order-b.order);document.querySelector('.brand strong').textContent=d.world.name;document.querySelector('.brand span').textContent='离线世界 Wiki · '+d.audience;document.querySelector('.nav-categories').innerHTML=cats.map(c=>'<a href="'+route('category',c.id)+'"><span>'+esc(c.title)+'</span><small>'+d.entities.filter(e=>e.categoryId===c.id).length+'</small></a>').join('');document.querySelector('.nav-tools').innerHTML='<a href="'+route('quests')+'">任务线</a><a href="'+route('maps')+'">地图</a><a href="'+route('timelines')+'">时间线</a>';document.querySelector('.export-time').textContent='导出于 '+new Date(d.exportedAt).toLocaleDateString('zh-CN')}function home(){const cover=asset(d.world.coverAssetId);const featured=(d.world.featuredEntityIds.map(id=>byId(d.entities,id)).filter(Boolean).length?d.world.featuredEntityIds.map(id=>byId(d.entities,id)).filter(Boolean):d.entities.slice(0,6));return '<section class="hero">'+(cover?'<img alt="" src="'+assetPath(cover.storedName)+'">':'')+'<div class="hero-copy"><span class="eyebrow">世界档案</span><h1>'+esc(d.world.name)+'</h1><p>'+esc(d.world.description)+'</p></div></section><div class="section-title"><h2>精选条目</h2><span>'+d.entities.length+' 篇文章</span></div><div class="grid">'+featured.map(e=>'<a class="card" href="'+route('entity',e.id)+'"><strong>'+esc(e.title)+'</strong><p>'+esc(e.summary)+'</p></a>').join('')+'</div><div class="section-title"><h2>世界脉络</h2></div><div class="grid"><a class="card" href="'+route('quests')+'"><strong>任务线</strong><p>'+d.quests.length+' 条公开任务</p></a><a class="card" href="'+route('maps')+'"><strong>地图</strong><p>'+d.maps.length+' 张地图</p></a><a class="card" href="'+route('timelines')+'"><strong>时间线</strong><p>'+d.timelines.length+' 条时间轨道</p></a></div>'}function entity(id){const e=byId(d.entities,id);if(!e)return missing();const image=d.assets.find(a=>a.linkedEntityIds.includes(e.id));const related=d.relations.filter(r=>r.sourceEntityId===e.id||r.targetEntityId===e.id);return '<article class="article"><header><span class="eyebrow">'+esc(e.type)+'</span><h1>'+esc(e.title)+'</h1><p class="summary">'+esc(e.summary)+'</p>'+(image?'<img style="max-width:320px;max-height:320px;object-fit:contain" alt="'+esc(e.title)+'" src="'+assetPath(image.storedName)+'">':'')+'</header><div class="prose">'+e.content+'</div>'+(e.fields.length?'<div class="facts">'+e.fields.map(f=>'<div><span>'+esc(f.label)+'</span><strong>'+esc(f.value)+'</strong></div>').join('')+'</div>':'')+'<div class="tags">'+e.tags.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div>'+(related.length?'<div class="section-title"><h2>相关条目</h2></div><div class="list">'+related.map(r=>{const other=r.sourceEntityId===e.id?r.targetEntityId:r.sourceEntityId;return '<div class="row">'+entityLink(other)+'<small>'+esc(r.label)+'</small></div>'}).join('')+'</div>':'')+'</article>'}function category(id){const c=byId(d.categories,id);const items=d.entities.filter(e=>e.categoryId===id);return '<article class="article"><header><span class="eyebrow">目录</span><h1>'+esc(c?.title||'条目目录')+'</h1><p class="summary">'+esc(c?.description||'')+'</p></header><div class="list">'+items.map(e=>'<div class="row"><a href="'+route('entity',e.id)+'"><strong>'+esc(e.title)+'</strong></a><small>'+esc(e.summary)+'</small></div>').join('')+'</div></article>'}function quests(id){if(id){const q=byId(d.quests,id);if(!q)return missing();return '<article class="article"><header><span class="eyebrow">任务线</span><h1>'+esc(q.title)+'</h1><p class="summary">'+esc(q.summary)+'</p></header><div class="facts"><div><span>触发条件</span><strong>'+esc(q.trigger)+'</strong></div><div><span>状态</span><strong>'+esc(q.status)+'</strong></div></div><div class="section-title"><h2>任务步骤</h2></div><div class="list">'+q.steps.map((s,i)=>'<div class="row"><strong>'+(i+1)+'. '+esc(s.title)+'</strong><small>'+esc(s.objective)+'</small></div>').join('')+'</div></article>'}return listPage('任务线',d.quests,'quest')}function maps(id){if(id){const m=byId(d.maps,id);if(!m)return missing();return '<article class="article"><header><span class="eyebrow">互动地图</span><h1>'+esc(m.title)+'</h1><p class="summary">'+esc(m.description)+'</p></header><div class="map">'+(m.imageStoredName?'<img alt="'+esc(m.title)+'" src="'+assetPath(m.imageStoredName)+'">':'')+'<svg viewBox="0 0 100 100" preserveAspectRatio="none">'+m.regions.map(r=>'<polygon points="'+r.points.map(p=>p.x+','+p.y).join(' ')+'" fill="'+r.color+'" fill-opacity="'+r.opacity+'" stroke="'+r.color+'" vector-effect="non-scaling-stroke"/>').join('')+'</svg>'+m.markers.map(x=>'<a class="marker" title="'+esc(x.description)+'" style="left:'+x.x+'%;top:'+x.y+'%" href="'+(x.entityId?route('entity',x.entityId):x.questId?route('quest',x.questId):route('map',m.id))+'"><span>'+esc(x.label)+'</span></a>').join('')+'</div></article>'}return listPage('地图',d.maps,'map')}function timelines(){return '<article class="article"><header><span class="eyebrow">历史档案</span><h1>时间线</h1></header>'+d.timelines.map(t=>'<div class="section-title"><h2>'+esc(t.name)+'</h2><span>'+t.events.length+' 个时间点</span></div><div class="list">'+t.events.map(e=>'<div class="row"><strong>'+esc(e.displayDate)+' · '+esc(e.title)+'</strong><small>'+esc(e.summary)+'</small></div>').join('')+'</div>').join('')+'</article>'}function listPage(title,items,kind){return '<article class="article"><header><span class="eyebrow">世界档案</span><h1>'+esc(title)+'</h1></header><div class="list">'+items.map(x=>'<div class="row"><a href="'+route(kind,x.id)+'"><strong>'+esc(x.title||x.name)+'</strong></a><small>'+esc(x.summary||x.description||'')+'</small></div>').join('')+'</div></article>'}function search(q){const n=q.trim().toLocaleLowerCase();const entities=d.entities.filter(e=>(e.title+' '+e.summary+' '+e.tags.join(' ')).toLocaleLowerCase().includes(n));const quests=d.quests.filter(e=>(e.title+' '+e.summary).toLocaleLowerCase().includes(n));return '<article class="article"><header><span class="eyebrow">本地搜索</span><h1>'+esc(q)+'</h1><p class="summary">找到 '+(entities.length+quests.length)+' 项</p></header><div class="list">'+entities.map(e=>'<div class="row"><a href="'+route('entity',e.id)+'"><strong>'+esc(e.title)+'</strong></a><small>'+esc(e.summary)+'</small></div>').join('')+quests.map(e=>'<div class="row"><a href="'+route('quest',e.id)+'"><strong>'+esc(e.title)+'</strong></a><small>'+esc(e.summary)+'</small></div>').join('')+'</div></article>'}function missing(){return '<div class="empty"><h1>内容不存在或未公开</h1><a href="#/home">返回首页</a></div>'}function render(){const parts=location.hash.replace(/^#\/?/,'').split('/').map(decodeURIComponent);const kind=parts[0]||'home',id=parts[1]||'';let html=kind==='home'?home():kind==='entity'?entity(id):kind==='category'?category(id):kind==='quest'?quests(id):kind==='quests'?quests():kind==='map'?maps(id):kind==='maps'?maps():kind==='timelines'?timelines():kind==='search'?search(parts.slice(1).join('/')):missing();document.getElementById('content').innerHTML=html;scrollTo(0,0)}layout();document.querySelector('.search').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.currentTarget.value.trim())location.hash=route('search',e.currentTarget.value.trim()).slice(1)});addEventListener('hashchange',render);render()})();`;

const WIKI_REFERENCE_JS = String.raw`(()=>{const d=window.__WORLDCRAFT_WIKI__;if(!d)return;const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));const plain=v=>String(v??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();const byId=(items,id)=>items.find(item=>item.id===id);const assetPath=name=>'assets/'+encodeURIComponent(name);let card=null;function data(kind,id){if(kind==='entity'){const e=byId(d.entities,id);if(!e)return null;const image=d.assets.find(a=>a.linkedEntityIds.includes(e.id));return{title:e.title,type:e.type,meta:(d.categories.find(c=>c.id===e.categoryId)||{}).title||d.audience,summary:e.summary||plain(e.content).slice(0,180),excerpt:e.summary?plain(e.content).slice(0,140):'',image:image&&image.storedName}}if(kind==='quest'){const q=byId(d.quests,id);return q&&{title:q.title,type:q.category,meta:q.status,summary:q.summary||q.trigger,excerpt:q.steps.slice(0,2).map(s=>s.title||s.objective).filter(Boolean).join(' / ')}}if(kind==='map'){const m=byId(d.maps,id);return m&&{title:m.title,type:'Map',meta:m.markers.length+' markers',summary:m.description,excerpt:''}}if(kind==='timeline-track'){const t=byId(d.timelines,id);return t&&{title:t.name,type:'Timeline',meta:t.events.length+' events',summary:t.description,excerpt:''}}if(kind==='timeline-event'){for(const t of d.timelines){const e=byId(t.events,id);if(e)return{title:e.title,type:e.displayDate||'Timeline event',meta:t.name,summary:e.summary,excerpt:''}}}return null}function hide(){if(card){card.remove();card=null}}function show(item,x,y){if(!card){card=document.createElement('aside');card.className='wiki-ref-card';card.setAttribute('aria-hidden','true');document.body.append(card)}card.innerHTML=(item.image?'<img alt="" src="'+assetPath(item.image)+'">':'<span class="wiki-ref-mark">Wiki</span>')+'<div><span>'+esc(item.type||'Wiki')+'</span><strong>'+esc(item.title)+'</strong>'+(item.meta?'<small>'+esc(item.meta)+'</small>':'')+(item.summary?'<p>'+esc(item.summary)+'</p>':'')+(item.excerpt?'<p class="excerpt">'+esc(item.excerpt)+'</p>':'')+'</div>';const w=330,h=220,m=14;card.style.left=Math.min(x+18,Math.max(m,innerWidth-w-m))+'px';card.style.top=Math.min(y+18,Math.max(m,innerHeight-h-m))+'px'}document.addEventListener('mousemove',event=>{const link=event.target.closest&&event.target.closest('a[data-wiki-reference-kind][data-wiki-reference-id]');if(!link){hide();return}const item=data(link.dataset.wikiReferenceKind,link.dataset.wikiReferenceId);if(!item){hide();return}show(item,event.clientX,event.clientY)});document.addEventListener('scroll',hide,true);addEventListener('hashchange',hide)})();`;

function htmlShell(worldName) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'self' data:; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'"><title>${escapeHtml(worldName)} · Worldcraft Wiki</title><link rel="stylesheet" href="wiki.css"></head><body><div class="shell"><aside class="side"><a class="brand" href="#/home"><strong></strong><span></span></a><input class="search" aria-label="搜索离线 Wiki" placeholder="搜索人物、地点、任务"><div class="nav-title">目录</div><nav class="nav nav-categories"></nav><div class="nav-title">世界内容</div><nav class="nav nav-tools"></nav></aside><main class="main"><header class="top"><nav><a href="#/home">首页</a><a href="#/quests">任务</a><a href="#/maps">地图</a><a href="#/timelines">时间线</a></nav><small class="export-time"></small></header><div id="content"></div></main></div><script src="wiki-data.js"></script><script src="wiki.js"></script></body></html>`;
}

async function exportOfflineWiki({ outputDir, assetsDir, publication }) {
  const serializedInput = JSON.stringify(publication ?? {});
  if (Buffer.byteLength(serializedInput, "utf8") > 80 * 1024 * 1024) {
    throw new Error("离线 Wiki 数据超过 80 MB 安全上限");
  }
  const clean = cleanPublication(publication);
  await fs.mkdir(outputDir, { recursive: true });
  const outputAssetsDir = path.join(outputDir, "assets");
  await fs.mkdir(outputAssetsDir, { recursive: true });
  const missingAssets = [];
  let copiedAssets = 0;
  for (const asset of clean.assets) {
    const sourcePath = path.resolve(assetsDir, asset.storedName);
    const root = path.resolve(assetsDir);
    if (sourcePath !== root && !sourcePath.startsWith(`${root}${path.sep}`)) {
      missingAssets.push(asset.storedName);
      continue;
    }
    try {
      await fs.copyFile(sourcePath, path.join(outputAssetsDir, asset.storedName));
      copiedAssets += 1;
    } catch {
      missingAssets.push(asset.storedName);
    }
  }
  const safeJson = JSON.stringify(clean).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  await Promise.all([
    fs.writeFile(path.join(outputDir, "index.html"), htmlShell(clean.world.name), "utf8"),
    fs.writeFile(path.join(outputDir, "wiki.css"), WIKI_CSS + WIKI_REFERENCE_CSS, "utf8"),
    fs.writeFile(path.join(outputDir, "wiki.js"), `${WIKI_JS}\n${WIKI_REFERENCE_JS}`, "utf8"),
    fs.writeFile(path.join(outputDir, "wiki-data.js"), `window.__WORLDCRAFT_WIKI__=${safeJson};`, "utf8"),
    fs.writeFile(path.join(outputDir, "manifest.json"), JSON.stringify({
      schemaVersion: 1, worldId: clean.world.id, worldName: clean.world.name,
      audience: clean.audience, exportedAt: clean.exportedAt,
      counts: { articles: clean.entities.length, quests: clean.quests.length, maps: clean.maps.length, timelines: clean.timelines.length, assets: copiedAssets },
      missingAssets
    }, null, 2), "utf8")
  ]);
  return {
    outputDir,
    entryFile: path.join(outputDir, "index.html"),
    entityCount: clean.entities.length,
    questCount: clean.quests.length,
    mapCount: clean.maps.length,
    timelineCount: clean.timelines.length,
    assetCount: copiedAssets,
    missingAssets,
    files: ["index.html", "wiki.css", "wiki.js", "wiki-data.js", "manifest.json"]
  };
}

module.exports = { cleanPublication, exportOfflineWiki, sanitizeRichText };
