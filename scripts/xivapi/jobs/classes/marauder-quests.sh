#!/usr/bin/env bash

EXPORT_ID="marauder-class-quests"
TITLE="Marauder Quests"

CATEGORY="class"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Marauder Quests"
)

STARTING_CLASS_JOB_ID="marauder"
STARTING_CLASS_ROUTE_ROWS="65847,65850"
NONSTARTING_CLASS_ROUTE_ROWS="65846,65848,65851"

PRIMARY_FACET_ID="tank"
PRIMARY_FACET_NAME="Tank"

SECONDARY_FACET_ID="marauder"
SECONDARY_FACET_NAME="Marauder"

COLLECTION_ID="marauder-class-quests"
COLLECTION_TITLE="Marauder Quests"
COLLECTION_DESCRIPTION="The complete Marauder class questline."
COLLECTION_SORT_ORDER="1050"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"