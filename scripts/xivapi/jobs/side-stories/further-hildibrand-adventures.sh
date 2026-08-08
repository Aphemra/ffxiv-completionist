#!/usr/bin/env bash

EXPORT_ID="further-hildibrand-adventures"
TITLE="Further Hildibrand Adventures"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Hildibrand Sidequests"
)

JOURNAL_GENRES=(
  "Further Hildibrand Adventures"
)

PRIMARY_FACET_ID="hildibrand-adventures"
PRIMARY_FACET_NAME="Hildibrand Adventures"

SECONDARY_FACET_ID="heavensward"
SECONDARY_FACET_NAME="Heavensward"

COLLECTION_ID="further-hildibrand-adventures"
COLLECTION_TITLE="Further Hildibrand Adventures"
COLLECTION_DESCRIPTION="Hildibrand's further adventures during Heavensward."
COLLECTION_SORT_ORDER="14010"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"