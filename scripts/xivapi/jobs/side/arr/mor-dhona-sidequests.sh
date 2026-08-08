#!/usr/bin/env bash

EXPORT_ID="mor-dhona-sidequests"
TITLE="Mor Dhona Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Mor Dhonan Sidequests"
)

JOURNAL_GENRES=(
  "Mor Dhonan Sidequests"
)

PRIMARY_FACET_ID="a-realm-reborn"
PRIMARY_FACET_NAME="A Realm Reborn"

SECONDARY_FACET_ID="mor-dhona"
SECONDARY_FACET_NAME="Mor Dhona"

COLLECTION_ID="mor-dhona-sidequests"
COLLECTION_TITLE="Mor Dhona Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Mor Dhona."
COLLECTION_SORT_ORDER="7030"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"