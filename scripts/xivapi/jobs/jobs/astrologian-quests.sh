#!/usr/bin/env bash

EXPORT_ID="astrologian-job-quests"
TITLE="Astrologian Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Astrologian Quests"
)

PRIMARY_FACET_ID="healer"
PRIMARY_FACET_NAME="Healer"

SECONDARY_FACET_ID="astrologian"
SECONDARY_FACET_NAME="Astrologian"

COLLECTION_ID="astrologian-job-quests"
COLLECTION_TITLE="Astrologian Quests"
COLLECTION_DESCRIPTION="The complete Astrologian job questline."
COLLECTION_SORT_ORDER="2000"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"