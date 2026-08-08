#!/usr/bin/env bash

EXPORT_ID="dark-knight-job-quests"
TITLE="Dark Knight Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Dark Knight Quests"
)

PRIMARY_FACET_ID="tank"
PRIMARY_FACET_NAME="Tank"

SECONDARY_FACET_ID="dark-knight"
SECONDARY_FACET_NAME="Dark Knight"

COLLECTION_ID="dark-knight-job-quests"
COLLECTION_TITLE="Dark Knight Quests"
COLLECTION_DESCRIPTION="The complete Dark Knight job questline."
COLLECTION_SORT_ORDER="2050"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"