#!/usr/bin/env bash

EXPORT_ID="black-mage-job-quests"
TITLE="Black Mage Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Black Mage Quests"
)

EXCLUDED_QUEST_ROWS="66659"

PRIMARY_FACET_ID="magical-ranged-dps"
PRIMARY_FACET_NAME="Magical Ranged DPS"

SECONDARY_FACET_ID="black-mage"
SECONDARY_FACET_NAME="Black Mage"

COLLECTION_ID="black-mage-job-quests"
COLLECTION_TITLE="Black Mage Quests"
COLLECTION_DESCRIPTION="The complete Black Mage job questline."
COLLECTION_SORT_ORDER="2020"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"