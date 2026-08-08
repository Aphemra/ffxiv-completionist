#!/usr/bin/env bash

EXPORT_ID="eden-quests"
TITLE="Eden Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - Eden"
)

JOURNAL_GENRES=(
  "Eden"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="eden"
SECONDARY_FACET_NAME="Eden"

COLLECTION_ID="eden-quests"
COLLECTION_TITLE="Eden Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for Eden."
COLLECTION_SORT_ORDER="12050"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"