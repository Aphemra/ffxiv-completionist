#!/usr/bin/env bash

EXPORT_ID="pilgrims-traverse-quests"
TITLE="Pilgrim's Traverse Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Pilgrim's Traverse"
)

PRIMARY_FACET_ID="deep-dungeons"
PRIMARY_FACET_NAME="Deep Dungeons"

SECONDARY_FACET_ID="pilgrims-traverse"
SECONDARY_FACET_NAME="Pilgrim's Traverse"

COLLECTION_ID="pilgrims-traverse-quests"
COLLECTION_TITLE="Pilgrim's Traverse"
COLLECTION_DESCRIPTION="Quests associated with the Pilgrim's Traverse deep dungeon."
COLLECTION_SORT_ORDER="13100"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"