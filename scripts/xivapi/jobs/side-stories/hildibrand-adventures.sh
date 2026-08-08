#!/usr/bin/env bash

EXPORT_ID="hildibrand-adventures"
TITLE="Hildibrand Adventures"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Hildibrand Sidequests"
)

JOURNAL_GENRES=(
  "Hildibrand Adventures"
)

PRIMARY_FACET_ID="hildibrand-adventures"
PRIMARY_FACET_NAME="Hildibrand Adventures"

SECONDARY_FACET_ID="a-realm-reborn"
SECONDARY_FACET_NAME="A Realm Reborn"

COLLECTION_ID="hildibrand-adventures"
COLLECTION_TITLE="Hildibrand Adventures"
COLLECTION_DESCRIPTION="The original adventures of Hildibrand Manderville in A Realm Reborn."
COLLECTION_SORT_ORDER="14000"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"