#!/usr/bin/env bash

EXPORT_ID="omega-quests"
TITLE="Omega Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - Omega"
)

JOURNAL_GENRES=(
  "Omega Quests"
  "Omega: Beyond the Rift"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="omega"
SECONDARY_FACET_NAME="Omega"

COLLECTION_ID="omega-quests"
COLLECTION_TITLE="Omega Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for Omega, including Beyond the Rift."
COLLECTION_SORT_ORDER="12080"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"