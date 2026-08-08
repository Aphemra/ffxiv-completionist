#!/usr/bin/env bash

EXPORT_ID="machinist-job-quests"
TITLE="Machinist Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Machinist Quests"
)

PRIMARY_FACET_ID="physical-ranged-dps"
PRIMARY_FACET_NAME="Physical Ranged DPS"

SECONDARY_FACET_ID="machinist"
SECONDARY_FACET_NAME="Machinist"

COLLECTION_ID="machinist-job-quests"
COLLECTION_TITLE="Machinist Quests"
COLLECTION_DESCRIPTION="The complete Machinist job questline."
COLLECTION_SORT_ORDER="2080"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"