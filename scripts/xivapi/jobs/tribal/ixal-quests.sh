#!/usr/bin/env bash

EXPORT_ID="ixal-society-quests"
TITLE="Ixal Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Ixal Quests"
)

PRIMARY_FACET_ID="ixal"
PRIMARY_FACET_NAME="Ixal"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="ixal-society-quests"
COLLECTION_TITLE="Ixal Society Quests"
COLLECTION_DESCRIPTION="The complete Ixal society quest collection."
COLLECTION_SORT_ORDER="6040"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"