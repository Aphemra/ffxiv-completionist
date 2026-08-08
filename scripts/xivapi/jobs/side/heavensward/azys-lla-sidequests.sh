#!/usr/bin/env bash

EXPORT_ID="azys-lla-sidequests"
TITLE="Azys Lla Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Azys Lla Sidequests"
)

JOURNAL_GENRES=(
  "Azys Lla Sidequests"
)

PRIMARY_FACET_ID="heavensward"
PRIMARY_FACET_NAME="Heavensward"

SECONDARY_FACET_ID="azys-lla"
SECONDARY_FACET_NAME="Azys Lla"

COLLECTION_ID="azys-lla-sidequests"
COLLECTION_TITLE="Azys Lla Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Azys Lla."
COLLECTION_SORT_ORDER="7110"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"