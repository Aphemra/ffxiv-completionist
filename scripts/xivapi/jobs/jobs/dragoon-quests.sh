#!/usr/bin/env bash

EXPORT_ID="dragoon-job-quests"
TITLE="Dragoon Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Dragoon Quests"
)

EXCLUDED_QUEST_ROWS="66658"

PRIMARY_FACET_ID="melee-dps"
PRIMARY_FACET_NAME="Melee DPS"

SECONDARY_FACET_ID="dragoon"
SECONDARY_FACET_NAME="Dragoon"

COLLECTION_ID="dragoon-job-quests"
COLLECTION_TITLE="Dragoon Quests"
COLLECTION_DESCRIPTION="The complete Dragoon job questline."
COLLECTION_SORT_ORDER="2060"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"