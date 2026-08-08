#!/usr/bin/env bash

EXPORT_ID="studium-aetherology-quests"
TITLE="Faculty of Aetherology Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Studium Quests"
)

JOURNAL_GENRES=(
  "Faculty of Aetherology Quests"
)

PRIMARY_FACET_ID="crafting"
PRIMARY_FACET_NAME="Crafting"

SECONDARY_FACET_ID="faculty-of-aetherology"
SECONDARY_FACET_NAME="Faculty of Aetherology"

COLLECTION_ID="studium-aetherology-quests"
COLLECTION_TITLE="Faculty of Aetherology Quests"
COLLECTION_DESCRIPTION="The Studium Faculty of Aetherology questline."
COLLECTION_SORT_ORDER="4400"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"