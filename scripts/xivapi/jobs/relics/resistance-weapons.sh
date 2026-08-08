#!/usr/bin/env bash

EXPORT_ID="resistance-weapons"
TITLE="Resistance Weapon Quests"

CATEGORY="relic"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Weapon Enhancement Sidequests"
)

JOURNAL_GENRES=(
  "Resistance Weapons"
)

PRIMARY_FACET_ID="resistance-weapons"
PRIMARY_FACET_NAME="Resistance Weapons"

SECONDARY_FACET_ID="all-stages"
SECONDARY_FACET_NAME="All Stages"

COLLECTION_ID="resistance-weapons"
COLLECTION_TITLE="Resistance Weapons"
COLLECTION_DESCRIPTION="The complete Resistance weapon quest collection."
COLLECTION_SORT_ORDER="9030"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"