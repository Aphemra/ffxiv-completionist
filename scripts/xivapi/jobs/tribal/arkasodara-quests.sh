#!/usr/bin/env bash

EXPORT_ID="arkasodara-society-quests"
TITLE="Arkasodara Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Arkasodara Quests"
)

PRIMARY_FACET_ID="arkasodara"
PRIMARY_FACET_NAME="Arkasodara"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="arkasodara-society-quests"
COLLECTION_TITLE="Arkasodara Society Quests"
COLLECTION_DESCRIPTION="The complete Arkasodara society quest collection."
COLLECTION_SORT_ORDER="6020"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"