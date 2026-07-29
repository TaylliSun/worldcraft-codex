# G2 Unified Reference Architecture

## Decision

Worldcraft Codex uses one `ProjectObjectRef` contract for all selectable targets while keeping existing persisted ID fields readable during migration. A deterministic reference index adapts legacy fields and records the source object, field, structured path, role, and optional character range.

This avoids a duplicated top-level reference table becoming a second source of truth. Source objects remain atomic SQLite rows and the index can always be rebuilt after import, migration, rename, deletion, or recovery.

## Core Contract

- `ProjectObjectRef`: stable object kind plus object ID.
- `ProjectReference`: source and target refs, source field/path, role, labels, and exact text range where available.
- `ProjectReferenceProblem`: broken IDs, unresolved title mentions, and ambiguous title mentions.
- `ProjectReferenceIndex`: deterministic references and diagnostics generated from current project data.

## Compatibility

- Existing quest, scene, asset, milestone, map, timeline, relation, and template fields are read by adapters.
- New map-marker and timeline-event multi-reference arrays suppress duplicate legacy slots.
- ID-based references survive renames. Title-based `[[links]]` become explicit diagnostics when a rename leaves an unresolved token.
- Secret template fields are excluded from the shared index and later preview/export paths by default.

## Navigation

Every indexed reference carries enough information to open the source object and select the originating field. Structured paths address arrays and nested nodes; wiki links also include start/end offsets for precise text selection.

## Migration Sequence

1. Add the shared reference contract and deterministic index.
2. Add schema 16 fields for timeline multi-reference/date precision and map layers/groups.
3. Render all existing association controls through one reusable picker.
4. Replace local backlink scans with the shared index and source anchors.
5. Add preview/export filtering and leakage tests before removing any legacy UI.

## Implementation Status

Released in `2.0.0-beta.1` with workspace schema `16`.

- The deterministic project reference index now covers legacy IDs, explicit multi-object references, wiki links, nested story nodes, map objects, timeline objects, milestones, relations, assets, quests, and template fields.
- Entity and quest inspectors show source kind, source field, role, and excerpt. Back-reference navigation opens the source object and focuses or selects the exact originating control or text range.
- Project health reports broken IDs, unresolved wiki links, and ambiguous title links from the same index, with direct source navigation.
- Map markers and timeline events use the shared picker. The picker supports search, kind filtering, multiple selections, navigation, and in-place object creation with automatic attachment to the original source.
- Map layers and marker groups provide visibility and locking. Timeline events support exact, approximate, unknown, range, and custom-era date precision while preserving numeric ordering and dependency-cycle checks.
- Reader preview and JSON/Markdown publication exports use the same sanitization boundary. Secret objects, secret fields/blocks, development notes, tests, review data, and private AI state are excluded; complete project files and backups remain lossless.
- Migration tests cover schemas 8 through 15 upgrading to schema 16. Reference, publication, persistence, restart, and packaged desktop workflows are covered by automated regression tests.
