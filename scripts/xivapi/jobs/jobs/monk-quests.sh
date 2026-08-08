#!/usr/bin/env bash

EXPORT_ID="monk-job-quests"
TITLE="Monk Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Monk Quests"
)

EXCLUDED_QUEST_ROWS="66657"

PRIMARY_FACET_ID="melee-dps"
PRIMARY_FACET_NAME="Melee DPS"

SECONDARY_FACET_ID="monk"
SECONDARY_FACET_NAME="Monk"

COLLECTION_ID="monk-job-quests"
COLLECTION_TITLE="Monk Quests"
COLLECTION_DESCRIPTION="The complete Monk job questline."
COLLECTION_SORT_ORDER="2090"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"