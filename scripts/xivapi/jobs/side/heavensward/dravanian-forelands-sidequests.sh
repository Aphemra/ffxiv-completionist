#!/usr/bin/env bash

EXPORT_ID="dravanian-forelands-sidequests"
TITLE="Dravanian Forelands Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Dravanian Sidequests"
)

JOURNAL_GENRES=(
  "Dravanian Forelands Sidequests"
)

PRIMARY_FACET_ID="heavensward"
PRIMARY_FACET_NAME="Heavensward"

SECONDARY_FACET_ID="dravanian-forelands"
SECONDARY_FACET_NAME="Dravanian Forelands"

COLLECTION_ID="dravanian-forelands-sidequests"
COLLECTION_TITLE="Dravanian Forelands Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout the Dravanian Forelands."
COLLECTION_SORT_ORDER="7070"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"