#!/usr/bin/env bash

EXPORT_ID="warring-triad-quests"
TITLE="The Warring Triad Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - The Warring Triad"
)

JOURNAL_GENRES=(
  "Heavensward Primal Quests"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="warring-triad"
SECONDARY_FACET_NAME="The Warring Triad"

COLLECTION_ID="warring-triad-quests"
COLLECTION_TITLE="The Warring Triad Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for the Warring Triad."
COLLECTION_SORT_ORDER="12140"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"