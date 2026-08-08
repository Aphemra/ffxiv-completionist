#!/usr/bin/env bash

EXPORT_ID="lancer-class-quests"
TITLE="Lancer Quests"

CATEGORY="class"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Lancer Quests"
)

PRIMARY_FACET_ID="melee-dps"
PRIMARY_FACET_NAME="Melee DPS"

SECONDARY_FACET_ID="lancer"
SECONDARY_FACET_NAME="Lancer"

COLLECTION_ID="lancer-class-quests"
COLLECTION_TITLE="Lancer Quests"
COLLECTION_DESCRIPTION="The complete Lancer class questline."
COLLECTION_SORT_ORDER="1040"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"