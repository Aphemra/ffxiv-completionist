#!/usr/bin/env bash

EXPORT_ID="palace-of-the-dead-quests"
TITLE="Palace of the Dead Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Palace of the Dead"
)

PRIMARY_FACET_ID="deep-dungeons"
PRIMARY_FACET_NAME="Deep Dungeons"

SECONDARY_FACET_ID="palace-of-the-dead"
SECONDARY_FACET_NAME="Palace of the Dead"

COLLECTION_ID="palace-of-the-dead-quests"
COLLECTION_TITLE="Palace of the Dead"
COLLECTION_DESCRIPTION="Quests associated with the Palace of the Dead deep dungeon."
COLLECTION_SORT_ORDER="13090"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"