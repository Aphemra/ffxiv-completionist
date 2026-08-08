#!/usr/bin/env bash

EXPORT_ID="shadowbringers-tank-role-quests"
TITLE="Shadowbringers Tank Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Tank Role Quests (Shadowbringers)"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="tank"
SECONDARY_FACET_NAME="Tank"

COLLECTION_ID="shadowbringers-tank-role-quests"
COLLECTION_TITLE="Shadowbringers Tank Role Quests"
COLLECTION_DESCRIPTION="The Shadowbringers Tank role questline."
COLLECTION_SORT_ORDER="3030"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"