#!/usr/bin/env bash

EXPORT_ID="culinarian-quests"
TITLE="Culinarian Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Culinarian Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="culinarian"
SECONDARY_FACET_NAME="Culinarian"

COLLECTION_ID="culinarian-quests"
COLLECTION_TITLE="Culinarian Quests"
COLLECTION_DESCRIPTION="The complete Culinarian crafting questline."
COLLECTION_SORT_ORDER="4040"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"