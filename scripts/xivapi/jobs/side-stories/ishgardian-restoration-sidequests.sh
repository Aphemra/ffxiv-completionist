#!/usr/bin/env bash

EXPORT_ID="ishgardian-restoration-sidequests"
TITLE="Ishgardian Restoration Sidequests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Ishgardian Restoration Sidequests"
)

PRIMARY_FACET_ID="ishgardian-restoration"
PRIMARY_FACET_NAME="Ishgardian Restoration"

SECONDARY_FACET_ID="ishgardian-restoration-sidequests"
SECONDARY_FACET_NAME="Sidequests"

COLLECTION_ID="ishgardian-restoration-sidequests"
COLLECTION_TITLE="Ishgardian Restoration Sidequests"
COLLECTION_DESCRIPTION="Optional stories associated with the restoration of the Firmament."
COLLECTION_SORT_ORDER="13070"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"