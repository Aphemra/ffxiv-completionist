#!/usr/bin/env bash

EXPORT_ID="heritage-found-sidequests"
TITLE="Heritage Found Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Xak Tural Sidequests"
)

JOURNAL_GENRES=(
  "Heritage Found Sidequests"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="heritage-found"
SECONDARY_FACET_NAME="Heritage Found"

COLLECTION_ID="heritage-found-sidequests"
COLLECTION_TITLE="Heritage Found Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Heritage Found."
COLLECTION_SORT_ORDER="7410"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"