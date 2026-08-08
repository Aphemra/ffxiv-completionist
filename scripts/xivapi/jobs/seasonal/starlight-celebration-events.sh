#!/usr/bin/env bash

EXPORT_ID="starlight-celebration-events"
TITLE="Starlight Celebration Events"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Seasonal Events"
)

JOURNAL_GENRES=(
  "Starlight Celebration Events"
)

PRIMARY_FACET_ID="starlight-celebration"
PRIMARY_FACET_NAME="Starlight Celebration"

SECONDARY_FACET_ID="all-starlight-celebration-events"
SECONDARY_FACET_NAME="All Starlight Celebration Events"

COLLECTION_ID="starlight-celebration-events"
COLLECTION_TITLE="Starlight Celebration Events"
COLLECTION_DESCRIPTION="Starlight Celebration seasonal quests from every available event year."
COLLECTION_SORT_ORDER="10080"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"