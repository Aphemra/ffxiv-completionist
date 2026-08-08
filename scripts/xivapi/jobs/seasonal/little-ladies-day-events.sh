#!/usr/bin/env bash

EXPORT_ID="little-ladies-day-events"
TITLE="Little Ladies' Day Events"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Seasonal Events"
)

JOURNAL_GENRES=(
  "Little Ladies' Day Events"
)

PRIMARY_FACET_ID="little-ladies-day"
PRIMARY_FACET_NAME="Little Ladies' Day"

SECONDARY_FACET_ID="all-little-ladies-day-events"
SECONDARY_FACET_NAME="All Little Ladies' Day Events"

COLLECTION_ID="little-ladies-day-events"
COLLECTION_TITLE="Little Ladies' Day Events"
COLLECTION_DESCRIPTION="Little Ladies' Day seasonal quests from every available event year."
COLLECTION_SORT_ORDER="10050"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"