#!/usr/bin/env bash

EXPORT_ID="gunbreaker-job-quests"
TITLE="Gunbreaker Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Gunbreaker Quests"
)

PRIMARY_FACET_ID="tank"
PRIMARY_FACET_NAME="Tank"

SECONDARY_FACET_ID="gunbreaker"
SECONDARY_FACET_NAME="Gunbreaker"

COLLECTION_ID="gunbreaker-job-quests"
COLLECTION_TITLE="Gunbreaker Quests"
COLLECTION_DESCRIPTION="The complete Gunbreaker job questline."
COLLECTION_SORT_ORDER="2070"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"