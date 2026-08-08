#!/usr/bin/env bash

EXPORT_ID="reaper-job-quests"
TITLE="Reaper Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Reaper Quests"
)

PRIMARY_FACET_ID="melee-dps"
PRIMARY_FACET_NAME="Melee DPS"

SECONDARY_FACET_ID="reaper"
SECONDARY_FACET_NAME="Reaper"

COLLECTION_ID="reaper-job-quests"
COLLECTION_TITLE="Reaper Quests"
COLLECTION_DESCRIPTION="The complete Reaper job questline."
COLLECTION_SORT_ORDER="2130"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"