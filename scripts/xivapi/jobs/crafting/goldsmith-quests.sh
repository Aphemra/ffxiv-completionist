#!/usr/bin/env bash

EXPORT_ID="goldsmith-quests"
TITLE="Goldsmith Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Goldsmith Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="goldsmith"
SECONDARY_FACET_NAME="Goldsmith"

COLLECTION_ID="goldsmith-quests"
COLLECTION_TITLE="Goldsmith Quests"
COLLECTION_DESCRIPTION="The complete Goldsmith crafting questline."
COLLECTION_SORT_ORDER="4050"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"