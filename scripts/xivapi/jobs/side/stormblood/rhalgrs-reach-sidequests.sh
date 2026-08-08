#!/usr/bin/env bash

EXPORT_ID="rhalgrs-reach-sidequests"
TITLE="Rhalgr's Reach Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Gyr Abanian Sidequests"
)

JOURNAL_GENRES=(
  "Rhalgr's Reach Sidequests"
)

PRIMARY_FACET_ID="stormblood"
PRIMARY_FACET_NAME="Stormblood"

SECONDARY_FACET_ID="rhalgrs-reach"
SECONDARY_FACET_NAME="Rhalgr's Reach"

COLLECTION_ID="rhalgrs-reach-sidequests"
COLLECTION_TITLE="Rhalgr's Reach Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Rhalgr's Reach."
COLLECTION_SORT_ORDER="7140"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"