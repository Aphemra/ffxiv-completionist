#!/usr/bin/env bash

EXPORT_ID="miner-quests"
TITLE="Miner Quests"

CATEGORY="gathering"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Miner Quests"
)

PRIMARY_FACET_ID="gathering"
PRIMARY_FACET_NAME="Gathering"

SECONDARY_FACET_ID="miner"
SECONDARY_FACET_NAME="Miner"

COLLECTION_ID="miner-quests"
COLLECTION_TITLE="Miner Quests"
COLLECTION_DESCRIPTION="The complete Miner gathering questline."
COLLECTION_SORT_ORDER="5020"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"