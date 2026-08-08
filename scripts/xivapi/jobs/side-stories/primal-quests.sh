#!/usr/bin/env bash

EXPORT_ID="primal-quests"
TITLE="A Realm Reborn Primal Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - Primals"
)

JOURNAL_GENRES=(
  "Primal Quests"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="a-realm-reborn-primals"
SECONDARY_FACET_NAME="A Realm Reborn Primals"

COLLECTION_ID="primal-quests"
COLLECTION_TITLE="A Realm Reborn Primal Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for A Realm Reborn primal battles."
COLLECTION_SORT_ORDER="12100"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"