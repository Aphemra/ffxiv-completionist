#!/usr/bin/env bash

EXPORT_ID="crystalline-mean-crafting-quests"
TITLE="Facet of Crafting Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Crystalline Mean Quests"
)

JOURNAL_GENRES=(
  "Facet of Crafting Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="facet-of-crafting"
SECONDARY_FACET_NAME="Facet of Crafting"

COLLECTION_ID="crystalline-mean-crafting-quests"
COLLECTION_TITLE="Facet of Crafting Quests"
COLLECTION_DESCRIPTION="The Crystalline Mean Facet of Crafting questline."
COLLECTION_SORT_ORDER="4300"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"