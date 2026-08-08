#!/usr/bin/env bash

EXPORT_ID="shadowbringers-healer-role-quests"
TITLE="Shadowbringers Healer Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Healer Role Quests (Shadowbringers)"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="healer"
SECONDARY_FACET_NAME="Healer"

COLLECTION_ID="shadowbringers-healer-role-quests"
COLLECTION_TITLE="Shadowbringers Healer Role Quests"
COLLECTION_DESCRIPTION="The Shadowbringers Healer role questline."
COLLECTION_SORT_ORDER="3020"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"