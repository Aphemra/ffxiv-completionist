#!/usr/bin/env bash

EXPORT_ID="white-mage-job-quests"
TITLE="White Mage Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "White Mage Quests"
)

PRIMARY_FACET_ID="healer"
PRIMARY_FACET_NAME="Healer"

SECONDARY_FACET_ID="white-mage"
SECONDARY_FACET_NAME="White Mage"

COLLECTION_ID="white-mage-job-quests"
COLLECTION_TITLE="White Mage Quests"
COLLECTION_DESCRIPTION="The complete White Mage job questline."
COLLECTION_SORT_ORDER="2210"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"