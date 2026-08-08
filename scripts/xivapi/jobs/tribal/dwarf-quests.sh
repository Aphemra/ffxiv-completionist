#!/usr/bin/env bash

EXPORT_ID="dwarf-society-quests"
TITLE="Dwarf Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Dwarf Quests"
)

PRIMARY_FACET_ID="dwarf"
PRIMARY_FACET_NAME="Dwarf"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="dwarf-society-quests"
COLLECTION_TITLE="Dwarf Society Quests"
COLLECTION_DESCRIPTION="The complete Dwarf society quest collection."
COLLECTION_SORT_ORDER="6030"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"