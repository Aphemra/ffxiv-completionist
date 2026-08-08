#!/usr/bin/env bash

EXPORT_ID="blacksmith-quests"
TITLE="Blacksmith Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Blacksmith Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="blacksmith"
SECONDARY_FACET_NAME="Blacksmith"

COLLECTION_ID="blacksmith-quests"
COLLECTION_TITLE="Blacksmith Quests"
COLLECTION_DESCRIPTION="The complete Blacksmith crafting questline."
COLLECTION_SORT_ORDER="4020"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"