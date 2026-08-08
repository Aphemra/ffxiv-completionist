#!/usr/bin/env bash

EXPORT_ID="lakeland-sidequests"
TITLE="Lakeland Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Lakeland Sidequests"
)

JOURNAL_GENRES=(
  "Lakeland Sidequests"
)

PRIMARY_FACET_ID="shadowbringers"
PRIMARY_FACET_NAME="Shadowbringers"

SECONDARY_FACET_ID="lakeland"
SECONDARY_FACET_NAME="Lakeland"

COLLECTION_ID="lakeland-sidequests"
COLLECTION_TITLE="Lakeland Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Lakeland."
COLLECTION_SORT_ORDER="7230"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"