#!/usr/bin/env bash

EXPORT_ID="paladin-job-quests"
TITLE="Paladin Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Paladin Quests"
)

PRIMARY_FACET_ID="tank"
PRIMARY_FACET_NAME="Tank"

SECONDARY_FACET_ID="paladin"
SECONDARY_FACET_NAME="Paladin"

COLLECTION_ID="paladin-job-quests"
COLLECTION_TITLE="Paladin Quests"
COLLECTION_DESCRIPTION="The complete Paladin job questline."
COLLECTION_SORT_ORDER="2110"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"