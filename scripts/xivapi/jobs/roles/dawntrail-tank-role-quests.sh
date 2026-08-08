#!/usr/bin/env bash

EXPORT_ID="dawntrail-tank-role-quests"
TITLE="Dawntrail Tank Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Tank Role Quests (Dawntrail)"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="tank"
SECONDARY_FACET_NAME="Tank"

COLLECTION_ID="dawntrail-tank-role-quests"
COLLECTION_TITLE="Dawntrail Tank Role Quests"
COLLECTION_DESCRIPTION="The Dawntrail Tank role questline."
COLLECTION_SORT_ORDER="3150"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"