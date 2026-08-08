#!/usr/bin/env bash

EXPORT_ID="moonfire-faire-events"
TITLE="Moonfire Faire Events"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Seasonal Events"
)

JOURNAL_GENRES=(
  "Moonfire Faire Events"
)

PRIMARY_FACET_ID="moonfire-faire"
PRIMARY_FACET_NAME="Moonfire Faire"

SECONDARY_FACET_ID="all-moonfire-faire-events"
SECONDARY_FACET_NAME="All Moonfire Faire Events"

COLLECTION_ID="moonfire-faire-events"
COLLECTION_TITLE="Moonfire Faire Events"
COLLECTION_DESCRIPTION="Moonfire Faire seasonal quests from every available event year."
COLLECTION_SORT_ORDER="10060"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"