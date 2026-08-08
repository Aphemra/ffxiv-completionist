#!/usr/bin/env bash

EXPORT_ID="raktika-sidequests"
TITLE="Rak'tika Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Rak'tika Sidequests"
)

JOURNAL_GENRES=(
  "Rak'tika Sidequests"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="raktika"
SECONDARY_FACET_NAME="Rak'tika"

COLLECTION_ID="raktika-sidequests"
COLLECTION_TITLE="Rak'tika Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Rak'tika."
COLLECTION_SORT_ORDER="7250"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"