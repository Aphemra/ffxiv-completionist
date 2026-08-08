#!/usr/bin/env bash

EXPORT_ID="island-sanctuary-quests"
TITLE="Island Sanctuary Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Island Sanctuary Quests"
)

PRIMARY_FACET_ID="island-sanctuary"
PRIMARY_FACET_NAME="Island Sanctuary"

SECONDARY_FACET_ID="island-sanctuary-story"
SECONDARY_FACET_NAME="Sanctuary Story"

COLLECTION_ID="island-sanctuary-quests"
COLLECTION_TITLE="Island Sanctuary Quests"
COLLECTION_DESCRIPTION="Quests following the development of the Island Sanctuary."
COLLECTION_SORT_ORDER="13080"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"