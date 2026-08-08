#!/usr/bin/env bash

EXPORT_ID="labyrinthos-sidequests"
TITLE="Labyrinthos Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Sharlayan Sidequests"
)

JOURNAL_GENRES=(
  "Labyrinthos Sidequests"
)

PRIMARY_FACET_ID="endwalker"
PRIMARY_FACET_NAME="Endwalker"

SECONDARY_FACET_ID="labyrinthos"
SECONDARY_FACET_NAME="Labyrinthos"

COLLECTION_ID="labyrinthos-sidequests"
COLLECTION_TITLE="Labyrinthos Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Labyrinthos."
COLLECTION_SORT_ORDER="7280"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"