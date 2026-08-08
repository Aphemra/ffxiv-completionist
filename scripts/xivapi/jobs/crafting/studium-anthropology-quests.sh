#!/usr/bin/env bash

EXPORT_ID="studium-anthropology-quests"
TITLE="Faculty of Anthropology Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Studium Quests"
)

JOURNAL_GENRES=(
  "Faculty of Anthropology Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="faculty-of-anthropology"
SECONDARY_FACET_NAME="Faculty of Anthropology"

COLLECTION_ID="studium-anthropology-quests"
COLLECTION_TITLE="Faculty of Anthropology Quests"
COLLECTION_DESCRIPTION="The Studium Faculty of Anthropology questline."
COLLECTION_SORT_ORDER="4410"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"