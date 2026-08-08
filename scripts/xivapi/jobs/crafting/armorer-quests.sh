#!/usr/bin/env bash

EXPORT_ID="armorer-quests"
TITLE="Armorer Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Armorer Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="armorer"
SECONDARY_FACET_NAME="Armorer"

COLLECTION_ID="armorer-quests"
COLLECTION_TITLE="Armorer Quests"
COLLECTION_DESCRIPTION="The complete Armorer crafting questline."
COLLECTION_SORT_ORDER="4010"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"