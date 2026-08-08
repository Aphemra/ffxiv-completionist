#!/usr/bin/env bash

EXPORT_ID="shadowbringers-physical-dps-role-quests"
TITLE="Shadowbringers Physical DPS Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Physical DPS Role Quests (Shadowbringers)"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="physical-dps"
SECONDARY_FACET_NAME="Physical DPS"

COLLECTION_ID="shadowbringers-physical-dps-role-quests"
COLLECTION_TITLE="Shadowbringers Physical DPS Role Quests"
COLLECTION_DESCRIPTION="The Shadowbringers Physical DPS role questline."
COLLECTION_SORT_ORDER="3000"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"