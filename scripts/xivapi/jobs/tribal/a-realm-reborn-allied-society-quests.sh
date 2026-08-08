#!/usr/bin/env bash

EXPORT_ID="a-realm-reborn-allied-society-quests"
TITLE="A Realm Reborn Allied Society Quests"

CATEGORY="tribal"

SELECTION_MODE="filter"
COLLECTION_FORMAT="linear"

JOURNAL_CATEGORIES=(
  "Intersocietal Quests"
)

JOURNAL_GENRES=(
  "A Realm Reborn Allied Society Quests"
)

# These three quests are mutually exclusive.
# Completing any one permits the shared questline to continue.
ALTERNATIVE_COMPLETION_GROUPS=(
  "arr-allied-call-of-the-wild:67001,67002,67003"
)

PRIMARY_FACET_ID="allied-societies"
PRIMARY_FACET_NAME="Allied Societies"

SECONDARY_FACET_ID="a-realm-reborn"
SECONDARY_FACET_NAME="A Realm Reborn"

COLLECTION_ID="a-realm-reborn-allied-society-quests"
COLLECTION_TITLE="A Realm Reborn Allied Society Quests"
COLLECTION_DESCRIPTION="The A Realm Reborn intersocietal alliance questline."
COLLECTION_SORT_ORDER="6500"

VERIFICATION_STATUS="verified"

source "$(dirname "${BASH_SOURCE[0]}")/../_quest-job.sh"