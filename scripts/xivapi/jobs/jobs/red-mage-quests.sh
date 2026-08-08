#!/usr/bin/env bash

EXPORT_ID="red-mage-job-quests"
TITLE="Red Mage Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Red Mage Quests"
)

PRIMARY_FACET_ID="magical-ranged-dps"
PRIMARY_FACET_NAME="Magical Ranged DPS"

SECONDARY_FACET_ID="red-mage"
SECONDARY_FACET_NAME="Red Mage"

COLLECTION_ID="red-mage-job-quests"
COLLECTION_TITLE="Red Mage Quests"
COLLECTION_DESCRIPTION="The complete Red Mage job questline."
COLLECTION_SORT_ORDER="2140"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"