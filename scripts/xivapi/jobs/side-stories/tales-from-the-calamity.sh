#!/usr/bin/env bash

EXPORT_ID="tales-from-the-calamity"
TITLE="Tales from the Calamity"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Side Story Quests"
)

JOURNAL_GENRES=(
  "Tales from the Calamity"
)

PRIMARY_FACET_ID="side-stories"
PRIMARY_FACET_NAME="Side Stories"

SECONDARY_FACET_ID="tales-from-the-calamity"
SECONDARY_FACET_NAME="Tales from the Calamity"

COLLECTION_ID="tales-from-the-calamity"
COLLECTION_TITLE="Tales from the Calamity"
COLLECTION_DESCRIPTION="Stories exploring the lingering consequences of the Seventh Umbral Calamity."
COLLECTION_SORT_ORDER="15020"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"