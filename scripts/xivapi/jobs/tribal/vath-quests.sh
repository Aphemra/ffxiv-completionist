#!/usr/bin/env bash

EXPORT_ID="vath-society-quests"
TITLE="Vath Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Vath Quests"
)

PRIMARY_FACET_ID="vath"
PRIMARY_FACET_NAME="Vath"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="vath-society-quests"
COLLECTION_TITLE="Vath Society Quests"
COLLECTION_DESCRIPTION="The complete Vath society quest collection."
COLLECTION_SORT_ORDER="6180"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"