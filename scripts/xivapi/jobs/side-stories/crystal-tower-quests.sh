#!/usr/bin/env bash

EXPORT_ID="crystal-tower-quests"
TITLE="The Crystal Tower Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - The Crystal Tower"
)

JOURNAL_GENRES=(
  "Crystal Tower Quests"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="crystal-tower"
SECONDARY_FACET_NAME="The Crystal Tower"

COLLECTION_ID="crystal-tower-quests"
COLLECTION_TITLE="The Crystal Tower Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for the Crystal Tower alliance raids."
COLLECTION_SORT_ORDER="12030"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"