#!/usr/bin/env bash

EXPORT_ID="shadowbringers-finale-role-quests"
TITLE="Shadowbringers Finale Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Role Quests (Shadowbringers)"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="all-roles"
SECONDARY_FACET_NAME="All Roles"

COLLECTION_ID="shadowbringers-finale-role-quests"
COLLECTION_TITLE="Shadowbringers Finale Role Quests"
COLLECTION_DESCRIPTION="The Shadowbringers finale role questline."
COLLECTION_SORT_ORDER="3040"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"