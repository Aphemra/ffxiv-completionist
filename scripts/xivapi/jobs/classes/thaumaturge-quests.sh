#!/usr/bin/env bash

EXPORT_ID="thaumaturge-class-quests"
TITLE="Thaumaturge Quests"

CATEGORY="class"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Thaumaturge Quests"
)

PRIMARY_FACET_ID="magical-ranged-dps"
PRIMARY_FACET_NAME="Magical Ranged DPS"

SECONDARY_FACET_ID="thaumaturge"
SECONDARY_FACET_NAME="Thaumaturge"

COLLECTION_ID="thaumaturge-class-quests"
COLLECTION_TITLE="Thaumaturge Quests"
COLLECTION_DESCRIPTION="The complete Thaumaturge class questline."
COLLECTION_SORT_ORDER="1080"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"