#!/usr/bin/env bash

EXPORT_ID="hatching-tide-events"
TITLE="Hatching-tide Events"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Seasonal Events"
)

JOURNAL_GENRES=(
  "Hatching-tide Events"
)

PRIMARY_FACET_ID="hatching-tide"
PRIMARY_FACET_NAME="Hatching-tide"

SECONDARY_FACET_ID="all-hatching-tide-events"
SECONDARY_FACET_NAME="All Hatching-tide Events"

COLLECTION_ID="hatching-tide-events"
COLLECTION_TITLE="Hatching-tide Events"
COLLECTION_DESCRIPTION="Hatching-tide seasonal quests from every available event year."
COLLECTION_SORT_ORDER="10020"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"