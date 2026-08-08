#!/usr/bin/env bash

EXPORT_ID="moogle-society-quests"
TITLE="Moogle Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Moogle Quests"
)

PRIMARY_FACET_ID="moogle"
PRIMARY_FACET_NAME="Moogle"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="moogle-society-quests"
COLLECTION_TITLE="Moogle Society Quests"
COLLECTION_DESCRIPTION="The complete Moogle society quest collection."
COLLECTION_SORT_ORDER="6090"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"