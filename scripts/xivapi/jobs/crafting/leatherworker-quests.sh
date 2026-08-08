#!/usr/bin/env bash

EXPORT_ID="leatherworker-quests"
TITLE="Leatherworker Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Leatherworker Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="leatherworker"
SECONDARY_FACET_NAME="Leatherworker"

COLLECTION_ID="leatherworker-quests"
COLLECTION_TITLE="Leatherworker Quests"
COLLECTION_DESCRIPTION="The complete Leatherworker crafting questline."
COLLECTION_SORT_ORDER="4060"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"