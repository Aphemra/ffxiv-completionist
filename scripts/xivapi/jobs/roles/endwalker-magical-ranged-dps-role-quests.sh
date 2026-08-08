#!/usr/bin/env bash

EXPORT_ID="endwalker-magical-ranged-dps-role-quests"
TITLE="Endwalker Magical Ranged DPS Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Magical Ranged DPS Role Quests (Endwalker)"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="magical-ranged-dps"
SECONDARY_FACET_NAME="Magical Ranged DPS"

COLLECTION_ID="endwalker-magical-ranged-dps-role-quests"
COLLECTION_TITLE="Endwalker Magical Ranged DPS Role Quests"
COLLECTION_DESCRIPTION="The Endwalker Magical Ranged DPS role questline."
COLLECTION_SORT_ORDER="3070"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"