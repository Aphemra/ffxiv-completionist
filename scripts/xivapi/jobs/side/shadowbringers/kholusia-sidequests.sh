#!/usr/bin/env bash

EXPORT_ID="kholusia-sidequests"
TITLE="Kholusia Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Kholusian Sidequests"
)

JOURNAL_GENRES=(
  "Kholusia Sidequests"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="kholusia"
SECONDARY_FACET_NAME="Kholusia"

COLLECTION_ID="kholusia-sidequests"
COLLECTION_TITLE="Kholusia Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Kholusia."
COLLECTION_SORT_ORDER="7200"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"