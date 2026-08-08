#!/usr/bin/env bash

EXPORT_ID="ananta-society-quests"
TITLE="Ananta Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Ananta Quests"
)

PRIMARY_FACET_ID="ananta"
PRIMARY_FACET_NAME="Ananta"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="ananta-society-quests"
COLLECTION_TITLE="Ananta Society Quests"
COLLECTION_DESCRIPTION="The complete Ananta society quest collection."
COLLECTION_SORT_ORDER="6010"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"