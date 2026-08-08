#!/usr/bin/env bash

EXPORT_ID="scholar-job-quests"
TITLE="Scholar Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Scholar Quests"
)

PRIMARY_FACET_ID="healer"
PRIMARY_FACET_NAME="Healer"

SECONDARY_FACET_ID="scholar"
SECONDARY_FACET_NAME="Scholar"

COLLECTION_ID="scholar-job-quests"
COLLECTION_TITLE="Scholar Quests"
COLLECTION_DESCRIPTION="The complete Scholar job questline."
COLLECTION_SORT_ORDER="2170"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"