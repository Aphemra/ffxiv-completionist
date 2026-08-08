#!/usr/bin/env bash

EXPORT_ID="kozamauka-sidequests"
TITLE="Kozama'uka Sidequests"

CATEGORY="side"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Yok Tural Sidequests"
)

JOURNAL_GENRES=(
  "Kozama'uka Sidequests"
)

PRIMARY_FACET_ID="dawntrail"
PRIMARY_FACET_NAME="Dawntrail"

SECONDARY_FACET_ID="kozamauka"
SECONDARY_FACET_NAME="Kozama'uka"

COLLECTION_ID="kozamauka-sidequests"
COLLECTION_TITLE="Kozama'uka Sidequests"
COLLECTION_DESCRIPTION="Sidequests located throughout Kozama'uka."
COLLECTION_SORT_ORDER="7360"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../../_quest-job.sh"