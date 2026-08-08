#!/usr/bin/env bash

EXPORT_ID="heaven-on-high-quests"
TITLE="Heaven-on-High Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Heaven-on-High"
)

PRIMARY_FACET_ID="deep-dungeons"
PRIMARY_FACET_NAME="Deep Dungeons"

SECONDARY_FACET_ID="heaven-on-high"
SECONDARY_FACET_NAME="Heaven-on-High"

COLLECTION_ID="heaven-on-high-quests"
COLLECTION_TITLE="Heaven-on-High"
COLLECTION_DESCRIPTION="Quests associated with the Heaven-on-High deep dungeon."
COLLECTION_SORT_ORDER="13050"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"