#!/usr/bin/env bash

EXPORT_ID="anima-weapons"
TITLE="Anima Weapon Quests"

CATEGORY="relic"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Weapon Enhancement Sidequests"
)

JOURNAL_GENRES=(
  "Anima Weapons"
)

PRIMARY_FACET_ID="anima-weapons"
PRIMARY_FACET_NAME="Anima Weapons"

SECONDARY_FACET_ID="all-stages"
SECONDARY_FACET_NAME="All Stages"

COLLECTION_ID="anima-weapons"
COLLECTION_TITLE="Anima Weapons"
COLLECTION_DESCRIPTION="The complete Anima weapon quest collection."
COLLECTION_SORT_ORDER="9010"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"