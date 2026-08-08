#!/usr/bin/env bash

EXPORT_ID="dawntrail-shared-role-quests"
TITLE="Dawntrail Shared Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_GENRES=(
  "Role Quests (Dawntrail)"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="all-roles"
SECONDARY_FACET_NAME="All Roles"

COLLECTION_ID="dawntrail-shared-role-quests"
COLLECTION_TITLE="Dawntrail Shared Role Quests"
COLLECTION_DESCRIPTION="The shared introduction and finale quests for Dawntrail role quests."
COLLECTION_SORT_ORDER="3160"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"