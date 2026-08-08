#!/usr/bin/env bash

EXPORT_ID="churning-mists-sidequests"
TITLE="Churning Mists Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Dravanian Sidequests"
)

JOURNAL_GENRES=(
  "Churning Mists Sidequests"
)

PRIMARY_FACET_ID="heavensward"
PRIMARY_FACET_NAME="Heavensward"

SECONDARY_FACET_ID="churning-mists"
SECONDARY_FACET_NAME="Churning Mists"

COLLECTION_ID="churning-mists-sidequests"
COLLECTION_TITLE="Churning Mists Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout the Churning Mists."
COLLECTION_SORT_ORDER="7060"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"