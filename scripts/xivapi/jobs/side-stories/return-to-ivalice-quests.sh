#!/usr/bin/env bash

EXPORT_ID="return-to-ivalice-quests"
TITLE="Return to Ivalice Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - Return to Ivalice"
)

JOURNAL_GENRES=(
  "Return to Ivalice"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="return-to-ivalice"
SECONDARY_FACET_NAME="Return to Ivalice"

COLLECTION_ID="return-to-ivalice-quests"
COLLECTION_TITLE="Return to Ivalice Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for the Return to Ivalice alliance raids."
COLLECTION_SORT_ORDER="12110"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"