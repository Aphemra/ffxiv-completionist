#!/usr/bin/env bash

EXPORT_ID="myths-of-the-realm-quests"
TITLE="Myths of the Realm Quests"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - Myths of the Realm"
)

JOURNAL_GENRES=(
  "Myths of the Realm"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="myths-of-the-realm"
SECONDARY_FACET_NAME="Myths of the Realm"

COLLECTION_ID="myths-of-the-realm-quests"
COLLECTION_TITLE="Myths of the Realm Quests"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for Myths of the Realm."
COLLECTION_SORT_ORDER="12070"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"