#!/usr/bin/env bash

EXPORT_ID="omicron-society-quests"
TITLE="Omicron Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Omicron Quests"
)

PRIMARY_FACET_ID="omicron"
PRIMARY_FACET_NAME="Omicron"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="omicron-society-quests"
COLLECTION_TITLE="Omicron Society Quests"
COLLECTION_DESCRIPTION="The complete Omicron society quest collection."
COLLECTION_SORT_ORDER="6110"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"