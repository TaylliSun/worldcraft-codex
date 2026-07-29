# G3 Editor AI Architecture

Worldcraft Codex 2.1 keeps AI beside the field being edited. The existing AI workspace remains responsible for deep writing, memory administration, and cross-module operations; it is not required for normal field edits.

## Invocation and Targeting

- A shared inline trigger is available on entity summaries, rich-text bodies, non-secret long template fields, quest summaries, triggers and steps, and story scene summaries and dialogue.
- The target contract includes world, object, context, exact field path, display label, and plain-text or rich-text format.
- Textarea selections use exact character offsets. Rich-text selections preserve surrounding document structure and refuse to operate inside a secret block.
- The same field whitelist is used for reads, writes, preflight checks, and undo, preventing model output from addressing arbitrary workspace properties.

## Context and Provenance

- Context packs rank the current object, directly related objects, world context, and long-term memories under a fixed character budget.
- Authors can pin, exclude, or adjust source priority before generation.
- Secret template fields, developer notes, and rich-text secret blocks are removed before model requests.
- Structured model responses must return the source and memory IDs actually used. Unknown IDs are rejected; output without accepted sources is labeled as new creation.
- Candidate facts are stored as draft memories tied to the writing session and do not become confirmed canon automatically.

## Apply and Undo

- Before apply, the current stored value must still equal the value seen when generation started.
- A local deterministic consistency scan compares the workspace before and after the candidate write. New critical or major findings are shown before commit and require a second explicit apply action.
- Apply creates a dedicated backup, writes the field, audit branch, source IDs, candidate memories, and consistency delta in one SQLite save transaction.
- The audit branch stores both readable before/after text and exact stored values, including rich-text HTML.
- Undo creates another backup and only proceeds when the current field exactly equals the AI-applied value. It restores the exact prior value and removes only unconfirmed candidate memories owned solely by that edit branch.
- Confirmed memories, memories with additional author sources, and fields changed after AI apply are preserved.

## Large-Project Recall

Retrieval is deterministic and project-local. Tests cover 1,200 sources and more than 100,000 characters while keeping the selected context inside a 24,000-character source budget. The ranking favors the current object, direct relations, author-pinned sources, explicit priority, and content relevance.

## Released Surface

Released in `2.1.0-beta.1` with workspace schema `16`. No new cloud service, community system, plugin market, or engine-specific exporter is introduced.
