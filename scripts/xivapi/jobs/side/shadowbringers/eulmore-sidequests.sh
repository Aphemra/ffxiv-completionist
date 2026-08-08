#!/usr/bin/env bash

EXPORT_ID="eulmore-sidequests"
TITLE="Eulmore Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Kholusian Sidequests"
)

JOURNAL_GENRES=(
  "Eulmore Sidequests"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="eulmore"
SECONDARY_FACET_NAME="Eulmore"

COLLECTION_ID="eulmore-sidequests"
COLLECTION_TITLE="Eulmore Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Eulmore."
COLLECTION_SORT_ORDER="7210"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"