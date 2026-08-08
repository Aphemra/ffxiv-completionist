#!/usr/bin/env bash

EXPORT_ID="echoes-of-vanadiel-quests"
TITLE="Echoes of Vana'diel Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - Echoes of Vana'diel"
)

JOURNAL_GENRES=(
  "Echoes of Vana'diel"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="echoes-of-vanadiel"
SECONDARY_FACET_NAME="Echoes of Vana'diel"

COLLECTION_ID="echoes-of-vanadiel-quests"
COLLECTION_TITLE="Echoes of Vana'diel Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for Echoes of Vana'diel."
COLLECTION_SORT_ORDER="12040"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"