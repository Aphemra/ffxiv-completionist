#!/usr/bin/env bash

EXPORT_ID="crystalline-mean-shared-quests"
TITLE="Crystalline Mean Shared Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Crystalline Mean Quests"
)

JOURNAL_GENRES=(
  "Crystalline Mean Quests"
)

PRIMARY_FACET_ID="shared"
PRIMARY_FACET_NAME="Shared Crafting & Gathering"

SECONDARY_FACET_ID="crystalline-mean"
SECONDARY_FACET_NAME="Crystalline Mean"

COLLECTION_ID="crystalline-mean-shared-quests"
COLLECTION_TITLE="Crystalline Mean Shared Quests"
COLLECTION_DESCRIPTION="The shared opening and finale quests for the Crystalline Mean."
COLLECTION_SORT_ORDER="4350"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"