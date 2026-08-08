#!/usr/bin/env bash

EXPORT_ID="kugane-sidequests"
TITLE="Kugane Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Hingan Sidequests"
)

JOURNAL_GENRES=(
  "Kugane Sidequests"
)

PRIMARY_FACET_ID="stormblood"
PRIMARY_FACET_NAME="Stormblood"

SECONDARY_FACET_ID="kugane"
SECONDARY_FACET_NAME="Kugane"

COLLECTION_ID="kugane-sidequests"
COLLECTION_TITLE="Kugane Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Kugane."
COLLECTION_SORT_ORDER="7160"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"