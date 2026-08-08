#!/usr/bin/env bash

EXPORT_ID="ishgardian-sidequests"
TITLE="Ishgardian Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Ishgardian Sidequests"
)

JOURNAL_GENRES=(
  "Ishgardian Sidequests"
)

PRIMARY_FACET_ID="heavensward"
PRIMARY_FACET_NAME="Heavensward"

SECONDARY_FACET_ID="ishgardian"
SECONDARY_FACET_NAME="Ishgardian"

COLLECTION_ID="ishgardian-sidequests"
COLLECTION_TITLE="Ishgardian Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Ishgard."
COLLECTION_SORT_ORDER="7050"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"