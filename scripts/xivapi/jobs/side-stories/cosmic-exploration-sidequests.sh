#!/usr/bin/env bash

EXPORT_ID="cosmic-exploration-sidequests"
TITLE="Cosmic Exploration Sidequests"

CATEGORY="side-story"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Cosmic Exploration Sidequests"
)

PRIMARY_FACET_ID="cosmic-exploration"
PRIMARY_FACET_NAME="Cosmic Exploration"

SECONDARY_FACET_ID="cosmic-exploration-sidequests"
SECONDARY_FACET_NAME="Sidequests"

COLLECTION_ID="cosmic-exploration-sidequests"
COLLECTION_TITLE="Cosmic Exploration Sidequests"
COLLECTION_DESCRIPTION="Optional quests associated with Cosmic Exploration."
COLLECTION_SORT_ORDER="13010"

VERIFICATION_STATUS="in-review"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"