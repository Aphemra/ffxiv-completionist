#!/usr/bin/env bash

EXPORT_ID="stormblood-allied-society-quests"
TITLE="Stormblood Allied Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Intersocietal Quests"
)

JOURNAL_GENRES=(
  "Stormblood Allied Society Quests"
)

PRIMARY_FACET_ID="allied-societies"
PRIMARY_FACET_NAME="Allied Societies"

SECONDARY_FACET_ID="stormblood"
SECONDARY_FACET_NAME="Stormblood"

COLLECTION_ID="stormblood-allied-society-quests"
COLLECTION_TITLE="Stormblood Allied Society Quests"
COLLECTION_DESCRIPTION="The Stormblood intersocietal alliance questline."
COLLECTION_SORT_ORDER="6520"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"