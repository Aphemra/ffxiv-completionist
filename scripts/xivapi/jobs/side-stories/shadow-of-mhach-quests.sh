#!/usr/bin/env bash

EXPORT_ID="shadow-of-mhach-quests"
TITLE="The Shadow of Mhach Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - The Shadow of Mhach"
)

JOURNAL_GENRES=(
  "Shadow of Mhach Quests"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="shadow-of-mhach"
SECONDARY_FACET_NAME="The Shadow of Mhach"

COLLECTION_ID="shadow-of-mhach-quests"
COLLECTION_TITLE="The Shadow of Mhach Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for the Shadow of Mhach alliance raids."
COLLECTION_SORT_ORDER="12120"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"