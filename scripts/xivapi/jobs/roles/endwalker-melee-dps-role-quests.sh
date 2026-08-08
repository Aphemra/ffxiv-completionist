#!/usr/bin/env bash

EXPORT_ID="endwalker-melee-dps-role-quests"
TITLE="Endwalker Melee DPS Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Melee DPS Role Quests (Endwalker)"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="melee-dps"
SECONDARY_FACET_NAME="Melee DPS"

COLLECTION_ID="endwalker-melee-dps-role-quests"
COLLECTION_TITLE="Endwalker Melee DPS Role Quests"
COLLECTION_DESCRIPTION="The Endwalker Melee DPS role questline."
COLLECTION_SORT_ORDER="3060"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"