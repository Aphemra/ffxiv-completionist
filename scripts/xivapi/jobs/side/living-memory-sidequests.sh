#!/usr/bin/env bash

EXPORT_ID="living-memory-sidequests"
TITLE="Living Memory Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Unlost World Sidequests"
)

PRIMARY_FACET_ID="unlost-world"
PRIMARY_FACET_NAME="Unlost World"

SECONDARY_FACET_ID="living-memory"
SECONDARY_FACET_NAME="Living Memory"

COLLECTION_ID="living-memory-sidequests"
COLLECTION_TITLE="Living Memory Sidequests"
COLLECTION_DESCRIPTION="Side quests found throughout Living Memory."

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"