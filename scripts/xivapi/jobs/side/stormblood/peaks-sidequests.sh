#!/usr/bin/env bash

EXPORT_ID="peaks-sidequests"
TITLE="Peaks Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Gyr Abanian Sidequests"
)

JOURNAL_GENRES=(
  "Peaks Sidequests"
)

PRIMARY_FACET_ID="stormblood"
PRIMARY_FACET_NAME="Stormblood"

SECONDARY_FACET_ID="peaks"
SECONDARY_FACET_NAME="Peaks"

COLLECTION_ID="peaks-sidequests"
COLLECTION_TITLE="Peaks Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout the Peaks."
COLLECTION_SORT_ORDER="7120"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"