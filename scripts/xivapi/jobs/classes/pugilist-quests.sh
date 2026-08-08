#!/usr/bin/env bash

EXPORT_ID="pugilist-class-quests"
TITLE="Pugilist Quests"

CATEGORY="class"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Pugilist Quests"
)

PRIMARY_FACET_ID="melee-dps"
PRIMARY_FACET_NAME="Melee DPS"

SECONDARY_FACET_ID="pugilist"
SECONDARY_FACET_NAME="Pugilist"

COLLECTION_ID="pugilist-class-quests"
COLLECTION_TITLE="Pugilist Quests"
COLLECTION_DESCRIPTION="The complete Pugilist class questline."
COLLECTION_SORT_ORDER="1060"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"