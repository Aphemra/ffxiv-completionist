#!/usr/bin/env bash

EXPORT_ID="tatarus-grand-endeavor"
TITLE="Tataru's Grand Endeavor"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Side Story Quests"
)

JOURNAL_GENRES=(
  "Tataru's Grand Endeavor"
)

PRIMARY_FACET_ID="side-stories"
PRIMARY_FACET_NAME="Side Stories"

SECONDARY_FACET_ID="tatarus-grand-endeavor"
SECONDARY_FACET_NAME="Tataru's Grand Endeavor"

COLLECTION_ID="tatarus-grand-endeavor"
COLLECTION_TITLE="Tataru's Grand Endeavor"
COLLECTION_DESCRIPTION="Quests following Tataru's ambitious plans and reunions with former allies."
COLLECTION_SORT_ORDER="15030"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"