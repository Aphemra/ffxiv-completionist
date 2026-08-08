#!/usr/bin/env bash

EXPORT_ID="gridiana-black-shroud-sidequests"
TITLE="Gridania and Black Shroud Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Gridanian Sidequests"
)

JOURNAL_GENRES=(
  "Gridanian Sidequests"
)

PRIMARY_FACET_ID="a-realm-reborn"
PRIMARY_FACET_NAME="A Realm Reborn"

SECONDARY_FACET_ID="gridania-and-black-shroud"
SECONDARY_FACET_NAME="Gridania and Black Shroud"

COLLECTION_ID="gridiana-black-shroud-sidequests"
COLLECTION_TITLE="Gridania and Black Shroud Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout the Black Shroud and Gridania."
COLLECTION_SORT_ORDER="7000"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"