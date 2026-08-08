#!/usr/bin/env bash

EXPORT_ID="dawntrail-physical-ranged-dps-role-quests"
TITLE="Dawntrail Physical Ranged DPS Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Physical Ranged DPS Role Quests (Dawntrail)"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="physical-ranged-dps"
SECONDARY_FACET_NAME="Physical Ranged DPS"

COLLECTION_ID="dawntrail-physical-ranged-dps-role-quests"
COLLECTION_TITLE="Dawntrail Physical Ranged DPS Role Quests"
COLLECTION_DESCRIPTION="The Dawntrail Physical Ranged DPS role questline."
COLLECTION_SORT_ORDER="3120"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"