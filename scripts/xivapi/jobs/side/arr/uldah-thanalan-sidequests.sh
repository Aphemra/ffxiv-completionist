#!/usr/bin/env bash

EXPORT_ID="uldah-thanalan-sidequests"
TITLE="Ul'dah and Thanalan Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Ul'dahn Sidequests"
)

JOURNAL_GENRES=(
  "Ul'dahn Sidequests"
)

PRIMARY_FACET_ID="a-realm-reborn"
PRIMARY_FACET_NAME="A Realm Reborn"

SECONDARY_FACET_ID="uldah-and-thanalan"
SECONDARY_FACET_NAME="Ul'dah and Thanalan"

COLLECTION_ID="uldah-thanalan-sidequests"
COLLECTION_TITLE="Ul'dah and Thanalan Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Thanalan and Ul'dah."
COLLECTION_SORT_ORDER="7020"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"