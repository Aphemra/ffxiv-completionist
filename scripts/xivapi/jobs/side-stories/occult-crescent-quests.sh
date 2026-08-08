#!/usr/bin/env bash

EXPORT_ID="occult-crescent-quests"
TITLE="The Occult Crescent Quests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "The Occult Crescent"
)

PRIMARY_FACET_ID="field-operations"
PRIMARY_FACET_NAME="Field Operations"

SECONDARY_FACET_ID="occult-crescent"
SECONDARY_FACET_NAME="The Occult Crescent"

COLLECTION_ID="occult-crescent-quests"
COLLECTION_TITLE="The Occult Crescent"
COLLECTION_DESCRIPTION="Quests associated with field operations in the Occult Crescent."
COLLECTION_SORT_ORDER="13110"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"