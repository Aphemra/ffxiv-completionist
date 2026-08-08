#!/usr/bin/env bash

EXPORT_ID="delivery-moogle-quests"
TITLE="Delivery Moogle Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Side Story Quests"
)

JOURNAL_GENRES=(
  "Delivery Moogle Quests"
)

PRIMARY_FACET_ID="side-stories"
PRIMARY_FACET_NAME="Side Stories"

SECONDARY_FACET_ID="delivery-moogle"
SECONDARY_FACET_NAME="Delivery Moogle"

COLLECTION_ID="delivery-moogle-quests"
COLLECTION_TITLE="Delivery Moogle Quests"
COLLECTION_DESCRIPTION="Quests completed while serving as a deputy postmoogle."
COLLECTION_SORT_ORDER="15000"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"