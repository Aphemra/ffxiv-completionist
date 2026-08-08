#!/usr/bin/env bash

EXPORT_ID="idyllshire-sidequests"
TITLE="Idyllshire Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Dravanian Sidequests"
)

JOURNAL_GENRES=(
  "Idyllshire Sidequests"
)

PRIMARY_FACET_ID="heavensward"
PRIMARY_FACET_NAME="Heavensward"

SECONDARY_FACET_ID="idyllshire"
SECONDARY_FACET_NAME="Idyllshire"

COLLECTION_ID="idyllshire-sidequests"
COLLECTION_TITLE="Idyllshire Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Idyllshire."
COLLECTION_SORT_ORDER="7090"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"