#!/usr/bin/env bash

EXPORT_ID="rogue-class-quests"
TITLE="Rogue Quests"

CATEGORY="class"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Rogue Quests"
)

PRIMARY_FACET_ID="melee-dps"
PRIMARY_FACET_NAME="Melee DPS"

SECONDARY_FACET_ID="rogue"
SECONDARY_FACET_NAME="Rogue"

COLLECTION_ID="rogue-class-quests"
COLLECTION_TITLE="Rogue Quests"
COLLECTION_DESCRIPTION="The complete Rogue class questline."
COLLECTION_SORT_ORDER="1070"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"