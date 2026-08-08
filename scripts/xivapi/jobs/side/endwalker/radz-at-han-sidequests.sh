#!/usr/bin/env bash

EXPORT_ID="radz-at-han-sidequests"
TITLE="Radz-at-Han Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Thavnairian Sidequests"
)

JOURNAL_GENRES=(
  "Radz-at-Han Sidequests"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="radz-at-han"
SECONDARY_FACET_NAME="Radz-at-Han"

COLLECTION_ID="radz-at-han-sidequests"
COLLECTION_TITLE="Radz-at-Han Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Radz-at-Han."
COLLECTION_SORT_ORDER="7310"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"