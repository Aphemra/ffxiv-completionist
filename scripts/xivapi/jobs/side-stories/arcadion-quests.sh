#!/usr/bin/env bash

EXPORT_ID="arcadion-quests"
TITLE="The Arcadion Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - The Arcadion"
)

JOURNAL_GENRES=(
  "The Arcadion"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="arcadion"
SECONDARY_FACET_NAME="The Arcadion"

COLLECTION_ID="arcadion-quests"
COLLECTION_TITLE="The Arcadion Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for the Arcadion."
COLLECTION_SORT_ORDER="12010"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"