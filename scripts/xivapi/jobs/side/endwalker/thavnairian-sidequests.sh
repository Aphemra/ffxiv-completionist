#!/usr/bin/env bash

EXPORT_ID="thavnairian-sidequests"
TITLE="Thavnairian Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Thavnairian Sidequests"
)

JOURNAL_GENRES=(
  "Thavnairian Sidequests"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="thavnairian"
SECONDARY_FACET_NAME="Thavnairian"

COLLECTION_ID="thavnairian-sidequests"
COLLECTION_TITLE="Thavnairian Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Thavnair."
COLLECTION_SORT_ORDER="7300"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"