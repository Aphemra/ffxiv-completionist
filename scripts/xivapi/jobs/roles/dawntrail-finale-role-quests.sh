#!/usr/bin/env bash

EXPORT_ID="dawntrail-finale-role-quests"
TITLE="Dawntrail Finale Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Role Quests (Dawntrail)"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="all-roles"
SECONDARY_FACET_NAME="All Roles"

COLLECTION_ID="dawntrail-finale-role-quests"
COLLECTION_TITLE="Dawntrail Finale Role Quests"
COLLECTION_DESCRIPTION="The Dawntrail finale role questline."
COLLECTION_SORT_ORDER="3160"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"