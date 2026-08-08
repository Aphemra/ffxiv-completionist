#!/usr/bin/env bash

EXPORT_ID="lochs-sidequests"
TITLE="Lochs Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Gyr Abanian Sidequests"
)

JOURNAL_GENRES=(
  "Lochs Sidequests"
)

PRIMARY_FACET_ID="stormblood"
PRIMARY_FACET_NAME="Stormblood"

SECONDARY_FACET_ID="lochs"
SECONDARY_FACET_NAME="Lochs"

COLLECTION_ID="lochs-sidequests"
COLLECTION_TITLE="Lochs Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout the Lochs."
COLLECTION_SORT_ORDER="7150"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"