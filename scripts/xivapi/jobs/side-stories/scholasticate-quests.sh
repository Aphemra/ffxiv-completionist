#!/usr/bin/env bash

EXPORT_ID="scholasticate-quests"
TITLE="Scholasticate Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Side Story Quests"
)

JOURNAL_GENRES=(
  "Scholasticate Quests"
)

PRIMARY_FACET_ID="side-stories"
PRIMARY_FACET_NAME="Side Stories"

SECONDARY_FACET_ID="scholasticate"
SECONDARY_FACET_NAME="The Scholasticate"

COLLECTION_ID="scholasticate-quests"
COLLECTION_TITLE="Scholasticate Quests"
COLLECTION_DESCRIPTION="Quests concerning the students and faculty of Saint Endalim's Scholasticate."
COLLECTION_SORT_ORDER="15010"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"