#!/usr/bin/env bash

EXPORT_ID="dravanian-hinterlands-sidequests"
TITLE="Dravanian Hinterlands Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Dravanian Sidequests"
)

JOURNAL_GENRES=(
  "Dravanian Hinterlands Sidequests"
)

PRIMARY_FACET_ID="heavensward"
PRIMARY_FACET_NAME="Heavensward"

SECONDARY_FACET_ID="dravanian-hinterlands"
SECONDARY_FACET_NAME="Dravanian Hinterlands"

COLLECTION_ID="dravanian-hinterlands-sidequests"
COLLECTION_TITLE="Dravanian Hinterlands Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout the Dravanian Hinterlands."
COLLECTION_SORT_ORDER="7080"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"