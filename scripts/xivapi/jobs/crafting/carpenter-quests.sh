#!/usr/bin/env bash

EXPORT_ID="carpenter-quests"
TITLE="Carpenter Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Carpenter Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="carpenter"
SECONDARY_FACET_NAME="Carpenter"

COLLECTION_ID="carpenter-quests"
COLLECTION_TITLE="Carpenter Quests"
COLLECTION_DESCRIPTION="The complete Carpenter crafting questline."
COLLECTION_SORT_ORDER="4030"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"