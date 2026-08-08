#!/usr/bin/env bash

EXPORT_ID="arcanist-class-quests"
TITLE="Arcanist Quests"

CATEGORY="class"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Arcanist Quests"
)

STARTING_CLASS_JOB_ID="arcanist"
STARTING_CLASS_ROUTE_ROWS="65989,65992"
NONSTARTING_CLASS_ROUTE_ROWS="65988,65990,65993"

PRIMARY_FACET_ID="magical-ranged-dps"
PRIMARY_FACET_NAME="Magical Ranged DPS"

SECONDARY_FACET_ID="arcanist"
SECONDARY_FACET_NAME="Arcanist"

COLLECTION_ID="arcanist-class-quests"
COLLECTION_TITLE="Arcanist Quests"
COLLECTION_DESCRIPTION="The complete Arcanist class questline."
COLLECTION_SORT_ORDER="1000"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"