#!/usr/bin/env bash

EXPORT_ID="alexander-quests"
TITLE="Alexander Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - Alexander"
)

JOURNAL_GENRES=(
  "Alexander Quests"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="alexander"
SECONDARY_FACET_NAME="Alexander"

COLLECTION_ID="alexander-quests"
COLLECTION_TITLE="Alexander Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for Alexander."
COLLECTION_SORT_ORDER="12000"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"