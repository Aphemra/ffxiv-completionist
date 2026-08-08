#!/usr/bin/env bash

EXPORT_ID="abalathian-sidequests"
TITLE="Abalathian Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Abalathian Sidequests"
)

JOURNAL_GENRES=(
  "Abalathian Sidequests"
)

PRIMARY_FACET_ID="heavensward"
PRIMARY_FACET_NAME="Heavensward"

SECONDARY_FACET_ID="abalathian"
SECONDARY_FACET_NAME="Abalathian"

COLLECTION_ID="abalathian-sidequests"
COLLECTION_TITLE="Abalathian Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Abalathian."
COLLECTION_SORT_ORDER="7100"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"