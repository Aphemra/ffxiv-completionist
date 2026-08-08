#!/usr/bin/env bash

EXPORT_ID="pandemonium-quests"
TITLE="Pandæmonium Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - Pandæmonium"
)

JOURNAL_GENRES=(
  "Pandæmonium"
  "Pandæmonium: Epilogue"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="pandemonium"
SECONDARY_FACET_NAME="Pandæmonium"

COLLECTION_ID="pandemonium-quests"
COLLECTION_TITLE="Pandæmonium Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for Pandæmonium, including its epilogue."
COLLECTION_SORT_ORDER="12090"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"