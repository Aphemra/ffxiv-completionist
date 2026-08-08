#!/usr/bin/env bash

EXPORT_ID="studium-medicine-quests"
TITLE="Faculty of Medicine Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Studium Quests"
)

JOURNAL_GENRES=(
  "Faculty of Medicine Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="faculty-of-medicine"
SECONDARY_FACET_NAME="Faculty of Medicine"

COLLECTION_ID="studium-medicine-quests"
COLLECTION_TITLE="Faculty of Medicine Quests"
COLLECTION_DESCRIPTION="The Studium Faculty of Medicine questline."
COLLECTION_SORT_ORDER="4420"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"