#!/usr/bin/env bash

EXPORT_ID="endwalker-healer-role-quests"
TITLE="Endwalker Healer Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Healer Role Quests (Endwalker)"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="healer"
SECONDARY_FACET_NAME="Healer"

COLLECTION_ID="endwalker-healer-role-quests"
COLLECTION_TITLE="Endwalker Healer Role Quests"
COLLECTION_DESCRIPTION="The Endwalker Healer role questline."
COLLECTION_SORT_ORDER="3080"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"