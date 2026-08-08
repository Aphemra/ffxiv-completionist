#!/usr/bin/env bash

EXPORT_ID="ultima-thule-sidequests"
TITLE="Ultima Thule Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Ultima Thule Sidequests"
)

JOURNAL_GENRES=(
  "Ultima Thule Sidequests"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="ultima-thule"
SECONDARY_FACET_NAME="Ultima Thule"

COLLECTION_ID="ultima-thule-sidequests"
COLLECTION_TITLE="Ultima Thule Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Ultima Thule."
COLLECTION_SORT_ORDER="7350"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"