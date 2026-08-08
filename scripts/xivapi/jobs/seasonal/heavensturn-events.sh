#!/usr/bin/env bash

EXPORT_ID="heavensturn-events"
TITLE="Heavensturn Events"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Seasonal Events"
)

JOURNAL_GENRES=(
  "Heavensturn Events"
)

PRIMARY_FACET_ID="heavensturn"
PRIMARY_FACET_NAME="Heavensturn"

SECONDARY_FACET_ID="all-heavensturn-events"
SECONDARY_FACET_NAME="All Heavensturn Events"

COLLECTION_ID="heavensturn-events"
COLLECTION_TITLE="Heavensturn Events"
COLLECTION_DESCRIPTION="Heavensturn seasonal quests from every available event year."
COLLECTION_SORT_ORDER="10030"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"