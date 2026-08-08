#!/usr/bin/env bash

EXPORT_ID="garlean-sidequests"
TITLE="Garlean Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Garlean Sidequests"
)

JOURNAL_GENRES=(
  "Garlean Sidequests"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="garlean"
SECONDARY_FACET_NAME="Garlean"

COLLECTION_ID="garlean-sidequests"
COLLECTION_TITLE="Garlean Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Garlean."
COLLECTION_SORT_ORDER="7320"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"