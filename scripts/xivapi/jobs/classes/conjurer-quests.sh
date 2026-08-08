#!/usr/bin/env bash

EXPORT_ID="conjurer-class-quests"
TITLE="Conjurer Quests"

CATEGORY="class"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Conjurer Quests"
)

STARTING_CLASS_JOB_ID="conjurer"
STARTING_CLASS_ROUTE_ROWS="65558,65627"
NONSTARTING_CLASS_ROUTE_ROWS="65669,65747,65683"

PRIMARY_FACET_ID="healer"
PRIMARY_FACET_NAME="Healer"

SECONDARY_FACET_ID="conjurer"
SECONDARY_FACET_NAME="Conjurer"

COLLECTION_ID="conjurer-class-quests"
COLLECTION_TITLE="Conjurer Quests"
COLLECTION_DESCRIPTION="The complete Conjurer class questline."
COLLECTION_SORT_ORDER="1020"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"