#!/usr/bin/env bash

EXPORT_ID="crystalline-mean-gathering-quests"
TITLE="Facet of Gathering Quests"

CATEGORY="gathering"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Crystalline Mean Quests"
)

JOURNAL_GENRES=(
  "Facet of Gathering Quests"
)

PRIMARY_FACET_ID="gathering"
PRIMARY_FACET_NAME="Gathering"

SECONDARY_FACET_ID="facet-of-gathering"
SECONDARY_FACET_NAME="Facet of Gathering"

COLLECTION_ID="crystalline-mean-gathering-quests"
COLLECTION_TITLE="Facet of Gathering Quests"
COLLECTION_DESCRIPTION="The Crystalline Mean Facet of Gathering questline."
COLLECTION_SORT_ORDER="4330"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"