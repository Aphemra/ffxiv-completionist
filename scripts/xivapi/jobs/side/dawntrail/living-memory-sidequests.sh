#!/usr/bin/env bash

EXPORT_ID="living-memory-sidequests"
TITLE="Living Memory Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Unlost World Sidequests"
)

JOURNAL_GENRES=(
  "Living Memory Sidequests"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="living-memory"
SECONDARY_FACET_NAME="Living Memory"

COLLECTION_ID="living-memory-sidequests"
COLLECTION_TITLE="Living Memory Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Living Memory."
COLLECTION_SORT_ORDER="7430"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"