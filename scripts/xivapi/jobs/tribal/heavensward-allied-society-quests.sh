#!/usr/bin/env bash

EXPORT_ID="heavensward-allied-society-quests"
TITLE="Heavensward Allied Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Intersocietal Quests"
)

JOURNAL_GENRES=(
  "Heavensward Allied Society Quests"
)

PRIMARY_FACET_ID="allied-societies"
PRIMARY_FACET_NAME="Allied Societies"

SECONDARY_FACET_ID="heavensward"
SECONDARY_FACET_NAME="Heavensward"

COLLECTION_ID="heavensward-allied-society-quests"
COLLECTION_TITLE="Heavensward Allied Society Quests"
COLLECTION_DESCRIPTION="The Heavensward intersocietal alliance questline."
COLLECTION_SORT_ORDER="6510"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"