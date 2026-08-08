#!/usr/bin/env bash

EXPORT_ID="dawntrail-healer-role-quests"
TITLE="Dawntrail Healer Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Healer Role Quests (Dawntrail)"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="healer"
SECONDARY_FACET_NAME="Healer"

COLLECTION_ID="dawntrail-healer-role-quests"
COLLECTION_TITLE="Dawntrail Healer Role Quests"
COLLECTION_DESCRIPTION="The Dawntrail Healer role questline."
COLLECTION_SORT_ORDER="3140"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"