#!/usr/bin/env bash

EXPORT_ID="blue-mage-job-quests"
TITLE="Blue Mage Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Blue Mage Quests"
)

PRIMARY_FACET_ID="limited job"
PRIMARY_FACET_NAME="limited-job"

SECONDARY_FACET_ID="blue-mage"
SECONDARY_FACET_NAME="Blue Mage"

COLLECTION_ID="blue-mage-job-quests"
COLLECTION_TITLE="Blue Mage Quests"
COLLECTION_DESCRIPTION="The complete Blue Mage job questline."
COLLECTION_SORT_ORDER="2030"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"