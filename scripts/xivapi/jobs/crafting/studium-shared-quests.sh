#!/usr/bin/env bash

EXPORT_ID="studium-shared-quests"
TITLE="Studium Shared Quests"

CATEGORY="crafting"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Studium Quests"
)

JOURNAL_GENRES=(
  "Studium Quests"
)

PRIMARY_FACET_ID="shared"
PRIMARY_FACET_NAME="Shared Crafting & Gathering"

SECONDARY_FACET_ID="studium"
SECONDARY_FACET_NAME="Studium"

COLLECTION_ID="studium-shared-quests"
COLLECTION_TITLE="Studium Shared Quests"
COLLECTION_DESCRIPTION="The shared opening and finale quests for The Studium."
COLLECTION_SORT_ORDER="4450"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"