#!/usr/bin/env bash

EXPORT_ID="mare-lamentorum-sidequests"
TITLE="Mare Lamentorum Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Mare Lamentorum Sidequests"
)

JOURNAL_GENRES=(
  "Mare Lamentorum Sidequests"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="mare-lamentorum"
SECONDARY_FACET_NAME="Mare Lamentorum"

COLLECTION_ID="mare-lamentorum-sidequests"
COLLECTION_TITLE="Mare Lamentorum Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Mare Lamentorum."
COLLECTION_SORT_ORDER="7330"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"