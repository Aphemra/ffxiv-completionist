#!/usr/bin/env bash

EXPORT_ID="azim-steppe-sidequests"
TITLE="Azime Steppe Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Othardian Sidequests"
)

JOURNAL_GENRES=(
  "Azim Steppe Sidequests"
)

PRIMARY_FACET_ID="stormblood"
PRIMARY_FACET_NAME="Stormblood"

SECONDARY_FACET_ID="azim-steppe"
SECONDARY_FACET_NAME="Azime Steppe"

COLLECTION_ID="azim-steppe-sidequests"
COLLECTION_TITLE="Azime Steppe Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout the Azime Steppe."
COLLECTION_SORT_ORDER="7170"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"