#!/usr/bin/env bash

EXPORT_ID="studium-archaeology-quests"
TITLE="Faculty of Archaeology Quests"

CATEGORY="gathering"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Studium Quests"
)

JOURNAL_GENRES=(
  "Faculty of Archaeology Quests"
)

PRIMARY_FACET_ID="gathering"
PRIMARY_FACET_NAME="Gathering"

SECONDARY_FACET_ID="faculty-of-archaeology"
SECONDARY_FACET_NAME="Faculty of Archaeology"

COLLECTION_ID="studium-archaeology-quests"
COLLECTION_TITLE="Faculty of Archaeology Quests"
COLLECTION_DESCRIPTION="The Studium Faculty of Archaeology questline."
COLLECTION_SORT_ORDER="4430"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"