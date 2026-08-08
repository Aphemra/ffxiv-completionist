#!/usr/bin/env bash

EXPORT_ID="variant-dungeon-quests"
TITLE="Variant Dungeon Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Variant Dungeons"
)

PRIMARY_FACET_ID="variant-dungeons"
PRIMARY_FACET_NAME="Variant Dungeons"

SECONDARY_FACET_ID="variant-dungeon-quests"
SECONDARY_FACET_NAME="Variant Dungeon Quests"

COLLECTION_ID="variant-dungeon-quests"
COLLECTION_TITLE="Variant Dungeon Quests"
COLLECTION_DESCRIPTION="Quests associated with variant and criterion dungeon adventures."
COLLECTION_SORT_ORDER="13120"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"