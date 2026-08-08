#!/usr/bin/env bash

EXPORT_ID="amaljaa-society-quests"
TITLE="Amalj'aa Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"

JOURNAL_CATEGORIES=(
  "Amalj'aa Quests"
)

PRIMARY_FACET_ID="amaljaa"
PRIMARY_FACET_NAME="Amalj'aa"

SECONDARY_FACET_ID="main-and-daily"
SECONDARY_FACET_NAME="Main and Daily Quests"

COLLECTION_ID="amaljaa-society-quests"
COLLECTION_TITLE="Amalj'aa Society Quests"
COLLECTION_DESCRIPTION="The complete Amalj'aa society quest collection."
COLLECTION_SORT_ORDER="6000"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"