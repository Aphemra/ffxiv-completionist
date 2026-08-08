#!/usr/bin/env bash

EXPORT_ID="fringes-sidequests"
TITLE="Fringes Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Gyr Abanian Sidequests"
)

JOURNAL_GENRES=(
  "Fringes Sidequests"
)

PRIMARY_FACET_ID="stormblood"
PRIMARY_FACET_NAME="Stormblood"

SECONDARY_FACET_ID="fringes"
SECONDARY_FACET_NAME="Fringes"

COLLECTION_ID="fringes-sidequests"
COLLECTION_TITLE="Fringes Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout the Fringes."
COLLECTION_SORT_ORDER="7130"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"