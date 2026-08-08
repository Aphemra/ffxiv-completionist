#!/usr/bin/env bash

EXPORT_ID="endwalker-finale-role-quests"
TITLE="Endwalker Finale Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Role Quests (Endwalker)"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="all-roles"
SECONDARY_FACET_NAME="All Roles"

COLLECTION_ID="endwalker-finale-role-quests"
COLLECTION_TITLE="Endwalker Finale Role Quests"
COLLECTION_DESCRIPTION="The Endwalker finale role questline."
COLLECTION_SORT_ORDER="3100"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"