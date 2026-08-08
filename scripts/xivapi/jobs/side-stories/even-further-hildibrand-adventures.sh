#!/usr/bin/env bash

EXPORT_ID="even-further-hildibrand-adventures"
TITLE="Even Further Hildibrand Adventures"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Hildibrand Sidequests"
)

JOURNAL_GENRES=(
  "Even Further Hildibrand Adventures"
)

PRIMARY_FACET_ID="hildibrand-adventures"
PRIMARY_FACET_NAME="Hildibrand Adventures"

SECONDARY_FACET_ID="stormblood"
SECONDARY_FACET_NAME="Stormblood"

COLLECTION_ID="even-further-hildibrand-adventures"
COLLECTION_TITLE="Even Further Hildibrand Adventures"
COLLECTION_DESCRIPTION="Hildibrand's increasingly improbable adventures during Stormblood."
COLLECTION_SORT_ORDER="14020"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"