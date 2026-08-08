#!/usr/bin/env bash

EXPORT_ID="bahamut-quests"
TITLE="The Binding Coil of Bahamut"

CATEGORY="side-story"
SELECTION_MODE="filter"
COLLECTION_FORMAT="standard"
AUTO_GROUPS="true"

JOURNAL_CATEGORIES=(
  "Chronicles of a New Era - Bahamut"
)

JOURNAL_GENRES=(
  "Bahamut Quests"
)

PRIMARY_FACET_ID="chronicles-of-a-new-era"
PRIMARY_FACET_NAME="Chronicles of a New Era"

SECONDARY_FACET_ID="binding-coil-of-bahamut"
SECONDARY_FACET_NAME="The Binding Coil of Bahamut"

COLLECTION_ID="bahamut-quests"
COLLECTION_TITLE="The Binding Coil of Bahamut"
COLLECTION_DESCRIPTION="Chronicles of a New Era quests for the Binding Coil of Bahamut."
COLLECTION_SORT_ORDER="12020"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"