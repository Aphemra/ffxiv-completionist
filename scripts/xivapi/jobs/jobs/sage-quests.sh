#!/usr/bin/env bash

EXPORT_ID="sage-job-quests"
TITLE="Sage Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Sage Quests"
)

PRIMARY_FACET_ID="healer"
PRIMARY_FACET_NAME="Healer"

SECONDARY_FACET_ID="sage"
SECONDARY_FACET_NAME="Sage"

COLLECTION_ID="sage-job-quests"
COLLECTION_TITLE="Sage Quests"
COLLECTION_DESCRIPTION="The complete Sage job questline."
COLLECTION_SORT_ORDER="2150"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"