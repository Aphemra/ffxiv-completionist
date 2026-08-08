#!/usr/bin/env bash

EXPORT_ID="urqopacha-sidequests"
TITLE="Urqopacha Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Yok Tural Sidequests"
)

JOURNAL_GENRES=(
  "Urqopacha Sidequests"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="urqopacha"
SECONDARY_FACET_NAME="Urqopacha"

COLLECTION_ID="urqopacha-sidequests"
COLLECTION_TITLE="Urqopacha Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Urqopacha."
COLLECTION_SORT_ORDER="7370"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"