#!/usr/bin/env bash

EXPORT_ID="ishgardian-restoration-main-quests"
TITLE="Ishgardian Restoration Main Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Ishgardian Restoration Main Quests"
)

PRIMARY_FACET_ID="ishgardian-restoration"
PRIMARY_FACET_NAME="Ishgardian Restoration"

SECONDARY_FACET_ID="ishgardian-restoration-main"
SECONDARY_FACET_NAME="Main Quests"

COLLECTION_ID="ishgardian-restoration-main-quests"
COLLECTION_TITLE="Ishgardian Restoration Main Quests"
COLLECTION_DESCRIPTION="Main quests following the restoration of the Firmament in Ishgard."
COLLECTION_SORT_ORDER="13060"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"