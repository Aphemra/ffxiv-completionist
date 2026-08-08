#!/usr/bin/env bash

EXPORT_ID="collaboration-quests"
TITLE="Collaboration Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Special Quests"
)

JOURNAL_GENRES=(
  "Collaboration Quests"
)

PRIMARY_FACET_ID="special-quests"
PRIMARY_FACET_NAME="Special Quests"

SECONDARY_FACET_ID="collaboration-quests"
SECONDARY_FACET_NAME="Collaboration Quests"

COLLECTION_ID="collaboration-quests"
COLLECTION_TITLE="Collaboration Quests"
COLLECTION_DESCRIPTION="Special quests created as collaborations with other games and franchises."
COLLECTION_SORT_ORDER="16000"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"