#!/usr/bin/env bash

EXPORT_ID="conjurer-class-quests"
TITLE="Conjurer Quests"

CATEGORY="class"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_GENRES=(
  "Conjurer Quests"
)

PRIMARY_FACET_ID="healer"
PRIMARY_FACET_NAME="Healer"

SECONDARY_FACET_ID="conjurer"
SECONDARY_FACET_NAME="Conjurer"

COLLECTION_ID="conjurer-class-quests"
COLLECTION_TITLE="Conjurer Quests"
COLLECTION_DESCRIPTION="The complete Conjurer class questline."
COLLECTION_SORT_ORDER="1020"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"