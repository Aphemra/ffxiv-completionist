#!/usr/bin/env bash

EXPORT_ID="all-saints-wake-events"
TITLE="All Saints' Wake Events"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Seasonal Events"
)

JOURNAL_GENRES=(
  "All Saints' Wake Events"
)

PRIMARY_FACET_ID="all-saints-wake"
PRIMARY_FACET_NAME="All Saints' Wake"

SECONDARY_FACET_ID="all-all-saints-wake-events"
SECONDARY_FACET_NAME="All All Saints' Wake Events"

COLLECTION_ID="all-saints-wake-events"
COLLECTION_TITLE="All Saints' Wake Events"
COLLECTION_DESCRIPTION="All Saints' Wake seasonal quests from every available event year."
COLLECTION_SORT_ORDER="10000"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"