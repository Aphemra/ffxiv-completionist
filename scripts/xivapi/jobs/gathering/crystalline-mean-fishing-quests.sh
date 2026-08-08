#!/usr/bin/env bash

EXPORT_ID="crystalline-mean-fishing-quests"
TITLE="Facet of Fishing Quests"

CATEGORY="gathering"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Crystalline Mean Quests"
)

JOURNAL_GENRES=(
  "Facet of Fishing Quests"
)

PRIMARY_FACET_ID="gathering"
PRIMARY_FACET_NAME="Gathering"

SECONDARY_FACET_ID="facet-of-fishing"
SECONDARY_FACET_NAME="Facet of Fishing"

COLLECTION_ID="crystalline-mean-fishing-quests"
COLLECTION_TITLE="Facet of Fishing Quests"
COLLECTION_DESCRIPTION="The Crystalline Mean Facet of Fishing questline."
COLLECTION_SORT_ORDER="4310"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"