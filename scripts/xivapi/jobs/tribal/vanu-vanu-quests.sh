#!/usr/bin/env bash

EXPORT_ID="vanu-vanu-society-quests"
TITLE="Vanu Vanu Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Vanu Vanu Quests"
)

PRIMARY_FACET_ID="vanu-vanu"
PRIMARY_FACET_NAME="Vanu Vanu"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="vanu-vanu-society-quests"
COLLECTION_TITLE="Vanu Vanu Society Quests"
COLLECTION_DESCRIPTION="The complete Vanu Vanu society quest collection."
COLLECTION_SORT_ORDER="6170"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"