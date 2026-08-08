#!/usr/bin/env bash

EXPORT_ID="phantom-weapons"
TITLE="Phantom Weapon Quests"

CATEGORY="relic"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Weapon Enhancement Sidequests"
)

JOURNAL_GENRES=(
  "Phantom Weapons"
)

PRIMARY_FACET_ID="phantom-weapons"
PRIMARY_FACET_NAME="Phantom Weapons"

SECONDARY_FACET_ID="all-stages"
SECONDARY_FACET_NAME="All Stages"

COLLECTION_ID="phantom-weapons"
COLLECTION_TITLE="Phantom Weapons"
COLLECTION_DESCRIPTION="The complete Phantom weapon quest collection."
COLLECTION_SORT_ORDER="9040"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"