#!/usr/bin/env bash

EXPORT_ID="samurai-job-quests"
TITLE="Samurai Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Samurai Quests"
)

PRIMARY_FACET_ID="melee-dps"
PRIMARY_FACET_NAME="Melee DPS"

SECONDARY_FACET_ID="samurai"
SECONDARY_FACET_NAME="Samurai"

COLLECTION_ID="samurai-job-quests"
COLLECTION_TITLE="Samurai Quests"
COLLECTION_DESCRIPTION="The complete Samurai job questline."
COLLECTION_SORT_ORDER="2160"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"