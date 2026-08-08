#!/usr/bin/env bash

EXPORT_ID="dawntrail-melee-dps-role-quests"
TITLE="Dawntrail Melee DPS Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Melee DPS Role Quests (Dawntrail)"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="melee-dps"
SECONDARY_FACET_NAME="Melee DPS"

COLLECTION_ID="dawntrail-melee-dps-role-quests"
COLLECTION_TITLE="Dawntrail Melee DPS Role Quests"
COLLECTION_DESCRIPTION="The Dawntrail Melee DPS role questline."
COLLECTION_SORT_ORDER="3110"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"