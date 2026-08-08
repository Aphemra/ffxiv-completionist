#!/usr/bin/env bash

EXPORT_ID="pictomancer-job-quests"
TITLE="Pictomancer Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Pictomancer Quests"
)

PRIMARY_FACET_ID="magical-ranged-dps"
PRIMARY_FACET_NAME="Magical Ranged DPS"

SECONDARY_FACET_ID="pictomancer"
SECONDARY_FACET_NAME="Pictomancer"

COLLECTION_ID="pictomancer-job-quests"
COLLECTION_TITLE="Pictomancer Quests"
COLLECTION_DESCRIPTION="The complete Pictomancer job questline."
COLLECTION_SORT_ORDER="2120"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"