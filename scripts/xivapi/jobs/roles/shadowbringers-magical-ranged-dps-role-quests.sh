#!/usr/bin/env bash

EXPORT_ID="shadowbringers-magical-ranged-dps-role-quests"
TITLE="Shadowbringers Magical Ranged DPS Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Magical Ranged DPS Role Quests (Shadowbringers)"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="magical-ranged-dps"
SECONDARY_FACET_NAME="Magical Ranged DPS"

COLLECTION_ID="shadowbringers-magical-ranged-dps-role-quests"
COLLECTION_TITLE="Shadowbringers Magical Ranged DPS Role Quests"
COLLECTION_DESCRIPTION="The Shadowbringers Magical Ranged DPS role questline."
COLLECTION_SORT_ORDER="3010"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"