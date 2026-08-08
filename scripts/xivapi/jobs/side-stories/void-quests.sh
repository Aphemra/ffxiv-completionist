#!/usr/bin/env bash

EXPORT_ID="void-quests"
TITLE="Void Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Side Story Quests"
)

JOURNAL_GENRES=(
  "Void Quests"
)

PRIMARY_FACET_ID="side-stories"
PRIMARY_FACET_NAME="Side Stories"

SECONDARY_FACET_ID="void-quests"
SECONDARY_FACET_NAME="Void Quests"

COLLECTION_ID="void-quests"
COLLECTION_TITLE="Void Quests"
COLLECTION_DESCRIPTION="Quests concerning the Void and efforts to restore the Thirteenth."
COLLECTION_SORT_ORDER="15040"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"