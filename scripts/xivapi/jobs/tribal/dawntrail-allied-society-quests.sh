#!/usr/bin/env bash

EXPORT_ID="dawntrail-allied-society-quests"
TITLE="Dawntrail Allied Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Intersocietal Quests"
)

JOURNAL_GENRES=(
  "Dawntrail Allied Society Quests"
)

PRIMARY_FACET_ID="allied-societies"
PRIMARY_FACET_NAME="Allied Societies"

SECONDARY_FACET_ID="dawntrail"
SECONDARY_FACET_NAME="Dawntrail"

COLLECTION_ID="dawntrail-allied-society-quests"
COLLECTION_TITLE="Dawntrail Allied Society Quests"
COLLECTION_DESCRIPTION="The Dawntrail intersocietal alliance questline."
COLLECTION_SORT_ORDER="6550"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"