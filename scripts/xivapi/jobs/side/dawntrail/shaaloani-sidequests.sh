#!/usr/bin/env bash

EXPORT_ID="shaaloani-sidequests"
TITLE="Shaaloani Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Xak Tural Sidequests"
)

JOURNAL_GENRES=(
  "Shaaloani Sidequests"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="shaaloani"
SECONDARY_FACET_NAME="Shaaloani"

COLLECTION_ID="shaaloani-sidequests"
COLLECTION_TITLE="Shaaloani Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Shaaloani."
COLLECTION_SORT_ORDER="7400"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"