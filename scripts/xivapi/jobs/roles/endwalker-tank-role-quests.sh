#!/usr/bin/env bash

EXPORT_ID="endwalker-tank-role-quests"
TITLE="Endwalker Tank Role Quests"

CATEGORY="role"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Tank Role Quests (Endwalker)"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="tank"
SECONDARY_FACET_NAME="Tank"

COLLECTION_ID="endwalker-tank-role-quests"
COLLECTION_TITLE="Endwalker Tank Role Quests"
COLLECTION_DESCRIPTION="The Endwalker Tank role questline."
COLLECTION_SORT_ORDER="3090"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"