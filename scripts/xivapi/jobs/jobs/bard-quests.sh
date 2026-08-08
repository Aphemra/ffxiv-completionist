#!/usr/bin/env bash

EXPORT_ID="bard-job-quests"
TITLE="Bard Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Bard Quests"
)

EXCLUDED_QUEST_ROWS="66661"

PRIMARY_FACET_ID="physical-ranged-dps"
PRIMARY_FACET_NAME="Physical Ranged DPS"

SECONDARY_FACET_ID="bard"
SECONDARY_FACET_NAME="Bard"

COLLECTION_ID="bard-job-quests"
COLLECTION_TITLE="Bard Quests"
COLLECTION_DESCRIPTION="The complete Bard job questline."
COLLECTION_SORT_ORDER="2010"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"