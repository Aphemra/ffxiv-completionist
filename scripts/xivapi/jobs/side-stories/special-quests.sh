#!/usr/bin/env bash

EXPORT_ID="special-quests"
TITLE="Special Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Special Quests"
)

JOURNAL_GENRES=(
  "Special Quests"
)

PRIMARY_FACET_ID="special-quests"
PRIMARY_FACET_NAME="Special Quests"

SECONDARY_FACET_ID="special-questlines"
SECONDARY_FACET_NAME="Special Questlines"

COLLECTION_ID="special-quests"
COLLECTION_TITLE="Special Quests"
COLLECTION_DESCRIPTION="Special-purpose quests that do not belong to a standard journal storyline."
COLLECTION_SORT_ORDER="16010"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"