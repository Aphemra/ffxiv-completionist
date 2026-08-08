#!/usr/bin/env bash

EXPORT_ID="kobold-society-quests"
TITLE="Kobold Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Kobold Quests"
)

PRIMARY_FACET_ID="kobold"
PRIMARY_FACET_NAME="Kobold"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="kobold-society-quests"
COLLECTION_TITLE="Kobold Society Quests"
COLLECTION_DESCRIPTION="The complete Kobold society quest collection."
COLLECTION_SORT_ORDER="6050"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"