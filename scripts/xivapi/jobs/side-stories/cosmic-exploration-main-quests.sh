#!/usr/bin/env bash

EXPORT_ID="cosmic-exploration-main-quests"
TITLE="Cosmic Exploration Main Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Cosmic Exploration Main Quests"
)

PRIMARY_FACET_ID="cosmic-exploration"
PRIMARY_FACET_NAME="Cosmic Exploration"

SECONDARY_FACET_ID="cosmic-exploration-main"
SECONDARY_FACET_NAME="Main Quests"

COLLECTION_ID="cosmic-exploration-main-quests"
COLLECTION_TITLE="Cosmic Exploration Main Quests"
COLLECTION_DESCRIPTION="Main quests associated with Cosmic Exploration."
COLLECTION_SORT_ORDER="13000"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"