#!/usr/bin/env bash

EXPORT_ID="dawntrail-magical-ranged-dps-role-quests"
TITLE="Dawntrail Magical Ranged DPS Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Magical Ranged DPS Role Quests (Dawntrail)"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="magical-ranged-dps"
SECONDARY_FACET_NAME="Magical Ranged DPS"

COLLECTION_ID="dawntrail-magical-ranged-dps-role-quests"
COLLECTION_TITLE="Dawntrail Magical Ranged DPS Role Quests"
COLLECTION_DESCRIPTION="The Dawntrail Magical Ranged DPS role questline."
COLLECTION_SORT_ORDER="3130"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"