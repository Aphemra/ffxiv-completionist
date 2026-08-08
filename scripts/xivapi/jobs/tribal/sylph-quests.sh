#!/usr/bin/env bash

EXPORT_ID="sylph-society-quests"
TITLE="Sylph Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Sylph Quests"
)

PRIMARY_FACET_ID="sylph"
PRIMARY_FACET_NAME="Sylph"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="sylph-society-quests"
COLLECTION_TITLE="Sylph Society Quests"
COLLECTION_DESCRIPTION="The complete Sylph society quest collection."
COLLECTION_SORT_ORDER="6160"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"