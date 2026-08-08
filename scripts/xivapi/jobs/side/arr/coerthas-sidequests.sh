#!/usr/bin/env bash

EXPORT_ID="coerthas-sidequests"
TITLE="Coerthas Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Coerthan Sidequests"
)

JOURNAL_GENRES=(
  "Coerthan Sidequests"
)

PRIMARY_FACET_ID="a-realm-reborn"
PRIMARY_FACET_NAME="A Realm Reborn"

SECONDARY_FACET_ID="coerthas"
SECONDARY_FACET_NAME="Coerthas"

COLLECTION_ID="coerthas-sidequests"
COLLECTION_TITLE="Coerthas Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Coerthas."
COLLECTION_SORT_ORDER="7040"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"