#!/usr/bin/env bash

EXPORT_ID="old-sharlayan-sidequests"
TITLE="Old Sharlayan Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Sharlayan Sidequests"
)

JOURNAL_GENRES=(
  "Old Sharlayan Sidequests"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="old-sharlayan"
SECONDARY_FACET_NAME="Old Sharlayan"

COLLECTION_ID="old-sharlayan-sidequests"
COLLECTION_TITLE="Old Sharlayan Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Old Sharlayan."
COLLECTION_SORT_ORDER="7290"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"