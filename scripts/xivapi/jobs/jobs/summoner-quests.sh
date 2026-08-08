#!/usr/bin/env bash

EXPORT_ID="summoner-job-quests"
TITLE="Summoner Quests"

CATEGORY="job"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Summoner Quests"
)

PRIMARY_FACET_ID="magical-ranged-dps"
PRIMARY_FACET_NAME="Magical Ranged DPS"

SECONDARY_FACET_ID="summoner"
SECONDARY_FACET_NAME="Summoner"

COLLECTION_ID="summoner-job-quests"
COLLECTION_TITLE="Summoner Quests"
COLLECTION_DESCRIPTION="The complete Summoner job questline."
COLLECTION_SORT_ORDER="2180"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"