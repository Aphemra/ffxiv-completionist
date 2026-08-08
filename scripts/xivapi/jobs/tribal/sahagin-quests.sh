#!/usr/bin/env bash

EXPORT_ID="sahagin-society-quests"
TITLE="Sahagin Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Sahagin Quests"
)

PRIMARY_FACET_ID="sahagin"
PRIMARY_FACET_NAME="Sahagin"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="sahagin-society-quests"
COLLECTION_TITLE="Sahagin Society Quests"
COLLECTION_DESCRIPTION="The complete Sahagin society quest collection."
COLLECTION_SORT_ORDER="6150"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"