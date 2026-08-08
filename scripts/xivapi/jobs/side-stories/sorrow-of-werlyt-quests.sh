#!/usr/bin/env bash

EXPORT_ID="sorrow-of-werlyt-quests"
TITLE="The Sorrow of Werlyt Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - The Sorrow of Werlyt"
)

JOURNAL_GENRES=(
  "Garlemald's Machinations"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="sorrow-of-werlyt"
SECONDARY_FACET_NAME="The Sorrow of Werlyt"

COLLECTION_ID="sorrow-of-werlyt-quests"
COLLECTION_TITLE="The Sorrow of Werlyt Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for the Sorrow of Werlyt."
COLLECTION_SORT_ORDER="12130"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"