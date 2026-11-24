#!/usr/bin/env bash

EXPORT_ID="beastmaster-job-quests"
TITLE="Beastmaster Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Beastmaster Quests"
)

PRIMARY_FACET_ID="melee-dps"
PRIMARY_FACET_NAME="Melee DPS"

SECONDARY_FACET_ID="beastmaster"
SECONDARY_FACET_NAME="Beastmaster"

COLLECTION_ID="beastmaster-job-quests"
COLLECTION_TITLE="Beastmaster Quests"
COLLECTION_DESCRIPTION="The complete Beastmaster job questline."
COLLECTION_SORT_ORDER="2011"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"