#!/usr/bin/env bash

EXPORT_ID="ninja-job-quests"
TITLE="Ninja Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Ninja Quests"
)

PRIMARY_FACET_ID="melee-dps"
PRIMARY_FACET_NAME="Melee DPS"

SECONDARY_FACET_ID="ninja"
SECONDARY_FACET_NAME="Ninja"

COLLECTION_ID="ninja-job-quests"
COLLECTION_TITLE="Ninja Quests"
COLLECTION_DESCRIPTION="The complete Ninja job questline."
COLLECTION_SORT_ORDER="2100"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"