#!/usr/bin/env bash

EXPORT_ID="mamool-ja-society-quests"
TITLE="Mamool Ja Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Mamool Ja Quests"
)

PRIMARY_FACET_ID="mamool-ja"
PRIMARY_FACET_NAME="Mamool Ja"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="mamool-ja-society-quests"
COLLECTION_TITLE="Mamool Ja Society Quests"
COLLECTION_DESCRIPTION="The complete Mamool Ja society quest collection."
COLLECTION_SORT_ORDER="6080"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"