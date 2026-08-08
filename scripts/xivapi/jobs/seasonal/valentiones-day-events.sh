#!/usr/bin/env bash

EXPORT_ID="valentiones-day-events"
TITLE="Valentione's Day Events"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Seasonal Events"
)

JOURNAL_GENRES=(
  "Valentione's Day Events"
)

PRIMARY_FACET_ID="valentiones-day"
PRIMARY_FACET_NAME="Valentione's Day"

SECONDARY_FACET_ID="all-valentiones-day-events"
SECONDARY_FACET_NAME="All Valentione's Day Events"

COLLECTION_ID="valentiones-day-events"
COLLECTION_TITLE="Valentione's Day Events"
COLLECTION_DESCRIPTION="Valentione's Day seasonal quests from every available event year."
COLLECTION_SORT_ORDER="10100"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"