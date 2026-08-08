#!/usr/bin/env bash

EXPORT_ID="elpis-sidequests"
TITLE="Elpis Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Elpis Sidequests"
)

JOURNAL_GENRES=(
  "Elpis Sidequests"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="elpis"
SECONDARY_FACET_NAME="Elpis"

COLLECTION_ID="elpis-sidequests"
COLLECTION_TITLE="Elpis Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Elpis."
COLLECTION_SORT_ORDER="7340"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"