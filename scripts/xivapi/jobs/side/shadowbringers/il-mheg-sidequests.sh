#!/usr/bin/env bash

EXPORT_ID="il-mheg-sidequests"
TITLE="Il Mheg Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Il Mheg Sidequests"
)

JOURNAL_GENRES=(
  "Il Mheg Sidequests"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="il-mheg"
SECONDARY_FACET_NAME="Il Mheg"

COLLECTION_ID="il-mheg-sidequests"
COLLECTION_TITLE="Il Mheg Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Il Mheg."
COLLECTION_SORT_ORDER="7260"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"