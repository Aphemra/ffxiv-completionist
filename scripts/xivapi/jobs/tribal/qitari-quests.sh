#!/usr/bin/env bash

EXPORT_ID="qitari-society-quests"
TITLE="Qitari Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Qitari Quests"
)

PRIMARY_FACET_ID="qitari"
PRIMARY_FACET_NAME="Qitari"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="qitari-society-quests"
COLLECTION_TITLE="Qitari Society Quests"
COLLECTION_DESCRIPTION="The complete Qitari society quest collection."
COLLECTION_SORT_ORDER="6140"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"