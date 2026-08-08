#!/usr/bin/env bash

EXPORT_ID="kojin-society-quests"
TITLE="Kojin Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Kojin Quests"
)

PRIMARY_FACET_ID="kojin"
PRIMARY_FACET_NAME="Kojin"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="kojin-society-quests"
COLLECTION_TITLE="Kojin Society Quests"
COLLECTION_DESCRIPTION="The complete Kojin society quest collection."
COLLECTION_SORT_ORDER="6060"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"