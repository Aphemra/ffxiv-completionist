#!/usr/bin/env bash

EXPORT_ID="warrior-job-quests"
TITLE="Warrior Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Warrior Quests"
)

PRIMARY_FACET_ID="tank"
PRIMARY_FACET_NAME="Tank"

SECONDARY_FACET_ID="warrior"
SECONDARY_FACET_NAME="Warrior"

COLLECTION_ID="warrior-job-quests"
COLLECTION_TITLE="Warrior Quests"
COLLECTION_DESCRIPTION="The complete Warrior job questline."
COLLECTION_SORT_ORDER="2200"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"