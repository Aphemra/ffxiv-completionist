#!/usr/bin/env bash

EXPORT_ID="pixie-society-quests"
TITLE="Pixie Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Pixie Quests"
)

PRIMARY_FACET_ID="pixie"
PRIMARY_FACET_NAME="Pixie"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="pixie-society-quests"
COLLECTION_TITLE="Pixie Society Quests"
COLLECTION_DESCRIPTION="The complete Pixie society quest collection."
COLLECTION_SORT_ORDER="6130"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"