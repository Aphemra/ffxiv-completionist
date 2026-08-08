#!/usr/bin/env bash

EXPORT_ID="four-lords-quests"
TITLE="The Four Lords Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - The Four Lords"
)

JOURNAL_GENRES=(
  "The Four Lords"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="four-lords"
SECONDARY_FACET_NAME="The Four Lords"

COLLECTION_ID="four-lords-quests"
COLLECTION_TITLE="The Four Lords Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for the Four Lords."
COLLECTION_SORT_ORDER="12060"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"