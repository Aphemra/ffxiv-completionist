#!/usr/bin/env bash

EXPORT_ID="rising-events"
TITLE="The Rising Events"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Seasonal Events"
)

JOURNAL_GENRES=(
  "Rising Events"
)

PRIMARY_FACET_ID="the-rising"
PRIMARY_FACET_NAME="The Rising"

SECONDARY_FACET_ID="all-rising-events"
SECONDARY_FACET_NAME="All The Rising Events"

COLLECTION_ID="rising-events"
COLLECTION_TITLE="The Rising Events"
COLLECTION_DESCRIPTION="The Rising seasonal quests from every available event year."
COLLECTION_SORT_ORDER="10070"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"