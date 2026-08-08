#!/usr/bin/env bash

EXPORT_ID="manderville-weapons"
TITLE="Manderville Weapon Quests"

CATEGORY="relic"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Hildibrand Sidequests"
)

JOURNAL_GENRES=(
  "Manderville Weapons"
)

PRIMARY_FACET_ID="manderville-weapons"
PRIMARY_FACET_NAME="Manderville Weapons"

SECONDARY_FACET_ID="all-stages"
SECONDARY_FACET_NAME="All Stages"

COLLECTION_ID="manderville-weapons"
COLLECTION_TITLE="Manderville Weapons"
COLLECTION_DESCRIPTION="The complete Manderville weapon quest collection."
COLLECTION_SORT_ORDER="9050"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"