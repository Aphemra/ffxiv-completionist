#!/usr/bin/env bash

EXPORT_ID="botanist-quests"
TITLE="Botanist Quests"

CATEGORY="gathering"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Botanist Quests"
)

PRIMARY_FACET_ID="gathering"
PRIMARY_FACET_NAME="Gathering"

SECONDARY_FACET_ID="botanist"
SECONDARY_FACET_NAME="Botanist"

COLLECTION_ID="botanist-quests"
COLLECTION_TITLE="Botanist Quests"
COLLECTION_DESCRIPTION="The complete Botanist gathering questline."
COLLECTION_SORT_ORDER="5000"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"