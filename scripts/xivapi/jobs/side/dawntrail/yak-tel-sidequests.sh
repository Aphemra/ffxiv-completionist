#!/usr/bin/env bash

EXPORT_ID="yak-tel-sidequests"
TITLE="Yak T'el Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Yok Tural Sidequests"
)

JOURNAL_GENRES=(
  "Yak T'el Sidequests"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="yak-tel"
SECONDARY_FACET_NAME="Yak T'el"

COLLECTION_ID="yak-tel-sidequests"
COLLECTION_TITLE="Yak T'el Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Yak T'el."
COLLECTION_SORT_ORDER="7380"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"