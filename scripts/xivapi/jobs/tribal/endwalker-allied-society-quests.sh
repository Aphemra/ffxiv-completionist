#!/usr/bin/env bash

EXPORT_ID="endwalker-allied-society-quests"
TITLE="Endwalker Allied Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Intersocietal Quests"
)

JOURNAL_GENRES=(
  "Endwalker Allied Society Quests"
)

PRIMARY_FACET_ID="allied-societies"
PRIMARY_FACET_NAME="Allied Societies"

SECONDARY_FACET_ID="endwalker"
SECONDARY_FACET_NAME="Endwalker"

COLLECTION_ID="endwalker-allied-society-quests"
COLLECTION_TITLE="Endwalker Allied Society Quests"
COLLECTION_DESCRIPTION="The Endwalker intersocietal alliance questline."
COLLECTION_SORT_ORDER="6540"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"