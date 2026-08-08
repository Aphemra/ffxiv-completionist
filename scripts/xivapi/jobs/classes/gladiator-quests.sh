#!/usr/bin/env bash

EXPORT_ID="gladiator-class-quests"
TITLE="Gladiator Quests"

CATEGORY="class"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Gladiator Quests"
)

STARTING_CLASS_JOB_ID="gladiator"
STARTING_CLASS_ROUTE_ROWS="65789,65797"
NONSTARTING_CLASS_ROUTE_ROWS="65821,65822,65824"

PRIMARY_FACET_ID="tank"
PRIMARY_FACET_NAME="Tank"

SECONDARY_FACET_ID="gladiator"
SECONDARY_FACET_NAME="Gladiator"

COLLECTION_ID="gladiator-class-quests"
COLLECTION_TITLE="Gladiator Quests"
COLLECTION_DESCRIPTION="The complete Gladiator class questline."
COLLECTION_SORT_ORDER="1030"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"