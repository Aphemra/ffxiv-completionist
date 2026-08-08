#!/usr/bin/env bash

EXPORT_ID="splendorous-tools"
TITLE="Splendorous Tool Quests"

CATEGORY="relic"

SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Records of Unusual Endeavors"
)

JOURNAL_GENRES=(
  "Splendorous Tools"
)

PRIMARY_FACET_ID="splendorous-tools"
PRIMARY_FACET_NAME="Splendorous Tools"

SECONDARY_FACET_ID="all-stages"
SECONDARY_FACET_NAME="All Stages"

COLLECTION_ID="splendorous-tools"
COLLECTION_TITLE="Splendorous Tools"
COLLECTION_DESCRIPTION="The complete Splendorous tool quest collection."
COLLECTION_SORT_ORDER="9060"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"