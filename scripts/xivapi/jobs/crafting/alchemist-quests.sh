#!/usr/bin/env bash

EXPORT_ID="alchemist-quests"
TITLE="Alchemist Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Alchemist Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="alchemist"
SECONDARY_FACET_NAME="Alchemist"

COLLECTION_ID="alchemist-quests"
COLLECTION_TITLE="Alchemist Quests"
COLLECTION_DESCRIPTION="The complete Alchemist crafting questline."
COLLECTION_SORT_ORDER="4000"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"