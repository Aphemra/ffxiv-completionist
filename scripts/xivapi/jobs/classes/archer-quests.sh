#!/usr/bin/env bash

EXPORT_ID="archer-class-quests"
TITLE="Archer Quests"

CATEGORY="class"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Archer Quests"
)

STARTING_CLASS_JOB_ID="archer"
STARTING_CLASS_ROUTE_ROWS="65557,65603"
NONSTARTING_CLASS_ROUTE_ROWS="65667,65755,65670"

PRIMARY_FACET_ID="physical-ranged-dps"
PRIMARY_FACET_NAME="Physical Ranged DPS"

SECONDARY_FACET_ID="archer"
SECONDARY_FACET_NAME="Archer"

COLLECTION_ID="archer-class-quests"
COLLECTION_TITLE="Archer Quests"
COLLECTION_DESCRIPTION="The complete Archer class questline."
COLLECTION_SORT_ORDER="1010"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"