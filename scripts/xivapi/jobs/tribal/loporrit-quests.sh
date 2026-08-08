#!/usr/bin/env bash

EXPORT_ID="loporrit-society-quests"
TITLE="Loporrit Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Loporrit Quests"
)

PRIMARY_FACET_ID="loporrit"
PRIMARY_FACET_NAME="Loporrit"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="loporrit-society-quests"
COLLECTION_TITLE="Loporrit Society Quests"
COLLECTION_DESCRIPTION="The complete Loporrit society quest collection."
COLLECTION_SORT_ORDER="6070"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"