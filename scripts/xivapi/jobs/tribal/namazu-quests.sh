#!/usr/bin/env bash

EXPORT_ID="namazu-society-quests"
TITLE="Namazu Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Namazu Quests"
)

PRIMARY_FACET_ID="namazu"
PRIMARY_FACET_NAME="Namazu"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="namazu-society-quests"
COLLECTION_TITLE="Namazu Society Quests"
COLLECTION_DESCRIPTION="The complete Namazu society quest collection."
COLLECTION_SORT_ORDER="6100"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"