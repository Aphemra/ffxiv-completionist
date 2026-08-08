#!/usr/bin/env bash

EXPORT_ID="dancer-job-quests"
TITLE="Dancer Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Dancer Quests"
)

PRIMARY_FACET_ID="physical-ranged-dps"
PRIMARY_FACET_NAME="Physical Ranged DPS"

SECONDARY_FACET_ID="dancer"
SECONDARY_FACET_NAME="Dancer"

COLLECTION_ID="dancer-job-quests"
COLLECTION_TITLE="Dancer Quests"
COLLECTION_DESCRIPTION="The complete Dancer job questline."
COLLECTION_SORT_ORDER="2040"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"